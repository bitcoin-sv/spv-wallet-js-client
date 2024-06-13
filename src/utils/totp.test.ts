import { Contact } from '../types';
import { generateTotpForContact, validateTotpForContact } from './totp';
import { HD } from '@bsv/sdk';

export const makeMockPKI = (xpub: string): string => {
  const contactBaseHD = new HD().fromString(xpub);
  const hd = contactBaseHD.derive('m/0/0/0');
  const pubKey = hd.pubKey;
  return pubKey.encode(true, 'hex') as string;
};

const AliceXPriv =
  'xprv9s21ZrQH143K4JFXqGhBzdrthyNFNuHPaMUwvuo8xvpHwWXprNK7T4JPj1w53S1gojQncyj8JhSh8qouYPZpbocsq934cH5G1t1DRBfgbod';
const AliceXPrivHD = new HD().fromString(AliceXPriv);
const BobXPub =
  'xpub661MyMwAqRbcFf7dwiYF2cvyqrrfA9H4oMAuShiYJAJRUrc1vRKyXdpgsLQ55cxnsemYbJNaFBtYAyijPeosA46Sy9xwA9jQC4DGkEUW6XR';

const mockBobContact: Contact = {
  created_at: new Date(),
  fullName: '',
  id: '',
  status: '',
  paymail: 'test@paymail.com',
  pubKey: makeMockPKI(BobXPub),
};

describe('GenerateTotpForContact', () => {
  const mockBobContact: Contact = {
    created_at: new Date(),
    fullName: '',
    id: '',
    status: '',
    paymail: 'test@paymail.com',
    pubKey: makeMockPKI(BobXPub),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate a TOTP with custom period and digits', async () => {
    const result = await generateTotpForContact(AliceXPrivHD, mockBobContact, 60, 2);
    expect(result.length).toBe(2);
  });
});

describe('ValidateTotpForContact', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should validate a TOTP for the given contact', async () => {
    const passcode = await generateTotpForContact(AliceXPrivHD, mockBobContact);
    const result = await validateTotpForContact(AliceXPrivHD, mockBobContact, passcode, mockBobContact.paymail);
    expect(result).toBe(true);
  });

  it('should validate a TOTP with custom period and digits', async () => {
    const passcode = await generateTotpForContact(AliceXPrivHD, mockBobContact, 60, 2);

    const result = await validateTotpForContact(AliceXPrivHD, mockBobContact, passcode, mockBobContact.paymail, 60, 2);
    expect(result).toBe(true);
  });

  it('should return false for an invalid TOTP', async () => {
    const result = await validateTotpForContact(AliceXPrivHD, mockBobContact, '24', mockBobContact.paymail);
    expect(result).toBe(false);
  });

  it('should return false for an invalid TOTP', async () => {
    const result = await validateTotpForContact(AliceXPrivHD, mockBobContact, 'avg', mockBobContact.paymail);
    expect(result).toBe(false);
  });
});
