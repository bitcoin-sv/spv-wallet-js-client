import 'cross-fetch/polyfill'
import { generateKeys } from './utils/keys'

generateKeys().xPriv().toString() //TODO: why this line is in the index.ts file?

export * from './utils/keys'
export * from './client'
export * from './authentication'
export * from './interface'
