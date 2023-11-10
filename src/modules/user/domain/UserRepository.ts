import { UnsavedUser, User, UserCredentials } from "./User"

export interface UserRepository {
	getByUuid(uuid: string): Promise<User | undefined>
	getByCredentials(credentials: UserCredentials): Promise<User | undefined>
	save(user: UnsavedUser): Promise<void>
}