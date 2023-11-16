import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository";
import { Recipe } from "muhammara";

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

	// async addInitialSignature(buffer_file: Buffer, signature_params: SignatureParams) {
	async addInitialSignature(buffer_file: string, signature_params: SignatureParams) {

		try {
			const pdfDoc = new Recipe(buffer_file, "tmp/output_PDF/signed.pdf")

			pdfDoc
				.editPage(signature_params.page)
				.text("Hello World!", 200, 200)
				.endPage()
				.endPDF

			// Guarda el nuevo Buffer en un archivo PDF
			// fs.writeFileSync("tmp/output_PDF/signed.pdf", newBuffer)

			return "tmp/output_PDF/signed.pdf"
			// const newBuffer = await new Promise<Buffer>((res) => {
			// 	const pdfDoc = new Recipe(buffer_file as unknown as string, undefined)

			// 	pdfDoc
			// 		.editPage(signature_params.page)
			// 		.text("Hello World!", 200, 200)
			// 		.endPage()	

			// 	pdfDoc.endPDF(buffer => res(buffer))
			// })

			// fs.writeFileSync("tmp/output_PDF/signed.pdf", newBuffer)
			
			// return newBuffer

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}
}
