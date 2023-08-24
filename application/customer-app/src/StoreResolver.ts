import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  Int,
  InputType,
  Field,
} from 'type-graphql'
import { Store } from './Store'
import { Customer } from './Customer'
import { Context } from './context'


@InputType()
export class StoreCreateInput {
  @Field()
  title: string

  @Field()
  storeName: string;

  @Field()
  distributionCenterName: string;

  @Field((type) => Date)
  openDate: Date;

  @Field((type) => Date)
  closeDate: Date;
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@Resolver(Store)
export class StoreResolver {
  @FieldResolver()
  customer(@Root() store: Store, @Ctx() ctx: Context): Promise<Customer | null> {
    return ctx.prisma.store
      .findUnique({
        where: {
          id: store.id,
        },
      })
      .customer()
  }

  @Query((returns) => Store, { nullable: true })
  async storeById(@Arg('id') id: number, @Ctx() ctx: Context) {
    return ctx.prisma.store.findUnique({
      where: { id },
    })
  }

  @Mutation((returns) => Store, { nullable: true })
  async deleteStore(@Arg('id', (type) => Int) id: number, @Ctx() ctx: Context) {
    return ctx.prisma.store.delete({
      where: {
        id,
      },
    })
  }
}
