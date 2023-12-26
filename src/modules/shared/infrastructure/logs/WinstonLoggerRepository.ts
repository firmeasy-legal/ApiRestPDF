import { LogLevel, LogTypes, LoggerRepository } from "@/shared/domain/logs/LoggerRepository"

import winston from "winston"

type Params = {
	logsDir: string
}

type WinstonLogger = winston.Logger & {
	[T in LogTypes]: winston.LeveledLogMethod
}

type WinstonLogLevels = {
	[T in LogTypes]: number
}

const winstonLogLevels: WinstonLogLevels = {
	emergency: 0,
	critic: 1,
	error: 2,
	warning: 3,
	info: 4,
	debug: 5,
}

export class WinstonLoggerRepository implements LoggerRepository {
	private readonly infoLogger: WinstonLogger
	private readonly debugLogger: WinstonLogger
	private readonly errorLogger: WinstonLogger
	private readonly emergencyLogger: WinstonLogger
	private readonly criticLogger: WinstonLogger
	private readonly warningLogger: WinstonLogger

	private format(): winston.Logform.Format {
		const {
			combine,
			timestamp,
			prettyPrint,
			errors,
		} = winston.format

		return combine(
			errors({ stack: true }),
			timestamp(),
			prettyPrint(),
		)
	}

	private transports(logsDir: string, level: LogLevel): winston.transport[] {
		const transports: winston.transport[] = [
			new winston.transports.File({
				filename: `${logsDir}/${level}.log`,
				level,
				maxsize: 10485760,
				maxFiles: 7,
			}),
			new winston.transports.File({
				filename: `${logsDir}/combine.log`,
				level: "info",
				maxsize: 52428800,
			})
		]

		return transports
	}

	private loggerCreator(logsDir: string, level: LogLevel): WinstonLogger {
		return winston.createLogger({
			level,
			levels: winstonLogLevels,
			format: this.format(),
			transports: this.transports(logsDir, level),
		}) as WinstonLogger
	}

	constructor({ logsDir }: Params) {
		this.emergencyLogger = this.loggerCreator(logsDir, LogLevel.EMERGENCY)
		this.criticLogger = this.loggerCreator(logsDir, LogLevel.CRITIC)
		this.errorLogger = this.loggerCreator(logsDir, LogLevel.ERROR)
		this.warningLogger = this.loggerCreator(logsDir, LogLevel.WARNING)
		this.infoLogger = this.loggerCreator(logsDir, LogLevel.INFO)
		this.debugLogger = this.loggerCreator(logsDir, LogLevel.DEBUG)
	}

	emergency(...messages: unknown[]): void {
		messages.forEach(message => {
			this.emergencyLogger.emergency(message)
		})
	}

	critic(...messages: unknown[]): void {
		messages.forEach(message => {
			this.criticLogger.critic(message)
		})
	}

	error(...messages: unknown[]): void {
		messages.forEach(message => {
			this.errorLogger.error(message)
		})
	}

	warning(...messages: unknown[]): void {
		messages.forEach(message => {
			this.warningLogger.warning(message)
		})
	}

	info(...messages: unknown[]): void {
		messages.forEach(message => {
			this.infoLogger.info(message)
		})
	}

	debug(...messages: unknown[]): void {
		messages.forEach(message => {
			this.debugLogger.debug(message)
		})
	}
}