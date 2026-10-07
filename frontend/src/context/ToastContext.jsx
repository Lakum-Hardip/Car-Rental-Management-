import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container overlay matching original toast-3d markup */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-3d pointer-events-auto shadow-2xl ${
              toast.type === 'success'
                ? 'toast-success'
                : toast.type === 'error'
                ? 'toast-error'
                : toast.type === 'warning'
                ? 'toast-warning'
                : 'toast-info'
            }`}
          >
            <i
              className={
                toast.type === 'success'
                  ? 'fas fa-check-circle'
                  : toast.type === 'error'
                  ? 'fas fa-exclamation-triangle'
                  : toast.type === 'warning'
                  ? 'fas fa-bell'
                  : 'fas fa-info-circle'
              }
            />
            <div className="text-sm font-medium">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
