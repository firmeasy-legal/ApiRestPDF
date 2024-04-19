import { rootDir, serverPort } from "./constants"

import { EventEmitter } from "node:events"
import { ExpressServer } from "./http/ExpressServer"
import { FileRepository } from "@/editor/infrastructure/persistence/fileRepository"
import { InitialSignatory } from "@/documentEditor/infrastructure/persistence/initialSignatory"
import { InitialSignatory2 } from "@/documentEditor/infrastructure/persistence/initialSignatory2"
import { PDFEditor } from "@/editor/infrastructure/persistence/editPdf"
import { PrismaClient } from "./persistence"
import { PrismaUserRepository } from "@/user/infrastructure/persistence/PrismaUserRepository"
import { Router } from "express"
import { S3Client } from "@aws-sdk/client-s3"
import { S3Repository } from "@/editor/infrastructure/persistence/s3Repository"
import { SummaryRepository } from "@/documentEditor/infrastructure/persistence/summaryRepository"
import { UtilsRepository } from "@/documentEditor/infrastructure/persistence/utilsRepository"
import { WinstonLoggerRepository } from "./logs/WinstonLoggerRepository"
import { documentEditorRouter } from "@/documentEditor/infrastructure/http"
import { pdfEditorRouter } from "@/editor/infrastructure/http"
import { userRouter } from "@/user/infrastructure/http"

export const eventEmitir = new EventEmitter()

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
	loggerRepository
})

export const summaryRepository = new SummaryRepository({
	loggerRepository
})

export const initialSignatory = new InitialSignatory({
	loggerRepository
})

export const initialSignatory2 = new InitialSignatory2({
	loggerRepository
})

export const utilsRepository = new UtilsRepository({
	loggerRepository
})

export const pdfEditor = new PDFEditor({
	loggerRepository
})

export const filerepository = new FileRepository({
	loggerRepository
})

export const userRepository = new PrismaUserRepository({
	client: prismaClient,
	loggerRepository,
})

const apiRouter = Router()

apiRouter.use(userRouter.api)
apiRouter.use(pdfEditorRouter.api)
apiRouter.use(documentEditorRouter.api)

export const expressServer = new ExpressServer({
	apiRouter,
	loggerRepository,
	port: serverPort
})