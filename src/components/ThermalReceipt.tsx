import React from 'react';
import { Transaction, SPBUSettings } from '../types';
import { formatRupiah, formatLiter } from '../utils/formatters';

interface ThermalReceiptProps {
  transaction: Transaction;
  settings: SPBUSettings;
  paperWidth?: '58' | '80';
  density?: '80' | '100' | '130';
  customLogoUrl?: string | null;
  printerNumber?: number;
  className?: string;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  transaction,
  settings,
  paperWidth = '58',
  density = '100',
  customLogoUrl = null,
  printerNumber = 1,
  className = '',
}) => {
  const is80mm = paperWidth === '80';

  // Contrast / density styling
  const getDensityClass = () => {
    switch (density) {
      case '80':
        return 'text-neutral-700 font-normal';
      case '130':
        return 'text-black font-semibold contrast-125';
      default:
        return 'text-neutral-900 font-medium';
    }
  };

  return (
    <div
      id="printable-thermal-receipt"
      className={`relative select-none font-thermal-mono leading-[1.38] antialiased bg-white text-black transition-all duration-200 ${
        is80mm ? 'w-full max-w-[420px]' : 'w-[330px] max-w-full'
      } ${className}`}
      style={{
        filter:
          density === '130'
            ? 'contrast(1.2) brightness(0.95)'
            : density === '80'
            ? 'contrast(0.9) brightness(1.05)'
            : 'none',
      }}
    >
      {/* Top Perforated Serrated Zig-zag Cut Edge */}
      <div className="w-full h-3 overflow-hidden flex leading-none text-white print:hidden">
        <svg
          className="w-full h-full fill-white"
          preserveAspectRatio="none"
          viewBox="0 0 120 12"
        >
          <path d="M0 12 L4 0 L8 12 L12 0 L16 12 L20 0 L24 12 L28 0 L32 12 L36 0 L40 12 L44 0 L48 12 L52 0 L56 12 L60 0 L64 12 L68 0 L72 12 L76 0 L80 12 L84 0 L88 12 L92 0 L96 12 L100 0 L104 12 L108 0 L112 12 L116 0 L120 12 Z" />
        </svg>
      </div>

      {/* Main Thermal Canvas Body */}
      <div className={`bg-white px-5 py-4 ${getDensityClass()} text-[13px] tracking-tight`}>
        {/* Header Logo & Pasti Pas Badge */}
        <div className="flex items-start justify-between pb-2.5 gap-2">
          {/* Logo Brand Graphic */}
          {settings.showPertaminaLogo && (
            <div className="flex items-center space-x-2">
              {customLogoUrl ? (
                <img
                  src={customLogoUrl}
                  alt="Logo SPBU"
                  className="w-10 h-10 object-contain filter grayscale contrast-150"
                />
              ) : (
                <svg className="w-8 h-7 text-black fill-current shrink-0" viewBox="0 0 100 80">
                  <polygon points="5,25 35,0 70,0 40,25" />
                  <polygon points="0,55 30,30 65,30 35,55" />
                  <polygon points="25,80 55,55 90,55 60,80" />
                </svg>
              )}
              <div className="flex flex-col">
                <span className="font-headline font-extrabold text-[15px] tracking-wider leading-none">
                  PERTAMINA
                </span>
                <span className="font-thermal-mono text-[9px] tracking-widest mt-0.5 uppercase opacity-90">
                  {settings.spbuPartner ? 'RETAIL INDONESIA' : 'SPBU RESMI'}
                </span>
              </div>
            </div>
          )}

          {/* Stamped "PASTI PAS! TERKALIBRASI" */}
          {settings.showPastiPasLogo && (
            <div className="p-1 border border-black border-dashed flex flex-col items-center justify-center transform rotate-1 shrink-0">
              <div className="flex items-center gap-0.5">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span className="font-headline text-[9.5px] font-black uppercase tracking-tighter">
                  PASTI PAS!
                </span>
              </div>
              <span className="text-[7px] uppercase font-bold tracking-widest">
                TERKALIBRASI
              </span>
            </div>
          )}
        </div>

        {/* Station Address Block */}
        <div className="space-y-0.5 text-left text-neutral-900 font-medium">
          <p className="font-bold tracking-normal text-[13px]">{settings.spbuNumber}</p>
          <p>{settings.address}</p>
          <p>{settings.city}</p>
          <p>Telp.{settings.phone}</p>
          <div className="flex justify-between items-center pt-1 font-thermal-mono text-[11.5px]">
            <span>{transaction.timestamp}</span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2 border-b border-black border-dashed opacity-80"></div>

        {/* Dispenser Breakdown */}
        <div className="space-y-1 font-thermal-mono">
          <div className="flex justify-between">
            <span>Nomor Printer</span>
            <span className="font-bold">: {printerNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Nomor Selang</span>
            <span className="font-bold">: {transaction.nozzle}</span>
          </div>
          <div className="flex justify-between">
            <span>Jenis BBM</span>
            <span className="font-bold uppercase tracking-tight">
              : {transaction.fuelName} ({transaction.fuelGrade})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Liter</span>
            <span className="font-bold">: {formatLiter(transaction.volume)} L</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Harga/liter</span>
            <span>: Rp {formatRupiah(transaction.unitPrice)}</span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2.5 border-b border-black border-dashed opacity-80"></div>

        {/* Big Bold Thermal Total Line (Faithful to physical receipt Image_5) */}
        <div className="flex justify-between items-baseline py-1">
          <span className="font-headline text-[17px] font-black tracking-tight uppercase">
            TOTAL
          </span>
          <div className="text-right">
            <span className="font-headline text-[22px] sm:text-[24px] font-black tracking-tight leading-none">
              : Rp {formatRupiah(transaction.total)}
            </span>
          </div>
        </div>

        {/* Dashed Divider */}
        <div className="my-2 border-b border-black border-dashed opacity-80"></div>

        {/* Payment & Vehicle Details */}
        <div className="space-y-1 font-thermal-mono">
          <div className="flex justify-between items-center">
            <span>Nopol</span>
            <span className="font-bold text-[14px] bg-neutral-100 px-1 py-0.2 rounded">
              : {transaction.nopol.toUpperCase().replace(/\s+/g, '')}
            </span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span>Metode Bayar</span>
            <span className="uppercase font-semibold">
              : {transaction.paymentMethod === 'cash' ? 'TUNAI (CASH)' : transaction.paymentMethod === 'qris' ? 'MYPERTAMINA (QRIS)' : 'DEBIT / EDC'}
            </span>
          </div>
          {transaction.paymentMethod === 'cash' && transaction.cashReceived && (
            <>
              <div className="flex justify-between text-[11px] text-neutral-800">
                <span>Uang Diterima</span>
                <span>: Rp {formatRupiah(transaction.cashReceived)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-800">
                <span>Kembalian</span>
                <span className="font-bold">: Rp {formatRupiah(transaction.changeAmount ?? 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Scalable Thermal Barcode SVG */}
        {settings.showMyPertaminaQR && (
          <div className="my-3 flex flex-col items-center justify-center space-y-1">
            <svg
              className="h-8 w-44 text-black fill-current"
              preserveAspectRatio="none"
              viewBox="0 0 160 30"
            >
              <rect height="30" width="3" x="0" y="0" />
              <rect height="30" width="2" x="5" y="0" />
              <rect height="30" width="5" x="10" y="0" />
              <rect height="30" width="2" x="18" y="0" />
              <rect height="30" width="4" x="23" y="0" />
              <rect height="30" width="1" x="30" y="0" />
              <rect height="30" width="6" x="34" y="0" />
              <rect height="30" width="2" x="43" y="0" />
              <rect height="30" width="5" x="48" y="0" />
              <rect height="30" width="2" x="56" y="0" />
              <rect height="30" width="7" x="62" y="0" />
              <rect height="30" width="3" x="72" y="0" />
              <rect height="30" width="4" x="78" y="0" />
              <rect height="30" width="2" x="85" y="0" />
              <rect height="30" width="6" x="90" y="0" />
              <rect height="30" width="2" x="99" y="0" />
              <rect height="30" width="4" x="104" y="0" />
              <rect height="30" width="5" x="111" y="0" />
              <rect height="30" width="2" x="119" y="0" />
              <rect height="30" width="6" x="124" y="0" />
              <rect height="30" width="2" x="133" y="0" />
              <rect height="30" width="4" x="138" y="0" />
              <rect height="30" width="5" x="145" y="0" />
              <rect height="30" width="3" x="154" y="0" />
            </svg>
            <span className="font-thermal-mono text-[9px] tracking-widest text-neutral-800">
              {transaction.trxNumber || transaction.id}
            </span>
          </div>
        )}

        {/* Closing Footer Phrase */}
        <div className="pt-2 text-center space-y-0.5">
          <p className="font-headline text-[11.5px] font-extrabold tracking-wider uppercase">
            {settings.footerGreeting}
          </p>
          <p className="text-[10px] text-neutral-600">
            Pertamina Call Center: {settings.callCenter}
          </p>
        </div>

        {/* Extra Feed Blank Lines */}
        {settings.feedLines > 0 && (
          <div style={{ height: `${settings.feedLines * 10}px` }}></div>
        )}
      </div>

      {/* Bottom Perforated Serrated Zig-zag Cut Edge */}
      <div className="w-full h-3 overflow-hidden flex leading-none text-white print:hidden">
        <svg
          className="w-full h-full fill-white rotate-180"
          preserveAspectRatio="none"
          viewBox="0 0 120 12"
        >
          <path d="M0 12 L4 0 L8 12 L12 0 L16 12 L20 0 L24 12 L28 0 L32 12 L36 0 L40 12 L44 0 L48 12 L52 0 L56 12 L60 0 L64 12 L68 0 L72 12 L76 0 L80 12 L84 0 L88 12 L92 0 L96 12 L100 0 L104 12 L108 0 L112 12 L116 0 L120 12 Z" />
        </svg>
      </div>
    </div>
  );
};
