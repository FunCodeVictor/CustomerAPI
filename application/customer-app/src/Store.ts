import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'
import { Customer } from './Customer'

@ObjectType()
export class Store {
  @Field((type) => ID)
  id: number

  @Field()
  storeName: string

  @Field()
  distributionCenterName: string
  
  @Field((type) => Date)
  openDate: Date

  @Field((type) => Date)
  closeDate: Date

  @Field((type) => Customer, { nullable: true })
  customer?: Customer | null;
}
