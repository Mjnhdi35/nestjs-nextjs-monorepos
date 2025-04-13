import { Module } from '@nestjs/common'
import { SessionService } from './session.service'
import { SessionResolver } from './sesion.resolver'

@Module({
  providers: [SessionService, SessionResolver],
})
export class SessionModule {}
