import { SpvWalletClient } from '../dist/typescript-npm-package.cjs.js';

const server = 'http://localhost:3003';

const aliceXPriv =
  'xprv9s21ZrQH143K4JFXqGhBzdrthyNFNuHPaMUwvuo8xvpHwWXprNK7T4JPj1w53S1gojQncyj8JhSh8qouYPZpbocsq934cH5G1t1DRBfgbod';

//pubKey - PKI can be obtained from the contact's paymail capability
const bobPKI = '03a48e13dc598dce5fda9b14ea13f32d5dbc4e8d8a34447dda84f9f4c457d57fe7';

const client = new SpvWalletClient(server, {
  xPriv: aliceXPriv,
});

const digits = 4;
const period = 1200;

const mockBobContact = {
  pubKey: bobPKI,

  //the rest of the fields won't be used for OTP generation but they still need to be defined
  createdAt: new Date(),
  fullName: '',
  id: '',
  status: '',
  paymail: 'test@paymail.com',
};

const totpCode = client.GenerateTotpForContact(mockBobContact, period, digits);
console.log('TOTP code from Alice to Bob:', totpCode);

const valid = client.ValidateTotpForContact(mockBobContact, totpCode, mockBobContact.paymail, period, digits);
console.log('Is TOTP code valid:', valid);
