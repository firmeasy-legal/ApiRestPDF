import { PDFDocument, PDFImage, StandardFonts, rgb } from "pdf-lib"

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import crypto from "node:crypto"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
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
	biometrico?: boolean;
	imagen_dni_anverso?: string;
	imagen_dni_reverso?: string;
	imagen_firmante?: string;
	path_dni_anverso?: string;
	path_dni_reverso?: string;
	path_imagen_firmante?: string;
};

export class PDFEditor {
	private loggerRepository: LoggerRepository
	private uuid = crypto.randomUUID()

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
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

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

			const pages = pdfDoc.getPages()

			const token = signature_params.file_token

			//Imagenes
			const signature_path = await fs.readFile(signature_params.path_signature)
			const signature = await pdfDoc.embedPng(signature_path)

			signature.scale(0.5)

			console.log("Eje X: " + signature_params.eje_x)
			console.log("Eje Y: " + signature_params.eje_y)
			console.log("MM: " + signature_params.mm)
			console.log("Page: " + signature_params.page)
			console.log("Path: " + signature_params.path_signature)

			pages.forEach((page, index) => {
				const { width, height } = page.getSize()

				// const pixelsToPointsRatio = 1.33

				const xInPoints = signature_params.eje_x
				const yInPoints = (height - signature_params.eje_y) - 45

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
						height: 45,
					})
				}

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
			return undefined
		}

	}

	async addInitialSignature2(
		path_file: string,
		signature_params: SignatureParams
	) {

		try {

			console.log("====================================================================================================")
			console.log("================================= Starding add initial signature 2 in PDF ==========================")
			console.log("====================================================================================================")

			const input = process.cwd() + "/" + path_file
			const output = "tmp/output_PDF/" + signature_params.file_token + "_signed.pdf"

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

			const pages = pdfDoc.getPages()

			const token = signature_params.file_token

			//Imagenes
			const signature_path = await fs.readFile(signature_params.path_signature)
			const signature = await pdfDoc.embedPng(signature_path)

			signature.scale(0.5)

			let dni_anverso: PDFImage | undefined = undefined
			let dni_reverso: PDFImage | undefined = undefined
			let imagen_firmante: PDFImage | undefined = undefined

			if (signature_params.biometrico) {

				if (signature_params.path_dni_anverso) {
					const dni_anverso_path = await fs.readFile(signature_params.path_dni_anverso)
					dni_anverso = await pdfDoc.embedJpg(dni_anverso_path)

					dni_anverso.scale(0.5)
				}

				if (signature_params.path_dni_reverso) {
					const dni_reverso_path = await fs.readFile(signature_params.path_dni_reverso)
					dni_reverso = await pdfDoc.embedJpg(dni_reverso_path)

					dni_reverso.scale(0.5)
				}

				if (signature_params.path_imagen_firmante) {
					const imagen_firmante_path = await fs.readFile(signature_params.path_imagen_firmante)
					imagen_firmante = await pdfDoc.embedJpg(imagen_firmante_path)

					imagen_firmante.scale(0.5)
				}

			}

			console.log("Eje X: " + signature_params.eje_x)
			console.log("Eje Y: " + signature_params.eje_y)
			console.log("MM: " + signature_params.mm)
			console.log("Page: " + signature_params.page)
			console.log("Path: " + signature_params.path_signature)

			pages.forEach((page, index) => {
				const { width, height } = page.getSize()

				// const pixelsToPointsRatio = 1.33

				const xInPoints = signature_params.eje_x
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

					if (imagen_firmante) {
						page.drawImage(imagen_firmante, {
							x: xInPoints + 160 - 45 + 2.5,
							y: yInPoints + 2.5,
							width: 40,
							height: 40,
						})
					}

					page.drawImage(signature, {
						x: xInPoints + 160 - 45 - 30,
						y: yInPoints,
						width: 30,
						height: 20,
					})

					console.log("====================================================================================================")
				}

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

			const token = signature_params.file_token

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)

			// const pages = pdfDoc.getPages()

			// const { width, height } = pages[pages.length-1].getSize()

			const [width, height] = [595.28, 841.89]

			const newPage = pdfDoc.addPage([width, height])

			const helvicaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
			const helvicaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

			//Imagenes
			const logo_path = await fs.readFile("assets/images/png/logoFirmEasy.png")
			const logo = await pdfDoc.embedPng(logo_path)

			logo.scale(0.5)

			const qr_code = await fs.readFile(signature_params.qr_filename)
			const qr = await pdfDoc.embedPng(qr_code)

			qr.scale(0.5)

			const viñeta_path = await fs.readFile("assets/images/png/viñeta.png")
			const viñeta = await pdfDoc.embedPng(viñeta_path)

			viñeta.scale(0.5)

			const signature_path = await fs.readFile(signature_params.path_signature)
			const signature = await pdfDoc.embedPng(signature_path)

			signature.scale(0.5)

			let dni_anverso = undefined
			let dni_reverso = undefined
			let imagen_firmante = undefined

			if (signature_params.biometrico) {

				if (signature_params.path_dni_anverso) {
					const dni_anverso_path = await fs.readFile(signature_params.path_dni_anverso)
					dni_anverso = await pdfDoc.embedJpg(dni_anverso_path)

					dni_anverso.scale(0.5)
				}

				if (signature_params.path_dni_reverso) {
					const dni_reverso_path = await fs.readFile(signature_params.path_dni_reverso)
					dni_reverso = await pdfDoc.embedJpg(dni_reverso_path)

					dni_reverso.scale(0.5)
				}

				if (signature_params.path_imagen_firmante) {
					const imagen_firmante_path = await fs.readFile(signature_params.path_imagen_firmante)
					imagen_firmante = await pdfDoc.embedJpg(imagen_firmante_path)

					imagen_firmante.scale(0.5)
				}
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

			newPage.drawImage(signature, {
				x: width - 25 - 180,
				y: newheight,
				width: 110,
				height: 110 / 2,
			})

			newheight = newheight - 15

			newPage.drawText("Firma Ológrafa", {
				x: width - 25 - 155,
				y: newheight,
				size: 8,
				font: helvicaBoldFont,
				color: rgb(0.149, 0.149, 0.149),
			})

			newheight = newheight - 45
			//====================================================================================================
			newPage.drawRectangle({
				x: 25,
				y: newheight,
				width: width - 25 - 25,
				height: 1,
				color: rgb(0.247, 0.247, 0.247),
			})
			//====================================================================================================

			if (signature_params.biometrico) {
				newheight = newheight - 25

				newPage.drawText("Fotos del Firmante", {
					x: 25,
					y: newheight,
					size: 12,
					font: helvicaBoldFont,
					color: rgb(0, 0, 0),
				})

				newheight = newheight - 170

				if (dni_anverso) {

					newPage.drawImage(dni_anverso, {
						x: 25 + 25 + 10,
						y: newheight,
						width: 150,
						height: 150,
					})
				}

				if (dni_reverso) {

					newPage.drawImage(dni_reverso, {
						x: 25 + 25 + 10 + 150 + 10,
						y: newheight,
						width: 150,
						height: 150,
					})
				}

				if (imagen_firmante) {

					newPage.drawImage(imagen_firmante, {
						x: 25 + 25 + 10 + 150 + 10 + 150 + 10,
						y: newheight,
						width: 150,
						height: 150,
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

			const existingPpfBytes = await fs.readFile(input)

			const pdfDoc = await PDFDocument.load(existingPpfBytes)
			const helvicaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

			const pages = pdfDoc.getPages()

			const qr_code_path = await fs.readFile(qr_path)

			const qrcode = await pdfDoc.embedPng(qr_code_path)

			const firstpage = pages[0]

			const { height } = firstpage.getSize()

			firstpage.drawText("Code: " + qr_code, {
				x: 1,
				y: height - 6,
				size: 6,
				font: helvicaFont,
				color: rgb(0, 0, 0),
			})

			firstpage.drawImage(qrcode, {
				x: 1,
				y: height - 5 - 48,
				width: 45,
				height: 45,
			})

			const pdfBytes = await pdfDoc.save()

			await fs.writeFile(output, pdfBytes)

			return output

		} catch (error) {
			this.loggerRepository.error(error)
			console.error("Error:", error)
			return undefined
		}
	}
}


