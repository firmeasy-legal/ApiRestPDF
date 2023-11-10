type ConstructorParams = {
	message: string
	stackedError?: unknown
}

export abstract class CustomException extends Error {
	ocurredAt: Date
	stackedError?: unknown
	constructor({ message, stackedError }: ConstructorParams) {
		super(message)
		this.stackedError = stackedError
		this.ocurredAt = new Date()
	}
}