export function formatRupiah(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiah(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/[^\d]/g, '');
  return parseInt(clean, 10) || 0;
}

export function formatLiter(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0,00';
  return (Math.round(num * 100) / 100).toFixed(2).replace('.', ',');
}

export function parseLiter(str: string): number {
  if (!str) return 0;
  const clean = str.replace(',', '.').replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(date: Date = new Date()): string {
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  const dayName = HARI[date.getDay()];
  const day = date.getDate();
  const monthName = BULAN[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
}

export function toInputDateValue(date: Date): string {
  if (!date || isNaN(date.getTime())) date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toInputTimeValue(date: Date): string {
  if (!date || isNaN(date.getTime())) date = new Date();
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function fromDateTimeInput(dateStr: string, timeStr: string): Date {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const timeParts = timeStr.split(':').map(Number);
    const hour = timeParts[0] || 0;
    const minute = timeParts[1] || 0;
    const second = timeParts[2] || 0;
    return new Date(year, month - 1, day, hour, minute, second);
  } catch {
    return new Date();
  }
}

export function generateTrxId(spbuNum: string = '5461255'): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  const cleanSpbu = spbuNum.replace(/[^\d]/g, '');
  return `TRX-${cleanSpbu}-${y}${m}${d}-${randomNum}`;
}
