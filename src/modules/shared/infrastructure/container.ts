import { rootDir, serverPort } from "./constants"

import { ExpressServer } from "./http/ExpressServer"
import { PrismaClient } from "./persistence"
import { PrismaUserRepository } from "@/user/infrastructure/persistence/PrismaUserRepository"
import { Router } from "express"
import { S3Client } from "@aws-sdk/client-s3"
import { S3Repository } from "@/editor/infrastructure/repositories/S3Repository"
import { WinstonLoggerRepository } from "./logs/WinstonLoggerRepository"
import { pdfEditorRouter } from "@/editor/infrastructure/http"
import { userRouter } from "@/user/infrastructure/http"

export const loggerRepository = new WinstonLoggerRepository({
	logsDir: `${rootDir}/logs/app`,
})

export const prismaClient = new PrismaClient({
	log: ["info", "warn", "error"],
})

const config = {
	region: `${process.env.AWS_REGION}`,
	credentials: {
		accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
		secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
	},
}

const s3client = new S3Client(config)

export const s3Repository = new S3Repository({
	s3Client: s3client,
	loggerRepository,
	bucketName: `${process.env.AWS_BUCKET}`,
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