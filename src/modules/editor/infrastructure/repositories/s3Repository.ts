// // import { GetObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3"

// class S3Repository {
// 	private s3Client: AWS.S3Client

// 	// constructor(config: S3ClientConfig) {
// 	// 	this.s3Client = new S3Client(config)
// 	// }

// 	// async getPDFFromURI(uri: string): Promise<Buffer> {
// 	// 	const command = new GetObjectCommand({
// 	// 		Bucket: "nombre-del-bucket",
// 	// 		Key: uri, // Asumiendo que la URI es la clave para buscar en el bucket
// 	// 	})

// 	// 	try {
// 	// 		const data = await this.s3Client.send(command);
// 	// 		return data.Body
// 	// 	} catch (error) {
// 	// 		console.error("Error al obtener el PDF desde S3:", error);
// 	// 		throw error
// 	// 	}
// 	// }
// }

// export { S3Repository }

// import {
//   CreateQueueCommand,
//   GetQueueUrlCommand,
//   QueueDoesNotExist,
//   SQSClient,
//   SendMessageCommand,
// } from "@aws-sdk/client-sqs";
// import { Queue, SavedQueue } from "../domain/Queue";

import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository";
// import { GetQueueException } from "../domain/exceptions/GetQueueException";
// import { MessageBroker } from "../domain/MessageBroker";
// import { SaveQueueException } from "../domain/exceptions/SaveQueueException";
// import { SendMessageException } from "../domain/exceptions/SendMessageException";
// import crypto from "node:crypto";
import {
	S3Client,
} from "@aws-sdk/client-s3"

type Params = {
  s3Client: S3Client;
  loggerRepository: LoggerRepository;
	bucketName: string
};

export class S3Repository{
	private s3Client: S3Client
	private loggerRepository: LoggerRepository
	private bucketName: string

	constructor({ s3Client, loggerRepository, bucketName }: Params) {
		this.s3Client = s3Client
		this.loggerRepository = loggerRepository
		this.bucketName = bucketName
	}

  // async createQueue(queue: Queue): Promise<SavedQueue> {
  //   const createQueueCommand = new CreateQueueCommand({
  //     QueueName: `${queue.name}.fifo`,
  //     Attributes: {
  //       FifoQueue: "true",
  //       MessageRetentionPeriod: "600",
  //       ReceiveMessageWaitTimeSeconds: "2",
  //     },
  //   });

  //   try {
  //     const response = await this.sqsClient.send(createQueueCommand);

  //     if (!response.QueueUrl) {
  //       throw new Error("No se obtuvo la url de la cola");
  //     }

  //     return {
  //       name: queue.name,
  //       url: response.QueueUrl,
  //     };
  //   } catch (error) {
  //     const throwableError = new SaveQueueException({
  //       queue,
  //       stackedError: error,
  //     });
  //     this.loggerRepository.emergency(throwableError);
  //     throw throwableError;
  //   }
  // }

  // async getQueueByName({
  //   name,
  // }: Pick<Queue, "name">): Promise<SavedQueue | undefined> {
  //   const getQueueUrlCommand = new GetQueueUrlCommand({
  //     QueueName: `${name}.fifo`,
  //   });

  //   try {
  //     const response = await this.sqsClient.send(getQueueUrlCommand);

  //     if (!response.QueueUrl) return;

  //     return {
  //       name,
  //       url: response.QueueUrl,
  //     };
  //   } catch (error) {
  //     if (error instanceof QueueDoesNotExist) {
  //       return;
  //     }

  //     const throwableError = new GetQueueException({
  //       queue: { name },
  //       stackedError: error,
  //     });
  //     this.loggerRepository.emergency(throwableError);
  //     throw throwableError;
  //   }
  // }

  // async sendMessage(queue: SavedQueue, message: string): Promise<void> {
  //   const sendMessageCommand = new SendMessageCommand({
  //     MessageBody: message,
  //     QueueUrl: queue.url,
  //     MessageGroupId: "default",
  //     MessageDeduplicationId: crypto.randomUUID(),
  //   });

  //   try {
  //     await this.sqsClient.send(sendMessageCommand);
  //   } catch (error) {
  //     const throwableError = new SendMessageException({
  //       queue,
  //       payload: message,
  //       stackedError: error,
  //     });
  //     this.loggerRepository.emergency(throwableError);
  //     throw throwableError;
  //   }
  // }
}
