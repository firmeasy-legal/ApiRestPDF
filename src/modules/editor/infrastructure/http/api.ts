import { Request, Response, Router } from "express"
import { pdfEditor, s3Repository } from "@/shared/infrastructure/container"

import { filerepository } from "@/shared/infrastructure/container"
import { loggerRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/getPdf", async (req: Request, res: Response) => {

	const {
		origin_filename,
		signature_params
	} = req.body

	try {

		const path_file = await s3Repository.getTempPathFromURI_PDF(`public/${origin_filename}`)

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

		if(signature_params.qr_filename && signature_params.qr_filename !== null) {
			const path_qr_image = await s3Repository.getTempPathFromURI_PNG(`public${signature_params.qr_filename}`)
			
			if (!path_qr_image) {
				return res.status(401).json({
					message: "Hubo un error al obtener el QR"
				})
			}
			
			signature_params.qr_filename = path_qr_image
		}

		const pdf_signed = await pdfEditor.addInitialSignature(path_file, signature_params)
		
		if (!pdf_signed) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF no firmado"
			})
		}

		const pdf_summary_added = await pdfEditor.addSummarySignature(pdf_signed, signature_params)

		res.json({
			message: "PDF obtenido correctamente",
			signature_params,
			path_file,
			pdf_signed,
			pdf_summary_added
		})

		filerepository.deleteFile(path_file)
		filerepository.deleteFile(signature_params.path_signature)
		// filerepository.deleteFile(signature_params.qr_filename)
		filerepository.deleteFile(pdf_signed)

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
