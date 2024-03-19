import pino from 'pino'

const logger = pino({
  name: 'spv-wallet-js-client',
  browser: {
    asObject: true,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
})

export default logger
