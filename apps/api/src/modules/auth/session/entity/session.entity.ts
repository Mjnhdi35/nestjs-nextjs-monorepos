import type {
  DeviceInfo,
  LocationInfo,
  SessionMetadata,
} from '@/shared/types/session-metadata.type'
import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class LocationEntity implements LocationInfo {
  @Field(() => String)
  public country: string
  @Field(() => String)
  public city: string
  @Field(() => Number)
  public latidute: number
  @Field(() => Number)
  public longitude: number
}

@ObjectType()
export class DeviceEntity implements DeviceInfo {
  @Field(() => String)
  public browser: string
  @Field(() => String)
  public os: string
  @Field(() => String)
  public type: string
}

@ObjectType()
export class SessionMetadataEntity implements SessionMetadata {
  @Field(() => LocationEntity)
  public location: LocationInfo
  @Field(() => DeviceEntity)
  public device: DeviceInfo
  @Field(() => String)
  public ip: string
}
@ObjectType()
export class SessionEntity {
  @Field(() => String)
  public id: string
  @Field(() => String)
  public userId: string
  @Field(() => String)
  public createdAt: string
  @Field(() => SessionMetadataEntity)
  public metadata: SessionMetadataEntity
}
