import {
	GetObjectCommand,
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

}
