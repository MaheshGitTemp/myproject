// Request handlers for chat. Thin controllers: resolve the target, enforce
// the messaging block rule in the SERVICE layer (business rule 5), call the
// repo, and shape responses to match the frontend chat mock (chatData.js).
//
// Message block rule: a message is rejected when EITHER a full block OR a
// message_only block exists in either direction between the pair
// (blocksRepo.isMessageBlocked). On a new message we create a notification for
// the receiver.
import { withTransaction } from '../../db.js';
import { getUserIdByMatId, getPublicIdentity } from '../profiles/profilesRepo.js';
import { normalizeMatId } from '../profiles/matId.js';
import { isMessageBlocked } from '../interactions/blocksRepo.js';
import { notify } from '../interactions/notificationsRepo.js';
import {
  getOrCreateConversation, getConversationById, isParticipant,
  listConversations, listMessages, sendMessage, markRead,
} from './chatRepo.js';

const photoUrl = (id) => `/api/photos/file/${id}`;

/** Parse a Postgres int[] (from array_agg) into a JS array of numbers. */
function toIdArray(val) {
  if (Array.isArray(val)) return val.filter((v) => v != null).map(Number);
  return [];
}

/**
 * Resolve the conversation avatar for a listConversations row, preferring the
 * other party's approved primary photo (same precedence as profile cards) and
 * falling back to their seeded profiles.image.
 */
function resolveAvatar(row) {
  const galleryIds = toIdArray(row.gallery_photo_ids);
  const primaryId = row.primary_photo_id != null ? Number(row.primary_photo_id) : null;
  if (primaryId != null) return photoUrl(primaryId);
  if (galleryIds.length > 0) return photoUrl(galleryIds[0]);
  return row.image || null;
}

/** Format a timestamp for the chat UI's `time` / `lastMessageTime` fields. */
function formatTime(ts) {
  if (!ts) return '';
  const d = ts instanceof Date ? ts : new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Shape a DB message row for the frontend (chatData message shape). */
function toMessage(row, viewerId) {
  return {
    id: row.id,
    text: row.body,
    isSent: row.sender_id === viewerId,
    time: formatTime(row.created_at),
    read: row.read,
  };
}

/** GET /api/chat/conversations -> [ conversation ] shaped like chatData. */
export async function getConversations(req, res, next) {
  try {
    const rows = await listConversations(req.user.id);
    const conversations = rows.map((row) => ({
      id: row.id,
      name: row.other_name,
      avatar: resolveAvatar(row),
      online: !!row.other_online,
      unread: row.unread,
      lastMessage: row.last_message || '',
      lastMessageTime: formatTime(row.last_message_at || row.updated_at),
      otherMatId: row.other_mat_id,
    }));
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

/** GET /api/chat/conversations/:id/messages -> { messages:[...] } */
export async function getMessages(req, res, next) {
  try {
    const convId = Number(req.params.id);
    if (!Number.isInteger(convId)) {
      return res.status(400).json({ error: 'invalid_conversation_id' });
    }
    const conversation = await getConversationById(convId);
    if (!conversation || !isParticipant(conversation, req.user.id)) {
      return res.status(404).json({ error: 'not_found' });
    }
    const rows = await listMessages(convId);
    res.json({ messages: rows.map((row) => toMessage(row, req.user.id)) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/messages  body { matId, body }
 * Blocked (full OR message_only, either direction) -> 403 messaging_blocked.
 * Otherwise get/create the conversation, insert the message, notify receiver,
 * and return the created message in the same shape as GET messages.
 */
export async function postMessage(req, res, next) {
  try {
    const matId = normalizeMatId(req.body ? req.body.matId : '');
    const body = typeof (req.body && req.body.body) === 'string' ? req.body.body.trim() : '';
    if (!matId) return res.status(400).json({ error: 'invalid_mat_id' });
    if (!body) return res.status(400).json({ error: 'empty_message' });

    const targetId = await getUserIdByMatId(matId);
    if (!targetId) return res.status(404).json({ error: 'not_found' });
    if (targetId === req.user.id) return res.status(400).json({ error: 'self_action' });

    // Service-layer block enforcement (business rule 5): a full block OR a
    // message_only block in either direction stops messaging.
    if (await isMessageBlocked(req.user.id, targetId)) {
      return res.status(403).json({ error: 'messaging_blocked' });
    }

    const { conversationId, message } = await withTransaction(async (client) => {
      const conversation = await getOrCreateConversation(client, req.user.id, targetId);
      const created = await sendMessage(client, conversation.id, req.user.id, body);
      return { conversationId: conversation.id, message: created };
    });

    // Notify the receiver of the new message.
    const sender = await getPublicIdentity(req.user.id);
    await notify(targetId, 'message_received', {
      conversationId,
      fromUserId: req.user.id,
      fromMatId: sender ? sender.mat_id : null,
      fromName: sender ? sender.first_name : null,
    });

    res.status(201).json({ conversationId, message: toMessage(message, req.user.id) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/chat/conversations/:id/read -> mark the other party's msgs read. */
export async function markConversationRead(req, res, next) {
  try {
    const convId = Number(req.params.id);
    if (!Number.isInteger(convId)) {
      return res.status(400).json({ error: 'invalid_conversation_id' });
    }
    const conversation = await getConversationById(convId);
    if (!conversation || !isParticipant(conversation, req.user.id)) {
      return res.status(404).json({ error: 'not_found' });
    }
    const updated = await markRead(convId, req.user.id);
    res.json({ ok: true, updated });
  } catch (err) {
    next(err);
  }
}
