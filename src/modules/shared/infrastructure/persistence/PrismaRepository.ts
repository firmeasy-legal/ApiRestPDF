import { LoggerRepository } from "@/shared/domain/logs/LoggerRepository"
import { PrismaClient } from "."

export type PrismaRepositoryParams = {
	client: PrismaClient
	loggerRepository: LoggerRepository
}

export abstract class PrismaRepository<
	Repository,
	Source,
	E
> {
	protected client: PrismaClient
	protected loggerRepository: LoggerRepository

	constructor({ client, loggerRepository }: PrismaRepositoryParams) {
		this.client = client
		this.loggerRepository = loggerRepository
	}

	protected abstract sourceToEntity(source: Source): E

	protected abstract repository(): Promise<Repository>
}