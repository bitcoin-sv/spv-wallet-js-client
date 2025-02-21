import crypto from 'crypto';

type keyType = 'xPriv' | 'xPub' | 'adminKey' | 'Paymail';

export function errMessage(key: keyType): string {
  return `Please provide a valid ${key}.`;
}

export function CreateXpubID(xpub: string): string {
  return Hash(xpub);
}

export function Hash(data: string): string {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash;
}
