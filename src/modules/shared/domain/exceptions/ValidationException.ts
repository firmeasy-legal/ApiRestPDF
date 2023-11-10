import { ValidationError as YupValidationError } from "yup"
import { CustomException } from "./CustomException"

type ValidationError = {
	property: string
	message: string
}

function yupErrorToMessage(error: YupValidationError): ValidationError {
	return {
		property: error.path as string,
		message: error.message,
	}
}

export class ValidationException extends CustomException {
	errors: ValidationError[]

	constructor(error: YupValidationError) {
		super({
			message: error.message,
		})
		this.errors = error.inner.map(yupErrorToMessage)
	}
}