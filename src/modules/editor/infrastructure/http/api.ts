import { Request, Response, Router } from "express"

import { generateAuthToken } from "@/user/application/generateAuthToken"
import { UserCredentials } from "@/user/domain/User"
// import { getExternalToken } from "@/shared/infrastructure/http/auth"
// import { getUserAuthenticatedByToken } from "@/user/application/getUserAuthenticatedByToken"
import { userRepository } from "@/shared/infrastructure/container"

const apiRouter = Router()

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

apiRouter.post("/test", async (req: Request, res: Response) => {

	return res.json({
		ok: true,
		message: "Test"
	})
})


export { apiRouter }
