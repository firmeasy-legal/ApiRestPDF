import { rootDir, serverPort } from "./constants"

import { userRouter } from "@/user/infrastructure/http"
import { pdfEditorRouter } from "@/editor/infrastructure/http"
import { PrismaUserRepository } from "@/user/infrastructure/persistence/PrismaUserRepository"
import { Router } from "express"
import { ExpressServer } from "./http/ExpressServer"
import { WinstonLoggerRepository } from "./logs/WinstonLoggerRepository"
import { PrismaClient } from "./persistence"

export const loggerRepository = new WinstonLoggerRepository({
	logsDir: `${rootDir}/logs/app`,
})

export const prismaClient = new PrismaClient({
	log: ["info", "warn", "error"],
})

export const userRepository = new PrismaUserRepository({
	client: prismaClient,
	loggerRepository,
})

const apiRouter = Router()

apiRouter.use(userRouter.api)
apiRouter.use(pdfEditorRouter.api)

export const expressServer = new ExpressServer({
	apiRouter,
	loggerRepository,
	port: serverPort
})