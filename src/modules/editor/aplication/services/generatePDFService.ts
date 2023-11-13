import { PDFEditor } from "@/editor/aplication/services/pdfEditor"
import { S3Repository } from "@/editor/infrastructure/repositories/s3Repository"

class GeneratePDFService {
	constructor(
    private s3Repository: S3Repository,
    private pdfEditor: PDFEditor
	) {}

	async generateAndEditPDFFromURI(uri: string): Promise<Buffer> {
		// Obtener el PDF desde S3
		const pdfData = await this.s3Repository.getPDFFromURI(uri)

		// Editar el PDF
		const editedPDF = this.pdfEditor.editPDF(pdfData)

		return editedPDF
	}
}

export { GeneratePDFService }
