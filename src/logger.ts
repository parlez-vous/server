import * as winston from 'winston'

const combine = winston.format.combine

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: combine(
        winston.format.colorize(),
        winston.format.simple(),
      )
    }),
  ],
})

export default logger
