import winston, { format, transports } from 'winston'

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

export class LoggerConfig {
  private readonly options: winston.LoggerOptions
  constructor () {
    this.options = {
      level: 'debug',
      levels: logLevels,
      exitOnError: false,
      format: format.combine(
        format.timestamp(),
        format.printf((msg: winston.Logform.TransformableInfo): string => {
          return `${msg.timestamp as string} [${msg.level}] - ${
            msg.message as string
          }`
        })
      ),
      transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf((msg: winston.Logform.TransformableInfo): string => {
              return `${msg.timestamp as string} [${msg.level}] - ${
                msg.message as string
              }`
            })
          )
        })
      ]
    }
  }

  public console (): object {
    return this.options
  }
}
