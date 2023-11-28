import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client
} from "@aws-sdk/client-s3"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { Readable } from "node:stream"
import crypto from "node:crypto"
import fs from "node:fs"

type Params = {
	s3Client: S3Client;
	loggerRepository: LoggerRepository;
};


export class S3Repository {
	private s3Client: S3Client
	private loggerRepository: LoggerRepository

	constructor({ s3Client, loggerRepository }: Params) {
		this.s3Client = s3Client
		this.loggerRepository = loggerRepository
	}

	async getTempPathFromURI_PDF(uri: string): Promise<string | undefined> {

		const uuid = crypto.randomUUID()

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

			if (response.Body === undefined) {
				return undefined
			}

			const readstream = response.Body as Readable

			const filePath = `tmp/input_PDF/${uuid}.pdf`
			const fileWriteStream = fs.createWriteStream(filePath)

			readstream.pipe(fileWriteStream)
			
			console.log("====================================================================================================")
			console.log("==================================== Starding to write PDF file ====================================")
			console.log("====================================================================================================")
			
			return await new Promise<string>((resolve, reject) => {
				fileWriteStream.on("finish", () => {
					console.log(`PDF guardado en ${filePath}`)
					fileWriteStream.close()
					resolve(filePath)
				})

				fileWriteStream.on("error", (err) => {
					console.error("Error al escribir el archivo:", err)
					reject(err)
				})
			})

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	}

	async getTempPathFromURI_PNG(uri: string): Promise<string | undefined> {

		const uuid = crypto.randomUUID()

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

			if (response.Body === undefined) {
				return undefined
			}

			const readstream = response.Body as Readable

			const filePath = `tmp/input_PNG/${uuid}.png`
			const fileWriteStream = fs.createWriteStream(filePath)

			readstream.pipe(fileWriteStream)

			return await new Promise<string>((resolve, reject) => {
				fileWriteStream.on("finish", () => {
					console.log(`PNG guardado en ${filePath}`)
					fileWriteStream.close()
					resolve(filePath)
				})

				fileWriteStream.on("error", (err) => {
					console.error("Error al escribir la imagen:", err)
					reject(err)
				})
			})

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	}

	async addFileToS3(filePath: string, file_token: string): Promise<string | undefined> {
		
		const fileContent = fs.readFileSync(process.cwd() + "/" + filePath)

		if (!fileContent) {
			return undefined
		}

		const new_filename = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.pdf`

		const fileKey = `public/${file_token}/${new_filename}`
		
		const params = {
			Bucket: process.env.AWS_BUCKET,
			Key: fileKey,
			Body: fileContent,
			Metadata: {
				"Content-Type": "application/pdf"
			}	
		}

		try {
			const command = new PutObjectCommand(params)
			const response = await this.s3Client.send(command)

			if (response.$metadata.httpStatusCode !== 200) {
				return undefined
			}
			
			return fileKey
			
		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}

}
