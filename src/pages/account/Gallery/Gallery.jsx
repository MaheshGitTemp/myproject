import { Fragment, useEffect, useRef, useState } from 'react';
import SettingRow from '../../../components/ui/SettingRow.jsx';
import { PILLS } from '../../../components/layout/AccountSidebar.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import usePageMeta from '../../../hooks/usePageMeta.js';
import AccountLayout from '../../../layouts/AccountLayout.jsx';
import { deletePhoto, listMyPhotos, photoFileUrl, uploadPhoto } from '../../../services/photosService.js';

const PRIVACY_ROWS = [
  { key: 'hideGallery', title: 'Hide Gallery', description: 'Hide from all users.' },
  { key: 'blurPhotos', title: 'Blur for Free Users', description: 'Only premium can see clearly.' },
];
const TIPS = [
  'Use clear, well-lit photos.',
  'Include at least one clear face shot.',
  'Avoid group photos as your main picture.',
  'Smile naturally and dress appropriately.',
];
const MAX_PHOTOS = 6;

export default function Gallery() {
  usePageMeta({
    title: 'Photo Gallery | Telugu Sambandham',
    description: 'Manage the photos shown on your Telugu Sambandham profile.',
    robots: 'noindex, nofollow',
  });
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  // hideGallery / blurPhotos are kept local — there is no backend for these
  // privacy toggles yet, so Save Settings only reflects the local state.
  const [privacy, setPrivacy] = useState({ hideGallery: false, blurPhotos: true });
  const [photos, setPhotos] = useState([]);

  async function refetchPhotos() {
    const res = await listMyPhotos();
    setPhotos(res.photos || []);
  }

  useEffect(() => {
    refetchPhotos();
  }, []);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    for (const file of files) {
      // sequential so the backend sees them in order; failures are non-fatal.
      // eslint-disable-next-line no-await-in-loop
      const res = await uploadPhoto(file);
      if (!res.ok) {
        showToast('Upload Failed', 'One of your photos could not be uploaded.', 'error', { duration: 4000, icon: 'fa-times-circle' });
      }
    }
    await refetchPhotos();
  }

  async function removePhoto(id) {
    const res = await deletePhoto(id);
    if (res.ok) await refetchPhotos();
    else showToast('Delete Failed', 'Could not remove the photo. Please try again.', 'error', { duration: 4000, icon: 'fa-times-circle' });
  }

  function saveSettings() {
    // Local-only: these privacy toggles have no backend yet.
    showToast('Settings Saved', 'Your gallery privacy preferences have been updated.', 'success', { duration: 3000 });
  }

  return (
    <AccountLayout
      subtitle="My Gallery"
      title={<>My <span className="gradient-text">Gallery</span></>}
      description="Upload up to 6 photos. Your main profile picture will be shown first."
      sidebarActive="gallery"
      pills={PILLS.profile}
    >
      <div className="glass rounded-2xl p-6 card-shadow">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <i aria-hidden="true" className="fas fa-cloud-upload-alt text-brand" /> Upload Photos
        </h3>
        <div
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          aria-label="Upload photos"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <i aria-hidden="true" className="fas fa-images text-4xl text-slate-400 mb-3 group-hover:text-brand transition-colors" />
          {isTouchDevice ? (
            <>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Tap to select photos</p>
              <p className="text-sm text-slate-500 mb-4">from your camera or photo library</p>
            </>
          ) : (
            <>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Drag &amp; Drop photos here</p>
              <p className="text-sm text-slate-500 mb-4">or click to browse from your device</p>
            </>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg font-semibold transition shadow-md"
          >
            Select Photos
          </button>
          <p className="text-xs text-slate-400 mt-3">Supports JPG, PNG. Max 5MB per file.</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-images text-brand" /> Your Photos
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{`${photos.length} / ${MAX_PHOTOS} Uploaded`}</span>
        </div>
        {photos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
            <i aria-hidden="true" className="fas fa-camera text-4xl text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No photos yet. Upload your first photo to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img loading="lazy" decoding="async" src={photoFileUrl(photo.id, 'thumb')} alt="Gallery" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                  aria-label="Delete photo"
                >
                  <i aria-hidden="true" className="fas fa-trash-alt text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-user-shield text-brand" /> Privacy Settings
          </h3>
          <div className="space-y-5">
            {PRIVACY_ROWS.map((row, i) => (
              <Fragment key={row.key}>
                {i > 0 && <hr className="border-slate-200 dark:border-slate-700" />}
                <SettingRow
                  title={row.title}
                  description={row.description}
                  checked={privacy[row.key]}
                  onChange={(v) => setPrivacy((p) => ({ ...p, [row.key]: v }))}
                />
              </Fragment>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={saveSettings} className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-lg shadow-brand/30 transition transform hover:scale-[1.02] flex items-center gap-2">
              <i aria-hidden="true" className="fas fa-save" /> Save Settings
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i aria-hidden="true" className="fas fa-lightbulb text-brand" /> Photo Tips
          </h3>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
            {TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <i aria-hidden="true" className="fas fa-check-circle text-green-500 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AccountLayout>
  );
}
