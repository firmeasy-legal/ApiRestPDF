import { Request, Response, Router } from "express"
import { on_screen_signature_repository, s3Repository } from "@/shared/infrastructure/container"

import { filerepository } from "@/shared/infrastructure/container"
import { loggerRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/AddHolographicSignature", async (req: Request, res: Response) => {

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
				message: "Hubo un error al obtener la imagen de la firma"
			})
		}

		const pdf_addedsignature = await on_screen_signature_repository.addSignature(path_file, signature_params)

		if (!pdf_addedsignature) {
			return res.status(401).json({
				message: "Hubo un error al procesar el PDF no firmado"
			})
		}

		const result = await s3Repository.addFileToS3(pdf_addedsignature, normalizedFilePath)

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
		filerepository.deleteFile(pdf_addedsignature)

	} catch (error) {
		loggerRepository.error(error)
		return res.status(500).json({
			message: "Error al procesar el PDF",
			error: error
		})
	}
})

export { apiRouter }
