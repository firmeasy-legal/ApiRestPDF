import { rootDir, serverPort } from "./constants"

// import { empresaLocationRouter } from "@/empresa/infrastructure/http"
// import { PrismaEmpresaLocationRepository } from "@/empresa/infrastructure/persistence/PrismaEmpresaLocationRepository"
// import { AwsSqsMessageBroker } from "@/messageBroker/infrastructure/AwsSqsMessageBroker"
// import { printerRouter } from "@/printer/infrastructure/http"
// import { PrismaPrintableFileRepository } from "@/printer/infrastructure/persistence/PrismaPrintableFileRepository"
import { userRouter } from "@/user/infrastructure/http"
// import { PrismaUserRepository } from "@/user/infrastructure/persistence/PrismaUserRepository"
// import { SQSClient } from "@aws-sdk/client-sqs"
import { Router } from "express"
import { ExpressServer } from "./http/ExpressServer"
import { WinstonLoggerRepository } from "./logs/WinstonLoggerRepository"
// import { PrismaClient } from "./persistence"

export const loggerRepository = new WinstonLoggerRepository({
	logsDir: `${rootDir}/logs/app`,
})

// export const prismaClient = new PrismaClient({
// 	log: ["info", "warn", "error"],
// })

// export const userRepository = new PrismaUserRepository({
// 	client: prismaClient,
// 	loggerRepository,
// })

// export const userRepository = new 

// export const empresaLocationRepository = new PrismaEmpresaLocationRepository({
// 	client: prismaClient,
// 	loggerRepository,
// })

// export const printableFileRepository = new PrismaPrintableFileRepository({
// 	client: prismaClient,
// 	loggerRepository,
// })

// const sqsClient = new SQSClient({
// 	region: "us-east-2"
// })

// export const messageBroker = new AwsSqsMessageBroker({
// 	sqsClient,
// 	loggerRepository
// })

const apiRouter = Router()

apiRouter.use(userRouter.api)
// apiRouter.use(empresaLocationRouter.api)
// apiRouter.use(printerRouter.api)

export const expressServer = new ExpressServer({
	apiRouter,
	loggerRepository,
	port: serverPort
})