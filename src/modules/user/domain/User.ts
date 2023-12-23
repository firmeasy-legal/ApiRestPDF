export interface UserCredentials {
	username: string
	password: string
}

export interface User extends UserCredentials {
	id: number
	uuid: string
	estaActivo: boolean
	createdAt: Date
	updatedAt: Date
}

export type UnsavedUser = UserCredentials & {
	estaActivo?: boolean
}