import { Prisma, PrismaEntities, PrismaRepository } from "@/shared/infrastructure/persistence"
import { UnsavedUser, User, UserCredentials } from "../../domain/User"

import { amountPasswordSaltRounds } from "@/shared/infrastructure/constants"
import bcrypt from "bcryptjs"
import crypto from "node:crypto"
import { UserRepository } from "../../domain/UserRepository"

export class PrismaUserRepository extends PrismaRepository<
	Prisma.UserDelegate,
	PrismaEntities.User,
	User
> implements UserRepository {
	protected sourceToEntity(source: PrismaEntities.User): User {
		return {
			id: source.id,
			uuid: source.uuid,
			username: source.username,
			password: source.password,
			estaActivo: source.estaActivo,
			createdAt: source.createdAt,
			updatedAt: source.updatedAt,
		}
	}

	protected async repository() {
		return this.client.user
	}

	async getByUuid(uuid: string): Promise<User | undefined> {
		const user = await this.client.user.findUnique({
			where: { uuid },
		})

		if (!user) {
			return
		}

		return this.sourceToEntity(user)
	}

	async getByCredentials({ username, password }: UserCredentials): Promise<User | undefined> {
		const user = await this.client.user.findFirst({
			where: { username },
		})

		if (!user) {
			return
		}

		const isPasswordValid = await bcrypt.compare(password, user.password)

		if (!isPasswordValid) {
			return
		}

		return this.sourceToEntity(user)
	}

	async save({ username, password, estaActivo }: UnsavedUser): Promise<void> {
		const hashedPassphrase = await bcrypt.hash(password, amountPasswordSaltRounds)

		await this.client.user.create({
			data: {
				uuid: crypto.randomUUID(),
				username,
				password: hashedPassphrase,
				estaActivo,
			}
		})
	}
}