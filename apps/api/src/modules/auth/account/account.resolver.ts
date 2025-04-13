import { Query, Resolver } from '@nestjs/graphql'
import { AccountService } from './account.service'
import { UserEntity } from './entity/user.entity'

@Resolver('Account')
export class AccountResolver {
  public constructor(private readonly accountService: AccountService) {}

  @Query(() => [UserEntity], { name: 'findAllUsers' })
  public async findAllAccount() {
    return this.accountService.findAllAccount()
  }
}
