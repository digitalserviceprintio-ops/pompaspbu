import React, { useState, useMemo } from 'react';
import { Transaction, FuelId, SPBUSettings, CashierSession } from '../types';
import { formatRupiah, formatLiter } from '../utils/formatters';
import { ThermalReceipt } from './ThermalReceipt';

interface RiwayatTabProps {
  transactions: Transaction[];
  settings: SPBUSettings;
  session: CashierSession;
  onReprint: (tx: Transaction) => void;
  onOpenRekap: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const RiwayatTab: React.FC<RiwayatTabProps> = ({
  transactions,
  settings,
  session,
  onReprint,
  onOpenRekap,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShift, setSelectedShift] = useState<number>(session.shift);
  const [selectedFuelFilter, setSelectedFuelFilter] = useState<string>('all');
  const [previewTx, setPreviewTx] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Shift filter
      if (tx.shift !== selectedShift) return false;

      // Fuel filter
      if (selectedFuelFilter !== 'all' && tx.fuelId !== selectedFuelFilter) return false;

      // Search query (nopol or trx ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPlate = tx.nopol.toLowerCase().includes(q);
        const matchId = tx.id.toLowerCase().includes(q) || tx.trxNumber.toLowerCase().includes(q);
        if (!matchPlate && !matchId) return false;
      }

      return true;
    });
  }, [transactions, selectedShift, selectedFuelFilter, searchQuery]);

  // Aggregate metrics
  const totalStruk = transactions.length + 136; // base historical offset for realism
  const totalOmset = transactions.reduce((acc, t) => acc + t.total, 8420000 - 130118 * 4);
  const totalLiters = transactions.reduce((acc, t) => acc + t.volume, 685.4 - 15.13 * 4);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleDirectReprint = (tx: Transaction) => {
    if (navigator.vibrate) navigator.vibrate(40);
    onShowToast(`Mencetak ulang struk ${tx.nopol} (${tx.id})...`, 'print');
    onReprint(tx);
  };

  return (
    <div className="flex flex-col w-full pb-8 gap-3.5 max-w-lg mx-auto">
      {/* Status Bar & Shift Context Strip */}
      <div className="w-full bg-[#eaedff] rounded-xl p-2.5 shadow-xs border border-[#d2d9f4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#bb0013] text-white">
            <span className="material-symbols-outlined text-[16px]">local_gas_station</span>
          </span>
          <div>
            <p className="font-headline text-[10.5px] text-[#5e3f3c] leading-none uppercase font-bold">
              {settings.spbuNumber} Waru
            </p>
            <p className="font-headline text-[13.5px] text-[#131b2e] font-bold leading-tight">
              Pos Pulau {session.island} (Nozzle 3-6)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#008740] shadow-xs border border-[#008740]/20">
          <span className="w-2 h-2 rounded-full bg-[#008740] animate-pulse"></span>
          <span className="font-headline text-[11px] font-bold uppercase">SHIFT AKTIF</span>
        </div>
      </div>

      {/* Operational Metric Tiles (Summary) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Struk Card */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="font-headline text-[11px] font-bold uppercase">Struk</span>
            <span className="material-symbols-outlined text-[16px] text-[#245eaa]">receipt</span>
          </div>
          <div className="mt-2">
            <span className="font-headline text-[20px] font-extrabold text-[#131b2e] tracking-tight">
              {totalStruk}
            </span>
            <span className="font-body text-[10px] text-[#5e3f3c] ml-0.5">lbr</span>
          </div>
          <p className="font-headline text-[10px] text-[#008740] font-bold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            100% OK
          </p>
        </div>

        {/* Omset Card */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="font-headline text-[11px] font-bold uppercase">Omset</span>
            <span className="material-symbols-outlined text-[16px] text-[#bb0013]">payments</span>
          </div>
          <div className="mt-2">
            <span className="font-headline text-[10px] font-bold text-[#bb0013] block leading-none">
              Rp
            </span>
            <span className="font-headline text-[19px] font-extrabold text-[#131b2e] tracking-tight truncate">
              {(totalOmset / 1000000).toFixed(2)}M
            </span>
          </div>
          <p className="font-thermal-mono text-[10px] text-[#5e3f3c] mt-1 truncate">
            {formatRupiah(totalOmset)}
          </p>
        </div>

        {/* Volume Card */}
        <div className="bg-white rounded-xl p-2.5 shadow-xs border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5e3f3c]">
            <span className="font-headline text-[11px] font-bold uppercase">BBM</span>
            <span className="material-symbols-outlined text-[16px] text-[#008740]">water_drop</span>
          </div>
          <div className="mt-2">
            <span className="font-headline text-[20px] font-extrabold text-[#131b2e] tracking-tight">
              {formatLiter(totalLiters)}
            </span>
            <span className="font-body text-[10px] text-[#5e3f3c] ml-0.5">L</span>
          </div>
          <p className="font-body text-[10px] text-[#5e3f3c] mt-1 truncate">Total Liter</p>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="flex flex-col gap-2">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5e3f3c] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Plat (misal: W 416 RH) atau No Struk..."
            className="w-full bg-white text-[#131b2e] font-body text-[13px] rounded-xl pl-10 pr-24 py-2.5 shadow-xs border border-[#eaedff] outline-none placeholder:text-[#5e3f3c]/60 uppercase focus:border-[#245eaa]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-[#5e3f3c] p-1 rounded-full hover:bg-[#eaedff] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            <span className="px-1.5 py-0.5 rounded bg-[#e2e7ff] text-[#245eaa] font-headline text-[9.5px] font-bold">
              NOPOL
            </span>
          </div>
        </div>

        {/* Shift Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#eaedff] p-1 rounded-xl border border-[#d2d9f4]">
          {[1, 2, 3].map((shiftNum) => {
            const isActive = selectedShift === shiftNum;
            const hours =
              shiftNum === 1 ? '06-14' : shiftNum === 2 ? '14-22' : '22-06';
            return (
              <button
                key={shiftNum}
                type="button"
                onClick={() => setSelectedShift(shiftNum)}
                className={`py-1.5 px-2 rounded-lg text-center font-headline text-[12px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#bb0013] shadow-xs font-bold'
                    : 'text-[#5e3f3c] hover:text-[#131b2e]'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#bb0013] animate-pulse"></span>}
                <span>Shift {shiftNum}</span>
                <span className="font-thermal-mono text-[9.5px] opacity-75">({hours})</span>
              </button>
            );
          })}
        </div>

        {/* Fuel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedFuelFilter('all')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-headline text-[11px] font-bold transition-all cursor-pointer ${
              selectedFuelFilter === 'all'
                ? 'bg-[#bb0013] text-white shadow-xs'
                : 'bg-white text-[#131b2e] hover:bg-[#eaedff] border border-[#eaedff]'
            }`}
          >
            Semua BBM
          </button>
          <button
            type="button"
            onClick={() => setSelectedFuelFilter('pertalite')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-headline text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFuelFilter === 'pertalite'
                ? 'bg-[#006b32] text-white shadow-xs'
                : 'bg-white text-[#131b2e] hover:bg-[#eaedff] border border-[#eaedff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#008740]"></span>
            Pertalite
          </button>
          <button
            type="button"
            onClick={() => setSelectedFuelFilter('pertamax')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-headline text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFuelFilter === 'pertamax'
                ? 'bg-[#245eaa] text-white shadow-xs'
                : 'bg-white text-[#131b2e] hover:bg-[#eaedff] border border-[#eaedff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#245eaa]"></span>
            Pertamax
          </button>
          <button
            type="button"
            onClick={() => setSelectedFuelFilter('pertamax-turbo')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-headline text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFuelFilter === 'pertamax-turbo'
                ? 'bg-[#bb0013] text-white shadow-xs'
                : 'bg-white text-[#131b2e] hover:bg-[#eaedff] border border-[#eaedff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#bb0013]"></span>
            Pertamax Turbo
          </button>
          <button
            type="button"
            onClick={() => setSelectedFuelFilter('pertamina-dex')}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full font-headline text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFuelFilter === 'pertamina-dex'
                ? 'bg-[#283044] text-white shadow-xs'
                : 'bg-white text-[#131b2e] hover:bg-[#eaedff] border border-[#eaedff]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#283044]"></span>
            Pertamina Dex
          </button>
        </div>
      </div>

      {/* Section Header with Real-Time Indicator */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <h2 className="font-headline text-[15px] font-bold text-[#131b2e]">
            Daftar Transaksi
          </h2>
          <span className="bg-[#d6e3ff] text-[#003f7e] font-headline text-[11px] font-bold px-2 py-0.5 rounded-full">
            {filteredTransactions.length} Struk Ditampilkan
          </span>
        </div>
        <button
          type="button"
          onClick={() => onShowToast('Sinkronisasi data dispenser selesai', 'sync')}
          className="text-[#245eaa] flex items-center gap-1 font-headline text-[11.5px] font-bold hover:underline cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>Segarkan</span>
        </button>
      </div>

      {/* Receipt Cards Feed */}
      <div className="flex flex-col gap-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white rounded-xl shadow-xs border border-[#eaedff]">
            <div className="w-12 h-12 rounded-full bg-[#eaedff] flex items-center justify-center mb-2.5 text-[#5e3f3c]">
              <span className="material-symbols-outlined text-[26px]">search_off</span>
            </div>
            <h3 className="font-headline text-[14px] font-bold text-[#131b2e]">
              Struk Tidak Ditemukan
            </h3>
            <p className="font-body text-[11.5px] text-[#5e3f3c] max-w-xs mt-1">
              Periksa kembali nomor plat atau kode transaksi di filter shift ini.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <article
              key={tx.id}
              className="bg-white rounded-xl shadow-xs border border-[#eaedff] p-3 flex flex-col gap-2 transition-all hover:border-[#245eaa]/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.vehicleType === 'bike'
                        ? 'bg-[#008740]/10 text-[#008740]'
                        : 'bg-[#245eaa]/10 text-[#245eaa]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {tx.vehicleType === 'bike' ? 'two_wheeler' : 'directions_car'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-[15px] font-bold text-[#131b2e] tracking-wide">
                        {tx.nopol}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-[#78fc9c] text-[#00210b] font-headline text-[9.5px] font-bold">
                        {tx.status}
                      </span>
                    </div>
                    <p className="font-thermal-mono text-[11px] text-[#5e3f3c]">
                      #{tx.id} • Selang {tx.nozzle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-headline text-[16px] font-extrabold text-[#bb0013]">
                    Rp {formatRupiah(tx.total)}
                  </div>
                  <span className="font-thermal-mono text-[10.5px] text-[#5e3f3c]">
                    {tx.timestamp.split(' ').slice(-1)[0]} WIB
                  </span>
                </div>
              </div>

              {/* Metered Specification Row */}
              <div className="bg-[#f2f3ff] rounded-lg p-2 grid grid-cols-3 gap-2 text-center border border-[#eaedff]">
                <div>
                  <span className="block font-headline text-[9.5px] text-[#5e3f3c] uppercase font-bold">
                    Produk
                  </span>
                  <span className="font-headline text-[12px] text-[#245eaa] font-bold truncate block">
                    {tx.fuelName}
                  </span>
                </div>
                <div>
                  <span className="block font-headline text-[9.5px] text-[#5e3f3c] uppercase font-bold">
                    Volume
                  </span>
                  <span className="font-thermal-mono text-[12px] text-[#131b2e] font-bold">
                    {formatLiter(tx.volume)} L
                  </span>
                </div>
                <div>
                  <span className="block font-headline text-[9.5px] text-[#5e3f3c] uppercase font-bold">
                    Tarif/L
                  </span>
                  <span className="font-thermal-mono text-[12px] text-[#131b2e]">
                    Rp {formatRupiah(tx.unitPrice)}
                  </span>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center justify-between pt-0.5 gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTx(tx)}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#245eaa]">
                    visibility
                  </span>
                  <span>Lihat Struk 58mm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectReprint(tx)}
                  className="py-2 px-3.5 rounded-lg bg-[#bb0013] hover:bg-[#e71520] text-white font-headline text-[11.5px] font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak Ulang</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* End of Shift Report Action Bar (Tactile Pinned CTA) */}
      <div className="mt-2 pt-1 flex flex-col gap-2">
        <button
          type="button"
          onClick={onOpenRekap}
          className="w-full min-h-[52px] bg-[#245eaa] hover:bg-[#003f7e] text-white rounded-xl px-4 py-3 shadow-md flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            <div>
              <span className="font-headline text-[14.5px] font-bold leading-tight block">
                Rekap Shift {selectedShift} (Tutup Buku)
              </span>
              <span className="font-thermal-mono text-[11px] text-[#d6e3ff]">
                Cetak Ringkasan 58mm • {totalStruk} Transaksi
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[22px]">chevron_right</span>
        </button>
      </div>

      {/* Thermal 58mm Receipt Preview Modal */}
      {previewTx && (
        <div className="fixed inset-0 z-50 bg-[#283044]/70 backdrop-blur-xs flex flex-col justify-end p-2 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-3 bg-[#eaedff] flex items-center justify-between border-b border-[#d2d9f4]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#245eaa] text-[20px]">
                  print
                </span>
                <span className="font-headline text-[14px] font-bold text-[#131b2e]">
                  Pratinjau Kertas 58mm ({previewTx.nopol})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTx(null)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#131b2e] hover:bg-[#d2d9f4] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-4 overflow-y-auto bg-[#f2f3ff] flex justify-center">
              <ThermalReceipt
                transaction={previewTx}
                settings={settings}
                paperWidth="58"
                density="100"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-white border-t border-[#eaedff] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewTx(null);
                  handleDirectReprint(previewTx);
                }}
                className="flex-1 min-h-[48px] bg-[#bb0013] hover:bg-[#e71520] text-white font-headline text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                <span>Cetak ke Printer RPP-02N</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
