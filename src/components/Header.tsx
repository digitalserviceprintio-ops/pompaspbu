import React from 'react';
import { BluetoothDevice, CashierSession } from '../types';

interface HeaderProps {
  currentTab: 'buat-struk' | 'preview-dan-cetak' | 'riwayat-struk' | 'pengaturan-printer-dan-spbu';
  device: BluetoothDevice;
  session: CashierSession;
  onOpenSessionModal: () => void;
  onOpenDeviceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  device,
  session,
  onOpenSessionModal,
  onOpenDeviceModal,
}) => {
  const getSubTitle = () => {
    switch (currentTab) {
      case 'buat-struk':
        return 'Buat Struk';
      case 'preview-dan-cetak':
        return 'Preview Dan Cetak';
      case 'riwayat-struk':
        return 'Riwayat Struk';
      case 'pengaturan-printer-dan-spbu':
        return 'Pengaturan Printer Dan Spbu';
      default:
        return 'Sistem Kasir SPBU';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#faf8ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]">
      <div className="h-20 px-3.5 max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Pertamina Tri-Color Emblem */}
          <div className="flex items-center gap-0.5 shrink-0 bg-white p-1.5 rounded-lg shadow-xs border border-[#eaedff]">
            <span className="w-2.5 h-6 rounded-sm bg-[#bb0013] transform -skew-x-12 inline-block"></span>
            <span className="w-2.5 h-7 rounded-sm bg-[#245eaa] transform -skew-x-12 inline-block"></span>
            <span className="w-2.5 h-5 rounded-sm bg-[#008740] transform -skew-x-12 inline-block"></span>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-[15px] sm:text-[17px] text-[#bb0013] tracking-tight truncate">
                Pertamina SPBU POS
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#bb0013]/10 text-[#bb0013] font-headline text-[10px] font-bold uppercase tracking-wider">
                58mm
              </span>
            </div>
            <span className="font-body text-[11px] text-[#5e3f3c] font-medium truncate">
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Right: Bluetooth Telemetry & Operator Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenDeviceModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#e2e7ff] hover:bg-[#dae2fd] transition-colors cursor-pointer active:scale-95"
            title="Status Koneksi Printer Bluetooth"
            type="button"
          >
            <span className="relative flex h-2 w-2">
              {device.connected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008740] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  device.connected ? 'bg-[#008740]' : 'bg-[#ba1a1a]'
                }`}
              ></span>
            </span>
            <span className="material-symbols-outlined text-[#245eaa] text-[16px]">
              bluetooth
            </span>
            <span className="font-thermal-mono text-[11px] text-[#131b2e] font-semibold hidden sm:inline">
              {device.name} Connected
            </span>
            <span className="font-thermal-mono text-[11px] text-[#131b2e] font-semibold sm:hidden">
              {device.name.split(' ')[0]}
            </span>
          </button>

          <button
            onClick={onOpenSessionModal}
            className="w-8 h-8 rounded-full bg-[#bb0013] hover:bg-[#e71520] flex items-center justify-center shrink-0 ml-0.5 shadow-sm active:scale-95 transition-transform"
            title={`Sesi Shift: ${session.operatorName} (Shift ${session.shift})`}
            type="button"
          >
            <span className="material-symbols-outlined text-white text-[18px]">
              person
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
