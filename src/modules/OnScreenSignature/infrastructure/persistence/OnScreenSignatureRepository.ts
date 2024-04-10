import { PDFDocument } from "pdf-lib"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
};

type SignatureParams = {
	original_filename: string;
	signature_filename: string;
	path_signature: string;
	eje_x: number;
	eje_y: number;
	page: number;
	file_token: string;
};

export class OnScreenSignatureRepository {
	private loggerRepository: LoggerRepository
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}

	async addSignature(
		path_file: string,
		signature_params: SignatureParams
	) {

		try {
			console.log("====================================================================================================")
			console.log("=================================== Starding add signature in PDF ==================================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_addedsignature.pdf"

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)

			const pages = pdfDoc.getPages()

			//Imagenes
			const signature_path = await fs.readFile(signature_params.path_signature)
			const signature = await pdfDoc.embedPng(signature_path)

			signature.scale(0.5)

			console.log("====================================================================================================")
			console.log("Eje X: " + signature_params.eje_x)
			console.log("Eje Y: " + signature_params.eje_y)
			console.log("Page: " + signature_params.page)
			console.log("Path: " + signature_params.path_signature)
			console.log("====================================================================================================")

			pages.forEach((page, index) => {
				const { width, height } = page.getSize()

				const xInPoints = signature_params.eje_x
				const yInPoints = (height - signature_params.eje_y) - 45

				if (signature_params.page === index + 1) {
					page.drawImage(signature, {
						x: xInPoints,
						y: yInPoints,
						width: 160,
						height: 45,
					})

					console.log("====================================================================================================")
					console.log("Enter to page: " + index)
					console.log("Width: " + width)
					console.log("Height: " + height)
					console.log("X: " + xInPoints)
					console.log("Y: " + yInPoints)
					console.log("Imagen de la firma agregada")
					console.log("====================================================================================================")
				}
			})

			const pdfBytes = await pdfDoc.save()

			await fs.writeFile(output, pdfBytes)

			return output

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}

	// async addInitialSignature2(
	// 	path_file: string,
	// 	signature_params: SignatureParams
	// ) {

	// 	try {

	// 		console.log("====================================================================================================")
	// 		console.log("================================= Starding add initial signature 2 in PDF ==========================")
	// 		console.log("====================================================================================================")

	// 		const input = process.cwd() + "/" + path_file
	// 		const output = "tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"

	// 		const existingPpfBytes = await fs.readFile(input)

	// 		const pdfDoc = await PDFDocument.load(existingPpfBytes)
	// 		const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
	// 		const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

	// 		const pages = pdfDoc.getPages()

	// 		const token = signature_params.file_token

	// 		//Imagenes
	// 		const signature_path = await fs.readFile(signature_params.path_signature)
	// 		const signature = await pdfDoc.embedPng(signature_path)

	// 		signature.scale(0.5)

	// 		let dni_anverso: PDFImage | undefined = undefined
	// 		let dni_reverso: PDFImage | undefined = undefined
	// 		let imagen_firmante: PDFImage | undefined = undefined

	// 		if (signature_params.biometrico) {

	// 			if (signature_params.path_dni_anverso) {
	// 				const dni_anverso_path = await fs.readFile(signature_params.path_dni_anverso)
	// 				dni_anverso = await pdfDoc.embedJpg(dni_anverso_path)

	// 				dni_anverso.scale(0.5)
	// 			}

	// 			if (signature_params.path_dni_reverso) {
	// 				const dni_reverso_path = await fs.readFile(signature_params.path_dni_reverso)
	// 				dni_reverso = await pdfDoc.embedJpg(dni_reverso_path)

	// 				dni_reverso.scale(0.5)
	// 			}

	// 			if (signature_params.path_imagen_firmante) {
	// 				const imagen_firmante_path = await fs.readFile(signature_params.path_imagen_firmante)
	// 				imagen_firmante = await pdfDoc.embedJpg(imagen_firmante_path)

	// 				imagen_firmante.scale(0.5)
	// 			}

	// 		}

	// 		console.log("Eje X: " + signature_params.eje_x)
	// 		console.log("Eje Y: " + signature_params.eje_y)
	// 		console.log("MM: " + signature_params.mm)
	// 		console.log("Page: " + signature_params.page)
	// 		console.log("Path: " + signature_params.path_signature)

	// 		pages.forEach((page, index) => {
	// 			const { width, height } = page.getSize()

	// 			// const pixelsToPointsRatio = 1.33

	// 			const xInPoints = signature_params.eje_x
	// 			const yInPoints = (height - signature_params.eje_y) - 45

	// 			if (signature_params.page === index + 1) {
	// 				console.log("Entre a la pagina: " + index)
	// 				console.log("Width: " + width)
	// 				console.log("Height: " + height)
	// 				console.log("X: " + xInPoints)
	// 				console.log("Y: " + yInPoints)

	// 				page.drawRectangle({
	// 					x: xInPoints,
	// 					y: yInPoints,
	// 					width: 160,
	// 					height: 45,
	// 					borderColor: rgb(0.055, 0.012, 0.361),
	// 					borderWidth: 1,
	// 				})

	// 				page.drawText("Firma Electrónica", {
	// 					x: xInPoints + 2,
	// 					y: yInPoints + 36,
	// 					size: 7,
	// 					font: helvicaBoldFont,
	// 					color: rgb(0.149, 0.149, 0.149),
	// 				})

	// 				page.drawText(signature_params.signer_name, {
	// 					x: xInPoints + 2,
	// 					y: yInPoints + 28,
	// 					size: 6,
	// 					font: helvicaFont,
	// 					color: rgb(0.149, 0.149, 0.149),
	// 				})

	// 				page.drawText(signature_params.signer_email, {
	// 					x: xInPoints + 2,
	// 					y: yInPoints + 20,
	// 					size: 6,
	// 					font: helvicaFont,
	// 					color: rgb(0.149, 0.149, 0.149),
	// 				})

	// 				page.drawText(signature_params.signer_ID, {
	// 					x: xInPoints + 2,
	// 					y: yInPoints + 12,
	// 					size: 6,
	// 					font: helvicaFont,
	// 					color: rgb(0.149, 0.149, 0.149),
	// 				})

	// 				page.drawText(signature_params.signer_date, {
	// 					x: xInPoints + 2,
	// 					y: yInPoints + 4,
	// 					size: 6,
	// 					font: helvicaFont,
	// 					color: rgb(0.149, 0.149, 0.149),
	// 				})

	// 				if (imagen_firmante) {
	// 					page.drawImage(imagen_firmante, {
	// 						x: xInPoints + 160 - 45 + 2.5,
	// 						y: yInPoints + 2.5,
	// 						width: 40,
	// 						height: 40,
	// 					})
	// 				}

	// 				page.drawImage(signature, {
	// 					x: xInPoints + 160 - 45 - 30,
	// 					y: yInPoints,
	// 					width: 30,
	// 					height: 20,
	// 				})

	// 				console.log("====================================================================================================")
	// 			}

	// 			page.drawText(signature_params.company_name, {
	// 				x: 25,
	// 				y: 15,
	// 				size: 8,
	// 				font: helvicaBoldFont,
	// 				color: rgb(0.458, 0.455, 0.455),
	// 			})

	// 			page.drawText(token, {
	// 				x: 25 + 42,
	// 				y: 15,
	// 				size: 7,
	// 				font: helvicaFont,
	// 				color: rgb(0.533, 0.522, 0.561),
	// 			})
	// 		})

	// 		const pdfBytes = await pdfDoc.save()

	// 		await fs.writeFile(output, pdfBytes)

	// 		return output

	// 	} catch (error) {
	// 		this.loggerRepository.error(error)
	// 		console.error("Error:", error)
	// 		return undefined
	// 	}

	// }

}


