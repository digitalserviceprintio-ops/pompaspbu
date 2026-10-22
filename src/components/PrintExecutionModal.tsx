import React, { useState, useEffect } from 'react';
import { Transaction, SPBUSettings, BluetoothDevice } from '../types';
import {
  playPrinterSound,
  generateESCPOSText,
  printViaWebBluetooth,
  downloadReceiptAsImage,
} from '../utils/thermalPrinter';
import { ThermalReceipt } from './ThermalReceipt';
import { formatRupiah } from '../utils/formatters';

interface PrintExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  settings: SPBUSettings;
  device: BluetoothDevice;
  copies?: number;
  onConfirmSuccess?: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const PrintExecutionModal: React.FC<PrintExecutionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings,
  device,
  copies = 1,
  onConfirmSuccess,
  onShowToast,
}) => {
  const [printStage, setPrintStage] = useState<'printing' | 'success'>('printing');
  const [progress, setProgress] = useState<number>(0);
  const [bluetoothStatus, setBluetoothStatus] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      setPrintStage('printing');
      setProgress(0);
      setBluetoothStatus('');
      return;
    }

    // Play tactile mechanical thermal sound
    playPrinterSound();

    // Animate printing sequence
    setProgress(20);
    const t1 = setTimeout(() => setProgress(55), 350);
    const t2 = setTimeout(() => setProgress(85), 700);
    const t3 = setTimeout(() => {
      setProgress(100);
      setPrintStage('success');
      onConfirmSuccess?.();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct Browser Print
  const handleBrowserPrint = () => {
    try {
      window.print();
      onShowToast('Dialog cetak sistem dibuka', 'print');
    } catch (e) {
      console.log('Browser print error:', e);
      onShowToast('Memproses cetak thermal...', 'print');
    }
  };

  // Direct Web Bluetooth
  const handleBluetoothDirect = async () => {
    try {
      const rawText = generateESCPOSText(transaction, settings);
      await printViaWebBluetooth(rawText, (status) => setBluetoothStatus(status));
      onShowToast(`Terkirim ke printer Bluetooth ${device.name}!`, 'bluetooth_connected');
    } catch (err: any) {
      onShowToast(err.message || 'Gagal koneksi Bluetooth. Menggunakan dialog cetak.', 'info');
      handleBrowserPrint();
    }
  };

  // Copy raw text for RawBT app
  const handleCopyText = () => {
    const rawText = generateESCPOSText(transaction, settings);
    navigator.clipboard.writeText(rawText).then(() => {
      onShowToast('Format teks ESC/POS 32-kolom berhasil disalin!', 'content_copy');
    });
  };

  // Download receipt image
  const handleDownloadImage = () => {
    downloadReceiptAsImage(
      'printable-thermal-receipt',
      `Struk_${transaction.nopol.replace(/\s+/g, '_')}_${transaction.id}.png`
    );
    onShowToast('Gambar struk berhasil diunduh (PNG)', 'download');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/75 backdrop-blur-xs flex flex-col justify-center items-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col my-auto max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Hardware Header Bar */}
        <div className="bg-[#245eaa] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] animate-pulse">
              print
            </span>
            <div>
              <span className="font-headline text-[13.5px] font-bold block leading-tight">
                {device.name}
              </span>
              <span className="font-thermal-mono text-[10.5px] text-[#d6e3ff]">
                Kanal Bluetooth • ESC/POS 58mm
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Paper Dispenser Mechanical Visual */}
        <div className="bg-[#f2f3ff] p-4 flex flex-col items-center border-b border-[#eaedff]">
          {/* Printer Output Slot */}
          <div className="w-48 h-3.5 bg-[#283044] rounded-t-lg shadow-inner flex items-center justify-center">
            <div className="w-40 h-1 bg-black/60 rounded-full"></div>
          </div>

          {/* Animated Dispensing Receipt Slip */}
          <div
            className="w-44 bg-white p-2.5 shadow-md border-x border-b border-[#d2d9f4] font-thermal-mono text-[9.5px] leading-tight text-neutral-900 transition-all duration-700 ease-out overflow-hidden"
            style={{
              maxHeight: printStage === 'printing' ? '120px' : '190px',
              opacity: progress > 15 ? 1 : 0.6,
            }}
          >
            <div className="text-center font-bold pb-1 border-b border-black border-dashed">
              PERTAMINA RETAIL
              <br />
              {settings.spbuNumber}
            </div>
            <div className="py-1 text-[9px] space-y-0.5">
              <div className="flex justify-between">
                <span>Selang #{transaction.nozzle}</span>
                <span className="font-bold">{transaction.fuelName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-bold">Rp {formatRupiah(transaction.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nopol</span>
                <span className="font-bold">{transaction.nopol}</span>
              </div>
            </div>
            <div className="text-center pt-1 border-t border-black border-dashed text-[8px] text-neutral-600">
              TERIMA KASIH • PASTI PAS!
            </div>
          </div>

          {/* Progress & Status Message */}
          <div className="w-full mt-3.5 space-y-1.5">
            <div className="flex justify-between items-center text-[11.5px] font-headline font-bold">
              <span className="text-[#131b2e] flex items-center gap-1">
                {printStage === 'printing' ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] animate-spin text-[#245eaa]">
                      progress_activity
                    </span>
                    Mengirim Data Thermal ({copies}x)...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#008740]">
                      task_alt
                    </span>
                    Struk Berhasil Dicetak!
                  </>
                )}
              </span>
              <span className="font-thermal-mono text-[#245eaa]">{progress}%</span>
            </div>

            <div className="w-full bg-[#dae2fd] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#bb0013] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {bluetoothStatus && (
              <p className="font-thermal-mono text-[10.5px] text-[#245eaa] text-center pt-0.5 animate-pulse">
                {bluetoothStatus}
              </p>
            )}
          </div>
        </div>

        {/* Action Options */}
        <div className="p-3.5 flex flex-col gap-2 bg-white">
          <button
            type="button"
            onClick={handleBrowserPrint}
            className="w-full min-h-[46px] bg-[#bb0013] hover:bg-[#e71520] active:scale-[0.98] text-white font-headline text-[13.5px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>Buka Dialog Cetak / Simpan PDF</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleBluetoothDirect}
              className="py-2.5 px-2 bg-[#eaedff] hover:bg-[#d2d9f4] text-[#245eaa] font-headline text-[11.5px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Kirim byte stream ESC/POS langsung via Bluetooth"
            >
              <span className="material-symbols-outlined text-[17px]">bluetooth</span>
              <span>Web Bluetooth</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              className="py-2.5 px-2 bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[11.5px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Simpan gambar struk monokrom resolusi tinggi"
            >
              <span className="material-symbols-outlined text-[17px]">image</span>
              <span>Simpan Gambar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyText}
            className="py-2 px-3 bg-[#f2f3ff] hover:bg-[#eaedff] text-[#5e3f3c] font-headline text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#eaedff]"
          >
            <span className="material-symbols-outlined text-[15px]">content_copy</span>
            <span>Salin Teks ESC/POS (Untuk RawBT / Bluetooth Print)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 mt-1 bg-white hover:bg-[#f2f3ff] text-[#131b2e] font-headline text-[12.5px] font-bold rounded-xl transition-colors cursor-pointer border border-[#d2d9f4]"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
