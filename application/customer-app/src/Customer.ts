import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'
import { Store } from './Store'

@ObjectType()
export class Customer {
  @Field((type) => ID)
  id: number

  @Field()
  customerName: string

  @Field()
  sdpId: number

  @Field()
  streetName: string

  @Field()
  phoneNumber: string

  @Field((type) => [Store], { nullable: true })
  stores?: [Store] | null;
}
