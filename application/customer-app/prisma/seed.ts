import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const customerData: Prisma.CustomerCreateInput[] = [
  {
    customerName: 'customer',
    
    sdpId: 1,
    streetName: "test street name",
    phoneNumber: "1213123123",
    stores: {
      create: {
        storeName: "test store name",
        distributionCenterName: "test dist name",
      }
    }
  },
  {
    customerName: 'second customer',

    sdpId: 2,
    streetName: "second test street name",
    phoneNumber: "21312312",
    stores: {
      create: [
        {
          storeName: "second test store name",
          distributionCenterName: "second test dist name",
          openDate: new Date("2023-02-01")
        },
        {
          storeName: "third test store name",
          distributionCenterName: "third test dist name",
          openDate: new Date("2023-03-01"),
          closeDate: new Date("2023-03-25")
        },
      ]
    }
  },
]

async function main() {
  console.log(`Start seeding ...`)
  for (const c of customerData) {
    const customer = await prisma.customer.create({
      data: c,
    })
    console.log(`Created user with id: ${customer.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
