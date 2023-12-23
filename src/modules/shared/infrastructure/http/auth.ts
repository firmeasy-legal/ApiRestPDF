import { NextFunction, Request, Response } from "express"

import { getUserAuthenticatedByToken } from "@/user/application/getUserAuthenticatedByToken"
import { userRepository } from "@/shared/infrastructure/container"

export async function getExternalToken(req: Request) {
	const bearerToken = req.headers.authorization?.split(" ")[1]
	return bearerToken
}

export async function ensureAuthentication(req: Request, res: Response, next: NextFunction) {
	const bearerToken = req.headers.authorization
	if (!bearerToken)
		return res.status(404).send()

	const token = bearerToken.split(" ")[1] as string | undefined
	if (!token)
		return res.status(404).send()

	try {
		await getUserAuthenticatedByToken({
			token,
			userRepository
		})
		next()
	} catch (error) {
		return res.status(401).send()
	}
}