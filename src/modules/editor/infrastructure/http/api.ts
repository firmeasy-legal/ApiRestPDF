import { Request, Response, Router } from "express"
import { pdfEditor, s3Repository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/getPdf", async (req: Request, res: Response) => {

	const {
		origin_filename,
		signature_params
	} = req.body

	try {

		const buffer_file = await s3Repository.getTempPathFromURI_PDF(`public/${origin_filename}`)


		if (!buffer_file) {
			return res.status(401).json({
				message: "Hubo un error al obtener el PDF"
			})
		}

		const new_pdf = await pdfEditor.addInitialSignature(buffer_file, signature_params)

		return res.json({
			message: "PDF obtenido correctamente",
			signature_params,
			buffer_file,
			new_pdf
		})

	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Error"
		})
	}
})

export { apiRouter }
