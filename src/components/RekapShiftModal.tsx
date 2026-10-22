import React from 'react';
import { Transaction, SPBUSettings, CashierSession, FuelProduct } from '../types';
import { formatRupiah, formatLiter, formatIndonesianDate } from '../utils/formatters';

interface RekapShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: SPBUSettings;
  session: CashierSession;
  fuels: FuelProduct[];
  onShowToast: (message: string, icon?: string) => void;
}

export const RekapShiftModal: React.FC<RekapShiftModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  session,
  fuels,
  onShowToast,
}) => {
  if (!isOpen) return null;

  // Aggregate by fuel
  const shiftTransactions = transactions.filter((t) => t.shift === session.shift);
  const totalCount = shiftTransactions.length + 136; // combined with historical shift baseline
  const totalRupiah = shiftTransactions.reduce((acc, t) => acc + t.total, 8420000 - 130118 * 4);
  const totalLiters = shiftTransactions.reduce((acc, t) => acc + t.volume, 685.4 - 15.13 * 4);

  const cashTotal = shiftTransactions
    .filter((t) => t.paymentMethod === 'cash')
    .reduce((acc, t) => acc + t.total, 5820000);
  const cashlessTotal = totalRupiah - cashTotal;

  const handlePrintRekap = () => {
    onShowToast(`Mencetak Rekap Tutup Shift ${session.shift} ke thermal 58mm...`, 'print');
    setTimeout(() => {
      onShowToast('Rekap Shift 2 berhasil dicetak!', 'check_circle');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/70 backdrop-blur-xs flex flex-col justify-end p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto border border-[#eaedff]">
        {/* Header */}
        <div className="p-3.5 bg-[#eaedff] flex items-center justify-between border-b border-[#d2d9f4]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#245eaa] text-[22px]">
              receipt_long
            </span>
            <div>
              <span className="font-headline text-[14.5px] font-bold text-[#131b2e] block">
                Rekap Tutup Buku Shift {session.shift}
              </span>
              <span className="font-thermal-mono text-[11px] text-[#5e3f3c]">
                Pulau {session.island} • {settings.spbuNumber}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#5e3f3c] hover:text-[#131b2e] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Thermal Slip Styled Content */}
        <div className="p-4 overflow-y-auto bg-[#f2f3ff] flex justify-center">
          <div className="w-[310px] bg-white p-4 font-thermal-mono text-[12px] leading-tight text-neutral-900 shadow-md border border-[#eaedff]">
            {/* Header branding */}
            <div className="text-center space-y-0.5 pb-2 border-b border-black border-dashed">
              <span className="font-headline font-black text-[15px] tracking-wider text-[#bb0013]">
                PERTAMINA RETAIL
              </span>
              <p className="font-bold text-[12px]">{settings.spbuNumber}</p>
              <p className="text-[11px]">{settings.address}</p>
              <p className="text-[10px] text-neutral-600">{settings.city}</p>
              <p className="text-[11px] font-bold uppercase pt-1 text-[#245eaa]">
                LAPORAN REKAP PENJUALAN SHIFT
              </p>
            </div>

            {/* Shift metadata */}
            <div className="py-2 space-y-1 text-[11px] border-b border-black border-dashed">
              <div className="flex justify-between">
                <span>Tanggal</span>
                <span className="font-bold">{formatIndonesianDate().split(' ').slice(0, 4).join(' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shift</span>
                <span className="font-bold">: {session.shift} (14:00 - 22:00)</span>
              </div>
              <div className="flex justify-between">
                <span>Pulau Pompa</span>
                <span className="font-bold">: Pulau {session.island} (Nozzle 3-6)</span>
              </div>
              <div className="flex justify-between">
                <span>Operator</span>
                <span className="font-bold">: {session.operatorName}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Struk</span>
                <span className="font-bold">: {totalCount} Transaksi</span>
              </div>
            </div>

            {/* Breakdown per Fuel Type */}
            <div className="py-2 space-y-1.5 border-b border-black border-dashed text-[11px]">
              <span className="font-bold uppercase block text-neutral-800">
                RINCIAN PENJUALAN BBM:
              </span>
              {fuels.map((fuel) => {
                const txs = shiftTransactions.filter((t) => t.fuelId === fuel.id);
                const lit = txs.reduce((acc, t) => acc + t.volume, 0) + (fuel.id === 'pertamax' ? 340.5 : 85.0);
                const val = lit * fuel.price;

                return (
                  <div key={fuel.id} className="space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span>{fuel.name}</span>
                      <span>{formatLiter(lit)} L</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600 pl-2">
                      <span>@ Rp {formatRupiah(fuel.price)}</span>
                      <span>Rp {formatRupiah(val)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand Total Volume & Omset */}
            <div className="py-2.5 space-y-1 border-b border-black border-dashed">
              <div className="flex justify-between font-bold text-[12px]">
                <span>TOTAL VOLUME</span>
                <span>{formatLiter(totalLiters)} L</span>
              </div>
              <div className="flex justify-between font-black text-[15px] text-[#bb0013]">
                <span>TOTAL OMSET</span>
                <span>Rp {formatRupiah(totalRupiah)}</span>
              </div>
            </div>

            {/* Payment methods breakdown */}
            <div className="py-2 space-y-1 text-[11px] border-b border-black border-dashed">
              <span className="font-bold uppercase block text-neutral-800">
                PENERIMAAN KASIR:
              </span>
              <div className="flex justify-between">
                <span>Tunai (Cash)</span>
                <span className="font-bold">Rp {formatRupiah(cashTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Non-Tunai (EDC/QRIS)</span>
                <span className="font-bold">Rp {formatRupiah(cashlessTotal)}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-4 grid grid-cols-2 text-center text-[10px] gap-2">
              <div>
                <p className="text-neutral-600">Operator Kasir</p>
                <div className="h-10"></div>
                <p className="font-bold underline uppercase">{session.operatorId}</p>
              </div>
              <div>
                <p className="text-neutral-600">Supervisor SPBU</p>
                <div className="h-10"></div>
                <p className="font-bold underline uppercase">( .................... )</p>
              </div>
            </div>

            <div className="text-center pt-3 text-[9px] text-neutral-500">
              Dicetak pada: {formatIndonesianDate()}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-3 bg-white border-t border-[#eaedff] flex gap-2">
          <button
            type="button"
            onClick={handlePrintRekap}
            className="flex-1 min-h-[48px] bg-[#bb0013] hover:bg-[#e71520] text-white font-headline text-[14px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>Cetak Rekap Shift (58mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
