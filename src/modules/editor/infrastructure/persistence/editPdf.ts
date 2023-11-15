import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { Recipe } from "muhammara"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"

type Params = {
	loggerRepository: LoggerRepository;
};

type SignatureParams = {
	signature_filename: string;
	mm: number;
	eje_x: number;
	eje_y: number;
	page: number;
	company_name: string;
	file_token: string;
};

export class PDFEditor {
	private loggerRepository: LoggerRepository
	
	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}

	async addInitialSignature(path_file: string, signature_params: SignatureParams) {

		try {

			const uuid = crypto.randomUUID()
			
			// const tempDir = fs.mkdtempSync(path.join(process.cwd(), "temp"))
			
			// const tempFilePath = path.join(tempDir, `output_${uuid}.pdf`)

			const tempFilePath = path.join(process.cwd(), "tmp/output_PDF", `output_${uuid}.pdf`)

			this.loggerRepository.info(`path_file: ${path.resolve(path_file)}`)
			this.loggerRepository.info(`path_file: ${path.resolve(tempFilePath)}`)

			const pdfDoc = new Recipe(path.resolve(path_file), tempFilePath)

			this.loggerRepository.info(`pdfDoc: ${pdfDoc}`)

			pdfDoc
				.editPage(signature_params.page)
				.text("Add some texts to an existing pdf file", 150, 300)
				.rectangle(20, 20, 40, 100)
				.comment("Add comment annotation", 200, 300)
				// .image("/path/to/image.jpg", 20, 100, { width: 300, keepAspectRatio: true })
				.endPage()
				.endPDF()
	
			return {
				path_file,
				signature_params,
				tempFilePath
			}
		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}
}
