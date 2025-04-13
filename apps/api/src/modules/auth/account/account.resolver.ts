import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { AccountService } from './account.service'
import { UserEntity } from './entity/user.entity'
import { CreateUserInput } from './dtos/create-user.input'

@Resolver('Account')
export class AccountResolver {
  public constructor(private readonly accountService: AccountService) {}

  @Query(() => [UserEntity], { name: 'findAllUsers' })
  public async findAllAccount() {
    return this.accountService.findAllAccount()
  }

  @Mutation(() => Boolean, { name: 'createUser' })
  public async createUser(@Args('data') input: CreateUserInput) {
    return this.accountService.createUser(input)
  }
}
