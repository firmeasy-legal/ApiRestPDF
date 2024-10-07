import {
	GetObjectCommand,
	NoSuchKey,
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

	async getTempPathFromURI_PDF(uri: string): Promise<string> {

		const uuid = crypto.randomUUID()

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

			const readstream = response.Body as Readable

			const filePath = `tmp/input_PDF/${uuid}.pdf`
			const fileWriteStream = fs.createWriteStream(filePath)

			readstream.pipe(fileWriteStream)

			console.log("====================================================================================================")
			console.log("==================================== Starding to get PDF ===========================================")
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
			console.error("Error_getTempPathFromURI_PDF:", error)
			
			if (error instanceof NoSuchKey) {
				throw new Error(error.message)
			} 

			throw new Error("Error desconocido en getTempPathFromURI_PDF")
		}
	}

	async getTempPathFromURI_PNG(uri: string): Promise<string> {

		const uuid = crypto.randomUUID()

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

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
			console.error("Error_getTempPathFromURI_PNG:", error)

			if (error instanceof NoSuchKey) {
				throw new Error(error.message)
			}

			throw new Error("Error desconocido en getTempPathFromURI_PNG")
		}
	}

	async getTempPathFromURI_JPG(uri: string): Promise<string> {

		const uuid = crypto.randomUUID()

		const command = new GetObjectCommand({
			Bucket: process.env.AWS_BUCKET,
			Key: uri,
		})

		try {
			const response = await this.s3Client.send(command)

			const readstream = response.Body as Readable

			const filePath = `tmp/input_JPG/${uuid}.jpg`
			const fileWriteStream = fs.createWriteStream(filePath)

			readstream.pipe(fileWriteStream)

			return await new Promise<string>((resolve, reject) => {
				fileWriteStream.on("finish", () => {
					console.log(`JPG guardado en ${filePath}`)
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
			console.error("Error_getTempPathFromURI_JPG:", error)

			if (error instanceof NoSuchKey) {
				throw new Error(error.message)
			}

			throw new Error("Error desconocido en getTempPathFromURI_JPG")
		}
	}

	async addFileToS3(filePath: string, file_path: string): Promise<{ fileKey: string, new_filename: string, file_path: string }> {

		const fileContent = fs.readFileSync(process.cwd() + "/" + filePath)

		if (!fileContent) {
			throw new Error("No se pudo leer el archivo nuevo")
		}

		const new_filename = `${Date.now()}-${Math.random().toString(36).substring(2, 12)}.pdf`

		const fileKey = `public/${file_path}/${new_filename}`

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
				new Error("No se pudo guardar el archivo")
			}

			console.log("====================================================================================================")
			console.log("==================================== Uploaded file to S3 ===========================================")
			console.log("====================================================================================================")

			return {
				fileKey,
				new_filename,
				file_path
			}

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			throw new Error("No se pudo guardar el archivo")
		}

	}

	async getSha256FromURI(uri: string): Promise<string> {
		try {
			const command = new GetObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: uri });
			const response = await this.s3Client.send(command);

			const readStream = response.Body as Readable;
			const hash = crypto.createHash("sha256");

			return await new Promise<string>((resolve, reject) => {
				readStream.on("data", chunk => hash.update(chunk));
				readStream.on("end", () => resolve(hash.digest("hex")));
				readStream.on("error", reject);
			});
			
		} catch (error: any) {
			if (error.name === 'NoSuchKey') {
				this.loggerRepository.error(`Archivo no encontrado en S3 en el servicio getSha256FromURI: ${uri}`);
				throw new Error('NoSuchKey');
			}
			this.loggerRepository.error(`Error al obtener SHA256 de archivo en S3: ${uri}`);
			throw error;
		}
	}

}
