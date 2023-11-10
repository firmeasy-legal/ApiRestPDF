import { Request, Response, Router } from "express"

import { UserCredentials } from "@/user/domain/User"
import { generateAuthToken } from "@/user/application/generateAuthToken"
import { getExternalToken } from "@/shared/infrastructure/http/auth"
import { getUserAuthenticatedByToken } from "@/user/application/getUserAuthenticatedByToken"
import { userRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

apiRouter.get("/health-check", async (req: Request, res: Response) => {
	const token = await getExternalToken(req)

	if (!token) {
		return res.status(200).json({
			ok: false,
			message: "No hay token"
		})
	}

	try {
		await getUserAuthenticatedByToken({
			token,
			userRepository
		})
		return res.json({
			ok: true,
			message: "Token válido"
		})
	} catch (error) {
		return res.json({
			ok: false,
			message: "Token inválido"
		})
	}
})

apiRouter.post("/token", async (req: Request, res: Response) => {
	const userCredentials = req.body as UserCredentials

	const user = await userRepository.getByCredentials(userCredentials)
	if (!user) {
		return res.status(401).json({
			message: "Credenciales incorrectas"
		})
	}

	const token = await generateAuthToken({ user })

	return res.json({
		token
	})
})


export { apiRouter }

