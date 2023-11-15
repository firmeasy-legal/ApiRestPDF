import { Request, Response, Router } from "express"

import fs from "node:fs"
import { s3Repository } from "@/shared/infrastructure/container"

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

		try {
			fs.accessSync(path_file, fs.constants.R_OK)
			console.log("Puede leer el archivo! 🎉")

			const data = fs.readFileSync(path_file, "base64")

			// Envia el contenido del archivo como respuesta
			res.status(200).json({
				message: "Contenido del archivo leído exitosamente",
				content: data,
			})
		} catch (err) {
			console.error("No tiene acceso al archivo:", err)
			return res.status(500).json({
				message: "Error al acceder al archivo",
				error: err
			})
		}

		// const newpdf = await pdfEditor.addInitialSignature(path_file, signature_params)

		// return res.json({
		// 	message: "PDF obtenido correctamente",
		// 	path_file,
		// 	newpdf
		// })

	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Error"
		})
	}
})

export { apiRouter }
