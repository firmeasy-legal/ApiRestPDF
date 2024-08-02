import { PDFDocument, PDFImage, StandardFonts, rgb } from "pdf-lib"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
};

type SignatureParams = {
	original_filename: string;
	path_qr: string;
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

	biometrico?: boolean;
	selfie?: boolean;
	doc_identidad?: boolean;
	video_firma?: boolean;
	video_firma_date?: string;
	video_firma_sha256?: string;
	video_firma_size?: string;

	path_imagen_firma?: {
		success: true;
		path: string;
	}

	firma_imagen?: PDFImage;

	path_imagen_selfie?: {
		success: true;
		path: string;
	}

	selfie_imagen?: PDFImage;

	path_imagen_front_document?: {
		success: true;
		path: string;
	}

	front_document_image?: PDFImage;

	path_imagen_behind_document?: {
		success: true;
		path: string;
	}

	behind_document_image?: PDFImage;
};

export class SummaryRepository {
	private loggerRepository: LoggerRepository
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
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
			const output = "tmp/output_PDF/" + signature_params.file_token + "_summary_added.pdf"

			const token = signature_params.file_token

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)

			const [width, height] = [595.28, 841.89]

			const newPage = pdfDoc.addPage([width, height])

			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

			//Imagenes
			const logo_path = await fs.readFile("assets/images/png/logoFirmEasy.png")
			const logo = await pdfDoc.embedPng(logo_path)

			logo.scale(0.5)

			const qr_code = await fs.readFile(signature_params.path_qr)
			const qr = await pdfDoc.embedPng(qr_code)

			qr.scale(0.5)

			const viñeta_path = await fs.readFile("assets/images/png/viñeta.png")
			const viñeta = await pdfDoc.embedPng(viñeta_path)

			viñeta.scale(0.5)

			if (signature_params.path_imagen_firma) {
				const firma_path = await fs.readFile(signature_params.path_imagen_firma.path)

				signature_params.firma_imagen = await pdfDoc.embedPng(firma_path)

				signature_params.firma_imagen.scale(0.5)
			}

			if (signature_params.path_imagen_selfie) {
				const imagen_selfie_path = await fs.readFile(signature_params.path_imagen_selfie.path)

				signature_params.selfie_imagen = await pdfDoc.embedJpg(imagen_selfie_path)

				signature_params.selfie_imagen.scale(0.5)
			}

			if (signature_params.path_imagen_front_document) {
				const imagen_front_document_path = await fs.readFile(signature_params.path_imagen_front_document.path)

				signature_params.front_document_image = await pdfDoc.embedJpg(imagen_front_document_path)

				signature_params.front_document_image.scale(0.5)
			}

			if (signature_params.path_imagen_behind_document) {
				const imagen_behind_document_path = await fs.readFile(signature_params.path_imagen_behind_document.path)

				signature_params.behind_document_image = await pdfDoc.embedJpg(imagen_behind_document_path)

				signature_params.behind_document_image.scale(0.5)
			}

			let newheight = height - 55

			newPage.drawImage(logo, {
				x: 25,
				y: newheight,
				width: 110,
				height: 110 / 3.7,
			})

			newheight = newheight + 6.5

			newPage.drawText("Huella de Auditoría", {
				x: 25 + 110 + 25,
				y: newheight,
				size: 13,
				font: helvicaBoldFont,
				color: rgb(0, 0, 0),
			})

			newheight = newheight + 8

			newPage.drawText(signature_params.time_zone, {
				x: width - 25 - 195,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0, 0, 0),
			})

			newheight = newheight - 9

			newPage.drawText(signature_params.lastUpdate, {
				x: width - 25 - 195,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0, 0, 0),
			})

			newheight = newheight - 20
			//====================================================================================================
			newPage.drawRectangle({
				x: 25,
				y: newheight,
				width: width - 25 - 25,
				height: 1,
				color: rgb(0.247, 0.247, 0.247),
			})
			//====================================================================================================

			newheight = newheight - 50

			newPage.drawText(signature_params.original_filename.slice(0, 65), {
				x: 25 + 10,
				y: newheight,
				size: 11,
				font: helvicaBoldFont,
				color: rgb(0, 0, 0),
			})

			newheight = newheight - 13

			newPage.drawText("ID del Documento ", {
				x: 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.314, 0.286, 0.247),
			})

			newPage.drawText(token, {
				x: 25 + 10 + 70,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.314, 0.286, 0.247),
			})

			newheight = newheight - 27

			newPage.drawImage(qr, {
				x: width - 25 - 85,
				y: newheight,
				width: 75,
				height: 75,
				opacity: 0.9,
			})

			newheight = newheight - 15
			//====================================================================================================
			newPage.drawRectangle({
				x: 25,
				y: newheight,
				width: width - 25 - 25,
				height: 1,
				color: rgb(0.247, 0.247, 0.247),
			})
			//====================================================================================================

			newheight = newheight - 25

			newPage.drawText("Identificación del Firmante", {
				x: 25,
				y: newheight,
				size: 12,
				font: helvicaBoldFont,
				color: rgb(0, 0, 0),
			})

			newheight = newheight - 50

			newPage.drawImage(viñeta, {
				x: 25,
				y: newheight,
				width: 25,
				height: 25,
			})

			newheight = newheight + 15

			newPage.drawText(signature_params.signer_name, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 10,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 10

			newPage.drawText("Firmante", {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.043, 0.624, 0.498),
			})

			newheight = newheight - 30

			newPage.drawText("Dispositivo: " + signature_params.signer_device, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 12

			newPage.drawText("IP: " + signature_params.signer_IP, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 12

			newPage.drawText("Fecha y Hora: " + signature_params.signer_date, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 12

			newPage.drawText("Correo: " + signature_params.signer_email, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 12

			newPage.drawText("Celular: " + signature_params.signer_phone, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 12

			newPage.drawText("Firmante ID: " + signature_params.signer_ID, {
				x: 25 + 25 + 10,
				y: newheight,
				size: 8,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			if (signature_params.firma_imagen) {
				newheight = newheight + 40

				newPage.drawRectangle({
					x: width - 25 - 195,
					y: newheight,
					width: 140,
					height: 70,
					// color: rgb(0.247, 0.247, 0.247),
					borderColor: rgb(0.055, 0.012, 0.361),
					borderWidth: 1,
				})


				newPage.drawImage(signature_params.firma_imagen, {
					x: width - 25 - 170,
					y: newheight + 10,
					width: 110,
					height: 110 / 2,
				})

				newheight = newheight - 15

				newPage.drawText("Firma Holográfica", {
					x: width - 25 - 160,
					y: newheight,
					size: 8,
					font: helvicaBoldFont,
					color: rgb(0.149, 0.149, 0.149),
				})

				newheight = newheight - 25
			}

			newheight = newheight - 20
			//====================================================================================================
			newPage.drawRectangle({
				x: 25,
				y: newheight,
				width: width - 25 - 25,
				height: 1,
				color: rgb(0.247, 0.247, 0.247),
			})
			//====================================================================================================

			if (signature_params.selfie_imagen || signature_params.front_document_image) {
				newheight = newheight - 25

				let title = "Documento de Identidad del Firmante"

				if (signature_params.selfie_imagen && signature_params.front_document_image) {
					title = "Documentos de Identidad y Selfie del Firmante"
				} else if (signature_params.selfie_imagen) {
					title = "Selfie del Firmante"
				} else if (signature_params.front_document_image) {
					title = "Documento de Identidad del Firmante"
				}

				newPage.drawText(title, {
					x: 25,
					y: newheight,
					size: 12,
					font: helvicaBoldFont,
					color: rgb(0, 0, 0),
				})

				newheight = newheight - 140

				let newwidth = 25 + 25 + 10

				if (signature_params.front_document_image) {

					newPage.drawImage(signature_params.front_document_image, {
						x: newwidth,
						y: newheight,
						width: 120,
						height: 120,
					})

					newwidth = newwidth + 150 + 10
				}

				if (signature_params.behind_document_image) {

					newPage.drawImage(signature_params.behind_document_image, {
						x: newwidth,
						y: newheight,
						width: 120,
						height: 120,
					})

					newwidth = newwidth + 150 + 10
				}

				if (signature_params.selfie_imagen) {

					newPage.drawImage(signature_params.selfie_imagen, {
						x: newwidth,
						y: newheight,
						width: 120,
						height: 120,
					})
				}

				newheight = newheight - 20
				//====================================================================================================
				newPage.drawRectangle({
					x: 25,
					y: newheight,
					width: width - 25 - 25,
					height: 1,
					color: rgb(0.247, 0.247, 0.247),
				})
				//====================================================================================================
			}

			//==============================================Video Firma===========================================
			
			if (signature_params.video_firma) {
				newheight = newheight - 25

				newPage.drawText("Resumen del Video del " + signature_params.signer_name, {
					x: 25,
					y: newheight,
					size: 12,
					font: helvicaBoldFont,
					color: rgb(0, 0, 0),
				})

				newheight = newheight - 140

				let newwidth = 25 + 25 + 10

				if (signature_params.selfie_imagen) {

					newPage.drawImage(signature_params.selfie_imagen, {
						x: newwidth,
						y: newheight,
						width: 120,
						height: 120,
					})
				}

				newwidth = newwidth + 130 + 40

				if (signature_params.selfie_imagen) {

					newPage.drawImage(signature_params.selfie_imagen, {
						x: newwidth,
						y: newheight,
						width: 120,
						height: 120,
					})
				}
				
				newheight = newheight - 20

				newPage.drawText("Fecha y Hora del Video: " + signature_params.video_firma_date, {
					x: 25 + 10,
					y: newheight,
					size: 8,
					font: helvicaBoldFont,
					color: rgb(0.149, 0.149, 0.149),
				})

				newheight = newheight - 15

				newPage.drawText("Tamaño del Video en Bytes: " + signature_params.video_firma_size, {
					x: 25 + 10,
					y: newheight,
					size: 8,
					font: helvicaBoldFont,
					color: rgb(0.149, 0.149, 0.149),
				})

				newheight = newheight - 15

				newPage.drawText("SHA256 del Video: " + signature_params.video_firma_sha256, {
					x: 25 + 10,
					y: newheight,
					size: 8,
					font: helvicaBoldFont,
					color: rgb(0.149, 0.149, 0.149),
				})

				newheight = newheight - 20
				//====================================================================================================
				newPage.drawRectangle({
					x: 25,
					y: newheight,
					width: width - 25 - 25,
					height: 1,
					color: rgb(0.247, 0.247, 0.247),
				})
				//====================================================================================================
			}

			newheight = newheight - 20

			newPage.drawText("Validación Documental: " + signature_params.qr_link, {
				x: 25,
				y: newheight,
				size: 9,
				font: helvicaFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			//Pie de Pagina

			newheight = 15

			newPage.drawText(signature_params.company_name, {
				x: 25,
				y: newheight,
				size: 8,
				font: helvicaBoldFont,
				color: rgb(0.458, 0.455, 0.455),
			})

			newPage.drawText(token, {
				x: 25 + 42,
				y: newheight,
				size: 7,
				font: helvicaFont,
				color: rgb(0.533, 0.522, 0.561),
			})

			const pdfBytes = await pdfDoc.save()

			await fs.writeFile(output, pdfBytes)

			return output

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error_addSummarySignature:", error)
			throw new Error("Error al agregar el resumen de la firma al PDF")
		}

	}
}


