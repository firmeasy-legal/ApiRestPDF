
export const enum LogLevel {
	EMERGENCY = "emergency",
	CRITIC = "critic",
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
	DEBUG = "debug",
}

export type LogTypes = Lowercase<keyof typeof LogLevel>

export type LoggerRepository = {
	-readonly [T in LogTypes]: (...messages: unknown[]) => void
}