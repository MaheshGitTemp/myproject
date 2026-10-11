import { useCallback, useRef, useState } from 'react';

// Page-local stack of green success toasts (Matches / Search / Chat each keep their own list in the original).
export default function useToastStack(duration = 3500) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);
  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const show = useCallback((title, message) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, title, message }]);
    setTimeout(() => remove(id), duration);
  }, [duration, remove]);
  return { toasts, showToast: show, removeToast: remove };
}
