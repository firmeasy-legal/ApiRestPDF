import { PDFPageModifier, createReader, createWriter, createWriterToModify, eRangeTypeSpecific } from "muhammara"

import { EventEmitter } from "node:events"
import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs"

type Params = {
	loggerRepository: LoggerRepository;
	eventEmitir: EventEmitter;
};

type SignatureParams = {
	original_filename: string;
	signature_filename: string;
	path_signature: string;
	qr_filename: string;
	mm: number;
	eje_x: number;
	eje_y: number;
	page: number;
	company_name: string;
	file_token: string;
	time_zone: string;
	lastUpdate: string;
	signer_name: string;
	signer_email: string;
	signer_ID: string;
	signer_phone: string;
	signer_device: string;
	signer_IP: string;
	signer_date: string;
	qr_link: string;
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

			const pdfWriter = createWriter(output)

			const pdfReader = createReader(input)

			const pageCount = pdfReader.getPagesCount()

			const token = signature_params.file_token

			for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {

				const page = pdfReader.parsePage(pageIndex)
				const pageWidth = page.getMediaBox()[2]
				const pageHeight = page.getMediaBox()[3]

				const newPage = pdfWriter.createPage(0, 0, pageWidth, pageHeight)

				const contentContext = pdfWriter
					.startPageContentContext(newPage)
					.q()

				pdfWriter.mergePDFPagesToPage(
					newPage,
					input,
					{ type: eRangeTypeSpecific, specificRanges: [[pageIndex, pageIndex]] }
				)

				if (signature_params.page === pageIndex + 1) {
					contentContext
						.Q()
						.q()
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
						.Q()
				}

				contentContext
					.Q()
					.q()
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
					.Q()

				pdfWriter
					.writePage(newPage)
			}

			pdfWriter
				.end()

			return output

			// const inStream = fs.createReadStream(input)
			// const outStream = fs.createWriteStream(process.cwd() + "/" + output)

			// outStream.on("finish", () => {

			// 	const pdfWriter = createWriterToModify(process.cwd() + "/" + output)

			// 	const pdfReader = createReader(input)

			// 	const pageCount = pdfReader.getPagesCount()

			// 	const token = signature_params.file_token

			// 	for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {

			// 		const pageModifier = new PDFPageModifier(pdfWriter, pageIndex)

			// 		if (signature_params.page === pageIndex + 1) {

			// 			pageModifier
			// 				.startContext()
			// 				.getContext()
			// 				.drawImage(signature_params.eje_x,
			// 					signature_params.eje_y * signature_params.mm,
			// 					signature_params.path_signature,
			// 					{
			// 						transformation:
			// 						{
			// 							width: 140,
			// 							height: 140 / 2,
			// 							proportional: true,
			// 							fit: "always",
			// 						}
			// 					})
			// 		}

			// 		pageModifier
			// 			.startContext()
			// 			.getContext()
			// 			.writeText(signature_params.company_name,
			// 				25,
			// 				15,
			// 				{
			// 					font: pdfWriter.getFontForFile(
			// 						process.cwd() + "/assets/fonts/NotoSans-SemiBold.ttf"
			// 					),
			// 					size: 8,
			// 					colorspace: "gray",
			// 					color: 0x747474,
			// 				})
			// 			.writeText(token,
			// 				25 + 42,
			// 				15,
			// 				{
			// 					font: pdfWriter.getFontForFile(
			// 						process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
			// 					),
			// 					size: 7,
			// 					colorspace: "gray",
			// 					color: 0x7c7c7c,
			// 				})

			// 		pageModifier
			// 			.endContext()
			// 			.writePage()
			// 	}

			// 	pdfWriter.end()

			// 	// outStream.close()
			// 	// inStream.close()
			// })

			// inStream.pipe(outStream)

			// return await new Promise<string>((resolve, reject) => {
			// 	outStream.on("close", () => {
			// 		console.log(`PDF guardado en ${output}`)
			// 		// outStream.close()
			// 		// inStream.close()
			// 		resolve(output)
			// 	})

			// 	outStream.on("error", (err) => {
			// 		console.error("Error al escribir el archivo:", err)
			// 		reject(err)
			// 	})
			// })

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

			outStream.on("finish", () => {

				const pdfWriter = createWriterToModify(process.cwd() + "/" + output)

				// const pdfReader = createReader(input)

				//Quiero obtener el tamaño de la primera página
				// const page = pdfReader.parsePage(0)
				// const pageWidth = page.getMediaBox()[2]
				// const pageHeight = page.getMediaBox()[3]

				const pageWidth = 595
				const pageHeight = 842
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
					.writeText("Huella de Auditoría",
						25 + 110 + 25,
						pageHeight - (15 * 4) + 8,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-SemiBold.ttf"
							),
							size: 13,
							colorspace: "gray",
							color: 0x000000,
						})
					.writeText(signature_params.time_zone,
						pageWidth - 25 - 195,
						pageHeight - (15 * 4) + 15,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x000000,
						})
					.writeText(signature_params.lastUpdate,
						pageWidth - 25 - 195,
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
							color: 0x31293F,
							type: "fill",

						})

				// File & QRCode

				pdfWriter
					.startPageContentContext(nuevoPage)
					.writeText(signature_params.original_filename.slice(0, 65),
						25 + 10,
						pageHeight - (15 * 4) - 65,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Bold.ttf"
							),
							size: 11,
							colorspace: "gray",
							color: 0x000000,
						})
					.writeText("ID del Documento ",
						25 + 10,
						pageHeight - (15 * 4) - 80,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x505050,
						})
					.writeText(token,
						25 + 10 + 70,
						pageHeight - (15 * 4) - 80,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x505050,
						})
					.drawImage(
						pageWidth - 25 - 85,
						pageHeight - (15 * 4) - 30 - 75,
						signature_params.qr_filename,
						{
							transformation:
							{
								width: 75,
								height: 75,
								proportional: true,
								fit: "always",
							}
						})
					.drawRectangle(
						25,
						pageHeight - (15 * 4) - 120,
						pageWidth - 25 - 25,
						1,
						{
							colorspace: "gray",
							color: 0x31293F,
							type: "fill",

						})

				/* Detalle del firmante */
				pdfWriter
					.startPageContentContext(nuevoPage)
					.writeText("Identificación del Firmante",
						25,
						pageHeight - (15 * 4) - 145,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Bold.ttf"
							),
							size: 12,
							colorspace: "gray",
							color: 0x000000,
						})
					.drawImage(
						25,
						pageHeight - (15 * 4) - 190,
						"assets/images/png/viñeta.png",
						{
							transformation:
							{
								width: 25,
								height: 25,
								proportional: true,
								fit: "always",
							}
						})
					.writeText(signature_params.signer_name,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 175,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Medium.ttf"
							),
							size: 10,
							colorspace: "gray",
							color: 0x262626,
						})
					.writeText("Firmante",
						25 + 25 + 10,
						pageHeight - (15 * 4) - 185,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							// colorspace: "gray",
							color: 0x0b9f7f,
						})
					.writeText("Dispositivo: " + signature_params.signer_device,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 220,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							// colorspace: "gray",
							color: 0x262626,
						})
					.writeText("IP: " + signature_params.signer_IP,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 232,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x262626,
						})
					.writeText("Fecha y Hora: " + signature_params.signer_date,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 244,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x262626,
						})
					.writeText("Correo: " + signature_params.signer_email,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 256,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x262626,
						})
					.writeText("Celular: " + signature_params.signer_phone,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 268,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x262626,
						})
					.writeText("Firmante ID: " + signature_params.signer_ID,
						25 + 25 + 10,
						pageHeight - (15 * 4) - 280,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Regular.ttf"
							),
							size: 8,
							colorspace: "gray",
							color: 0x262626,
						})
					.drawRectangle(
						pageWidth - 25 - 195,
						pageHeight - (15 * 4) - 235,
						140,
						70,
						{
							color: 0x0e035c,
						})
					.drawImage(
						pageWidth - 25 - 195,
						pageHeight - (15 * 4) - 235 + 10,
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
					.writeText("Firma Ológrafa",
						pageWidth - 25 - 155,
						pageHeight - (15 * 4) - 248,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Medium.ttf"
							),
							size: 8,
							// colorspace: "gray",
							color: 0x031215,
						})
					.drawRectangle(
						25,
						pageHeight - (15 * 4) - 300,
						pageWidth - 25 - 25,
						1,
						{
							colorspace: "gray",
							color: 0x31293F,
							type: "fill",

						})

				const height = pageHeight - (15 * 4) - 320

				/*Add Link QR*/
				pdfWriter
					.startPageContentContext(nuevoPage)
					.writeText("Validación Documental: " + signature_params.qr_link,
						25,
						height,
						{
							font: pdfWriter.getFontForFile(
								process.cwd() + "/assets/fonts/NotoSans-Medium.ttf"
							),
							size: 8,
							// colorspace: "gray",
							color: 0x333333,
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
				outStream.on("close", () => {
					console.log(`PDF guardado en ${output}`)
					// outStream.finish()
					// inStream.close()
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

	async addDigitalQRCode(
		path_file: string,
		qr_path: string,
		qr_code: string
	): Promise<string | undefined> {

		try {

			console.log("====================================================================================================")
			console.log("=================================== Starding add digital QRCode in PDF =============================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + this.uuid + "_qr.pdf"

			const pdfWriter = createWriter(output)

			const pdfReader = createReader(input)

			// const pageCount = pdfReader.getPagesCount()

			const page = pdfReader.parsePage(0)
			const pageWidth = page.getMediaBox()[2]
			const pageHeight = page.getMediaBox()[3]

			const newPage = pdfWriter.createPage(0, 0, pageWidth, pageHeight)

			const contentContext = pdfWriter
				.startPageContentContext(newPage)
				.q()

			pdfWriter.mergePDFPagesToPage(
				newPage,
				input,
				{ type: eRangeTypeSpecific, specificRanges: [[pageIndex, pageIndex]] }
			)

			contentContext
				.Q()
				.q()
				.drawImage(
					1,
					pageHeight - 5 - 48,
					qr_path,
					{
						transformation:
						{
							width: 45,
							height: 45,
							proportional: true,
							fit: "always",
						}
					})
				.writeText("Code: " + qr_code,
					1,
					pageHeight - 5,
					{
						font: pdfWriter.getFontForFile(
							process.cwd() + "/assets/fonts/NotoSans-Bold.ttf"
						),
						size: 6,
						colorspace: "gray",
						color: 0x000000,
					})
				.Q()

			pdfWriter
				.writePage(newPage)

			return output

			// const inStream = fs.createReadStream(input)
			// const outStream = fs.createWriteStream(process.cwd() + "/" + output)

			// outStream.on("finish", () => {

			// 	const pdfWriter = createWriterToModify(process.cwd() + "/" + output)

			// 	const pdfReader = createReader(input)

			// 	const page = pdfReader.parsePage(0)
			// 	// const pageWidth = page.getMediaBox()[2]
			// 	const pageHeight = page.getMediaBox()[3]

			// 	const pageModifier = new PDFPageModifier(pdfWriter, 0)

			// 	pageModifier
			// 		.startContext()
			// 		.getContext()
			// 		.writeText("Code: " + qr_code,
			// 			1,
			// 			pageHeight - 5,
			// 			{
			// 				font: pdfWriter.getFontForFile(
			// 					process.cwd() + "/assets/fonts/NotoSans-Bold.ttf"
			// 				),
			// 				size: 6,
			// 				colorspace: "gray",
			// 				color: 0x000000,
			// 			})
			// 		.drawImage(
			// 			1,
			// 			pageHeight - 5 - 48,
			// 			qr_path,
			// 			{
			// 				transformation:
			// 				{
			// 					width: 45,
			// 					height: 45,
			// 					proportional: true,
			// 					fit: "always",
			// 				}
			// 			})

			// 	pageModifier
			// 		.endContext()
			// 		.writePage()

			// 	pdfWriter.end()
			// })

			// inStream.pipe(outStream)

			// return await new Promise<string>((resolve, reject) => {
			// 	outStream.on("close", () => {
			// 		console.log(`PDF guardado en ${output}`)
			// 		// outStream.close()
			// 		// inStream.close()
			// 		resolve(output)
			// 	})

			// 	outStream.on("error", (err) => {
			// 		console.error("Error al escribir el archivo:", err)
			// 		reject(err)
			// 	})
			// })

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	}
}


