import { SpvWalletClient } from '../client';
import { ClientOptions, Contact } from '../types';
import { GenerateTotpForContact, ValidateTotpForContact } from './totp';
import { serverURL } from '../index.test';
import { HD } from '@bsv/sdk';


interface TestClient {
  xPrivString: string;
  xPubString: string;
  serverURL: string;
}

const httpTestClient: TestClient = {
  xPrivString: "xprv9s21ZrQH143K3N6qVJQAu4EP51qMcyrKYJLkLgmYXgz58xmVxVLSsbx2DfJUtjcnXK8NdvkHMKfmmg5AJT2nqqRWUrjSHX29qEJwBgBPkJQ",
  xPubString: "034252e5359a1de3b8ec08e6c29b80594e88fb47e6ae9ce65ee5a94f0d371d2cde",
  serverURL,
};

const testClient: TestClient = httpTestClient;

export const makeMockPKI = (xpub: string): string => {
  const contactBaseHD = new HD().fromString(
    xpub,
  );
  const hd = contactBaseHD.derive('m/0/0/0');
  const pubKey = hd.pubKey;
  return pubKey.encode(true, 'hex') as string
}

const AliceXPriv = "xprv9s21ZrQH143K4JFXqGhBzdrthyNFNuHPaMUwvuo8xvpHwWXprNK7T4JPj1w53S1gojQncyj8JhSh8qouYPZpbocsq934cH5G1t1DRBfgbod";
const BobXPub = "xpub661MyMwAqRbcFf7dwiYF2cvyqrrfA9H4oMAuShiYJAJRUrc1vRKyXdpgsLQ55cxnsemYbJNaFBtYAyijPeosA46Sy9xwA9jQC4DGkEUW6XR"

const options: ClientOptions = {
  xPriv: AliceXPriv,
};
const aliceClient = new SpvWalletClient(testClient.serverURL, options);

const mockBobContact: Contact = {
  created_at: new Date(), fullName: '', id: '', status: '',
  paymail: 'test@paymail.com',
  pubKey: makeMockPKI(BobXPub)
};

describe('GenerateTotpForContact', () => {
  const options: ClientOptions = {
    xPriv: httpTestClient.xPrivString,
  };
  const mockClient = new SpvWalletClient('https://spv-wallet.org/v1', options);

  const mockBobContact: Contact = {
    created_at: new Date(), fullName: '', id: '', status: '',
    paymail: 'test@paymail.com',
    pubKey: makeMockPKI(BobXPub)
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });


  it('should generate a TOTP with custom period and digits', () => {
    const result = GenerateTotpForContact(mockClient, mockBobContact, 60, 2);
    expect(result.length).toBe(2);
  });

});

describe('ValidateTotpForContact', () => {

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should validate a TOTP for the given contact', () => {
    const passcode = GenerateTotpForContact(aliceClient, mockBobContact);
    const result = ValidateTotpForContact(
      aliceClient,
      mockBobContact,
      passcode,
      mockBobContact.paymail,
    );
    expect(result).toBe(true);
  });

  it('should validate a TOTP with custom period and digits', () => {
    const passcode = GenerateTotpForContact(aliceClient, mockBobContact, 60, 2);

    const result = ValidateTotpForContact(
      aliceClient,
      mockBobContact,
      passcode,
      mockBobContact.paymail,
      60,
      2,
    );
    expect(result).toBe(true);
  });

  it('should return false for an invalid TOTP', () => {

    const result = ValidateTotpForContact(aliceClient,
      mockBobContact,
      "24",
      mockBobContact.paymail,);
    expect(result).toBe(false);
  });

  it('should return false for an invalid TOTP', () => {
    const result = ValidateTotpForContact(aliceClient,
      mockBobContact,
      "avg",
      mockBobContact.paymail,);
    expect(result).toBe(false);
  });

});


