import { UnsavedUser } from "../domain/User"
import { UserRepository } from "../domain/UserRepository"

type Params = {
	user: UnsavedUser
	userRepository: UserRepository
}

export async function registerUser({
	user,
	userRepository,
}: Params) {
	try {
		await userRepository.save(user)
	} catch (error) {
		console.error(error)
	}
}