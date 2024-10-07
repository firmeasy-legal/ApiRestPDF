import { z } from "zod"

const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/

const wordToPdfSchema = z.object({
	file: z.string().regex(base64Regex, { message: "El archivo debe estar en formato base64" }),
})

export const validateWordToPdfInput = (data: unknown) => {
	return wordToPdfSchema.safeParse(data)
}
