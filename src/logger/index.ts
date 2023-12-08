import pino from "pino";

const logger = pino({
    name: 'js-buxclient',
    browser: {
        asObject: true
    },
    formatters: {
        level: (label) => ({level: label})
    }
})

export default logger;
