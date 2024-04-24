import { describe, expect, test } from '@jest/globals';
import { signMessage } from './sign';
import { HD } from '@bsv/sdk';
import { deriveHDChildKeyFromHex } from './keys';

const nonce = '0111cdb846fdec74e71bf21d80f366d30b7808725327f96b52ee733e87e3daed';
const xPriv = 'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';
const messageToSign = 'xpub661MyMwAqRbcFgfmdkPgE2m5UjHXu9dj124DbaGLSjaqVESTWfCD4VuNmEbVPkbYLCkykwVZvmA8Pbf8884TQr1FgdG2nPoHR8aB36YdDQhaa655e1817379f75800937db8980faa3ee3514056e424d22b60283e4ef284ca30111cdb846fdec74e71bf21d80f366d30b7808725327f96b52ee733e87e3daed1713960719777';
const signatureFixture= 'HzE7s5TRtc4s5m2BgtdZ8g8w9eZrbszQSlPQFJC3d5wQKAZo0f3d4k54TjxxE3dFx9zF7Q/VL1KS3i33OmAatD8=';

describe('sign operation with creation of privateKey', () => {
  test('proper signing operation', () => {
    const hdWallet = new HD().fromString(xPriv);
    const derivedHDWallet = deriveHDChildKeyFromHex(hdWallet, nonce);
    const signedMessage = signMessage(messageToSign, derivedHDWallet.privKey);
    expect(signedMessage).toBe(signatureFixture);
  })
});
