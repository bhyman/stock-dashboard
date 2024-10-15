import { PrismaClient } from "@prisma/client";

import { generateRandomStockPrice } from "../shared/utils";

const prisma = new PrismaClient();

export async function getStocksInRootWatchlist() {
  try {
    const stocks = await prisma.stock.findMany({
      where: {
        watch: {
          some: {
            watchlist: {
              user: {
                email: "root@localhost",
              },
            },
          },
        },
      },
    });

    return stocks.map((stock) => ({
      symbol: stock.symbol,
      price: generateRandomStockPrice(),
    }));
  } catch (error) {
    console.error("Error getting stocks", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function addToWatchlist(symbol: string) {
  try {
    const user = await prisma.user.findFirst({
      include: { watchlist: true },
    });

    if (!user) {
      console.log("No users found in the database");
      return;
    }

    let watchlist;
    if (!user.watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
    } else {
      watchlist = user.watchlist;
    }

    let stock = await prisma.stock.findUnique({
      where: { symbol: symbol },
    });

    if (!stock) {
      stock = await prisma.stock.create({
        data: {
          symbol: symbol,
        },
      });
      console.log(`Stock ${symbol} created.`);
    }

    await prisma.watch.create({
      data: {
        stock: { connect: { id: stock.id } },
        watchlist: { connect: { id: watchlist.id } },
      },
    });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
  } finally {
    await prisma.$disconnect();
  }
}
