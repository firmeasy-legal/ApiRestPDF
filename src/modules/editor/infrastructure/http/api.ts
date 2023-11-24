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

		const path_signature_image = await s3Repository.getTempPathFromURI_PNG(`public/${signature_params.signature_filename}`)

		if (!path_signature_image) {
			return res.status(401).json({
				message: "Hubo un error al obtener la firma"
			})
		}

		const new_pdf = await pdfEditor.addInitialSignature(path_file, path_signature_image, signature_params)

		res.json({
			message: "PDF obtenido correctamente",
			signature_params,
			path_file,
			path_signature_image,
			new_pdf
		})

		filerepository.deleteFile(path_file)
		// filerepository.deleteFile(path_signature_image)

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
