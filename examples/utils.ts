type keyType = 'xPriv' | 'xPub' | 'adminKey' | 'Paymail';

export function errMessage(key: keyType): string {
  return `Please provide a valid ${key}.`;
}
