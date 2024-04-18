import { Request, Response, Router } from "express"
import { initialSignatory, s3Repository, summaryRepository, utilsRepository } from "@/shared/infrastructure/container"

import { FileObject } from "../../domain/File"
import { filerepository } from "@/shared/infrastructure/container"
import { loggerRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/addElectronicSignatory", async (req: Request, res: Response) => {

	const {
		origin_filename,
		file_path,
		signature_params
	} = req.body

	try {

		const normalizedFilePath = file_path.startsWith("/") ? file_path.slice(1) : file_path

		const normalizedFilename = origin_filename.startsWith("/") ? origin_filename.slice(1) : origin_filename

		const normalizesQRFilename = signature_params.qr_filename.startsWith("/") ? signature_params.qr_filename.slice(1) : signature_params.qr_filename

		const file_object: FileObject = await s3Repository.getTempPathFromURI_PDF(`public/${normalizedFilename}`)
			.then((path) => {
				return {
					success: true,
					path,
					message: undefined
				} as const
			})
			.catch((error) => {
				loggerRepository.error(error)
				return {
					success: false,
					path: undefined,
					message: error.message
				} as const
			})

		if (signature_params.biometrico) {
			signature_params.path_imagen_firma = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.imagen_firma}`)
				.then((path) => {
					return {
						success: true,
						path,
						message: undefined
					}
				})
				.catch((error) => {
					loggerRepository.error(error)
					return {
						success: false,
						path: undefined,
						message: "Hubo un error al obtener la imagen de la firma"
					}
				})
		}

		if (signature_params.selfie) {
			signature_params.path_imagen_selfie = await s3Repository.getTempPathFromURI_JPG(`public/${signature_params.imagen_selfie}`)
				.then((path) => {
					return {
						success: true,
						path,
						message: undefined
					}
				})
				.catch((error) => {
					loggerRepository.error(error)
					return {
						success: false,
						path: undefined,
						message: "Hubo un error al obtener la imagen de la selfie"
					}
				})
		}

		if (signature_params.doc_identidad) {
			signature_params.path_imagen_front_document = await s3Repository.getTempPathFromURI_JPG(`public/${signature_params.imagen_front_document}`)
				.then((path) => {
					return {
						success: true,
						path,
						message: undefined
					}
				})
				.catch((error) => {
					loggerRepository.error(error)
					return {
						success: false,
						path: undefined,
						message: "Hubo un error al obtener la imagen del documento de identidad (anverso)"
					}
				})

			signature_params.path_imagen_behind_document = await s3Repository.getTempPathFromURI_JPG(`public/${signature_params.imagen_behind_document}`)
				.then((path) => {
					return {
						success: true,
						path,
						message: undefined
					}
				})
				.catch((error) => {
					loggerRepository.error(error)
					return {
						success: false,
						path: undefined,
						message: "Hubo un error al obtener la imagen del documento de identidad (reverso)"
					}
				})
		}

		signature_params.path_qr = await s3Repository.getTempPathFromURI_PNG(`public/${normalizesQRFilename}`)

		if (signature_params.biometrico && signature_params.path_imagen_firma.success && file_object.success) {

			const pdf_inserted_signature = await initialSignatory.addInitialSignature(file_object.path, signature_params)

			const pdf_footer_added = await utilsRepository.addfooter(pdf_inserted_signature, signature_params)

			const pdf_signed = await summaryRepository.addSummarySignature(pdf_footer_added, signature_params)

			const response = await s3Repository.addFileToS3(pdf_signed, normalizedFilePath)

			const { fileKey, new_filename, file_path } = response

			res.json({
				completePath: fileKey,
				new_filename,
				file_path
			})

			// Flujo terminado, se eliminan los archivos temporales

			filerepository.deleteFile(file_object.path)

			filerepository.deleteFile(signature_params.path_imagen_firma.path)

			if (signature_params.selfie) filerepository.deleteFile(signature_params.path_imagen_selfie.path)

			if (signature_params.doc_identidad) {
				filerepository.deleteFile(signature_params.path_imagen_front_document.path)
				filerepository.deleteFile(signature_params.path_imagen_behind_document.path)
			}

			filerepository.deleteFile(signature_params.path_qr)

			filerepository.deleteFile(pdf_inserted_signature)

			filerepository.deleteFile(pdf_footer_added)

			filerepository.deleteFile(pdf_signed)
			
		} if (!signature_params.biometrico && file_object.success) {

			const pdf_footer_added = await utilsRepository.addfooter(file_object.path, signature_params)

			const pdf_signed = await summaryRepository.addSummarySignature(pdf_footer_added, signature_params)

			const response = await s3Repository.addFileToS3(pdf_signed, normalizedFilePath)

			const { fileKey, new_filename, file_path } = response

			res.json({
				completePath: fileKey,
				new_filename,
				file_path
			})

			// Flujo terminado, se eliminan los archivos temporales

			filerepository.deleteFile(file_object.path)

			if (signature_params.selfie) filerepository.deleteFile(signature_params.path_imagen_selfie.path)

			if (signature_params.doc_identidad) {
				filerepository.deleteFile(signature_params.path_imagen_front_document.path)
				filerepository.deleteFile(signature_params.path_imagen_behind_document.path)
			}

			filerepository.deleteFile(signature_params.path_qr)

			filerepository.deleteFile(pdf_footer_added)

			filerepository.deleteFile(pdf_signed)
		}

	} catch (error) {
		loggerRepository.error(error)
		console.error("Error:", error)
		return res.status(400).json({
			sucess: false,
			message: "Error al procesar el PDF",
			error: error
		})
	}
})

export { apiRouter }
