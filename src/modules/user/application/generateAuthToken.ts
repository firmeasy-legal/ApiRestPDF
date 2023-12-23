import { jwtAuthSecret } from "@/shared/infrastructure/constants"
import jwt from "jsonwebtoken"
import { User } from "../domain/User"

export type AuthPayload = {
	uuid: string
}

type Params = {
	user: User
}

export async function generateAuthToken({
	user
}: Params) {
	const payload: AuthPayload = {
		uuid: user.uuid
	}

	const token = jwt.sign(payload, jwtAuthSecret, { expiresIn: "1d" })
	return token
}