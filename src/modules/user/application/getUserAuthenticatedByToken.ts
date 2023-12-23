import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken"

import { jwtAuthSecret } from "@/shared/infrastructure/constants"
import { User } from "../domain/User"
import { UserRepository } from "../domain/UserRepository"
import { AuthPayload } from "./generateAuthToken"

type Params = {
	token: string
	userRepository: UserRepository
}

export async function getUserAuthenticatedByToken({
	token,
	userRepository
}: Params): Promise<User> {
	try {
		const payload = jwt.verify(token, jwtAuthSecret) as JwtPayload & AuthPayload
		const user = await userRepository.getByUuid(payload.uuid)

		if (!user) {
			throw new Error("Usuario no encontrado")
		}

		if (!user.estaActivo) {
			throw new Error("Usuario inactivo")
		}

		return user
	} catch (error) {
		if (error instanceof TokenExpiredError) {
			throw new Error("Token expirado")
		}

		if (error instanceof Error) {
			throw error
		}

		throw new Error("Error desconocido")
	}
}