"use client";

import { useEffect } from "react";
import { LuX } from "react-icons/lu";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export default function Notification({
  message,
  type,
  onClose,
  duration = 3000,
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 rounded-lg p-4 shadow-lg ${
        type === "success"
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-800"
      }`}
    >
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-black/5"
          aria-label="Dismiss"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
