import { generateKeyPair } from './utils.js';

export const exampleAdminKey =
  'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';

export const { xPriv: exampleXPriv, xPub: exampleXPub } = generateKeyPair();

export const examplePaymail = `example@example.com`;
