import { PDFPageModifier, createReader, createWriterToModify } from "muhammara"

import { EventEmitter } from "node:events"
import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs"

type Params = {
	loggerRepository: LoggerRepository;
	eventEmitir: EventEmitter;
};

type SignatureParams = {
	signature_filename: string;
	path_signature: string;
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
		this.eventEmitir = eventEmitir
	}

	async addInitialSignature(
		path_file: string,
		signature_params: SignatureParams
	) {

		try {

			console.log("====================================================================================================")
			console.log("=================================== Starding add initial signature in PDF ==========================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"

			const inStream = fs.createReadStream(input)
			const outStream = fs.createWriteStream(process.cwd() + "/" + output)

			outStream.on("close", () => {

				const pdfWriter = createWriterToModify(process.cwd() + "/" + output)

				const pdfReader = createReader(input)

				const pageCount = pdfReader.getPagesCount()

				const token = signature_params.file_token

				for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {

					const pageModifier = new PDFPageModifier(pdfWriter, pageIndex)

					if (signature_params.page === pageIndex + 1) {

						pageModifier
							.startContext()
							.getContext()
							.drawImage(signature_params.eje_x,
								signature_params.eje_y * signature_params.mm,
								signature_params.path_signature,
								{
									transformation:
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

				// outStream.close()
				// inStream.close()
			})

			inStream.pipe(outStream)

			return await new Promise<string>((resolve, reject) => {
				outStream.on("finish", () => {
					console.log(`PDF guardado en ${output}`)
					outStream.close()
					inStream.close()
					resolve(output)
				})

				outStream.on("error", (err) => {
					console.error("Error al escribir el archivo:", err)
					reject(err)
				})
			})

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}

	async addSummarySignature(
		path_file: string,
		signature_params: SignatureParams,
	) {

		try {

			console.log("====================================================================================================")
			console.log("=================================== Starding add summary signature in PDF ==========================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_summary.pdf"

			const inStream = fs.createReadStream(input)
			const outStream = fs.createWriteStream(process.cwd() + "/" + output)

			const token = signature_params.file_token

			outStream.on("close", () => {

				const pdfWriter = createWriterToModify(process.cwd() + "/" + output)

				const pdfReader = createReader(input)

				//Quiero obtener el tamaño de la primera página
				const page = pdfReader.parsePage(0)
				const pageWidth = page.getMediaBox()[2]
				const pageHeight = page.getMediaBox()[3]
				console.log("pageWidth:", pageWidth)
				console.log("pageHeight:", pageHeight)

				//Quiero agregar una página al final del documento

				const nuevoPage = pdfWriter.createPage(0, 0, pageWidth, pageHeight)

				// Header
				pdfWriter
					.startPageContentContext(nuevoPage)
					.drawImage(
						25,
						pageHeight - (15 * 4),
						"assets/images/png/logoFirmEasy.png",
						{
							transformation:
							{
								width: 110,
								height: 110 / 2,
								proportional: true,
								fit: "always",
							}
						})
					.writeText("Resumen de Firma",
						25 + 110 + 12.5,
						pageHeight - (15 * 4) + 8,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Bold.ttf"
							),
							size: 13,
							colorspace: "gray",
							color: 0x000000,
						})
					.writeText("Fechas y Horas en UTC-05:00 (America/Lima)",
						pageWidth - 25 - 215,
						pageHeight - (15 * 4) + 15,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x000000,
						})
					.writeText("Ultima actualizacion en: November 3, 2023, 12:59",
						pageWidth - 25 - 215,
						pageHeight - (15 * 4) + 5,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x000000,
						})
					.drawRectangle(
						25,
						pageHeight - (15 * 4) - 15,
						pageWidth - 25 - 25,
						1,
						{
							colorspace: "gray",
							color: 0x000000,
						})

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

				pdfWriter.writePage(nuevoPage)
				console.log("pageCount:", (pageHeight - 15))
				pdfWriter.end()

				// outStream.close()
				// inStream.close()
			})

			inStream.pipe(outStream)

			return await new Promise<string>((resolve, reject) => {
				outStream.on("finish", () => {
					console.log(`PDF guardado en ${output}`)
					outStream.close()
					inStream.close()
					resolve(output)
				})

				outStream.on("error", (err) => {
					console.error("Error al escribir el archivo:", err)
					reject(err)
				})
			})

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}

	}
}
