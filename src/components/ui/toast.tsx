'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from './use-toast';

export function Toaster() {
  const { toasts } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <div className="fixed top-0 right-0 z-50 flex flex-col p-4 space-y-4 max-w-xs w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${
            toast.variant === 'destructive' ? 'border-l-4 border-red-500' : 'border-l-4 border-emerald-500'
          }`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                {toast.title && (
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                )}
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss()}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
} 