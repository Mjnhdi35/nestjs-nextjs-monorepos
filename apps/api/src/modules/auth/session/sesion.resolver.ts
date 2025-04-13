import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { SessionService } from './session.service'
import { UserEntity } from '../account/entity/user.entity'
import { GqlContext } from '@/shared/types/gql-context.types'
import { LoginInput } from './dtos/login.input'

@Resolver('Session')
export class SessionResolver {
  public constructor(private readonly sessionService: SessionService) {}

  @Mutation(() => UserEntity, { name: 'loginUser' })
  public async login(
    @Context() { req }: GqlContext,
    @Args('data') input: LoginInput,
  ) {
    return this.sessionService.login(req, input)
  }
  @Mutation(() => Boolean, { name: 'logoutUser' })
  public async logout(@Context() { req }: GqlContext) {
    return this.sessionService.logout(req)
  }
}
