import React from 'react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'amber':
        return '⚠️';
      case 'error':
        return '✕';
      default:
        return '✓';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">{getIcon(toast.type)}</div>
          <div className="toast-message">{toast.msg}</div>
          <button
            className="toast-close"
            onClick={() => onRemove(toast.id)}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
