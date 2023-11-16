import express, { Router } from "express"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { morganLoggerMiddleware } from "./httpLoggerFunction"

type Params = {
	apiRouter: Router
	port: number
	loggerRepository: LoggerRepository
}

export class ExpressServer {
	constructor({
		apiRouter,
		port,
		loggerRepository,
	}: Params) {
		const server = express()

		server.use(express.json({
			limit: "1gb"
		}))

		server.use(morganLoggerMiddleware({ loggerRepository }))
		
		server.use("/api", apiRouter)

		server.listen(port, () => {
			console.log(`✅ Server running on port ${port}`)
		})
	}
}