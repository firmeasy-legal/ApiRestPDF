import {
	GetObjectCommand,
	S3Client
} from "@aws-sdk/client-s3"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { Readable } from "node:stream"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

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

	// async getTempPathFromURI_PDF(uri: string): Promise<Buffer | undefined> {
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

			readstream.on("data", (chunk) => {
				fileWriteStream.write(chunk)
			})

			readstream.on("end", () => {
				fileWriteStream.end()
				console.log(`PDF guardado en ${filePath}`)
			})

			return filePath

			// return await new Promise((resolve, reject) => {
			// 	const chunks: Buffer[] = []
			// 	readstream.on("data", (chunk) => {
			// 		chunks.push(chunk)
			// 	})
			// 	readstream.on("end", () => {
			// 		const buffer = Buffer.concat(chunks)
			// 		resolve(buffer)
			// 	})
			// 	readstream.on("error", reject)
			// })

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

			const tempDir = fs.mkdtempSync(path.join(process.cwd(), "temp"))
			const tempFilePath = path.join(tempDir, `${uuid}.png`)

			readstream.pipe(fs.createWriteStream(tempFilePath))

			return tempFilePath

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	}

}
