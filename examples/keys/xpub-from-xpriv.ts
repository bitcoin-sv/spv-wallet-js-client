import { getKeysFromString } from '../../dist/typescript-npm-package.cjs.js';

// This is an example xPriv key - replace it with your own
const xPriv = 'xprv9s21ZrQH143K3CbJXirfrtpLvhT3Vgusdo8coBritQ3rcS7Jy7sxWhatuxG5h2y1Cqj8FKmPp69536gmjYRpfga2MJdsGyBsnB12E19CESK';
console.log('extracted xPub:', getKeysFromString(xPriv).xPub.toString());
