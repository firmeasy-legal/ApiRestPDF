import { ObjectSchema, ValidationError } from "yup"

import { ValidationException } from "./ValidationException"

type Params<T extends object> = {
	schema: ObjectSchema<T>
	payload: unknown
}

export async function validatePayload<T extends object>({
	schema,
	payload,
}: Params<T>) {
	try {
		await schema.validate(payload, {
			strict: true,
			abortEarly: false,
			stripUnknown: true,
		})
	} catch (error) {
		if (error instanceof ValidationError) {
			throw new ValidationException(error)
		}

		throw error
	}
}