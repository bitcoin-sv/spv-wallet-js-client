import { BSM, BigNumber, ECDSA, PrivateKey, Utils } from '@bsv/sdk';

export const signMessage = function (message: string, privateKey: PrivateKey): string {
  const messageBuf = Utils.toArray(message);
  const hash = BSM.magicHash(messageBuf);
  const bnh = new BigNumber(hash);
  const signature = ECDSA.sign(bnh, privateKey, true);
  const recovery = signature.CalculateRecoveryFactor(privateKey.toPublicKey(), bnh);
  return signature.toCompact(recovery, true, 'base64') as string;
};
