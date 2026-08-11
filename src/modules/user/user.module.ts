import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { ProfileRepository } from './repositories/profile.repository';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, ProfileRepository],
  exports: [UserRepository],
})
export class UserModule {}
