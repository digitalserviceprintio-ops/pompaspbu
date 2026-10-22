import React, { useState } from 'react';
import { Transaction, SPBUSettings, BluetoothDevice } from '../types';
import { ThermalReceipt } from './ThermalReceipt';
import {
  formatRupiah,
  formatIndonesianDate,
  toInputDateValue,
  toInputTimeValue,
  fromDateTimeInput,
} from '../utils/formatters';

interface PreviewCetakTabProps {
  transaction: Transaction;
  settings: SPBUSettings;
  device: BluetoothDevice;
  onEditTransaction: () => void;
  onPrintComplete: (tx: Transaction, copies: number) => void;
  onOpenPrintModal: (tx: Transaction, copies: number) => void;
  onUpdateTimestamp?: (newTimestamp: string, newDateObj?: Date) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const PreviewCetakTab: React.FC<PreviewCetakTabProps> = ({
  transaction,
  settings,
  device,
  onEditTransaction,
  onPrintComplete,
  onOpenPrintModal,
  onUpdateTimestamp,
  onShowToast,
}) => {
  const [paperWidth, setPaperWidth] = useState<'58' | '80'>(settings.paperWidth);
  const [density, setDensity] = useState<'80' | '100' | '130'>(settings.printDensity);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Date editing state
  const [showDateEditor, setShowDateEditor] = useState<boolean>(false);
  const [inputDate, setInputDate] = useState<string>(
    toInputDateValue(transaction.rawDate || new Date())
  );
  const [inputTime, setInputTime] = useState<string>(
    toInputTimeValue(transaction.rawDate || new Date())
  );
  const [customText, setCustomText] = useState<string>(transaction.timestamp);

  // Zoom handlers
  const handleZoomIn = () => {
    if (zoomLevel < 125) setZoomLevel((prev) => prev + 10);
  };
  const handleZoomOut = () => {
    if (zoomLevel > 75) setZoomLevel((prev) => prev - 10);
  };

  // Copy multiplier
  const handleIncCopy = () => {
    if (copyCount < 5) setCopyCount((prev) => prev + 1);
  };
  const handleDecCopy = () => {
    if (copyCount > 1) setCopyCount((prev) => prev - 1);
  };

  // Execute Thermal Print
  const handlePrint = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 40, 50]);
    }

    setIsPrinting(true);
    onShowToast(`Mencetak struk ke printer ${device.name}...`, 'print');
    onPrintComplete(transaction, copyCount);

    setTimeout(() => {
      setIsPrinting(false);
      onOpenPrintModal(transaction, copyCount);
    }, 400);
  };

  // Share / Download as Image simulation
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Struk SPBU - ${transaction.nopol}`,
          text: `Struk Pembelian BBM ${transaction.fuelName} ${transaction.nopol} Total Rp ${formatRupiah(
            transaction.total
          )}`,
        })
        .catch(() => {});
    } else {
      onShowToast('Struk siap dibagikan / diunduh sebagai dokumen', 'share');
    }
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4 max-w-lg mx-auto">
      {/* Top Hardware Telemetry Pill */}
      <div className="w-full bg-[#eaedff] rounded-xl p-3 flex items-center justify-between shadow-xs border border-[#d2d9f4]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#dae2fd] flex items-center justify-center shrink-0 text-[#245eaa]">
            <span className="material-symbols-outlined text-[20px]">print</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#008740] animate-pulse"></span>
              <span className="font-headline text-[13px] text-[#131b2e] font-bold truncate">
                {device.name} (ESC/POS)
              </span>
            </div>
            <span className="font-body text-[11px] text-[#5e3f3c] truncate">
              Baterai {device.battery}% • Kertas Siap • BT Siap
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => onShowToast('Self-test ESC/POS OK. Sinyal kuat -48dBm', 'sensors')}
            className="px-2.5 py-1 bg-[#dae2fd] hover:bg-[#7aacfd] hover:text-[#001b3d] text-[#245eaa] rounded-lg font-headline text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            <span>Tes</span>
          </button>
        </div>
      </div>

      {/* Thermal Paper Setting Controls Bar */}
      <div className="bg-white rounded-xl p-3 space-y-3 shadow-xs border border-[#eaedff]">
        {/* Size segmented switcher & zoom */}
        <div className="flex items-center justify-between gap-2">
          <div className="grid grid-cols-2 p-1 bg-[#eaedff] rounded-lg flex-1">
            <button
              type="button"
              onClick={() => setPaperWidth('58')}
              className={`py-1.5 text-center rounded-md font-headline text-[12px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                paperWidth === '58'
                  ? 'bg-[#bb0013] text-white shadow-xs font-bold'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">straighten</span>
              <span>58mm Roll</span>
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('80')}
              className={`py-1.5 text-center rounded-md font-headline text-[12px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                paperWidth === '80'
                  ? 'bg-[#245eaa] text-white shadow-xs font-bold'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">aspect_ratio</span>
              <span>80mm Kios</span>
            </button>
          </div>

          {/* Quick Zoom control */}
          <div className="flex items-center bg-[#eaedff] rounded-lg p-1 space-x-1 border border-[#d2d9f4]">
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-7 h-7 flex items-center justify-center text-[#5e3f3c] hover:text-[#131b2e] rounded active:bg-[#dae2fd] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-thermal-mono text-[11px] text-[#131b2e] px-1 font-bold">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-7 h-7 flex items-center justify-center text-[#5e3f3c] hover:text-[#131b2e] rounded active:bg-[#dae2fd] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Density Profile Switcher */}
        <div className="flex items-center justify-between pt-1">
          <span className="font-body text-[11.5px] text-[#5e3f3c] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">contrast</span> Kepekatan Thermal:
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setDensity('80')}
              className={`px-2 py-0.5 rounded text-[11px] font-headline font-semibold transition-all cursor-pointer ${
                density === '80'
                  ? 'bg-[#283044] text-white shadow-xs'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Eco
            </button>
            <button
              type="button"
              onClick={() => setDensity('100')}
              className={`px-2.5 py-0.5 rounded text-[11px] font-headline font-bold transition-all cursor-pointer ${
                density === '100'
                  ? 'bg-[#283044] text-white shadow-xs'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Pasti Pas (Bold)
            </button>
            <button
              type="button"
              onClick={() => setDensity('130')}
              className={`px-2 py-0.5 rounded text-[11px] font-headline font-semibold transition-all cursor-pointer ${
                density === '130'
                  ? 'bg-[#283044] text-white shadow-xs'
                  : 'bg-[#eaedff] text-[#5e3f3c]'
              }`}
            >
              Maksimal
            </button>
          </div>
        </div>

        {/* Date & Time Struk Quick Adjuster Bar */}
        <div className="pt-2 border-t border-dashed border-[#eaedff]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
                calendar_month
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-[9.5px] text-[#5e3f3c] uppercase font-bold">
                  WAKTU TERCANTUM PADA STRUK
                </span>
                <span className="font-thermal-mono font-bold text-[#131b2e] text-[12px] truncate">
                  {transaction.timestamp}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDateEditor(!showDateEditor)}
              className="px-2.5 py-1 rounded bg-[#eaedff] hover:bg-[#d2d9f4] text-[#245eaa] font-headline text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
              <span>{showDateEditor ? 'Tutup' : 'Ubah Tanggal'}</span>
            </button>
          </div>

          {/* Expanded Date Editor */}
          {showDateEditor && (
            <div className="mt-2.5 p-3 rounded-xl bg-[#faf8ff] border border-[#d2d9f4] space-y-2 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-0.5">
                  <label className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold">
                    Pilih Tanggal
                  </label>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => {
                      setInputDate(e.target.value);
                      const dObj = fromDateTimeInput(e.target.value, inputTime);
                      const fmt = formatIndonesianDate(dObj);
                      setCustomText(fmt);
                      transaction.timestamp = fmt;
                      transaction.rawDate = dObj;
                      onUpdateTimestamp?.(fmt, dObj);
                    }}
                    className="w-full bg-white text-[#131b2e] font-thermal-mono text-[11.5px] font-bold px-2 py-1.5 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold">
                    Pilih Jam (WIB)
                  </label>
                  <input
                    type="time"
                    step="1"
                    value={inputTime}
                    onChange={(e) => {
                      setInputTime(e.target.value);
                      const dObj = fromDateTimeInput(inputDate, e.target.value);
                      const fmt = formatIndonesianDate(dObj);
                      setCustomText(fmt);
                      transaction.timestamp = fmt;
                      transaction.rawDate = dObj;
                      onUpdateTimestamp?.(fmt, dObj);
                    }}
                    className="w-full bg-white text-[#131b2e] font-thermal-mono text-[11.5px] font-bold px-2 py-1.5 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
                  />
                </div>
              </div>

              {/* Direct Text String Edit */}
              <div className="flex flex-col gap-0.5">
                <label className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold flex items-center justify-between">
                  <span>Format Teks Cetak Bebas</span>
                  <span className="text-[#245eaa] font-normal lowercase">ketik langsung</span>
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    transaction.timestamp = e.target.value;
                    onUpdateTimestamp?.(e.target.value);
                  }}
                  className="w-full bg-white text-[#131b2e] font-thermal-mono text-[11.5px] font-bold px-2 py-1 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const d = toInputDateValue(now);
                    const t = toInputTimeValue(now);
                    setInputDate(d);
                    setInputTime(t);
                    const fmt = formatIndonesianDate(now);
                    setCustomText(fmt);
                    transaction.timestamp = fmt;
                    transaction.rawDate = now;
                    onUpdateTimestamp?.(fmt, now);
                    onShowToast('Tanggal diubah ke sekarang', 'schedule');
                  }}
                  className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-headline text-[10px] font-bold whitespace-nowrap cursor-pointer hover:bg-[#d2d9f4]"
                >
                  Waktu Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputDate('2018-03-21');
                    setInputTime('15:37:23');
                    const fmt = 'Minggu, 21 Maret 2018 15:37:23';
                    setCustomText(fmt);
                    transaction.timestamp = fmt;
                    transaction.rawDate = new Date('2018-03-21T15:37:23');
                    onUpdateTimestamp?.(fmt, transaction.rawDate);
                    onShowToast('Tanggal diubah ke foto struk asli (21 Mar 2018)', 'history');
                  }}
                  className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#410002] font-headline text-[10px] font-bold whitespace-nowrap cursor-pointer border border-[#bb0013]/30"
                >
                  Struk Asli (21 Mar 2018)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dObj = fromDateTimeInput(inputDate, inputTime);
                    dObj.setHours(dObj.getHours() - 1);
                    const d = toInputDateValue(dObj);
                    const t = toInputTimeValue(dObj);
                    setInputDate(d);
                    setInputTime(t);
                    const fmt = formatIndonesianDate(dObj);
                    setCustomText(fmt);
                    transaction.timestamp = fmt;
                    transaction.rawDate = dObj;
                    onUpdateTimestamp?.(fmt, dObj);
                    onShowToast('Waktu digeser -1 jam', 'schedule');
                  }}
                  className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-headline text-[10px] font-bold whitespace-nowrap cursor-pointer hover:bg-[#d2d9f4]"
                >
                  -1 Jam
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Realistic Thermal Paper Canvas Preview */}
      <div className="w-full flex justify-center py-2 px-1 overflow-hidden">
        <div
          className="transition-transform duration-300 filter drop-shadow-md"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          <ThermalReceipt
            transaction={transaction}
            settings={settings}
            paperWidth={paperWidth}
            density={density}
          />
        </div>
      </div>

      {/* Operational Summary Chips */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 flex items-center space-x-2.5 shadow-xs border border-[#eaedff]">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#bb0013] shrink-0">
            <span className="material-symbols-outlined text-[20px]">local_gas_station</span>
          </div>
          <div className="min-w-0">
            <span className="font-headline text-[10px] text-[#5e3f3c] block uppercase font-bold truncate">
              Nozzle Pompa
            </span>
            <span className="font-headline text-[14px] text-[#131b2e] font-bold">
              Dispenser {transaction.nozzle}
            </span>
          </div>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 flex items-center space-x-2.5 shadow-xs border border-[#eaedff]">
          <div className="w-9 h-9 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#245eaa] shrink-0">
            <span className="material-symbols-outlined text-[20px]">payments</span>
          </div>
          <div className="min-w-0">
            <span className="font-headline text-[10px] text-[#5e3f3c] block uppercase font-bold truncate">
              Pola Transaksi
            </span>
            <span className="font-headline text-[14px] text-[#131b2e] font-bold truncate">
              Rp {formatRupiah(transaction.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Copy Multiplier & Print Controls */}
      <div className="bg-white rounded-xl p-3.5 space-y-3 shadow-md border border-[#eaedff]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#245eaa] text-[20px]">
              content_copy
            </span>
            <span className="font-headline text-[13px] text-[#131b2e] font-bold">
              Salinan Cetak (Copy)
            </span>
          </div>

          {/* Incrementer */}
          <div className="flex items-center bg-[#eaedff] rounded-lg p-1 space-x-2 border border-[#d2d9f4]">
            <button
              type="button"
              onClick={handleDecCopy}
              className="w-7 h-7 rounded bg-white text-[#131b2e] flex items-center justify-center font-bold active:bg-[#dae2fd] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span className="font-headline text-[14px] text-[#131b2e] font-bold px-1.5">
              {copyCount}x
            </span>
            <button
              type="button"
              onClick={handleIncCopy}
              className="w-7 h-7 rounded bg-white text-[#131b2e] flex items-center justify-center font-bold active:bg-[#dae2fd] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        </div>

        {/* Secondary Fast Action Utilities */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onEditTransaction}
            className="h-11 px-3 bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd] rounded-xl font-headline text-[12.5px] font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Edit Data BBM</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="h-11 px-3 bg-[#eaedff] text-[#245eaa] hover:bg-[#dae2fd] rounded-xl font-headline text-[12.5px] font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            <span>Kirim Gambar/PDF</span>
          </button>
        </div>

        {/* Master Action: High-Tactile Print Trigger */}
        <button
          type="button"
          disabled={isPrinting}
          onClick={handlePrint}
          className="w-full min-h-[54px] bg-[#bb0013] hover:bg-[#e71520] text-white rounded-xl font-headline text-[15px] sm:text-[16px] font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
        >
          {isPrinting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[24px]">
                progress_activity
              </span>
              <span>Mencetak ke Printer Thermal...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[24px]">print</span>
              <span>CETAK STRUK SEKARANG ({copyCount} Salinan)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
