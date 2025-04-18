import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { RedisService } from './core/redis/redis.service'
import { RedisStore } from 'connect-redis'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import { CoreModule } from './core/core.module'
import { ValidationPipe } from '@nestjs/common'
import { ms, type StringValue } from './shared/utils/ms.util'
import { parseBoolean } from './shared/utils/parse-boolean.util'

async function bootstrap() {
  const app = await NestFactory.create(CoreModule)

  const config = app.get(ConfigService)
  const redis = app.get(RedisService)

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
    }),
  )

  app.enableCors({
    // origin: (
    //   origin: string | undefined,
    //   callback: (err: Error | null, allow?: boolean) => void,
    // ) => {
    //   const allowed = [
    //     new URL(config.getOrThrow<string>('ALLOWED_ORIGIN_FE')).origin,
    //     new URL(config.getOrThrow<string>('ALLOWED_ORIGIN_GRAPHQL_STUDIO'))
    //       .origin,
    //   ]
    //   if (!origin || allowed.includes(origin)) {
    //     callback(null, true)
    //   } else {
    //     callback(new Error('Not allowed by CORS'))
    //   }
    // },
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN_FE'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'))
}
void bootstrap()
