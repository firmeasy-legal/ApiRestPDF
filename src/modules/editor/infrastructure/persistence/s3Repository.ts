import * as fs from "fs"
import * as path from "path"

import {
	GetObjectCommand,
	S3Client
} from "@aws-sdk/client-s3"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { promisify } from "util"

type Params = {
	s3Client: S3Client;
	loggerRepository: LoggerRepository;
	bucketName: string;
};


export class S3Repository {
	private s3Client: S3Client
	private loggerRepository: LoggerRepository
	private bucketName: string
	
	constructor({ s3Client, loggerRepository, bucketName }: Params) {
		this.s3Client = s3Client
		this.loggerRepository = loggerRepository
		this.bucketName = bucketName
	}
	
	async getPDFFromURI(uri: string): Promise<string | undefined> {
		
		const pipeline = promisify(require("stream").pipeline)
		
		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

			// Crea un archivo temporal
			const tempDir = fs.mkdtempSync(path.join(process.cwd(), "temp"))
			const tempFilePath = path.join(tempDir, "temp.pdf")

			const outputStream = fs.createWriteStream(tempFilePath)
			// response.Body.pipe(outputStream)

			// Escribe el contenido del archivo PDF en el archivo temporal
			await pipeline(response.Body, outputStream)

			return tempFilePath

		} catch (error) {
			console.error("Error:", error)
			throw new Error("Error al obtener el PDF")
		}

		return undefined
	}
}
