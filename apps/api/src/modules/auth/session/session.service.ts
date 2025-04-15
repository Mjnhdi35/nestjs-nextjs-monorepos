/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@/core/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { LoginInput } from './dtos/login.input'
import type { Request } from 'express'
import { verify } from 'argon2'
import { ConfigService } from '@nestjs/config'
import { getSessionMetadata } from '@/shared/utils/session-metadata.util'
import { RedisService } from '@/core/redis/redis.service'

@Injectable()
export class SessionService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId

    if (!userId) {
      throw new NotFoundException('Đã xảy ra lỗi vui lòng thử lại')
    }
    console.log('Current userId:', userId)
    console.log('Current session ID:', req.session.id)

    const sessionFolder =
      this.configService.getOrThrow<string>('SESSION_FOLDER')
    console.log('SESSION_FOLDER:', sessionFolder)
    const keys = await this.redisService.keys(`${sessionFolder}*`)
    console.log('Redis keys:', keys)

    const userSessions = []

    for (const key of keys) {
      const sessionData = await this.redisService.get(key)
      console.log(`Key: ${key}, Raw data: ${sessionData}`)
      if (sessionData) {
        const session = JSON.parse(sessionData)
        console.log('Parsed session:', session)
        if (session.userId === userId) {
          const sessionId = key.replace(sessionFolder, '')
          console.log(`Extracted session ID: ${sessionId}`)
          userSessions.push({ ...session, id: sessionId })
        }
      }
    }
    console.log('Sessions before sort:', userSessions)
    userSessions.sort((a, b) => b.createdAt - a.createdAt)

    console.log('Sessions after sort:', userSessions)

    const filteredSessions = userSessions.filter(
      (session) => session.id !== req.session.id,
    )
    console.log('Filtered sessions:', filteredSessions)

    return filteredSessions
  }
  public async findCurrent(req: Request) {
    const sessionId = req.session.id
    const sessionData = await this.redisService.get(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`,
    )
    const session = JSON.parse(sessionData)
    return {
      ...session,
      id: sessionId,
    }
  }

  public async login(req: Request, input: LoginInput, userAgent: string) {
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

    const metadata = getSessionMetadata(req, userAgent)
    return new Promise((resolve, reject) => {
      req.session.createdAt = new Date()
      req.session.userId = user.id
      req.session.metadata = metadata
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

  public async clearSession(req: Request) {
    req.res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
    return true
  }
  public async remove(req: Request, id: string) {
    if (req.session.id === id) {
      throw new ConflictException('Đã xảy ra lỗi máy chủ vui lòng thử lại')
    }
    await this.redisService.del(
      `${this.configService.getOrThrow<string>('SESSION_FOLDER')}:${id}`,
    )
    return true
  }
}
