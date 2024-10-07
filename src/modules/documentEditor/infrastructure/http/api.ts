import { Request, Response, Router } from "express"
import { initialSignatory, initialSignatory2, s3Repository, summaryRepository, utilsRepository } from "@/shared/infrastructure/container"

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

		if (!file_object.success) {
			return res.status(400).json({
				success: false,
				message: file_object.message
			})
		}

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

			if (!signature_params.path_imagen_firma.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_firma.message
				})
			}
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
			
			if (!signature_params.path_imagen_selfie.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_selfie.message
				})
			}
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

			if (!signature_params.path_imagen_front_document.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_front_document.message
				})
			}

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

			if (!signature_params.path_imagen_behind_document.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_behind_document.message
				})
			}
		}

		if (signature_params.video_firma) {
			signature_params.path_video_capture1 = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.video_firma_video_capture1}`)
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
						message: "Hubo un error al obtener la captura 1 del video"
					}
				})

			if (!signature_params.path_video_capture1.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_video_capture1.message
				})
			}

			signature_params.path_video_capture2 = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.video_firma_video_capture2}`)
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
						message: "Hubo un error al obtener la captura 2 del video"
					}
				})

			if (!signature_params.path_video_capture2.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_video_capture2.message
				})
			}
			
			signature_params.path_video_capture3 = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.video_firma_video_capture3}`)
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
						message: "Hubo un error al obtener la captura 3 del video"
					}
				})

			if (!signature_params.path_video_capture3.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_video_capture3.message
				})
			}
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

			// res.json({
			// 	status: "success",
			// 	message: "Firma biometrica realizada con exito",
			// 	pdf_signed
			// })

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

apiRouter.post("/addElectronicSignatory2", async (req: Request, res: Response) => {

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

		if (!file_object.success) {
			return res.status(400).json({
				success: false,
				message: file_object.message
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

			if (!signature_params.path_imagen_selfie.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_selfie.message
				})
			}
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

			if (!signature_params.path_imagen_front_document.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_front_document.message
				})
			}

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

			if (!signature_params.path_imagen_behind_document.success) {
				return res.status(400).json({
					success: false,
					message: signature_params.path_imagen_behind_document.message
				})
			}
		}

		signature_params.path_qr = await s3Repository.getTempPathFromURI_PNG(`public/${normalizesQRFilename}`)

		if (signature_params.biometrico && file_object.success) {

			const pdf_inserted_signature = await initialSignatory2.addInitialSignature2(file_object.path, signature_params)

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

apiRouter.get("/getSha256", async (req: Request, res: Response): Promise<void> => {
	const { key } = req.query

	try {
		if (!key) {
			throw new Error("No se ha enviado la clave")
		}

		const Sha256 : string = await s3Repository.getSha256FromURI(key as string)
		
		res.json({
			Sha256
		})
	} catch (error: any) {
		loggerRepository.error(error)
		if (error.message === "NoSuchKey") {
			res.status(404).json({ message: "El archivo especificado no existe en S3" });
		} else if (error.message === "No se ha enviado la clave") {
			res.status(400).json({ message: "No se ha enviado la clave de busqueda de S3" });
		} else {
			res.status(500).json({ message: "Error desconocido" });
		}
	}
})

export { apiRouter }
