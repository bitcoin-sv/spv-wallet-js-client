import { BSM, BigNumber, ECDSA, PrivateKey } from '@bsv/sdk';

export const signMessage = function (message: string, privateKey: PrivateKey): string {
  const messageBuf = Array.from(Buffer.from(message));
  const hash = BSM.magicHash(messageBuf);
  const bnh = new BigNumber(hash);
  const signature = ECDSA.sign(bnh, privateKey, true);
  const recovery = signature.CalculateRecoveryFactor(privateKey.toPublicKey(), bnh);
  return signature.toCompact(recovery, true, 'base64') as string;
};
