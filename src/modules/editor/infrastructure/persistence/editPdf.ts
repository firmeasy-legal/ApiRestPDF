import { PDFPageModifier, PDFRStreamForFile, PDFWStreamForFile, createReader, createWriterToModify } from "muhammara"

import { EventEmitter } from "node:events"
import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
	eventEmitir: EventEmitter;
};

type SignatureParams = {
	signature_filename: string;
	qr_filename?: string;
	mm: number;
	eje_x: number;
	eje_y: number;
	page: number;
	company_name: string;
	file_token: string;
};

export class PDFEditor {
	private loggerRepository: LoggerRepository
	private eventEmitir: EventEmitter
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository, eventEmitir }: Params) {
		this.loggerRepository = loggerRepository
		this.eventEmitir =	eventEmitir
	}

	async addInitialSignature(
		path_file: string, 
		signature_params: SignatureParams, 
		path_signature: string
	) {

		try {
			
			const inStream = new PDFRStreamForFile(
				process.cwd() +"/"+ path_file
			)

			const outStream = new PDFWStreamForFile(
				// process.cwd() + "/tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"
				// process.cwd() + "/tmp/output_PDF/" + this.uuid + "_signed.pdf"
				process.cwd() + "/" + path_file
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

				const pageModifier = new PDFPageModifier(pdfWriter, pageIndex)
				if (signature_params.page === pageIndex + 1) {
					console.log("agregando firma")

					pageModifier
						.startContext()
						.getContext()
						.drawImage(signature_params.eje_x,
							signature_params.eje_y * signature_params.mm,
							path_signature,
							{ transformation:
								{
									width: 140,
									height: 140 / 2,
									proportional: true,
									fit: "always",
								}
							})
				}
				
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
				
			console.log("PDF firmado :" + this.eventEmitir)

			// return "tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"	
			// return "tmp/output_PDF/" + this.uuid + "_signed.pdf"
			// return process.cwd() + "/tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"
			return path_file

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}

	async addSummarySignature(
		path_file: string,
		signature_params: SignatureParams, 
		path_signature: string
	) {
		
		try {
			
			const inStream = new PDFRStreamForFile(
				process.cwd() + "/" + path_file
			)

			const outStream = new PDFWStreamForFile(
				// process.cwd() + "/tmp/output_PDF/" + signature_params.file_token + "_summary.pdf"
				// process.cwd() + "/tmp/output_PDF/" + this.uuid + "_summary.pdf"
				process.cwd() + "/" + path_file
			)

			const pdfWriter = createWriterToModify(inStream, outStream)

			const pdfReader = createReader(process.cwd() + "/" + path_file)

			// const token = signature_params.file_token

			//Quiero obtener el tamaño de la primera página
			const page = pdfReader.parsePage(0)
			const pageWidth = page.getMediaBox()[2]
			const pageHeight = page.getMediaBox()[3]
			console.log(pageWidth, pageHeight)

			//Quiero agregar una página al final del documento

			const nuevoPage = pdfWriter.createPage(0, 0, pageWidth, pageHeight)

			pdfWriter
				.startPageContentContext(nuevoPage)
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

			pdfWriter.writePage(nuevoPage)
			
			pdfWriter.end()
			
			outStream.close()
			inStream.close()
			

			// return "tmp/output_PDF/" + signature_params.file_token + "_summary.pdf"
			// return "tmp/output_PDF/" + this.uuid + "_summary.pdf"
			return path_file
			
		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	
	}
}
