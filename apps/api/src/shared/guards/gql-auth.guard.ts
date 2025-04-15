/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@/core/prisma/prisma.service'
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class GqlAuthGuard implements CanActivate {
  public constructor(private readonly prismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context)
    const request = ctx.getContext().req

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException('Vui lòng đăng nhập lại')
    }
    const user = await this.prismaService.user.findUnique({
      where: { id: request.session.userId },
    })
    request.user = user
    return true
  }
}
