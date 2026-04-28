import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../types';

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (msg: string, type: ToastType = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, msg, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  return { toasts, showToast, removeToast };
};
