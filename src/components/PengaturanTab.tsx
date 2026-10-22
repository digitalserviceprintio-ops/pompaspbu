import React, { useState } from 'react';
import { SPBUSettings, BluetoothDevice, FuelProduct, Transaction } from '../types';
import { formatRupiah, formatLiter } from '../utils/formatters';
import { ThermalReceipt } from './ThermalReceipt';

interface PengaturanTabProps {
  settings: SPBUSettings;
  onUpdateSettings: (newSettings: SPBUSettings) => void;
  devices: BluetoothDevice[];
  onSelectDevice: (device: BluetoothDevice) => void;
  fuels: FuelProduct[];
  onUpdateFuelPrice: (fuelId: string, newPrice: number) => void;
  sampleTransaction: Transaction;
  onTestPrint: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const PengaturanTab: React.FC<PengaturanTabProps> = ({
  settings,
  onUpdateSettings,
  devices,
  onSelectDevice,
  fuels,
  onUpdateFuelPrice,
  sampleTransaction,
  onTestPrint,
  onShowToast,
}) => {
  // Form State
  const [formData, setFormData] = useState<SPBUSettings>({ ...settings });
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>(
    fuels.reduce((acc, f) => ({ ...acc, [f.id]: f.price }), {})
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customLogoPreview, setCustomLogoPreview] = useState<string | null>(null);

  // Field updates
  const handleChange = (field: keyof SPBUSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Price input update
  const handlePriceChange = (fuelId: string, val: string) => {
    const numeric = parseInt(val.replace(/[^\d]/g, ''), 10) || 0;
    setEditingPrices((prev) => ({ ...prev, [fuelId]: numeric }));
  };

  // Save all settings
  const handleSave = () => {
    onUpdateSettings(formData);
    // Apply prices
    Object.entries(editingPrices).forEach(([id, price]) => {
      onUpdateFuelPrice(id, price);
    });
    onShowToast('Pengaturan SPBU & Printer berhasil disimpan!', 'verified');
  };

  // Scan simulation
  const handleScan = () => {
    setIsScanning(true);
    onShowToast('Memindai printer Bluetooth terdekat...', 'bluetooth_searching');
    setTimeout(() => {
      setIsScanning(false);
      onShowToast('Ditemukan 4 Printer Bluetooth di sekitar dispenser', 'bluetooth_connected');
    }, 1600);
  };

  // Test Print
  const handleTestPrint = () => {
    onShowToast('Mengirim ESC/POS Self Test ke RPP-02N...', 'print');
    onTestPrint();
  };

  // Upload Logo Simulation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomLogoPreview(ev.target?.result as string);
        onShowToast('Logo berhasil diunggah & dikonversi ke mono 1-bit', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    setCustomLogoPreview(null);
    onShowToast('Menggunakan logo default resmi Pertamina', 'restart_alt');
  };

  const activeDevice = devices.find((d) => d.connected) || devices[0];

  return (
    <div className="flex flex-col w-full pb-8 gap-4 max-w-lg mx-auto">
      {/* Hardware Telemetry Header Card */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-[#eaedff] p-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#245eaa]">
              <span className="material-symbols-outlined text-[22px]">print</span>
            </div>
            <div>
              <span className="font-headline text-[10.5px] text-[#245eaa] uppercase tracking-wider block font-bold">
                Hardware Telemetry
              </span>
              <h2 className="font-headline text-[15.5px] font-bold text-[#131b2e]">
                Koneksi Bluetooth Printer
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f7fff3] text-[#008740] font-headline text-[11px] font-bold border border-[#008740]/20">
            <span className="w-2 h-2 rounded-full bg-[#008740] animate-pulse"></span>
            Aktif
          </span>
        </div>

        {/* Active Connected Device Details */}
        <div className="bg-[#f2f3ff] rounded-lg p-3 flex flex-col gap-2 border border-[#eaedff]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-headline text-[13.5px] font-bold text-[#131b2e] truncate flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#245eaa] text-[18px]">
                  bluetooth_connected
                </span>
                {activeDevice.name}
              </p>
              <p className="font-thermal-mono text-[11.5px] text-[#5e3f3c]">
                MAC: {activeDevice.mac}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#dae2fd] text-[#131b2e] font-headline text-[10px] font-bold">
              {formData.paperWidth}mm Default
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold">
                Baterai
              </span>
              <span className="font-thermal-mono text-[12px] text-[#008740] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">battery_5_bar</span>
                {activeDevice.battery}%
              </span>
            </div>
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold">
                Sinyal BT
              </span>
              <span className="font-thermal-mono text-[12px] text-[#245eaa] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                {activeDevice.rssi} dBm
              </span>
            </div>
            <div className="flex flex-col bg-white p-2 rounded border border-[#eaedff]">
              <span className="font-headline text-[10px] text-[#5e3f3c] uppercase font-bold">
                Kertas Roll
              </span>
              <span className="font-thermal-mono text-[12px] text-[#131b2e] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">receipt</span>
                Siap
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Scan & Self Test */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            type="button"
            disabled={isScanning}
            onClick={handleScan}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#eaedff] hover:bg-[#d2d9f4] active:scale-[0.98] text-[#131b2e] font-headline text-[12.5px] font-bold transition-all cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[#245eaa] text-[18px] ${
                isScanning ? 'animate-spin' : ''
              }`}
            >
              {isScanning ? 'sync' : 'bluetooth_searching'}
            </span>
            <span>{isScanning ? 'Memindai...' : 'Scan Sekitar'}</span>
          </button>
          <button
            type="button"
            onClick={handleTestPrint}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#245eaa] text-white hover:bg-[#003f7e] active:scale-[0.98] font-headline text-[12.5px] font-bold shadow-xs transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
            <span>Test Print Struk</span>
          </button>
        </div>

        {/* Paired History List */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="font-headline text-[10.5px] text-[#5e3f3c] uppercase font-bold tracking-wider">
            Perangkat Pernah Dipasangkan (Paired)
          </label>
          <div className="flex flex-col gap-1">
            {devices.map((dev) => (
              <div
                key={dev.mac}
                onClick={() => onSelectDevice(dev)}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer ${
                  dev.connected
                    ? 'bg-[#d6e3ff]/40 text-[#131b2e] border border-[#245eaa]/30'
                    : 'bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      dev.connected ? 'text-[#245eaa]' : 'text-[#5e3f3c]'
                    }`}
                  >
                    {dev.connected ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <div className="truncate">
                    <p
                      className={`font-headline text-[12.5px] truncate font-semibold ${
                        dev.connected ? 'text-[#245eaa]' : ''
                      }`}
                    >
                      {dev.name}
                    </p>
                    <p className="font-thermal-mono text-[10.5px] text-[#5e3f3c]">
                      {dev.mac} • {dev.status}
                    </p>
                  </div>
                </div>

                {dev.connected ? (
                  <span className="material-symbols-outlined text-[#008740] text-[18px]">
                    check_circle
                  </span>
                ) : (
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-[#dae2fd] text-[#131b2e] font-headline text-[10.5px] font-bold hover:bg-[#7aacfd]"
                  >
                    Sambung
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Format Thermal Printer Settings */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#bb0013]/10 flex items-center justify-center text-[#bb0013]">
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </div>
          <div>
            <span className="font-headline text-[10.5px] text-[#bb0013] uppercase tracking-wider block font-bold">
              Konfigurasi Cetak
            </span>
            <h2 className="font-headline text-[15.5px] font-bold text-[#131b2e]">
              Format Thermal Kertas
            </h2>
          </div>
        </div>

        {/* Paper Size Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="font-headline text-[12.5px] text-[#131b2e] font-bold">
            Lebar Kertas Roll
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleChange('paperWidth', '58')}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                formData.paperWidth === '58'
                  ? 'bg-[#ffdad6]/40 border-2 border-[#bb0013] text-[#131b2e]'
                  : 'bg-[#f2f3ff] border border-transparent text-[#131b2e]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-headline text-[15px] font-bold text-[#bb0013]">
                  58 mm
                </span>
                <span className="material-symbols-outlined text-[#bb0013] text-[20px]">
                  {formData.paperWidth === '58' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <span className="font-headline text-[11px] text-[#5e3f3c] block font-semibold">
                32 Karakter / Baris
              </span>
              <span className="font-body text-[11px] text-[#5e3f3c]">Standar SPBU Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => handleChange('paperWidth', '80')}
              className={`p-3 rounded-lg text-left transition-all cursor-pointer ${
                formData.paperWidth === '80'
                  ? 'bg-[#d6e3ff]/40 border-2 border-[#245eaa] text-[#131b2e]'
                  : 'bg-[#f2f3ff] border border-transparent text-[#131b2e]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-headline text-[15px] font-bold text-[#245eaa]">
                  80 mm
                </span>
                <span className="material-symbols-outlined text-[#245eaa] text-[20px]">
                  {formData.paperWidth === '80' ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <span className="font-headline text-[11px] text-[#5e3f3c] block font-semibold">
                48 Karakter / Baris
              </span>
              <span className="font-body text-[11px] text-[#5e3f3c]">POS Desktop / Kiosk</span>
            </button>
          </div>
        </div>

        {/* Print Density Slider */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="font-headline text-[12.5px] text-[#131b2e] font-bold">
              Ketebalan Cetak (Print Density)
            </label>
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#131b2e] font-thermal-mono text-[11.5px] font-bold">
              {formData.printDensity === '80'
                ? 'Ringan (80%)'
                : formData.printDensity === '130'
                ? 'Pekat (130%)'
                : 'Normal (100%)'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={formData.printDensity === '80' ? 1 : formData.printDensity === '130' ? 3 : 2}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('printDensity', val === '1' ? '80' : val === '3' ? '130' : '100');
            }}
            className="w-full accent-[#bb0013] h-2 bg-[#dae2fd] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between px-1 font-headline text-[10.5px] text-[#5e3f3c]">
            <span>Ringan (Hemat)</span>
            <span className="font-bold text-[#bb0013]">Normal (Direkomendasikan)</span>
            <span>Pekat (Gelap)</span>
          </div>
        </div>

        {/* Feed Lines & Auto-Cut */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Feed Baris Kosong
            </label>
            <select
              value={formData.feedLines}
              onChange={(e) => handleChange('feedLines', parseInt(e.target.value, 10))}
              className="w-full bg-[#f2f3ff] text-[#131b2e] font-headline text-[12px] font-medium rounded-lg p-2.5 border border-[#eaedff] focus:outline-none"
            >
              <option value={1}>1 Baris</option>
              <option value={2}>2 Baris</option>
              <option value={3}>3 Baris (Standar)</option>
              <option value={4}>4 Baris</option>
              <option value={5}>5 Baris (Sobek Rapi)</option>
            </select>
          </div>

          <div className="flex flex-col justify-between p-2 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            <div className="flex items-center justify-between">
              <span className="font-headline text-[11.5px] text-[#131b2e] font-bold">
                Auto-Cut Paper
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCut}
                  onChange={(e) => handleChange('autoCut', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#dae2fd] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#bb0013]"></div>
              </label>
            </div>
            <span className="font-body text-[10.5px] text-[#5e3f3c]">Khusus printer 80mm cutter</span>
          </div>
        </div>
      </div>

      {/* Master Identitas SPBU Header & Footer Configuration */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#008740]/10 flex items-center justify-center text-[#008740]">
            <span className="material-symbols-outlined text-[22px]">local_gas_station</span>
          </div>
          <div>
            <span className="font-headline text-[10.5px] text-[#008740] uppercase tracking-wider block font-bold">
              Master Identitas SPBU
            </span>
            <h2 className="font-headline text-[15.5px] font-bold text-[#131b2e]">
              Data Header &amp; Footer Struk
            </h2>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-2.5">
          {/* SPBU Number */}
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Nomor SPBU Pertamina
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#245eaa] text-[20px] mr-2">tag</span>
              <input
                type="text"
                value={formData.spbuNumber}
                onChange={(e) => handleChange('spbuNumber', e.target.value)}
                className="bg-transparent w-full text-[#131b2e] font-thermal-mono text-[13px] font-bold uppercase tracking-wider focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Partner */}
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Nama Mitra / Unit Pengelola
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#bb0013] text-[20px] mr-2">
                corporate_fare
              </span>
              <input
                type="text"
                value={formData.spbuPartner}
                onChange={(e) => handleChange('spbuPartner', e.target.value)}
                className="bg-transparent w-full text-[#131b2e] font-body text-[13px] focus:outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Alamat Lokasi
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#5e3f3c] text-[20px] mr-2">
                location_on
              </span>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="bg-transparent w-full text-[#131b2e] font-body text-[13px] focus:outline-none"
              />
            </div>
          </div>

          {/* City & Tel */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
                Kecamatan / Kota
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="bg-transparent w-full text-[#131b2e] font-body text-[13px] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
                Telepon Kantor
              </label>
              <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
                <span className="material-symbols-outlined text-[#5e3f3c] text-[18px] mr-1.5">
                  call
                </span>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="bg-transparent w-full text-[#131b2e] font-thermal-mono text-[13px] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Greeting */}
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Catatan Kaki (Footer Greeting)
            </label>
            <div className="flex items-center bg-[#f2f3ff] rounded-lg px-3 py-2 border border-[#eaedff]">
              <span className="material-symbols-outlined text-[#5e3f3c] text-[20px] mr-2">
                waving_hand
              </span>
              <input
                type="text"
                value={formData.footerGreeting}
                onChange={(e) => handleChange('footerGreeting', e.target.value)}
                className="bg-transparent w-full text-[#131b2e] font-thermal-mono text-[12.5px] uppercase tracking-wide focus:outline-none"
              />
            </div>
          </div>

          {/* Pengaturan Tanggal & Waktu Transaksi Info */}
          <div className="flex flex-col gap-1">
            <label className="font-headline text-[11.5px] text-[#131b2e] font-bold">
              Fleksibilitas Tanggal &amp; Waktu Transaksi
            </label>
            <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[#245eaa] text-[20px] shrink-0">
                  edit_calendar
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline text-[11.5px] font-bold text-[#131b2e] truncate">
                    Bisa Diatur / Setting Bebas
                  </span>
                  <span className="font-body text-[10.5px] text-[#5e3f3c]">
                    Pilih waktu sekarang, pilih tanggal &amp; jam manual, atau ketik langsung
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#f7fff3] text-[#008740] font-headline text-[10px] font-bold border border-[#008740]/20 shrink-0">
                Aktif di Kasir &amp; Preview
              </span>
            </div>
          </div>

          {/* Logo Header 1-Bit Setting */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-headline text-[12px] text-[#131b2e] font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#bb0013] text-[18px]">
                  image
                </span>
                Logo Header Struk (Thermal 1-Bit)
              </label>
              <span className="px-2 py-0.5 rounded bg-[#f7fff3] text-[#008740] font-headline text-[10px] font-bold border border-[#008740]/20">
                ESC/POS Ready
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white border border-[#d2d9f4] flex items-center justify-center p-1.5 shrink-0 shadow-xs relative">
                  {customLogoPreview ? (
                    <img
                      src={customLogoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain filter grayscale contrast-125"
                    />
                  ) : (
                    <svg className="w-8 h-7 text-black fill-current" viewBox="0 0 100 80">
                      <polygon points="5,25 35,0 70,0 40,25" />
                      <polygon points="0,55 30,30 65,30 35,55" />
                      <polygon points="25,80 55,55 90,55 60,80" />
                    </svg>
                  )}
                  <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[#008740] text-[16px] bg-white rounded-full">
                    check_circle
                  </span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline text-[12.5px] font-bold text-[#131b2e] truncate">
                    {customLogoPreview ? 'Custom Logo Mitra' : 'Logo Resmi Pertamina'}
                  </span>
                  <span className="font-body text-[11px] text-[#008740] font-medium">
                    Monokrom 1-Bit Siap Cetak Thermal (ESC/POS)
                  </span>
                  <p className="font-body text-[10.5px] text-[#5e3f3c]">
                    Maks 384px • Otomatis dithering 58mm
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#bb0013] text-white hover:bg-[#e71520] font-headline text-[11.5px] font-bold transition-all shadow-xs cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Unggah Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-[#dae2fd] hover:bg-[#7aacfd] text-[#131b2e] font-headline text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Default Pertamina</span>
                </button>
              </div>

              {/* Dithering threshold */}
              <div className="flex flex-col gap-1 pt-1 border-t border-dashed border-[#d2d9f4]">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-[#131b2e] font-medium">
                    Ambang Batas Biner (Dithering Threshold)
                  </span>
                  <span className="font-thermal-mono text-[11px] text-[#245eaa] font-bold">
                    {formData.logoDitheringThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={formData.logoDitheringThreshold}
                  onChange={(e) =>
                    handleChange('logoDitheringThreshold', parseInt(e.target.value, 10))
                  }
                  className="w-full accent-[#bb0013] h-2 bg-[#dae2fd] rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Validation & Badges Checkboxes */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="font-headline text-[12px] text-[#131b2e] font-bold">
              Elemen Grafis &amp; Validasi Struk
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] cursor-pointer hover:bg-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#bb0013] text-[20px]">
                  oil_barrel
                </span>
                <div className="flex flex-col">
                  <span className="font-headline text-[12px] text-[#131b2e] font-bold">
                    Cetak Logo Pertamina Utama
                  </span>
                  <span className="font-body text-[10.5px] text-[#5e3f3c]">
                    Header grafis monocrom bitmap resmi
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.showPertaminaLogo}
                onChange={(e) => handleChange('showPertaminaLogo', e.target.checked)}
                className="w-4 h-4 accent-[#bb0013] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] cursor-pointer hover:bg-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#008740] text-[20px]">
                  verified
                </span>
                <div className="flex flex-col">
                  <span className="font-headline text-[12px] text-[#131b2e] font-bold">
                    Cetak Cap Logo "Pasti Pas!"
                  </span>
                  <span className="font-body text-[10.5px] text-[#5e3f3c]">
                    Sertifikasi tera meteran takaran dispenser
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.showPastiPasLogo}
                onChange={(e) => handleChange('showPastiPasLogo', e.target.checked)}
                className="w-4 h-4 accent-[#bb0013] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] cursor-pointer hover:bg-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#245eaa] text-[20px]">
                  qr_code_2
                </span>
                <div className="flex flex-col">
                  <span className="font-headline text-[12px] text-[#131b2e] font-bold">
                    Cetak Barcode / QR Validasi MyPertamina
                  </span>
                  <span className="font-body text-[10.5px] text-[#5e3f3c]">
                    Tautan verifikasi pajak dan subsidi pemerintah
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.showMyPertaminaQR}
                onChange={(e) => handleChange('showMyPertaminaQR', e.target.checked)}
                className="w-4 h-4 accent-[#bb0013] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Manajemen Tarif & Harga BBM */}
      <div className="w-full bg-white rounded-xl shadow-xs border border-[#eaedff] p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#bb0013]/10 flex items-center justify-center text-[#bb0013]">
              <span className="material-symbols-outlined text-[22px]">local_gas_station</span>
            </div>
            <div>
              <span className="font-headline text-[10.5px] text-[#bb0013] uppercase tracking-wider block font-bold">
                Konfigurasi Produk
              </span>
              <h2 className="font-headline text-[15.5px] font-bold text-[#131b2e]">
                Manajemen Tarif &amp; Harga BBM
              </h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f7fff3] text-[#008740] font-headline text-[10.5px] font-bold border border-[#008740]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008740] animate-pulse"></span>
            Sinkron ke Pompa
          </span>
        </div>

        <p className="font-body text-[11.5px] text-[#5e3f3c]">
          Perubahan tarif per liter otomatis terhubung ke perhitungan nominal dispenser dan cetak
          nota fisik.
        </p>

        <div className="flex flex-col gap-2">
          {fuels.map((fuel) => {
            const currentPrice = editingPrices[fuel.id] ?? fuel.price;
            return (
              <div
                key={fuel.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] hover:bg-[#eaedff] transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-headline text-[11px] font-bold shrink-0 ${fuel.colorClass.bg}`}
                  >
                    {fuel.code}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline text-[13px] font-bold text-[#131b2e]">
                        {fuel.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-[#d6e3ff] text-[#003f7e] font-headline font-bold">
                        {fuel.grade}
                      </span>
                    </div>
                    <span className="font-body text-[10.5px] text-[#5e3f3c] truncate">
                      {fuel.subText}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-white rounded-md px-2 py-1 shadow-xs border border-[#d2d9f4]">
                    <span className="text-[11px] font-semibold text-[#5e3f3c] mr-1">Rp</span>
                    <input
                      type="text"
                      value={formatRupiah(currentPrice)}
                      onChange={(e) => handlePriceChange(fuel.id, e.target.value)}
                      className="w-16 bg-transparent text-right font-thermal-mono text-[13px] font-bold text-[#131b2e] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#5e3f3c] ml-0.5">/L</span>
                  </div>
                  <span className="material-symbols-outlined text-[#008740] text-[18px]">
                    check_circle
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              Object.entries(editingPrices).forEach(([id, price]) => {
                onUpdateFuelPrice(id, price);
              });
              onShowToast('Tarif BBM berhasil diperbarui ke seluruh sistem POS', 'price_change');
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#eaedff] hover:bg-[#d2d9f4] text-[#131b2e] font-headline text-[12.5px] font-bold transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#bb0013] text-[18px]">
              price_change
            </span>
            <span>Perbarui Tarif BBM</span>
          </button>
        </div>
      </div>

      {/* Live Struk Thermal Mockup / Perforated Canvas Inset */}
      <div className="w-full bg-[#f2f3ff] rounded-xl p-3 flex flex-col gap-2 border border-[#eaedff]">
        <div className="flex items-center justify-between px-1">
          <span className="font-headline text-[11px] text-[#5e3f3c] uppercase font-bold tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Pratinjau Struk Sesuai Format ({formData.paperWidth}mm)
          </span>
          <span className="font-thermal-mono text-[10.5px] text-[#008740] font-bold bg-[#f7fff3] px-2 py-0.5 rounded border border-[#008740]/20">
            Sinkronisasi Otomatis
          </span>
        </div>

        {/* Live thermal receipt preview rendered using current formData */}
        <div className="w-full flex justify-center py-2">
          <div className="filter drop-shadow-sm">
            <ThermalReceipt
              transaction={{
                ...sampleTransaction,
                unitPrice: editingPrices[sampleTransaction.fuelId] || sampleTransaction.unitPrice,
                total: Math.round(
                  sampleTransaction.volume *
                    (editingPrices[sampleTransaction.fuelId] || sampleTransaction.unitPrice)
                ),
              }}
              settings={formData}
              paperWidth={formData.paperWidth}
              density={formData.printDensity}
              customLogoUrl={customLogoPreview}
            />
          </div>
        </div>
      </div>

      {/* Primary Save Action Button */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="w-full min-h-[52px] bg-[#bb0013] hover:bg-[#e71520] text-white font-headline text-[15px] font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">save</span>
          <span>Simpan Perubahan Pengaturan</span>
        </button>
      </div>
    </div>
  );
};
