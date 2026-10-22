import React, { useState, useEffect } from 'react';
import {
  INITIAL_SPBU_SETTINGS,
  INITIAL_FUEL_PRODUCTS,
  INITIAL_BLUETOOTH_DEVICES,
  INITIAL_SESSION,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import {
  SPBUSettings,
  FuelProduct,
  BluetoothDevice,
  CashierSession,
  Transaction,
} from './types';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { BuatStrukTab } from './components/BuatStrukTab';
import { PreviewCetakTab } from './components/PreviewCetakTab';
import { RiwayatTab } from './components/RiwayatTab';
import { PengaturanTab } from './components/PengaturanTab';
import { LoginModal } from './components/LoginModal';
import { RekapShiftModal } from './components/RekapShiftModal';
import { PrintExecutionModal } from './components/PrintExecutionModal';
import { Toast, ToastData } from './components/Toast';
import { formatIndonesianDate, generateTrxId } from './utils/formatters';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('buat-struk');

  // Master Data State
  const [settings, setSettings] = useState<SPBUSettings>(() => {
    try {
      const saved = localStorage.getItem('pertamina_spbu_settings');
      return saved ? JSON.parse(saved) : INITIAL_SPBU_SETTINGS;
    } catch {
      return INITIAL_SPBU_SETTINGS;
    }
  });

  const [fuels, setFuels] = useState<FuelProduct[]>(() => {
    try {
      const saved = localStorage.getItem('pertamina_spbu_fuels');
      return saved ? JSON.parse(saved) : INITIAL_FUEL_PRODUCTS;
    } catch {
      return INITIAL_FUEL_PRODUCTS;
    }
  });

  const [devices, setDevices] = useState<BluetoothDevice[]>(INITIAL_BLUETOOTH_DEVICES);
  const [session, setSession] = useState<CashierSession>(INITIAL_SESSION);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('pertamina_spbu_txs');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Current Transaction prepared in "Buat Struk"
  const [currentTx, setCurrentTx] = useState<Transaction>(transactions[0]);

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRekapModalOpen, setIsRekapModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printModalTx, setPrintModalTx] = useState<Transaction>(transactions[0]);
  const [printModalCopies, setPrintModalCopies] = useState<number>(1);

  // Toast System
  const [toast, setToast] = useState<ToastData>({
    message: '',
    icon: 'check_circle',
    visible: false,
  });

  const showToast = (message: string, icon: string = 'check_circle') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pertamina_spbu_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('pertamina_spbu_fuels', JSON.stringify(fuels));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
  }, [fuels]);

  useEffect(() => {
    try {
      localStorage.setItem('pertamina_spbu_txs', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
  }, [transactions]);

  // Trigger print execution flow
  const triggerPrintExecution = (tx: Transaction, copies: number = 1) => {
    setPrintModalTx(tx);
    setPrintModalCopies(copies);
    setIsPrintModalOpen(true);

    // Save/update transaction to history
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      if (exists) {
        return prev.map((t) => (t.id === tx.id ? { ...tx, status: 'Tercetak' } : t));
      }
      return [{ ...tx, status: 'Tercetak' }, ...prev];
    });
  };

  // Handle proceed from "Buat Struk"
  const handleProceedToPrint = (tx: Transaction, autoPrintDirectly?: boolean) => {
    setCurrentTx(tx);
    setActiveTab('preview-dan-cetak');
    if (autoPrintDirectly) {
      setTimeout(() => {
        triggerPrintExecution(tx, 1);
      }, 350);
    }
  };

  // Handle successful print in "Preview & Cetak"
  const handlePrintComplete = (tx: Transaction, _copies: number) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      if (exists) {
        return prev.map((t) => (t.id === tx.id ? { ...tx, status: 'Tercetak' } : t));
      }
      return [tx, ...prev];
    });
  };

  // Handle reprint from History
  const handleReprintFromHistory = (tx: Transaction) => {
    setCurrentTx(tx);
    triggerPrintExecution(tx, 1);
  };

  // Test Print in Pengaturan
  const handleTestPrint = () => {
    const now = new Date();
    const testTx: Transaction = {
      id: generateTrxId('5461255'),
      trxNumber: 'TEST-RPP02N-001',
      timestamp: formatIndonesianDate(now),
      rawDate: now,
      nozzle: 4,
      island: session.island,
      shift: session.shift,
      fuelId: 'pertamax',
      fuelName: 'SELF-TEST DIAGNOSTIK',
      fuelGrade: 'ESC/POS 58MM',
      volume: 1.0,
      unitPrice: 0,
      total: 0,
      nopol: 'TEST OK',
      vehicleType: 'car',
      paymentMethod: 'cash',
      operatorId: session.operatorId,
      operatorName: session.operatorName,
      status: 'Tercetak',
    };
    triggerPrintExecution(testTx, 1);
  };

  // Update single fuel price
  const handleUpdateFuelPrice = (fuelId: string, newPrice: number) => {
    setFuels((prev) =>
      prev.map((f) => (f.id === fuelId ? { ...f, price: newPrice } : f))
    );
  };

  // Select Bluetooth device
  const handleSelectDevice = (selectedDev: BluetoothDevice) => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        connected: d.mac === selectedDev.mac,
        status: d.mac === selectedDev.mac ? 'Terhubung' : 'Siap Pairing',
      }))
    );
    showToast(`Printer terhubung: ${selectedDev.name}`, 'bluetooth_connected');
  };

  const activeDevice = devices.find((d) => d.connected) || devices[0];

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-body selection:bg-[#ffdad6]">
      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Main Persistent Header */}
      <Header
        currentTab={activeTab}
        device={activeDevice}
        session={session}
        onOpenSessionModal={() => setIsLoginModalOpen(true)}
        onOpenDeviceModal={() => setActiveTab('pengaturan-printer-dan-spbu')}
      />

      {/* Main Viewport Content Area */}
      <main className="flex-1 w-full pt-22 pb-24 px-3 sm:px-4 max-w-lg mx-auto">
        {activeTab === 'buat-struk' && (
          <BuatStrukTab
            fuels={fuels}
            settings={settings}
            session={session}
            onProceedToPrint={handleProceedToPrint}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'preview-dan-cetak' && (
          <PreviewCetakTab
            transaction={currentTx}
            settings={settings}
            device={activeDevice}
            onEditTransaction={() => setActiveTab('buat-struk')}
            onPrintComplete={handlePrintComplete}
            onOpenPrintModal={triggerPrintExecution}
            onUpdateTimestamp={(newTimestamp, newDateObj) => {
              setCurrentTx((prev) => ({
                ...prev,
                timestamp: newTimestamp,
                rawDate: newDateObj || prev.rawDate,
              }));
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'riwayat-struk' && (
          <RiwayatTab
            transactions={transactions}
            settings={settings}
            session={session}
            onReprint={handleReprintFromHistory}
            onOpenRekap={() => setIsRekapModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'pengaturan-printer-dan-spbu' && (
          <PengaturanTab
            settings={settings}
            onUpdateSettings={setSettings}
            devices={devices}
            onSelectDevice={handleSelectDevice}
            fuels={fuels}
            onUpdateFuelPrice={handleUpdateFuelPrice}
            sampleTransaction={currentTx}
            onTestPrint={handleTestPrint}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyBadgeCount={transactions.length}
      />

      {/* Login & Shift Station Selection Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        session={session}
        onSaveSession={setSession}
        settings={settings}
        device={activeDevice}
        onShowToast={showToast}
      />

      {/* End of Shift Rekap Reconciliation Modal */}
      <RekapShiftModal
        isOpen={isRekapModalOpen}
        onClose={() => setIsRekapModalOpen(false)}
        transactions={transactions}
        settings={settings}
        session={session}
        fuels={fuels}
        onShowToast={showToast}
      />

      {/* Thermal Print Execution Modal */}
      <PrintExecutionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        transaction={printModalTx}
        settings={settings}
        device={activeDevice}
        copies={printModalCopies}
        onConfirmSuccess={() => {
          showToast(`Struk ${printModalTx.nopol} berhasil dicetak!`, 'check_circle');
        }}
        onShowToast={showToast}
      />
    </div>
  );
}
