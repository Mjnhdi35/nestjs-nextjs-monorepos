/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SessionService } from './session.service'
import { UserEntity } from '../account/entity/user.entity'
import { GqlContext } from '@/shared/types/gql-context.types'
import { LoginInput } from './dtos/login.input'
import { UserAgent } from '@/shared/decorators/user-agent.decorator'
import { Authorization } from '@/shared/decorators/auth.decorator'
import { SessionEntity } from './entity/session.entity'

@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {}

  @Authorization()
  @Query(() => [SessionEntity], { name: 'findSessionsByUser' })
  public async findByUser(@Context() { req }: GqlContext) {
    return this.sessionService.findByUser(req)
  }

  @Authorization()
  @Query(() => SessionEntity, { name: 'findCurrentSession' })
  public async findCurrent(@Context() { req }: GqlContext) {
    return this.sessionService.findCurrent(req)
  }

  @Mutation(() => UserEntity, { name: 'loginUser' })
  public async login(
    @Context() { req }: GqlContext,
    @Args('data') input: LoginInput,
    @UserAgent() userAgent: string,
  ) {
    return this.sessionService.login(req, input, userAgent)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'logoutUser' })
  public async logout(@Context() { req }: GqlContext) {
    return this.sessionService.logout(req)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'clearSessionCookie' })
  public async clearSession(@Context() { req }: GqlContext) {
    return this.sessionService.clearSession(req)
  }

  @Authorization()
  @Mutation(() => Boolean, { name: 'removeSession' })
  public async remove(@Context() { req }: GqlContext, @Args('id') id: string) {
    return this.sessionService.remove(req, id)
  }
}
