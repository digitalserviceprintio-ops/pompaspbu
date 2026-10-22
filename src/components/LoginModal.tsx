import React, { useState } from 'react';
import { CashierSession, SPBUSettings, BluetoothDevice } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CashierSession;
  onSaveSession: (updatedSession: CashierSession) => void;
  settings: SPBUSettings;
  device: BluetoothDevice;
  onShowToast: (message: string, icon?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  session,
  onSaveSession,
  settings,
  device,
  onShowToast,
}) => {
  const [selectedShift, setSelectedShift] = useState<number>(session.shift);
  const [selectedIsland, setSelectedIsland] = useState<number>(session.island);
  const [username, setUsername] = useState<string>(session.operatorId || 'admin');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberTerminal, setRememberTerminal] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFillDefault = () => {
    setUsername('admin');
    setPassword('admin123');
    onShowToast('Kredensial default admin diisi', 'vpn_key');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      onShowToast('Username dan password wajib diisi', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const nozzles =
        selectedIsland === 1 ? [1, 2] : selectedIsland === 2 ? [3, 4] : [5, 6];
      onSaveSession({
        isLoggedIn: true,
        operatorId: username,
        operatorName:
          username === 'admin'
            ? 'Bambang Sudibyo (Kasir #1)'
            : `${username.toUpperCase()} (Operator)`,
        shift: selectedShift,
        island: selectedIsland,
        assignedNozzles: nozzles,
        loginTime: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB',
      });
      onShowToast(
        `Sesi kasir aktif: Shift ${selectedShift}, Pulau ${selectedIsland} (Nozzle ${nozzles.join(
          '-'
        )})`,
        'check_circle'
      );
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#283044]/70 backdrop-blur-xs flex flex-col justify-center items-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#faf8ff] rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col my-auto max-h-[96vh]">
        {/* Official Pertamina Station Header Bar */}
        <div className="w-full bg-white shadow-xs p-3.5 flex flex-col gap-2.5 border-b border-[#eaedff]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-0.5 shrink-0">
                <span className="w-2.5 h-6 rounded-sm bg-[#bb0013] transform -skew-x-12 inline-block"></span>
                <span className="w-2.5 h-7 rounded-sm bg-[#245eaa] transform -skew-x-12 inline-block"></span>
                <span className="w-2.5 h-5 rounded-sm bg-[#008740] transform -skew-x-12 inline-block"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-[15px] text-[#131b2e] tracking-tight uppercase leading-none font-bold">
                  Pertamina SPBU POS
                </span>
                <span className="font-body text-[10.5px] text-[#5e3f3c] font-medium mt-0.5">
                  Sistem Kasir &amp; Thermal Receipt Engine
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#78fc9c]/30 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#008740] animate-pulse"></span>
                <span className="font-headline text-[10.5px] text-[#006b32] font-bold tracking-wide">
                  ONLINE
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#eaedff] flex items-center justify-center text-[#5e3f3c] hover:text-[#131b2e] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* SPBU Metadata Chip */}
          <div className="flex items-center justify-between bg-[#eaedff] px-3 py-1.5 rounded-lg text-[#131b2e] text-[12px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[#245eaa] text-base">
                local_gas_station
              </span>
              <span className="font-thermal-mono font-bold truncate">
                {settings.spbuNumber} • {settings.address}
              </span>
            </div>
            <span className="font-headline text-[10px] bg-white text-[#245eaa] px-2 py-0.5 rounded shadow-xs font-bold shrink-0">
              Dispenser Terhubung
            </span>
          </div>
        </div>

        {/* Operational Form Body */}
        <div className="p-4 flex flex-col gap-3.5 overflow-y-auto">
          {/* Shift & Island Operational Setup Card */}
          <div className="bg-white rounded-xl p-3 shadow-xs border border-[#eaedff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#bb0013] text-[20px]">
                  schedule
                </span>
                <span className="font-headline text-[12.5px] text-[#131b2e] font-bold uppercase">
                  Pilih Shift &amp; Pulau Pompa
                </span>
              </div>
              <span className="font-headline text-[10px] text-[#5e3f3c] bg-[#eaedff] px-2 py-0.5 rounded font-bold">
                Wajib Isi
              </span>
            </div>

            {/* Shift Switcher */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { shift: 1, label: 'Shift 1', time: '06:00-14:00' },
                { shift: 2, label: 'Shift 2', time: '14:00-22:00' },
                { shift: 3, label: 'Shift 3', time: '22:00-06:00' },
              ].map((s) => {
                const isActive = selectedShift === s.shift;
                return (
                  <button
                    key={s.shift}
                    type="button"
                    onClick={() => setSelectedShift(s.shift)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#bb0013] text-white shadow-xs font-bold'
                        : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#d2d9f4]'
                    }`}
                  >
                    <span className="font-headline text-[12px]">{s.label}</span>
                    <span
                      className={`font-thermal-mono text-[9.5px] ${
                        isActive ? 'text-white/80' : 'text-[#5e3f3c]'
                      }`}
                    >
                      {s.time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Island / Dispenser Selector */}
            <div className="flex flex-col gap-1">
              <span className="font-headline text-[10px] text-[#5e3f3c] font-bold uppercase tracking-wider">
                Pulau / Dispenser Bertugas
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { island: 1, label: 'Pulau 1 (1-2)' },
                  { island: 2, label: 'Pulau 2 (3-4)' },
                  { island: 3, label: 'Pulau 3 (5-6)' },
                ].map((isl) => {
                  const isActive = selectedIsland === isl.island;
                  return (
                    <button
                      key={isl.island}
                      type="button"
                      onClick={() => setSelectedIsland(isl.island)}
                      className={`py-2 px-1 rounded-lg font-headline text-[11.5px] font-bold text-center truncate cursor-pointer transition-all ${
                        isActive
                          ? 'bg-[#245eaa] text-white shadow-xs'
                          : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#d2d9f4]'
                      }`}
                    >
                      {isl.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Credentials Helper Banner */}
          <div className="bg-[#e2e7ff] rounded-xl p-2.5 shadow-xs flex items-center justify-between gap-2 border border-[#d2d9f4]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#7aacfd] flex items-center justify-center text-[#001b3d] shrink-0">
                <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-[10px] font-bold text-[#131b2e] uppercase tracking-wide">
                  Kredensial Default
                </span>
                <span className="font-thermal-mono text-[11px] text-[#5e3f3c] truncate">
                  User: <b className="text-[#131b2e]">admin</b> | Sandi:{' '}
                  <b className="text-[#131b2e]">admin123</b>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDefault}
              className="shrink-0 bg-white text-[#245eaa] px-2.5 py-1.5 rounded-lg font-headline text-[11.5px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer border border-[#d2d9f4]"
            >
              Gunakan
            </button>
          </div>

          {/* Login Authentication Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Username Field */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pos-username"
                className="font-headline text-[10.5px] text-[#5e3f3c] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">badge</span>
                ID Operator / Username
              </label>
              <div className="flex items-center bg-[#eaedff] rounded-lg px-3 py-2 border border-[#d2d9f4] focus-within:border-[#bb0013]">
                <span className="material-symbols-outlined text-[#5e3f3c] mr-2 text-[20px]">
                  person
                </span>
                <input
                  id="pos-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent font-body text-[13.5px] text-[#131b2e] focus:outline-none"
                  placeholder="Masukkan ID kasir"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pos-password"
                className="font-headline text-[10.5px] text-[#5e3f3c] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">lock</span>
                PIN Akses / Kata Sandi
              </label>
              <div className="flex items-center bg-[#eaedff] rounded-lg px-3 py-2 border border-[#d2d9f4] focus-within:border-[#bb0013]">
                <span className="material-symbols-outlined text-[#5e3f3c] mr-2 text-[20px]">
                  key
                </span>
                <input
                  id="pos-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent font-body text-[13.5px] text-[#131b2e] focus:outline-none"
                  placeholder="Masukkan PIN"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#5e3f3c] hover:text-[#131b2e] p-1 flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Terminal Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberTerminal}
                  onChange={(e) => setRememberTerminal(e.target.checked)}
                  className="w-4 h-4 rounded text-[#bb0013] accent-[#bb0013]"
                />
                <span className="font-headline text-[11.5px] text-[#131b2e] font-semibold">
                  Ingat Kredensial di Terminal Ini
                </span>
              </label>
            </div>

            {/* Hardware ESC/POS Printer Telemetry Pill */}
            <div className="flex items-center justify-between p-2.5 bg-[#f2f3ff] rounded-lg border border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#008740] text-[20px]">print</span>
                <div className="flex flex-col">
                  <span className="font-headline text-[11.5px] font-bold text-[#131b2e]">
                    {device.name} ({settings.paperWidth}mm)
                  </span>
                  <span className="font-body text-[10.5px] text-[#008740] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008740]"></span> Siap Cetak Struk
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#5e3f3c]">
                <span className="material-symbols-outlined text-[16px]">bluetooth_connected</span>
                <span className="font-thermal-mono text-[11px] font-bold">100%</span>
              </div>
            </div>

            {/* Primary Action CTA Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[50px] bg-[#bb0013] hover:bg-[#e71520] active:scale-[0.98] text-white rounded-xl font-headline text-[14px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                  <span>Membuka Sesi Kasir...</span>
                </>
              ) : (
                <>
                  <span>Masuk &amp; Buka Sesi Kasir</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Indonesian Pertamina Fuel Grades Ticker */}
          <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#78fc9c]/30 text-[#006b32] font-headline text-[10px] font-bold">
              Pertalite
            </span>
            <span className="px-2 py-0.5 rounded bg-[#d6e3ff] text-[#245eaa] font-headline text-[10px] font-bold">
              Pertamax
            </span>
            <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#bb0013] font-headline text-[10px] font-bold">
              Turbo
            </span>
            <span className="px-2 py-0.5 rounded bg-[#eaedff] text-[#5e3f3c] font-headline text-[10px] font-bold">
              Dexlite
            </span>
          </div>

          {/* Official Industrial Footer */}
          <div className="flex flex-col items-center justify-center text-center gap-0.5 pt-2 pb-1 text-[#5e3f3c]">
            <span className="font-thermal-mono text-[10.5px] font-semibold">
              Versi 2.4.0 (ESC/POS Thermal Engine v1.8)
            </span>
            <span className="font-body text-[10px] text-[#5e3f3c]/80">
              PT Pertamina Retail • Hak Cipta Dilindungi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
