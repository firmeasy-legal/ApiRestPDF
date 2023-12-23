import express, { Router } from "express"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { morganLoggerMiddleware } from "./httpLoggerFunction"

// import cors from "cors"


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

		// server.use(cors({
		// 	origin: "*",
		// 	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		// 	preflightContinue: false,
		// 	optionsSuccessStatus: 204,
		// }))

		server.use(morganLoggerMiddleware({ loggerRepository }))
		
		server.use("/api", apiRouter)

		server.listen(port, () => {
			console.log(`✅ Server running on port ${port}`)
		})
	}
}