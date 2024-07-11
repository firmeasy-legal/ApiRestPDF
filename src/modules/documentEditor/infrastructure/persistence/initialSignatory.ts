import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { PDFDocument } from "pdf-lib"
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
	
	path_imagen_firma: {
		success: true;
		path: string;
	};
};

export class InitialSignatory {
	private loggerRepository: LoggerRepository
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}

	async addInitialSignature(
		path_file: string,
		signature_params: SignatureParams
	): Promise<string> {

		try {

			console.log("====================================================================================================")
			console.log("================================= Starding add initial signature in PDF ========================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_inserted_signature.pdf"

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)

			const pages = pdfDoc.getPages()
			
			const signature_path = await fs.readFile(signature_params.path_imagen_firma.path)
			const signature = await pdfDoc.embedPng(signature_path)

			signature.scale(1)

			console.log("Eje X: " + signature_params.eje_x)
			console.log("Eje Y: " + signature_params.eje_y)
			console.log("Page: " + signature_params.page)
			console.log("Path: " + signature_params.path_imagen_firma.path)

			pages.forEach((page, index) => {
				const { width, height } = page.getSize()

				// const xInPoints = signature_params.eje_x + 10
				const xInPoints = signature_params.eje_x + 10
				// const yInPoints = (height - signature_params.eje_y) - 45
				const yInPoints = (height - signature_params.eje_y) - 80

				if (signature_params.page === index + 1) {
					console.log("Entre a la pagina: " + index)
					console.log("Width: " + width)
					console.log("Height: " + height)
					console.log("X: " + xInPoints)
					console.log("Y: " + yInPoints)

					page.drawImage(signature, {
						x: xInPoints,
						y: yInPoints,
						width: 160,
						height: 160 / 2.1,
						// width: 160,
						// height: 45,
					})
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


