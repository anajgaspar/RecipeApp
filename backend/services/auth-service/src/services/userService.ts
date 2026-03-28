import { UserRepository } from "../repositories/userRepository"

export const UserService = {
    async getUser(userId: string) {
        const user = await UserRepository.findById(userId)
        if (!user) {
            throw new Error('Usuário não encontrado')
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        }
    }
}