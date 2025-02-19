"use client";

import { LuX } from "react-icons/lu";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="absolute right-0 top-0 pr-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500"
              >
                <LuX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {title}
                </h3>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
