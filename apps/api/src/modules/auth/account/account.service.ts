import { ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/core/prisma/prisma.service'
import { CreateUserInput } from './dtos/create-user.input'
import { hash } from 'argon2'

@Injectable()
export class AccountService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async findAllAccount() {
    const users = await this.prismaService.user.findMany()

    return users
  }

  public async createUser(input: CreateUserInput) {
    const { username, email, password } = input

    const isUsernameExists = await this.prismaService.user.findUnique({
      where: { username },
    })
    if (isUsernameExists) {
      throw new ConflictException('Username đã tồn tại')
    }
    const isEmailExists = await this.prismaService.user.findUnique({
      where: { email },
    })
    if (isEmailExists) {
      throw new ConflictException('Email đã tồn tại')
    }
    await this.prismaService.user.create({
      data: {
        username,
        email,
        password: await hash(password),
        displayName: username,
      },
    })
    return true
  }
}
