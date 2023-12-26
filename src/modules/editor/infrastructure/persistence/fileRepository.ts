import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import fs from "node:fs/promises"

type Params = {
	loggerRepository: LoggerRepository;
};

export class FileRepository {
	private loggerRepository: LoggerRepository

	constructor({ loggerRepository }: Params) {
		this.loggerRepository = loggerRepository
	}

	async deleteFile(path_file: string): Promise<boolean> {
		
		try {
			await fs.rm(path_file)
			console.log(`Archivo eliminado: ${path_file}`)
			return true
		} catch (error) {
			await new Promise((resolve) => {
				setTimeout(() => {
					resolve(true)
				}, 3000)
			})	

			return this.deleteFile(path_file)
		}
	}
}
