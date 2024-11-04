import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Request, Response, Router } from 'express';
import { pdfEditor, s3Repository } from '@/shared/infrastructure/container';

import { filerepository } from '@/shared/infrastructure/container';
import { loggerRepository } from '@/shared/infrastructure/container';

const apiRouter = Router();

apiRouter.post('/eSignature', async (req: Request, res: Response) => {
  const { origin_filename, file_path, signature_params } = req.body;

  try {
    if (signature_params.biometrico) {
      const normalized_dni_anverso =
        signature_params.imagen_dni_anverso.startsWith('/')
          ? signature_params.imagen_dni_anverso.slice(1)
          : signature_params.imagen_dni_anverso;
      const normalized_dni_reverso =
        signature_params.imagen_dni_reverso.startsWith('/')
          ? signature_params.imagen_dni_reverso.slice(1)
          : signature_params.imagen_dni_reverso;
      const normalized_imagen_firmante =
        signature_params.imagen_firmante.startsWith('/')
          ? signature_params.imagen_firmante.slice(1)
          : signature_params.imagen_firmante;

      signature_params.path_dni_anverso =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_dni_anverso}`
        );
      signature_params.path_dni_reverso =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_dni_reverso}`
        );
      signature_params.path_imagen_firmante =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_imagen_firmante}`
        );
    }

    const normalizedFilePath = file_path.startsWith('/')
      ? file_path.slice(1)
      : file_path;

    const normalizedFilename = origin_filename.startsWith('/')
      ? origin_filename.slice(1)
      : origin_filename;

    const normalizesQRFilename = signature_params.qr_filename.startsWith('/')
      ? signature_params.qr_filename.slice(1)
      : signature_params.qr_filename;

    const path_file = await s3Repository.getTempPathFromURI_PDF(
      `public/${normalizedFilename}`
    );

    if (!path_file) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el PDF',
      });
    }

    signature_params.path_signature = await s3Repository.getTempPathFromURI_PNG(
      `public/${signature_params.signature_filename}`
    );

    if (!signature_params.path_signature) {
      return res.status(401).json({
        message: 'Hubo un error al obtener la firma',
      });
    }

    signature_params.qr_filename = await s3Repository.getTempPathFromURI_PNG(
      `public/${normalizesQRFilename}`
    );

    if (!signature_params.qr_filename) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el QR',
      });
    }

    const pdf_signed = await pdfEditor.addInitialSignature(
      path_file,
      signature_params
    );

    if (!pdf_signed) {
      return res.status(401).json({
        message: 'Hubo un error al procesar el PDF no firmado',
      });
    }

    // const pdf_summary_added = await pdfEditor.addSummarySignature(pdf_signed, signature_params)

    // if (!pdf_summary_added) {
    // 	return res.status(401).json({
    // 		message: "Hubo un error al procesar el PDF firmado"
    // 	})
    // }

    // const result = await s3Repository.addFileToS3(pdf_summary_added, normalizedFilePath)
    const result = await s3Repository.addFileToS3(
      pdf_signed,
      normalizedFilePath
    );

    if (result === undefined) {
      res.status(500).json({
        error: 'Ocurrió un error al guardar el archivo en S3',
        message:
          'La función devolvió undefined, probablemente hubo un problema al guardar el archivo',
      });
    } else {
      const { fileKey, new_filename, file_path } = result;

      res.json({
        completePath: fileKey,
        new_filename,
        file_path,
      });
    }

    filerepository.deleteFile(path_file);
    filerepository.deleteFile(signature_params.path_signature);
    filerepository.deleteFile(signature_params.qr_filename);
    filerepository.deleteFile(pdf_signed);
    // filerepository.deleteFile(pdf_summary_added)

    if (signature_params.biometrico) {
      filerepository.deleteFile(signature_params.path_dni_anverso);
      filerepository.deleteFile(signature_params.path_dni_reverso);
      filerepository.deleteFile(signature_params.path_imagen_firmante);
    }
  } catch (error) {
    loggerRepository.error(error);
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error al procesar el PDF',
      error: error,
    });
  }
});

apiRouter.post('/eSignature2', async (req: Request, res: Response) => {
  const { origin_filename, file_path, signature_params } = req.body;

  try {
    if (signature_params.biometrico) {
      const normalized_dni_anverso =
        signature_params.imagen_dni_anverso.startsWith('/')
          ? signature_params.imagen_dni_anverso.slice(1)
          : signature_params.imagen_dni_anverso;
      const normalized_dni_reverso =
        signature_params.imagen_dni_reverso.startsWith('/')
          ? signature_params.imagen_dni_reverso.slice(1)
          : signature_params.imagen_dni_reverso;
      const normalized_imagen_firmante =
        signature_params.imagen_firmante.startsWith('/')
          ? signature_params.imagen_firmante.slice(1)
          : signature_params.imagen_firmante;

      signature_params.path_dni_anverso =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_dni_anverso}`
        );
      signature_params.path_dni_reverso =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_dni_reverso}`
        );
      signature_params.path_imagen_firmante =
        await s3Repository.getTempPathFromURI_JPG(
          `public/${normalized_imagen_firmante}`
        );
    }

    const normalizedFilePath = file_path.startsWith('/')
      ? file_path.slice(1)
      : file_path;

    const normalizedFilename = origin_filename.startsWith('/')
      ? origin_filename.slice(1)
      : origin_filename;

    const normalizesQRFilename = signature_params.qr_filename.startsWith('/')
      ? signature_params.qr_filename.slice(1)
      : signature_params.qr_filename;

    const path_file = await s3Repository.getTempPathFromURI_PDF(
      `public/${normalizedFilename}`
    );

    if (!path_file) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el PDF',
      });
    }

    signature_params.path_signature = await s3Repository.getTempPathFromURI_PNG(
      `public/${signature_params.signature_filename}`
    );

    if (!signature_params.path_signature) {
      return res.status(401).json({
        message: 'Hubo un error al obtener la firma',
      });
    }

    signature_params.qr_filename = await s3Repository.getTempPathFromURI_PNG(
      `public/${normalizesQRFilename}`
    );

    if (!signature_params.qr_filename) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el QR',
      });
    }

    const pdf_signed = await pdfEditor.addInitialSignature2(
      path_file,
      signature_params
    );

    if (!pdf_signed) {
      return res.status(401).json({
        message: 'Hubo un error al procesar el PDF no firmado',
      });
    }

    const pdf_summary_added = await pdfEditor.addSummarySignature(
      pdf_signed,
      signature_params
    );

    if (!pdf_summary_added) {
      return res.status(401).json({
        message: 'Hubo un error al procesar el PDF firmado',
      });
    }

    const result = await s3Repository.addFileToS3(
      pdf_summary_added,
      normalizedFilePath
    );

    if (result === undefined) {
      res.status(500).json({
        error: 'Ocurrió un error al guardar el archivo en S3',
        message:
          'La función devolvió undefined, probablemente hubo un problema al guardar el archivo',
      });
    } else {
      const { fileKey, new_filename, file_path } = result;

      res.json({
        completePath: fileKey,
        new_filename,
        file_path,
      });
    }

    filerepository.deleteFile(path_file);
    filerepository.deleteFile(signature_params.path_signature);
    filerepository.deleteFile(signature_params.qr_filename);
    filerepository.deleteFile(pdf_signed);
    filerepository.deleteFile(pdf_summary_added);

    if (signature_params.biometrico) {
      filerepository.deleteFile(signature_params.path_dni_anverso);
      filerepository.deleteFile(signature_params.path_dni_reverso);
      filerepository.deleteFile(signature_params.path_imagen_firmante);
    }

    // res.json({
    // 	message: "PDF firmado correctamente",
    // })
  } catch (error) {
    loggerRepository.error(error);
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error al procesar el PDF',
      error: error,
    });
  }
});

apiRouter.post('/addDigitalQR', async (req: Request, res: Response) => {
  const { origin_filename, qr_filename, qr_code, file_path } = req.body;

  try {
    const normalizedFilename = origin_filename.startsWith('/')
      ? origin_filename.slice(1)
      : origin_filename;

    const normalizedQRFilename = qr_filename.startsWith('/')
      ? qr_filename.slice(1)
      : qr_filename;

    const normalizedFilePath = file_path.startsWith('/')
      ? file_path.slice(1)
      : file_path;

    const path_file = await s3Repository.getTempPathFromURI_PDF(
      `public/${normalizedFilename}`
    );

    if (!path_file) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el PDF',
      });
    }

    const qr_path = await s3Repository.getTempPathFromURI_PNG(
      `public/${normalizedQRFilename}`
    );

    if (!qr_path) {
      return res.status(401).json({
        message: 'Hubo un error al obtener el QR',
      });
    }

    const pdf_signed = await pdfEditor.addDigitalQRCode(
      path_file,
      qr_path,
      qr_code
    );

    if (!pdf_signed) {
      return res.status(401).json({
        message: 'Hubo un error al procesar el PDF no firmado',
      });
    }

    const result = await s3Repository.addFileToS3(
      pdf_signed,
      normalizedFilePath
    );

    if (result === undefined) {
      res.status(500).json({
        error: 'Ocurrió un error al guardar el archivo en S3',
        message:
          'La función devolvió undefined, probablemente hubo un problema al guardar el archivo',
      });
    } else {
      const { fileKey, new_filename, file_path } = result;

      res.json({
        completePath: fileKey,
        new_filename,
        file_path,
      });
    }

    filerepository.deleteFile(path_file);
    filerepository.deleteFile(qr_path);
    filerepository.deleteFile(pdf_signed);
  } catch (error) {
    loggerRepository.error(error);
    console.error('Error:', error);
    return res.status(500).json({
      message: 'Error al procesar el PDF',
      error: error,
    });
  }
});

apiRouter.post('/addExternalQR', async (req: Request, res: Response) => {
  const {
    document_base64, // El PDF en formato base64
    qr_image_base64, // La imagen QR en formato base64
    qr_code, // Código a insertar en el PDF
  } = req.body;

  try {
    // Decodificar el PDF y la imagen QR de base64 a buffer
    const pdfBuffer = Buffer.from(document_base64, 'base64');
    const qrBuffer = Buffer.from(qr_image_base64, 'base64');

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Cargar la imagen QR en pdf-lib
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Obtener la primera página del PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Tamaño de la página para colocar el código y el QR en la parte superior
    const { height } = firstPage.getSize();

    // Dibujar el código QR y el texto en la primera página
    firstPage.drawText('Code: ' + qr_code, {
      x: 1,
      y: height - 6,
      size: 6,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawImage(qrImage, {
      x: 1,
			y: height - 5 - 48,
			width: 45,
			height: 45,
    });

    // Guardar el PDF modificado en un buffer
    const modifiedPdfBytes = await pdfDoc.save();

    // Convertir el PDF modificado a base64
    const modifiedPdfBase64 = Buffer.from(modifiedPdfBytes).toString("base64");

    // Enviar el PDF modificado en base64 en la respuesta
    res.json({
      message: 'PDF procesado exitosamente',
      document_base64: modifiedPdfBase64,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error al procesar el PDF',
      error: (error as Error).message,
    });
  }
});

export { apiRouter };
