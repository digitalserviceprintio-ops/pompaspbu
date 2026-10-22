import React, { useState, useEffect } from 'react';
import {
  FuelProduct,
  FuelId,
  VehicleType,
  PaymentMethod,
  Transaction,
  SPBUSettings,
  CashierSession,
} from '../types';
import {
  formatRupiah,
  parseRupiah,
  formatLiter,
  parseLiter,
  formatIndonesianDate,
  generateTrxId,
  toInputDateValue,
  toInputTimeValue,
  fromDateTimeInput,
} from '../utils/formatters';

interface BuatStrukTabProps {
  fuels: FuelProduct[];
  settings: SPBUSettings;
  session: CashierSession;
  onProceedToPrint: (transaction: Transaction, autoPrintDirectly?: boolean) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const BuatStrukTab: React.FC<BuatStrukTabProps> = ({
  fuels,
  settings,
  session,
  onProceedToPrint,
  onShowToast,
}) => {
  // POS Form State
  const [selectedNozzle, setSelectedNozzle] = useState<number>(4);
  const [selectedFuelId, setSelectedFuelId] = useState<FuelId>('pertamax');
  const [rupiahAmount, setRupiahAmount] = useState<number>(130118);
  const [literAmount, setLiterAmount] = useState<number>(15.13);
  const [rupiahInputText, setRupiahInputText] = useState<string>('130.118');
  const [literInputText, setLiterInputText] = useState<string>('15,13');
  const [nopol, setNopol] = useState<string>('W 416 RH');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<number>(150000);
  const [showCashDetail, setShowCashDetail] = useState<boolean>(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(true);
  const [includeLogos, setIncludeLogos] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Date & Time Customization State
  const [dateMode, setDateMode] = useState<'now' | 'custom'>('custom');
  const [customDate, setCustomDate] = useState<string>('2018-03-21');
  const [customTime, setCustomTime] = useState<string>('15:37:23');
  const [customFormattedText, setCustomFormattedText] = useState<string>(
    'Minggu, 21 Maret 2018 15:37:23'
  );
  const [showAdvancedDateEdit, setShowAdvancedDateEdit] = useState<boolean>(false);

  // Active Fuel object
  const activeFuel = fuels.find((f) => f.id === selectedFuelId) || fuels[0];

  // Sync Liter from Rupiah
  const handleRupiahChange = (text: string) => {
    const numeric = parseRupiah(text);
    setRupiahAmount(numeric);
    setRupiahInputText(formatRupiah(numeric));
    if (activeFuel.price > 0) {
      const calcLit = numeric / activeFuel.price;
      setLiterAmount(calcLit);
      setLiterInputText(formatLiter(calcLit));
    }
  };

  // Sync Rupiah from Liter
  const handleLiterChange = (text: string) => {
    setLiterInputText(text);
    const parsedLit = parseLiter(text);
    setLiterAmount(parsedLit);
    const calcRupiah = Math.round(parsedLit * activeFuel.price);
    setRupiahAmount(calcRupiah);
    setRupiahInputText(formatRupiah(calcRupiah));
  };

  // Fuel selection change recalculates volume
  const handleSelectFuel = (fuel: FuelProduct) => {
    setSelectedFuelId(fuel.id);
    // Keep volume same, recalculate Rupiah OR vice versa
    const newTotal = Math.round(literAmount * fuel.price);
    setRupiahAmount(newTotal);
    setRupiahInputText(formatRupiah(newTotal));
    onShowToast(`Bahan bakar: ${fuel.name} (Rp ${formatRupiah(fuel.price)}/L)`, 'local_gas_station');
  };

  // Preset chips
  const handlePresetAmount = (preset: number | 'full') => {
    if (preset === 'full') {
      const tankCapacity = vehicleType === 'car' ? 45.0 : 4.5;
      setLiterAmount(tankCapacity);
      setLiterInputText(formatLiter(tankCapacity));
      const total = Math.round(tankCapacity * activeFuel.price);
      setRupiahAmount(total);
      setRupiahInputText(formatRupiah(total));
      onShowToast(`Isi Penuh Tangki (${formatLiter(tankCapacity)} L)`, 'local_gas_station');
    } else {
      setRupiahAmount(preset);
      setRupiahInputText(formatRupiah(preset));
      if (activeFuel.price > 0) {
        const calcLit = preset / activeFuel.price;
        setLiterAmount(calcLit);
        setLiterInputText(formatLiter(calcLit));
      }
    }
  };

  // Quick Region Prefix for Nopol
  const handleRegionShortcut = (prefix: string) => {
    const parts = nopol.trim().split(/\s+/);
    if (parts.length > 1) {
      setNopol(`${prefix} ${parts.slice(1).join(' ')}`);
    } else {
      setNopol(`${prefix} 416 RH`);
    }
  };

  // Date & Time helper handlers
  const updateCustomDateTime = (newDateStr: string, newTimeStr: string) => {
    setCustomDate(newDateStr);
    setCustomTime(newTimeStr);
    const dateObj = fromDateTimeInput(newDateStr, newTimeStr);
    const formatted = formatIndonesianDate(dateObj);
    setCustomFormattedText(formatted);
  };

  const handleSetDateNow = () => {
    const now = new Date();
    const dStr = toInputDateValue(now);
    const tStr = toInputTimeValue(now);
    updateCustomDateTime(dStr, tStr);
    setDateMode('now');
    onShowToast('Tanggal struk diatur ke waktu saat ini', 'schedule');
  };

  const handleSetOriginalDate = () => {
    updateCustomDateTime('2018-03-21', '15:37:23');
    setDateMode('custom');
    onShowToast('Tanggal struk disesuaikan ke foto fisik (21 Maret 2018)', 'history');
  };

  const handleSetOffsetHours = (hoursDiff: number) => {
    const d = dateMode === 'now' ? new Date() : fromDateTimeInput(customDate, customTime);
    d.setHours(d.getHours() + hoursDiff);
    updateCustomDateTime(toInputDateValue(d), toInputTimeValue(d));
    setDateMode('custom');
    onShowToast(`Waktu digeser ${hoursDiff > 0 ? '+' : ''}${hoursDiff} jam`, 'schedule');
  };

  // Reset form
  const handleResetForm = () => {
    setSelectedNozzle(4);
    setSelectedFuelId('pertamax');
    setRupiahAmount(130118);
    setRupiahInputText('130.118');
    setLiterAmount(15.13);
    setLiterInputText('15,13');
    setNopol('W 416 RH');
    setVehicleType('car');
    setPaymentMethod('cash');
    setCashTendered(150000);
    updateCustomDateTime('2018-03-21', '15:37:23');
    setDateMode('custom');
    onShowToast('Form dikembalikan ke data awal', 'restart_alt');
  };

  // Build current Transaction object
  const buildTransaction = (): Transaction => {
    const txDate = dateMode === 'now' ? new Date() : fromDateTimeInput(customDate, customTime);
    const id = generateTrxId(settings.spbuNumber);
    const change = Math.max(0, cashTendered - rupiahAmount);
    const finalTimestamp = dateMode === 'now' ? formatIndonesianDate(txDate) : customFormattedText;

    return {
      id,
      trxNumber: id,
      timestamp: finalTimestamp,
      rawDate: txDate,
      nozzle: selectedNozzle,
      island: session.island,
      shift: session.shift,
      fuelId: activeFuel.id,
      fuelName: activeFuel.name,
      fuelGrade: activeFuel.grade,
      volume: Math.round(literAmount * 100) / 100,
      unitPrice: activeFuel.price,
      total: rupiahAmount,
      nopol: nopol.trim().toUpperCase() || 'W 416 RH',
      vehicleType,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' ? cashTendered : undefined,
      changeAmount: paymentMethod === 'cash' ? change : undefined,
      operatorId: session.operatorId,
      operatorName: session.operatorName,
      status: 'Tercetak',
    };
  };

  // Submit & Preview action
  const handleSubmit = (directPrint: boolean = false) => {
    if (rupiahAmount <= 0) {
      onShowToast('Nominal rupiah harus lebih dari 0', 'error');
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    setIsSubmitting(true);
    const tx = buildTransaction();

    setTimeout(() => {
      setIsSubmitting(false);
      onProceedToPrint(tx, directPrint);
    }, 300);
  };

  return (
    <div className="flex flex-col w-full pb-8 space-y-4 max-w-lg mx-auto">
      {/* Station Banner & Dispenser Quick Info Card */}
      <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] flex items-center justify-between">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#bb0013]/10 flex items-center justify-center shrink-0 text-[#bb0013] mt-0.5">
            <span className="material-symbols-outlined text-[20px]">
              local_gas_station
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline text-[15px] sm:text-[16px] text-[#131b2e] font-bold tracking-tight">
                {settings.spbuNumber}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#008740] text-white font-headline text-[10px] font-bold">
                <span className="material-symbols-outlined text-[12px]">verified</span> Pasti Pas!
              </span>
            </div>
            <p className="font-body text-[11.5px] text-[#5e3f3c] truncate">
              {settings.address}, {settings.city}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 pl-2">
          <div className="bg-[#eaedff] px-2 py-1 rounded-md text-right border border-[#d2d9f4]">
            <span className="block font-headline text-[9px] text-[#5e3f3c] uppercase font-bold">
              PRINTER #
            </span>
            <span className="font-thermal-mono text-[12px] font-bold text-[#245eaa]">
              01 • {settings.paperWidth}mm
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Selector Selang / Nozzle & Shift */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
              valve
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Pilih Nomor Selang / Nozzle
            </span>
          </div>
          <span className="font-body text-[11px] text-[#5e3f3c] font-medium bg-[#f2f3ff] px-2 py-0.5 rounded">
            Shift {session.shift} (Siang) • Pulau {session.island}
          </span>
        </div>

        {/* Nozzle Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isSelected = selectedNozzle === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedNozzle(num)}
                className={`flex-1 min-w-[56px] py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#245eaa] text-white font-headline shadow-xs scale-102 ring-2 ring-[#245eaa]/20'
                    : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#d2d9f4]'
                }`}
              >
                <span
                  className={`block font-headline text-[9.5px] uppercase leading-none mb-1 ${
                    isSelected ? 'text-[#d6e3ff]' : 'text-[#5e3f3c]'
                  }`}
                >
                  NOZZLE
                </span>
                <span className="font-bold text-[15px] leading-tight">
                  {String(num).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Pilihan Jenis BBM Pertamina */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#bb0013] text-[18px]">
              opacity
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Jenis Bahan Bakar (BBM)
            </span>
          </div>
          <span className="font-headline text-[11px] text-[#006b32] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006b32] animate-pulse"></span> Tangki Stabil
          </span>
        </div>

        {/* 2-Column Fuel Grid */}
        <div className="grid grid-cols-2 gap-2">
          {fuels.map((fuel) => {
            const isSelected = selectedFuelId === fuel.id;
            return (
              <button
                key={fuel.id}
                type="button"
                onClick={() => handleSelectFuel(fuel)}
                className={`flex flex-col p-2.5 rounded-xl text-left relative overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#245eaa] text-white shadow-sm ring-2 ring-[#245eaa]'
                    : 'bg-[#f2f3ff] text-[#131b2e] hover:bg-[#eaedff]'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`font-headline text-[14px] font-bold tracking-tight truncate ${
                      !isSelected && fuel.id === 'pertamax-turbo'
                        ? 'text-[#bb0013]'
                        : !isSelected && fuel.id === 'pertalite'
                        ? 'text-[#006b32]'
                        : !isSelected && fuel.id === 'dexlite'
                        ? 'text-[#008740]'
                        : ''
                    }`}
                  >
                    {fuel.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-headline text-[9.5px] uppercase font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#eaedff] text-[#5e3f3c]'
                    }`}
                  >
                    {fuel.grade}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-auto pt-1">
                  <span
                    className={`font-body text-[10.5px] ${
                      isSelected ? 'text-[#d6e3ff]' : 'text-[#5e3f3c]'
                    }`}
                  >
                    Tarif/liter:
                  </span>
                  <span className="font-thermal-mono font-bold text-[13.5px]">
                    Rp {formatRupiah(fuel.price)}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">
                    <span className="material-symbols-outlined text-[48px] text-white">
                      local_fire_department
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Kalkulator Dua Arah Rupiah <-> Liter (Sync Otomatis) */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
              calculate
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Perhitungan Volume &amp; Biaya
            </span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#eaedff] text-[#245eaa] font-headline text-[10.5px] font-bold">
            Auto-Sync Rate
          </div>
        </div>

        {/* Main Rupiah Display Input */}
        <div className="bg-[#f2f3ff] rounded-xl p-3 flex flex-col space-y-1 border border-[#eaedff] focus-within:border-[#bb0013] transition-colors">
          <div className="flex items-center justify-between">
            <label
              htmlFor="rupiah-input-main"
              className="font-headline text-[11px] text-[#5e3f3c] uppercase font-bold tracking-wide"
            >
              TOTAL PEMBAYARAN
            </label>
            <span className="font-body text-[11px] text-[#245eaa] font-medium">
              Ketik nominal
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-[22px] sm:text-[24px] font-bold text-[#bb0013]">
              Rp
            </span>
            <input
              id="rupiah-input-main"
              type="text"
              inputMode="numeric"
              value={rupiahInputText}
              onChange={(e) => handleRupiahChange(e.target.value)}
              className="w-full bg-transparent font-headline text-[26px] sm:text-[28px] font-extrabold text-[#131b2e] tracking-tight focus:outline-none focus:text-[#bb0013]"
              placeholder="0"
            />
          </div>
        </div>

        {/* Preset Rupiah Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[20000, 50000, 100000, 130118].map((amt) => {
            const isMatch = rupiahAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetAmount(amt)}
                className={`py-1.5 px-2.5 rounded-lg font-headline text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isMatch
                    ? 'bg-[#ffdad6] text-[#410002] ring-1 ring-[#bb0013] font-bold shadow-xs'
                    : 'bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e]'
                }`}
              >
                Rp {formatRupiah(amt)}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handlePresetAmount('full')}
            className="py-1.5 px-2.5 rounded-lg bg-[#008740] hover:bg-[#006b32] text-white font-headline text-[12px] font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[14px]">local_gas_station</span>
            Full Tank
          </button>
        </div>

        {/* Volume Liter Input & Unit Price Card */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#eaedff] rounded-lg p-2.5 flex flex-col justify-between border border-[#d2d9f4]">
            <label
              htmlFor="liter-input"
              className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold mb-1"
            >
              VOLUME BAHAN BAKAR
            </label>
            <div className="flex items-baseline justify-between">
              <input
                id="liter-input"
                type="text"
                inputMode="decimal"
                value={literInputText}
                onChange={(e) => handleLiterChange(e.target.value)}
                className="w-24 bg-transparent font-headline text-[18px] sm:text-[20px] font-bold text-[#131b2e] focus:outline-none focus:text-[#245eaa]"
              />
              <span className="font-headline text-[14px] text-[#245eaa] font-bold">
                Liter
              </span>
            </div>
          </div>

          <div className="bg-[#eaedff] rounded-lg p-2.5 flex flex-col justify-between border border-[#d2d9f4]">
            <span className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold mb-1">
              HARGA / LITER SATUAN
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-headline text-[13px] text-[#5e3f3c] font-semibold">Rp</span>
              <span className="font-headline text-[18px] sm:text-[20px] font-bold text-[#131b2e]">
                {formatRupiah(activeFuel.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Pengaturan Tanggal & Jam Transaksi */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
              calendar_month
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Tanggal &amp; Jam Transaksi
            </span>
          </div>
          <div className="inline-flex rounded-lg bg-[#eaedff] p-0.5">
            <button
              type="button"
              onClick={handleSetDateNow}
              className={`px-2 py-1 rounded-md font-headline text-[10.5px] font-bold cursor-pointer transition-all ${
                dateMode === 'now'
                  ? 'bg-[#245eaa] text-white shadow-xs'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              Waktu Sekarang
            </button>
            <button
              type="button"
              onClick={() => {
                setDateMode('custom');
                setShowAdvancedDateEdit(true);
              }}
              className={`px-2 py-1 rounded-md font-headline text-[10.5px] font-bold cursor-pointer transition-all ${
                dateMode === 'custom'
                  ? 'bg-[#245eaa] text-white shadow-xs'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              Atur Manual
            </button>
          </div>
        </div>

        {/* Current Selected Timestamp Readout Banner */}
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 flex items-center justify-between border border-[#eaedff]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#245eaa] text-[20px] shrink-0">
              schedule
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-[9.5px] text-[#5e3f3c] uppercase font-bold">
                TANGGAL PADA STRUK
              </span>
              <span className="font-thermal-mono font-bold text-[#131b2e] text-[12.5px] truncate">
                {dateMode === 'now' ? formatIndonesianDate() : customFormattedText}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvancedDateEdit(!showAdvancedDateEdit)}
            className="px-2 py-1 rounded bg-[#eaedff] hover:bg-[#d2d9f4] text-[#245eaa] font-headline text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
            <span>{showAdvancedDateEdit ? 'Tutup' : 'Ubah'}</span>
          </button>
        </div>

        {/* Date & Time Picker Controls (Visible when custom or showAdvancedDateEdit) */}
        {(dateMode === 'custom' || showAdvancedDateEdit) && (
          <div className="p-3 rounded-xl bg-[#faf8ff] border border-[#d2d9f4] space-y-2.5 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-headline text-[10.5px] text-[#5e3f3c] uppercase font-bold">
                  Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setDateMode('custom');
                    updateCustomDateTime(e.target.value, customTime);
                  }}
                  className="w-full bg-white text-[#131b2e] font-thermal-mono text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-headline text-[10.5px] text-[#5e3f3c] uppercase font-bold">
                  Pilih Jam (WIB)
                </label>
                <input
                  type="time"
                  step="1"
                  value={customTime}
                  onChange={(e) => {
                    setDateMode('custom');
                    updateCustomDateTime(customDate, e.target.value);
                  }}
                  className="w-full bg-white text-[#131b2e] font-thermal-mono text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
                />
              </div>
            </div>

            {/* Direct Text String Edit */}
            <div className="flex flex-col gap-1">
              <label className="font-headline text-[10.5px] text-[#5e3f3c] uppercase font-bold flex items-center justify-between">
                <span>Teks Format Cetak (Bebas Diedit)</span>
                <span className="text-[#245eaa] font-medium lowercase">bisa ketik langsung</span>
              </label>
              <input
                type="text"
                value={customFormattedText}
                onChange={(e) => {
                  setDateMode('custom');
                  setCustomFormattedText(e.target.value);
                }}
                placeholder="Contoh: Minggu, 21 Maret 2018 15:37:23"
                className="w-full bg-white text-[#131b2e] font-thermal-mono text-[12px] font-bold px-2.5 py-1.5 rounded-lg border border-[#d2d9f4] focus:outline-none focus:border-[#245eaa]"
              />
            </div>

            {/* Quick Date Presets */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <button
                type="button"
                onClick={handleSetDateNow}
                className="px-2 py-1 rounded bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[10.5px] font-semibold whitespace-nowrap cursor-pointer"
              >
                Hari Ini (Sekarang)
              </button>
              <button
                type="button"
                onClick={handleSetOriginalDate}
                className="px-2 py-1 rounded bg-[#ffdad6] text-[#410002] font-headline text-[10.5px] font-bold whitespace-nowrap cursor-pointer border border-[#bb0013]/30"
              >
                Foto Asli (21 Mar 2018)
              </button>
              <button
                type="button"
                onClick={() => handleSetOffsetHours(-1)}
                className="px-2 py-1 rounded bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[10.5px] font-semibold whitespace-nowrap cursor-pointer"
              >
                -1 Jam Lalu
              </button>
              <button
                type="button"
                onClick={() => handleSetOffsetHours(-24)}
                className="px-2 py-1 rounded bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[10.5px] font-semibold whitespace-nowrap cursor-pointer"
              >
                Kemarin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Data Kendaraan (Plat Nomor) & Kategori */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">
              directions_car
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Plat Nomor Kendaraan (Nopol)
            </span>
          </div>

          {/* Motor / Mobil Switcher */}
          <div className="inline-flex rounded-lg bg-[#eaedff] p-0.5">
            <button
              type="button"
              onClick={() => setVehicleType('car')}
              className={`px-2.5 py-1 rounded-md font-headline text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                vehicleType === 'car'
                  ? 'bg-white text-[#131b2e] shadow-xs'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">directions_car</span>
              Mobil
            </button>
            <button
              type="button"
              onClick={() => setVehicleType('bike')}
              className={`px-2.5 py-1 rounded-md font-headline text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                vehicleType === 'bike'
                  ? 'bg-white text-[#131b2e] shadow-xs'
                  : 'text-[#5e3f3c] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">two_wheeler</span>
              Motor
            </button>
          </div>
        </div>

        {/* Big Indonesian License Plate Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#e2e7ff] rounded-xl p-2.5 flex items-center gap-2 border border-[#d2d9f4]">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[20px]">
              badge
            </span>
            <input
              type="text"
              value={nopol}
              onChange={(e) => setNopol(e.target.value.toUpperCase())}
              placeholder="W 416 RH"
              className="w-full bg-transparent font-thermal-mono text-[16px] font-bold tracking-wider uppercase text-[#131b2e] placeholder:text-[#5e3f3c]/40 focus:outline-none"
            />
          </div>

          {/* Quick Region Chips */}
          <div className="flex gap-1">
            {['W', 'L', 'B', 'N', 'D'].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => handleRegionShortcut(reg)}
                className="w-8 h-10 rounded-lg bg-[#eaedff] text-[#131b2e] font-headline text-[14px] font-bold hover:bg-[#245eaa] hover:text-white transition-colors cursor-pointer"
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Metode Pembayaran */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
              payments
            </span>
            <span className="font-headline text-[13.5px] font-bold text-[#131b2e]">
              Metode Pembayaran
            </span>
          </div>
          <span className="font-headline text-[11px] text-[#008740] font-bold px-2 py-0.5 rounded bg-[#f7fff3] border border-[#008740]/20">
            LUNAS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Tunai / Cash */}
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('cash');
              setShowCashDetail(true);
            }}
            className={`py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'cash'
                ? 'bg-[#e2e7ff] text-[#131b2e] font-bold ring-2 ring-[#245eaa] shadow-xs'
                : 'bg-[#f2f3ff] text-[#5e3f3c] hover:bg-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#008740] text-[20px]">
              payments
            </span>
            <span className="font-headline text-[12px]">Tunai / Cash</span>
          </button>

          {/* QRIS MyPertamina */}
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('qris');
              setShowCashDetail(false);
            }}
            className={`py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'qris'
                ? 'bg-[#e2e7ff] text-[#131b2e] font-bold ring-2 ring-[#245eaa] shadow-xs'
                : 'bg-[#f2f3ff] text-[#5e3f3c] hover:bg-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#245eaa] text-[20px]">
              qr_code_2
            </span>
            <span className="font-headline text-[12px]">MyPertamina</span>
          </button>

          {/* Debit / EDC */}
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('edc');
              setShowCashDetail(false);
            }}
            className={`py-2.5 px-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              paymentMethod === 'edc'
                ? 'bg-[#e2e7ff] text-[#131b2e] font-bold ring-2 ring-[#245eaa] shadow-xs'
                : 'bg-[#f2f3ff] text-[#5e3f3c] hover:bg-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#bb0013] text-[20px]">
              credit_card
            </span>
            <span className="font-headline text-[12px]">Debit / EDC</span>
          </button>
        </div>

        {/* Cash Tendered & Kembalian Helper (when Cash is active) */}
        {paymentMethod === 'cash' && (
          <div className="bg-[#f2f3ff] p-2.5 rounded-lg border border-[#eaedff] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5e3f3c]">Uang Diterima:</span>
              <input
                type="text"
                value={formatRupiah(cashTendered)}
                onChange={(e) => setCashTendered(parseRupiah(e.target.value))}
                className="w-24 bg-white px-2 py-0.5 rounded font-thermal-mono font-bold text-[#131b2e] border border-[#d2d9f4] text-right focus:outline-none"
              />
            </div>
            <div className="text-right">
              <span className="text-[#5e3f3c] block text-[10px]">KEMBALIAN</span>
              <span className="font-thermal-mono font-bold text-[#008740] text-[13px]">
                Rp {formatRupiah(Math.max(0, cashTendered - rupiahAmount))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Toggle Cetak & Konfigurasi Printer */}
      <div className="bg-white rounded-xl p-3.5 shadow-xs border border-[#eaedff] space-y-2.5">
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">
              print
            </span>
            <div className="flex flex-col">
              <span className="font-headline text-[13px] text-[#131b2e] font-semibold">
                Cetak Otomatis Selesai Isi
              </span>
              <span className="font-body text-[11px] text-[#5e3f3c]">
                Kirim langsung ke thermal Bluetooth (RPP-02N)
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoPrintEnabled}
              onChange={(e) => setAutoPrintEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008740]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between py-0.5 pt-2 border-t border-dashed border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#5e3f3c] text-[18px]">
              verified
            </span>
            <div className="flex flex-col">
              <span className="font-headline text-[13px] text-[#131b2e] font-semibold">
                Sertakan Logo Pasti Pas &amp; Pertamina
              </span>
              <span className="font-body text-[11px] text-[#5e3f3c]">
                Header grafis mono bitmap 58mm
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={includeLogos}
              onChange={(e) => setIncludeLogos(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bb0013]"></div>
          </label>
        </div>
      </div>

      {/* Live Mini Receipt Snapshot Bar (Delight Feedback) */}
      <div className="bg-[#f2f3ff] rounded-xl p-3 flex items-center justify-between border border-[#eaedff]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#008740] text-[20px]">
            check_circle
          </span>
          <div className="flex flex-col">
            <span className="font-headline text-[12.5px] text-[#131b2e] font-bold">
              Struk Siap Dicetak
            </span>
            <span className="font-thermal-mono text-[11px] text-[#5e3f3c]">
              Selang #{selectedNozzle} • {activeFuel.name} • {formatLiter(literAmount)} L
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-headline text-[9.5px] text-[#5e3f3c] block uppercase font-bold">
            NOPOL TERDAFTAR
          </span>
          <span className="font-thermal-mono font-bold text-[#131b2e] text-[13px]">
            {nopol || '-'}
          </span>
        </div>
      </div>

      {/* Action Bar: Sticky Form Actions */}
      <div className="pt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleResetForm}
          title="Reset Form ke Pengaturan Awal"
          className="px-4 py-3.5 rounded-xl bg-[#eaedff] hover:bg-[#d2d9f4] text-[#5e3f3c] font-headline text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span>Reset</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => handleSubmit(autoPrintEnabled)}
          className="flex-1 py-3.5 px-4 rounded-xl bg-[#bb0013] hover:bg-[#e71520] active:scale-[0.98] text-white font-headline text-[15px] sm:text-[16px] font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[20px]">
                progress_activity
              </span>
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">print</span>
              <span className="truncate">
                Preview &amp; Cetak (Rp {formatRupiah(rupiahAmount)})
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
