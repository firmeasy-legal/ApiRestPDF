import { PDFDocument, StandardFonts } from "pdf-lib"
import { Request, Response, Router } from "express"

import { Readable } from "stream"
import { convertToHtml } from "mammoth"
import crypto from "node:crypto"
import fs from "node:fs"
import { loggerRepository } from "@/shared/infrastructure/container"
import { validateWordToPdfInput } from "@/converter/domain/wordToPdf"

const apiRouter = Router()

apiRouter.post("/wordToPdf", async (req: Request, res: Response) => {
	const validationResult = validateWordToPdfInput(req.body)

	if (!validationResult.success) {
		return res.status(422).send({
			errors: validationResult.error.errors,
		})
	}

	const { file } = validationResult.data

	const filePath = `tmp/input_WORD/${crypto.randomUUID()}.docx`

	// const tempDir = path.join(__dirname, "tmp")
	// const tempFilePath = path.join(tempDir, "temp.docx")

	try {
		// Decodificar base64 a buffer
		const buffer = Buffer.from(file, "base64")

		// Crear un Readable Stream desde el buffer
		const readableStream = new Readable()
		readableStream.push(buffer)
		readableStream.push(null)

		// Guardar el archivo temporal usando un WriteStream
		const fileWriteStream = fs.createWriteStream(filePath)
		
		readableStream.pipe(fileWriteStream)

		await new Promise<string>((resolve, reject) => {
			fileWriteStream.on("finish", () => {
				console.log(`Word guardado en ${filePath}`)
				fileWriteStream.close()
				resolve(filePath)
			})

			fileWriteStream.on("error", (err) => {
				console.error("Error al escribir el archivo:", err)
				reject(err)
			})
		})

		// Convertir el archivo Word a HTML con Mammoth
		const { value: html } = await convertToHtml({ path: filePath })

		// Crear un nuevo documento PDF
		const pdfDoc = await PDFDocument.create()
		const page = pdfDoc.addPage()
		const { width, height } = page.getSize()

		// Insertar el contenido HTML en el PDF
		page.drawText(html, {
			x: 50,
			y: height - 50,
			maxWidth: width - 100,
			font: await pdfDoc.embedFont(StandardFonts.Helvetica)
		})

		// Guardar el PDF en memoria
		const pdfBytes = await pdfDoc.save()

		// Convertir a Base64
		const pdfBase64 = pdfBytes.toString()

		// Enviar la respuesta
		res.send({
			message: "Documento convertido exitosamente a PDF",
			pdf: pdfBase64,
		})

		console.log("Documento convertido exitosamente a PDF")
	} catch (error) {
		loggerRepository.error("Error en el proceso de conversión:", error)
		res.status(500).send({ message: "Error interno del servidor" })
	} finally {
		// Limpiar el archivo temporal
		try {
			// await fs.promises.unlink(tempFilePath)
		} catch (err) {
			loggerRepository.error("Error al eliminar archivo temporal:", err)
		}
	}
})

export { apiRouter }

