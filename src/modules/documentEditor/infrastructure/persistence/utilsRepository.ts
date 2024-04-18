import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
};

type SignatureParams = {
	company_name: string;
	file_token: string;
};

export class UtilsRepository {
	private loggerRepository: LoggerRepository

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}

	async addfooter(
		path_file: string,
		signature_params: SignatureParams
	): Promise<string> {
		console.log("====================================================================================================")
		console.log("=================================== Starding add footer in PDF ======================================")
		console.log("====================================================================================================")

		try {
			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_footer_added.pdf"

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

			const pages = pdfDoc.getPages()

			const token = signature_params.file_token

			pages.forEach((page) => {
				page.drawText(signature_params.company_name, {
					x: 25,
					y: 15,
					size: 8,
					font: helvicaBoldFont,
					color: rgb(0.458, 0.455, 0.455),
				})
				page.drawText(token, {
					x: 25 + 42,
					y: 15,
					size: 7,
					font: helvicaFont,
					color: rgb(0.533, 0.522, 0.561),
				})
			})

			const pdfBytes = await pdfDoc.save()

			await fs.writeFile(output, pdfBytes)

			return output

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			throw new Error("Error al agregar el footer al PDF")
		}
	}
}


