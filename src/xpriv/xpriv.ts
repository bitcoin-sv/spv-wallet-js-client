import {HDKey, Versions} from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { base58 } from '@scure/base';
import { wordlist } from '@scure/bip39/wordlists/english';

interface Keys {
  xpriv: string;
  xpub: PublicKey;
  mnemonic: string;
}

interface PublicKey {
  toString(): string;
}

interface Key {
  XPriv(): string;
  XPub(): PubKey;
}

interface PubKey {
  toString(): string;
}

interface KeyWithMnemonic extends Key {
  getMnemonic(): string;
}

class KeysImpl implements Keys {
  xpriv: string;
  xpub: PublicKey;
  mnemonic: string;

  constructor(xpriv: string, xpub: PublicKey, mnemonic: string) {
    this.xpriv = xpriv;
    this.xpub = xpub;
    this.mnemonic = mnemonic;
  }

  XPub(): PublicKey {
    return this.xpub;
  }

  XPriv(): string {
    return this.xpriv;
  }

  getMnemonic(): string {
    return this.mnemonic;
  }
}

const createXPrivAndXPub = (seed:  Uint8Array, versions?: Versions): [HDKey, string] => {
  const hdXpriv = HDKey.fromMasterSeed(seed, versions);
  const hdXpub = hdXpriv.publicExtendedKey

  return [hdXpriv, hdXpub]

}

export const Generate =  () => {
  // The entropy in spvwallet-go-client is 128 bytes
  const entropy = new Uint8Array(32);
  const mnemonic = bip39.entropyToMnemonic(entropy, wordlist)
  const seed =  bip39.mnemonicToSeedSync(mnemonic, "")
  const [hdXpriv, hdXpub] = createXPrivAndXPub(seed);

  const hdXprivUnitArr = new TextEncoder().encode(hdXpriv.privateExtendedKey)

  return new KeysImpl(base58.encode(hdXprivUnitArr), hdXpub, mnemonic)
}

export const FromMnemonic =  (mnemonic: string): KeyWithMnemonic => {
  const seed =  bip39.mnemonicToSeedSync(mnemonic, "");
  const [hdXpriv, hdXpub] = createXPrivAndXPub(seed);

  const hdXprivUnitArr = new TextEncoder().encode(hdXpriv.privateExtendedKey)

  return new KeysImpl(base58.encode(hdXprivUnitArr), hdXpub, mnemonic)
};

export const FromString = (xpriv: string): Key => {
  const hdXpriv = HDKey.fromExtendedKey(xpriv);
  const hdXpub = hdXpriv.publicExtendedKey;

  const hdXprivUnitArr = new TextEncoder().encode(hdXpriv.privateExtendedKey)

  return new KeysImpl(base58.encode(hdXprivUnitArr), hdXpub, "")
};
