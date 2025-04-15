import 'express-session'
import type { SessionMetadata } from './session-metadata.type'

declare module 'express-session' {
  interface SessionData {
    userId?: string
    createdAt?: Date | string
    metadata: SessionMetadata
  }
}
