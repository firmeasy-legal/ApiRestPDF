import { Request, Response } from "express"
import morgan, { TokenIndexer } from "morgan"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { getRequestIp } from "./getRequestIp"

const MORGAN_TOKEN_DIVIDER = "|#|"

function morganParser(tokens: TokenIndexer<Request, Response>, req: Request, res: Response) {
	return [
		getRequestIp(req),
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, "content-length") ?? "-",
		`${tokens["response-time"](req, res)} ms`
	].join(MORGAN_TOKEN_DIVIDER)
}

function getMorganTokens(morganMessage: string) {
	const [ip, method, url, status, contentLength, responseTime] = morganMessage.trim().split(MORGAN_TOKEN_DIVIDER)
	return {
		ip,
		method,
		url,
		status,
		contentLength,
		responseTime
	}
}

type Params = {
	loggerRepository: LoggerRepository
}
export function morganLoggerMiddleware({ loggerRepository }: Params) {
	return morgan(morganParser, {
		stream: {
			write(message: string) {
				const tokens = getMorganTokens(message)
				loggerRepository.info(tokens)
			}
		}
	})
}