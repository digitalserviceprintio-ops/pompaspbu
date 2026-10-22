import React from 'react';

export interface ToastData {
  message: string;
  icon?: string;
  visible: boolean;
}

interface ToastProps {
  toast: ToastData;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  if (!toast.visible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform max-w-xs w-[90%] flex items-center gap-2 p-3 rounded-xl bg-[#283044] text-[#eef0ff] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-3">
      <span className="material-symbols-outlined text-[#78fc9c] text-[20px] shrink-0">
        {toast.icon || 'check_circle'}
      </span>
      <p className="font-body text-[12.5px] truncate flex-1 font-medium">{toast.message}</p>
    </div>
  );
};
