import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Toast from '../components/ui/Toast.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success', icon: undefined });
  const timer = useRef(null);

  const hideToast = useCallback(() => setToast((t) => ({ ...t, show: false })), []);

  // options: { duration = 3500, icon } (Privacy & Security / Gallery / Edit Profile used 3000, Close Account 4000;
  // icon overrides the error icon). A plain number is still accepted as the duration.
  const showToast = useCallback((title, message, type = 'success', options = {}) => {
    const { duration = 3500, icon } = typeof options === 'number' ? { duration: options } : options;
    clearTimeout(timer.current);
    setToast({ show: true, title, message, type, icon });
    timer.current = setTimeout(hideToast, duration);
  }, [hideToast]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The original pages were separate documents, so a toast never survived navigation.
  const { pathname } = useLocation();
  useEffect(() => { clearTimeout(timer.current); hideToast(); }, [pathname, hideToast]);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast {...toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
