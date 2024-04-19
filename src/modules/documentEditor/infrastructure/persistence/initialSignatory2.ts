import { PDFDocument, PDFImage, StandardFonts, rgb } from "pdf-lib"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
};

type SignatureParams = {
	eje_x: number;
	eje_y: number;
	page: number;
	file_token: string;
	signer_name: string;
	signer_email: string;
	signer_ID: string;
	signer_date: string;

	biometrico?: boolean;
	selfie?: boolean;

	path_imagen_firma: {
		success: true;
		path: string;
	};

	firma_imagen?: PDFImage;

	path_imagen_selfie?: {
		success: true;
		path: string;
	}

	selfie_imagen?: PDFImage;
};

export class InitialSignatory2 {
	private loggerRepository: LoggerRepository
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}
	
	async addInitialSignature2(
		path_file: string,
		signature_params: SignatureParams
	): Promise<string> {

		try {

			console.log("====================================================================================================")
			console.log("================================== Starding add initial signature 2 in PDF =========================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_inserted_signature.pdf"

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)

			const pages = pdfDoc.getPages()

			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

			if (signature_params.path_imagen_selfie) {
				const imagen_selfie_path = await fs.readFile(signature_params.path_imagen_selfie.path)

				signature_params.selfie_imagen = await pdfDoc.embedJpg(imagen_selfie_path)

				signature_params.selfie_imagen.scale(0.5)
			}

			console.log("Eje X: " + signature_params.eje_x)
			console.log("Eje Y: " + signature_params.eje_y)
			console.log("Page: " + signature_params.page)

			pages.forEach((page, index) => {
				const { width, height } = page.getSize()

				const xInPoints = signature_params.eje_x + 10
				const yInPoints = (height - signature_params.eje_y) - 45

				if (signature_params.page === index + 1) {
					console.log("Entre a la pagina: " + index)
					console.log("Width: " + width)
					console.log("Height: " + height)
					console.log("X: " + xInPoints)
					console.log("Y: " + yInPoints)

					page.drawRectangle({
						x: xInPoints,
						y: yInPoints,
						width: 160,
						height: 45,
						borderColor: rgb(0.055, 0.012, 0.361),
						borderWidth: 1,
					})

					page.drawText("Firma Electrónica", {
						x: xInPoints + 2,
						y: yInPoints + 36,
						size: 7,
						font: helvicaBoldFont,
						color: rgb(0.149, 0.149, 0.149),
					})

					page.drawText(signature_params.signer_name, {
						x: xInPoints + 2,
						y: yInPoints + 28,
						size: 6,
						font: helvicaFont,
						color: rgb(0.149, 0.149, 0.149),
					})

					page.drawText(signature_params.signer_email, {
						x: xInPoints + 2,
						y: yInPoints + 20,
						size: 6,
						font: helvicaFont,
						color: rgb(0.149, 0.149, 0.149),
					})

					page.drawText(signature_params.signer_ID, {
						x: xInPoints + 2,
						y: yInPoints + 12,
						size: 6,
						font: helvicaFont,
						color: rgb(0.149, 0.149, 0.149),
					})

					page.drawText(signature_params.signer_date, {
						x: xInPoints + 2,
						y: yInPoints + 4,
						size: 6,
						font: helvicaFont,
						color: rgb(0.149, 0.149, 0.149),
					})

					if (signature_params.selfie_imagen) {
						page.drawImage(signature_params.selfie_imagen, {
							x: xInPoints + 160 - 45 + 2.5,
							y: yInPoints + 2.5,
							width: 40,
							height: 40,
						})
					}
				}
			})

			const pdfBytes = await pdfDoc.save()

			await fs.writeFile(output, pdfBytes)

			return output

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error_addInitialSignature:", error)
			throw new Error("Error al agregar la firma inicial")
		}

	}
}


