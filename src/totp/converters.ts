export const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length / 2;
  const uintArray = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    uintArray[i] = parseInt(hex.substring(2 * i, 2 * i + 2), 16);
  }
  return uintArray;
};

export const hex2dec = (hex: string): number => {
  return parseInt(hex, 16);
};

export const dec2hex = (dec: number): string => {
  return (dec < 15.5 ? '0' : '') + Math.round(dec).toString(16);
};
