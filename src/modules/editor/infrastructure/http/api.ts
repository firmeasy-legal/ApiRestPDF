import { Request, Response, Router } from "express"

import { s3Repository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.post("/test", async (req: Request, res: Response) => {

	try {
		const buckets = await s3Repository.getPDFFromURI(`${process.env.AWS_BUCKET}`, "public/ef29b7c3-1c76-484e-bea8-ae6b5a5a1e6c/1699166282-d0fTUwQaHd.pdf")

		console.log("====================================")
		console.log(buckets)
		console.log("====================================")

		if (!buckets) {
			return res.status(401).json({
				message: "Hubo un error al obtener los buckets"
			})

		} else {

			return res.json({
				buckets
			})
		}
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Error"
		})
	}

})

apiRouter.get("/getPdf", async (req: Request, res: Response) => {

	const { filename } = req.query

	try {

		const pdf = await s3Repository.getPDFFromURI(`public/${filename}`)

		if (!pdf) {
			return res.status(401).json({
				message: "Hubo un error al obtener el PDF"
			})

		} else {

			return res.json({
				message: "PDF obtenido correctamente"
			})
		}
	} catch (error) {
		console.error(error)
		return res.status(500).json({
			message: "Error"
		})
	}
})

export { apiRouter }
