export type FuelId = 'pertamax' | 'pertalite' | 'pertamax-turbo' | 'dexlite' | 'pertamina-dex' | 'biosolar';

export interface FuelProduct {
  id: FuelId;
  name: string;
  grade: string; // e.g. "RON 92", "RON 90", "CN 51", "Subsidi"
  category: 'bensin' | 'diesel';
  price: number;
  code: string; // e.g. "92", "90", "98", "51", "53", "B35"
  subText: string;
  tag?: string; // e.g. "JBKP", "Subsidi JBT"
  colorClass: {
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
}

export type PaymentMethod = 'cash' | 'qris' | 'edc';
export type VehicleType = 'car' | 'bike';

export interface Transaction {
  id: string; // e.g. "SPBU-20180321-042"
  trxNumber: string;
  timestamp: string; // formatted date & time
  rawDate: Date;
  nozzle: number;
  island: number;
  shift: number;
  fuelId: FuelId;
  fuelName: string;
  fuelGrade: string;
  volume: number; // in liters, e.g. 15.13
  unitPrice: number; // e.g. 8600
  total: number; // e.g. 130118
  nopol: string; // e.g. "W 416 RH"
  vehicleType: VehicleType;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeAmount?: number;
  operatorId: string;
  operatorName: string;
  status: 'Tercetak' | 'Batal';
}

export interface SPBUSettings {
  spbuNumber: string; // "SPBU.54.612.55"
  spbuPartner: string; // "PT Pertamina Retail - KSO Tropodo"
  address: string; // "Jl. Raya Tropodo 9A"
  city: string; // "Waru - Sidoarjo"
  phone: string; // "031-8667744"
  footerGreeting: string; // "TERIMA KASIH DAN SELAMAT JALAN"
  callCenter: string; // "135"
  
  // Graphic flags
  showPertaminaLogo: boolean;
  showPastiPasLogo: boolean;
  showMyPertaminaQR: boolean;
  logoDitheringThreshold: number; // 20 - 80%

  // Thermal Hardware config
  paperWidth: '58' | '80'; // mm
  printDensity: '80' | '100' | '130'; // percent
  feedLines: number; // 1 - 5
  autoCut: boolean;
}

export interface BluetoothDevice {
  name: string;
  mac: string;
  connected: boolean;
  battery: number;
  rssi: number;
  paperReady: boolean;
  status: 'Terhubung' | 'Siap Pairing' | 'Standby' | 'Di luar jangkauan';
}

export interface CashierSession {
  isLoggedIn: boolean;
  operatorId: string;
  operatorName: string;
  shift: number; // 1, 2, or 3
  island: number; // 1, 2, or 3
  assignedNozzles: number[]; // e.g. [3, 4]
  loginTime: string;
}
