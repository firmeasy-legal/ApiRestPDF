import { PDFPageModifier, PDFRStreamForFile, PDFWStreamForFile, createReader, createWriterToModify } from "muhammara"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"

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

	async addInitialSignature(path_file: string, path_signature: string, signature_params: SignatureParams) {

		try {
			const inStream = new PDFRStreamForFile(
				process.cwd() +"/"+ path_file
			)
			const outStream = new PDFWStreamForFile(
				process.cwd() + "/tmp/output_PDF/" + "signed.pdf"
			)

			const pdfWriter = createWriterToModify(inStream, outStream)

			const pdfReader = createReader(process.cwd() + "/" + path_file)

			const pageCount = pdfReader.getPagesCount()

			const token = signature_params.file_token

			for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
				const page = pdfReader.parsePage(pageIndex)
				const pageWidth = page.getMediaBox()[2]
				const pageHeight = page.getMediaBox()[3]
				console.log(pageWidth, pageHeight)

				//quiero que agregar la firma en la primera pagina
				if (signature_params.page === pageIndex + 1) {
					const pageModifier = new PDFPageModifier(pdfWriter, pageIndex)

					pageModifier
						.startContext()
						.getContext()
						.drawImage(signature_params.eje_x,
							pageHeight - signature_params.eje_y,
							path_signature,
							{
								transformation: {
									width: 42,
									height: 15,
									fit: "always",
								},
							})

					pageModifier
						.endContext()
						.writePage()
				}
				

				const pageModifier = new PDFPageModifier(pdfWriter, pageIndex)

				pageModifier
					.startContext()
					.getContext()
					.writeText(signature_params.company_name,
						25,
						15,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-SemiBold.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x747474,
						})
					.writeText(token,
						25 + 42,
						15,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 7,
							colorspace: "gray",
							color: 0x7c7c7c,
						})

				pageModifier
					.endContext()
					.writePage()
			}

			pdfWriter.end()

			outStream.close()
			inStream.close()
				
			return "tmp/output_PDF/" + "signed.pdf"

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}
}
