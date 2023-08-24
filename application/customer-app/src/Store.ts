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
  
  @Field((type) => Date, { nullable: true })
  openDate: Date | null

  @Field((type) => Date, { nullable: true })
  closeDate: Date | null

  @Field((type) => Customer, { nullable: true })
  customer?: Customer | null;
}
