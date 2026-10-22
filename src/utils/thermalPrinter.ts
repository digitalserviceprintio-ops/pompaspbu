import { Transaction, SPBUSettings } from '../types';
import { formatRupiah, formatLiter } from './formatters';

// Web Audio API thermal printer sound synthesizer (no external audio files needed!)
export function playPrinterSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Initial beep
    const beepOsc = ctx.createOscillator();
    const beepGain = ctx.createGain();
    beepOsc.type = 'sine';
    beepOsc.frequency.setValueAtTime(1800, ctx.currentTime);
    beepGain.gain.setValueAtTime(0.08, ctx.currentTime);
    beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    beepOsc.connect(beepGain);
    beepGain.connect(ctx.destination);
    beepOsc.start(ctx.currentTime);
    beepOsc.stop(ctx.currentTime + 0.12);

    // Mechanical thermal motor whirr / step noise simulation
    const bufferSize = ctx.sampleRate * 0.4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime + 0.15);
    filter.Q.setValueAtTime(3, ctx.currentTime + 0.15);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, ctx.currentTime + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(ctx.currentTime + 0.15);
  } catch (e) {
    console.log('Audio feedback not permitted:', e);
  }
}

// Generate ESC/POS raw formatted text (32 characters wide for 58mm roll)
export function generateESCPOSText(tx: Transaction, settings: SPBUSettings): string {
  const pad = (left: string, right: string, width: number = 32): string => {
    const spaces = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaces) + right;
  };

  const center = (text: string, width: number = 32): string => {
    const leftPad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(leftPad) + text;
  };

  const divider = '-'.repeat(32);

  const lines = [
    center('PERTAMINA'),
    center(settings.spbuNumber),
    center(settings.address),
    center(settings.city),
    center(`Telp.${settings.phone}`),
    center(tx.timestamp),
    divider,
    pad('Nomor Printer', ': 1'),
    pad('Nomor Selang', `: ${tx.nozzle}`),
    pad('Jenis BBM', `: ${tx.fuelName} (${tx.fuelGrade})`),
    pad('Liter', `: ${formatLiter(tx.volume)} L`),
    pad('Harga/liter', `: Rp ${formatRupiah(tx.unitPrice)}`),
    divider,
    pad('TOTAL', `: Rp ${formatRupiah(tx.total)}`),
    divider,
    pad('Nopol', `: ${tx.nopol.toUpperCase().replace(/\s+/g, '')}`),
    pad('Metode Bayar', `: ${tx.paymentMethod.toUpperCase()}`),
  ];

  if (tx.paymentMethod === 'cash' && tx.cashReceived) {
    lines.push(pad('Uang Diterima', `: Rp ${formatRupiah(tx.cashReceived)}`));
    lines.push(pad('Kembalian', `: Rp ${formatRupiah(tx.changeAmount || 0)}`));
  }

  lines.push(divider);
  lines.push(center(tx.trxNumber || tx.id));
  lines.push(center(settings.footerGreeting));
  lines.push(center(`Pertamina Call Center: ${settings.callCenter}`));
  lines.push(center('PASTI PAS! • TERKALIBRASI'));
  lines.push('\n\n\n'); // Feed paper

  return lines.join('\n');
}

// Trigger Web Bluetooth ESC/POS print
export async function printViaWebBluetooth(
  rawText: string,
  onStatus?: (msg: string) => void
): Promise<boolean> {
  const nav = navigator as any;
  if (!nav.bluetooth) {
    throw new Error('Web Bluetooth tidak didukung di browser ini. Menggunakan dialog cetak.');
  }

  onStatus?.('Mencari printer Bluetooth RPP-02N...');
  const device = await nav.bluetooth.requestDevice({
    filters: [
      { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
      { namePrefix: 'RPP' },
      { namePrefix: 'POS' },
      { namePrefix: 'MPT' },
      { namePrefix: 'Bluetooth' },
    ],
    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb'],
  });

  onStatus?.(`Terhubung ke ${device.name || 'Printer'}. Mengirim data...`);
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
  const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

  // Convert to ESC/POS byte buffer
  const encoder = new TextEncoder();
  // ESC @ (initialize printer) + ESC a 1 (center) + content + GS V 66 0 (cut)
  const initBytes = new Uint8Array([0x1b, 0x40]);
  const textBytes = encoder.encode(rawText);
  const cutBytes = new Uint8Array([0x1d, 0x56, 0x42, 0x00]);

  const payload = new Uint8Array(initBytes.length + textBytes.length + cutBytes.length);
  payload.set(initBytes, 0);
  payload.set(textBytes, initBytes.length);
  payload.set(cutBytes, initBytes.length + textBytes.length);

  // Send in chunks of 512 bytes
  for (let i = 0; i < payload.length; i += 512) {
    const chunk = payload.slice(i, i + 512);
    await characteristic.writeValue(chunk);
  }

  onStatus?.('Cetak selesai!');
  return true;
}

// Download receipt slip as high-res PNG image
export function downloadReceiptAsImage(
  elementId: string,
  filename: string = 'Struk_Pertamina.png'
) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Use HTML Canvas directly to generate a crisp monochrome receipt image
  const canvas = document.createElement('canvas');
  const scale = 2; // high resolution for crisp thermal text
  const width = el.offsetWidth || 330;
  const height = el.offsetHeight || 580;

  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Render SVG foreignObject to canvas
  const data = new XMLSerializer().serializeToString(el);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; color:#000000; font-family:'IBM Plex Mono', monospace; font-size:13px;">
        ${data}
      </div>
    </foreignObject>
  </svg>`;

  const img = new Image();
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    try {
      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (e) {
      console.log('Download triggered:', e);
    }
  };
  img.src = url;
}
