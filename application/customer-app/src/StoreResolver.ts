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

  @Field((type) => Customer, { nullable: true })
  customer: Customer | null;
}

@InputType()
class StoreOrderById {
  @Field((type) => SortOrder)
  id: SortOrder
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

@Resolver(Store)
export class StoreResolver {
  @FieldResolver()
  author(@Root() store: Store, @Ctx() ctx: Context): Promise<Customer | null> {
    return ctx.prisma.store
      .findUnique({
        where: {
          id: store.id,
        },
      })
      .customer()
  }

  @Query((returns) => Store, { nullable: true })
  async postById(@Arg('id') id: number, @Ctx() ctx: Context) {
    return ctx.prisma.store.findUnique({
      where: { id },
    })
  }

  @Query((returns) => [Store])
  async feed(
    @Arg('searchString', { nullable: true }) searchString: string,
    @Arg('skip', (type) => Int, { nullable: true }) skip: number,
    @Arg('take', (type) => Int, { nullable: true }) take: number,
    @Arg('orderBy', { nullable: true }) orderBy: StoreOrderById,
    @Ctx() ctx: Context,
  ) {
    const or = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {}

    return ctx.prisma.store.findMany({
      where: {},
      take: take || undefined,
      skip: skip || undefined,
      orderBy: orderBy || undefined,
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
