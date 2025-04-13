import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserEntity {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  @Field(() => String)
  email: string

  @Field(() => String)
  password: string

  @Field(() => String)
  displayName: string

  @Field(() => String, { nullable: true })
  avatar: string

  @Field(() => String, { nullable: true })
  bio: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Date)
  updatedAt: Date
}
