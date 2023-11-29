import { Request, Response, Router } from "express"
import { pdfEditor, s3Repository } from "@/shared/infrastructure/container"

import { filerepository } from "@/shared/infrastructure/container"
import { loggerRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/eSignature", async (req: Request, res: Response) => {

	const {
		origin_filename,
		file_path,
		signature_params
	} = req.body

	try {

		const normalizedFilePath = file_path.startsWith("/") ? file_path.slice(1) : file_path

		const normalizedFilename = origin_filename.startsWith("/") ? origin_filename.slice(1) : origin_filename

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

		signature_params.qr_filename = await s3Repository.getTempPathFromURI_PNG(`public${signature_params.qr_filename}`)

		if (!signature_params.qr_filename) {
			return res.status(401).json({
				message: "Hubo un error al obtener el QR"
			})
		}

		const pdf_signed = await pdfEditor.addInitialSignature(path_file, signature_params)

		if (!pdf_signed) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF no firmado"
			})
		}

		const pdf_summary_added = await pdfEditor.addSummarySignature(pdf_signed, signature_params)

		if (!pdf_summary_added) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF firmado"
			})
		}

		const new_path = await s3Repository.addFileToS3(pdf_summary_added, normalizedFilePath)

		// res.json({
		// 	message: "PDF obtenido correctamente",
		// 	signature_params,
		// 	path_file,
		// 	pdf_signed,
		// 	pdf_summary_added,
		// 	new_path,
		// 	file_token
		// })
		
		res.json({
			new_path
		})

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

export { apiRouter }
