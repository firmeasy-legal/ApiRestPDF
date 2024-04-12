import { Request, Response, Router } from "express"
import { documentRepository, s3Repository } from "@/shared/infrastructure/container"

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

		const path_file = await s3Repository.getTempPathFromURI_PDF(`public/${normalizedFilename}`)

		if (!path_file) {
			return res.status(401).json({
				message: "Hubo un error al obtener el PDF"
			})
		}

		signature_params.path_signature = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.signature_filename}`)

		if (!signature_params.path_signature) {
			return res.status(401).json({
				message: "Hubo un error al obtener la firma"
			})
		}

		signature_params.qr_filename = await s3Repository.getTempPathFromURI_PNG(`public/${normalizesQRFilename}`)

		if (!signature_params.qr_filename) {
			return res.status(401).json({
				message: "Hubo un error al obtener el QR"
			})
		}

		const pdf_signed = await documentRepository.addInitialSignature(path_file, signature_params)

		if (!pdf_signed) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF no firmado"
			})
		}

		const pdf_summary_added = await documentRepository.addSummarySignature(pdf_signed, signature_params)

		if (!pdf_summary_added) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF firmado"
			})
		}

		const result = await s3Repository.addFileToS3(pdf_summary_added, normalizedFilePath)

		if (result === undefined) {
			res.status(500).json({
				error: "Ocurrió un error al guardar el archivo en S3",
				message: "La función devolvió undefined, probablemente hubo un problema al guardar el archivo"
			})
		} else {
			const { fileKey, new_filename, file_path } = result

			res.json({
				completePath: fileKey,
				new_filename,
				file_path
			})
		}

		filerepository.deleteFile(path_file)
		filerepository.deleteFile(signature_params.path_signature)
		filerepository.deleteFile(signature_params.qr_filename)
		filerepository.deleteFile(pdf_signed)
		filerepository.deleteFile(pdf_summary_added)

	} catch (error) {
		loggerRepository.error(error)
		console.error("Error:", error)
		return res.status(500).json({
			message: "Error al procesar el PDF",
			error: error
		})
	}
})

apiRouter.post("/addElectronicSignatoryWithSelfie", async (req: Request, res: Response) => {

	const {
		origin_filename,
		file_path,
		signature_params
	} = req.body

	try {

		if (signature_params.selfie) {
			const normalized_imagen_selfie = signature_params.imagen_selfie.startsWith("/") ? signature_params.imagen_selfie.slice(1) : signature_params.imagen_selfie

			signature_params.path_imagen_selfie = await s3Repository.getTempPathFromURI_JPG(`public/${normalized_imagen_selfie}`)
		}

		const normalizedFilePath = file_path.startsWith("/") ? file_path.slice(1) : file_path

		const normalizedFilename = origin_filename.startsWith("/") ? origin_filename.slice(1) : origin_filename

		const normalizesQRFilename = signature_params.qr_filename.startsWith("/") ? signature_params.qr_filename.slice(1) : signature_params.qr_filename

		const path_file = await s3Repository.getTempPathFromURI_PDF(`public/${normalizedFilename}`)

		if (!path_file) {
			return res.status(401).json({
				message: "Hubo un error al obtener el PDF"
			})
		}

		signature_params.path_signature = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.signature_filename}`)

		if (!signature_params.path_signature) {
			return res.status(401).json({
				message: "Hubo un error al obtener la firma"
			})
		}

		signature_params.qr_filename = await s3Repository.getTempPathFromURI_PNG(`public/${normalizesQRFilename}`)

		if (!signature_params.qr_filename) {
			return res.status(401).json({
				message: "Hubo un error al obtener el QR"
			})
		}

		const pdf_signed = await documentRepository.addInitialSignature(path_file, signature_params)

		if (!pdf_signed) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF no firmado"
			})
		}

		const pdf_summary_added = await documentRepository.addSummarySignatureWithSelfie(pdf_signed, signature_params)

		if (!pdf_summary_added) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF firmado"
			})
		}

		const result = await s3Repository.addFileToS3(pdf_summary_added, normalizedFilePath)

		if (result === undefined) {
			res.status(500).json({
				error: "Ocurrió un error al guardar el archivo en S3",
				message: "La función devolvió undefined, probablemente hubo un problema al guardar el archivo"
			})
		} else {
			const { fileKey, new_filename, file_path } = result

			res.json({
				completePath: fileKey,
				new_filename,
				file_path
			})
		}

		filerepository.deleteFile(path_file)
		filerepository.deleteFile(signature_params.path_signature)
		filerepository.deleteFile(signature_params.qr_filename)
		filerepository.deleteFile(pdf_signed)
		filerepository.deleteFile(pdf_summary_added)

		if (signature_params.selfie) {
			filerepository.deleteFile(signature_params.path_imagen_selfie)
		}

		// res.json({
		// 	message: "PDF firmado correctamente",
		// })

	} catch (error) {
		loggerRepository.error(error)
		console.error("Error:", error)
		return res.status(500).json({
			message: "Error al procesar el PDF",
			error: error
		})
	}
})

export { apiRouter }
