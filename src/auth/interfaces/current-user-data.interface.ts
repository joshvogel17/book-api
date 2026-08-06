import { Role } from 'src/auth/entities/user.entity';

export interface CurrentUserData {
  id: number
  email: string,
  role: Role
}