import { PrismaService } from '@/core/prisma/prisma.service'
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { LoginInput } from './dtos/login.input'
import type { Request } from 'express'
import { verify } from 'argon2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async login(req: Request, input: LoginInput) {
    const { login, password } = input
    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [{ username: { equals: login } }, { email: { equals: login } }],
      },
    })
    if (!user) {
      throw new NotFoundException('Không tìm thấy username và email')
    }
    const isValidPassword = await verify(user.password, password)

    if (!isValidPassword) {
      throw new UnauthorizedException('Mật khẩu không đúng vui lòng thử lại')
    }
    return new Promise((resolve, reject) => {
      req.session.createdAt = new Date()
      req.session.userId = user.id

      req.session.save((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Vui lòng thử lại đã xảy ra lỗi đăng nhập',
            ),
          )
        }
        resolve(user)
      })
    })
  }

  public async logout(req: Request) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            new InternalServerErrorException(
              'Vui lòng thử lại đã xảy ra lỗi đăng xuất',
            ),
          )
        }
        req.res.clearCookie(
          this.configService.getOrThrow<string>('SESSION_NAME'),
        )
        resolve(true)
      })
    })
  }
}
