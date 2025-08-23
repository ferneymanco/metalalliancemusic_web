// uuid.util.ts
export function uuidv4(): string {
  // 1) Mejor opción
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // 2) Con getRandomValues (Web Crypto)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    // RFC 4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const toHex = Array.from(bytes, b => b.toString(16).padStart(2, '0'));
    return `${toHex.slice(0,4).join('')}-${toHex.slice(4,6).join('')}-${toHex.slice(6,8).join('')}-${toHex.slice(8,10).join('')}-${toHex.slice(10).join('')}`;
  }

  // 3) Último recurso (no seguro)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
