import 'reflect-metadata'
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
  InputType,
  Field,
} from 'type-graphql'
import { Store } from './Store'
import { Customer } from './Customer'
import { Context } from './context'
import { StoreCreateInput } from './StoreResolver'

@InputType()
class CustomerUniqueInput {
  @Field()
  id: number
}

@InputType()
class CustomerCreateInput {
  @Field()
  id: number
  
  @Field()
  customerName: string

  @Field()
  sdpId: number

  @Field()
  streetName: string

  @Field()
  phoneNumber: string

  @Field((type) => [StoreCreateInput])
  stores: [StoreCreateInput]
}

@InputType()
export class StoreCreateInputDirectOnCustomer {
  @Field()
  storeName: string;

  @Field()
  distributionCenterName: string;

  @Field((type) => Date, { nullable: true })
  openDate: Date | null;

  @Field((type) => Date, { nullable: true })
  closeDate: Date | null;
}

@Resolver(Customer)
export class CustomerResolver {
  @FieldResolver()
  async stores(@Root() customer: Customer, @Ctx() ctx: Context): Promise<Store[] | null> {
    return ctx.prisma.customer
      .findUnique({
        where: {
          id: customer.id,
        },
      })
      .stores()
  }

  @Mutation((returns) => Customer)
  async createCustomer(
    @Arg('data') data: CustomerCreateInput,
    @Ctx() ctx: Context,
  ): Promise<Customer> {
    const storeData = data.stores.map((store) => {
      return {
        storeName: store.storeName,
        distributionCenterName: store.distributionCenterName,
        openDate: store.openDate,
        closeDate: store.closeDate
      }
    })

    return ctx.prisma.customer.create({
      data: {
        id: data.id,
        customerName: data.customerName,
        sdpId: data.sdpId,
        streetName: data.streetName,
        phoneNumber: data.phoneNumber,
        stores: {
          create: storeData,
        },
      },
    })
  }

  @Query(() => [Customer])
  async allCustomers(@Ctx() ctx: Context) {
    return ctx.prisma.customer.findMany()
  }

  @Query((returns) => [Store], { nullable: true })
  async storesByCustomer(
    @Arg('customerUniqueInput') customerUniqueInput: CustomerUniqueInput,
    @Ctx() ctx: Context,
  ) {
    return ctx.prisma.customer
      .findUnique({
        where: {
          id: customerUniqueInput.id
        },
      })
      .stores({
        where: {},
      })
  }

  @Query((returns) => Store, { nullable: true })
  async customerById(@Arg('id') id: number, @Ctx() ctx: Context) {
    return ctx.prisma.customer.findUnique({
      where: { id },
    });
  }
}
