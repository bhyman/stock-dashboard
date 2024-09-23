import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "root@localhost",
      name: "root",
    },
  });

  const watchlist = await prisma.watchlist.create({
    data: {
      user: {
        connect: { id: user.id },
      },
    },
  });

  await prisma.stock.createMany({
    data: [
      { symbol: "AAPL" },
      { symbol: "GOOG" },
      { symbol: "MSFT" },
      { symbol: "AMZN" },
      { symbol: "FB" },
      { symbol: "TSLA" },
      { symbol: "BABA" },
      { symbol: "NVDA" },
      { symbol: "PYPL" },
      { symbol: "ADBE" },
    ],
  });

  const stocks = await prisma.stock.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });

  await prisma.watch.createMany({
    data: [
      { stockId: stocks[0].id, watchlistId: watchlist.id },
      { stockId: stocks[1].id, watchlistId: watchlist.id },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
