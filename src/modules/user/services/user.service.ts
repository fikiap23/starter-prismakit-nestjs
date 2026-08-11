import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { getUserSelect } from '../types/select-user.type';

@Injectable()
export class UserService {
  constructor(private readonly users: UserRepository) {}

  handleMe(id: string) {
    return this.users.getThrowById({
      id,
      select: getUserSelect('general'),
      setCache: true,
    });
  }
}
