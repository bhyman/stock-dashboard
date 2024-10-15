import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

import { GET } from "./app/stocks/route.ts";

import {
  TIME_KEY,
  UPDATE_STOCK_PRICES,
  UPDATE_WATCHLIST,
} from "./shared/constants";
import { generateRandomStep, generateRandomStockPrice } from "./shared/utils";

const DEV = process.env.NODE_ENV !== "production";
const HOSTNAME = "localhost";
const PORT = 3000;
const app = next({ DEV, HOSTNAME, PORT });
const handler = app.getRequestHandler();

// The following method takes a stocks array and offsets object, and transforms it
// stocks == [ { symbol: 'AAPL', price: 466.57 }, { symbol: 'GOOG', price: 396.07 }, ...]
// offsets == {'AAPL': -5.17}
// Result: { AAPL: 461.40, GOOG: 396.07, ...}
const collatePrices = (stocks, offsets) =>
  stocks.reduce(
    (acc, { symbol, price }) => ({
      ...acc,
      [symbol]: Number((price + (offsets[symbol] || 0)).toPrecision(5)),
    }),
    {},
  );

const sendInitialStockData = (socket, prices) => {
  // Start off by emitting two data points for each stock rather than one, so that the frontend
  // draws a line rather than a point. This avoids the slightly displeasing user experience of
  // watching, in real time, the initial point be connected to the second one. This function fakes a
  // backdated (by 2 seconds) reading where the stock then rises by $0.25 over the course of that
  // interval.
  const now = new Date().getTime();
  socket.emit(UPDATE_STOCK_PRICES, {
    prices: Object.keys(prices).reduce(
      (acc, key) => ({
        ...acc,
        [key]: prices[key] - 0.25,
      }),
      {},
    ),
    [TIME_KEY]: now - 2000,
  });
  socket.emit(UPDATE_STOCK_PRICES, { prices, [TIME_KEY]: now });
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    const response = await GET();
    const data = await response.json();
    const initialStocksOnWatchlist = data?.stocks ?? [];

    // While the following stocks *are* on the user's watchlist in the DB (per the logic on the
    // updateWatchlist REST endpoint, currently a POST to /stocks), this process doesn't know that,
    // and we want to avoid making unnecessary DB calls. Hence the current artifice: in addition to
    // the DB, use an in-memory list that the client can update over the socket.
    let stocksNewlyAddedToWatchlist = [];
    // In lieu of using a stock API, we'll fake it by generating random movement, as described
    // further below.
    let offsets = {};

    sendInitialStockData(
      socket,
      collatePrices(initialStocksOnWatchlist, offsets),
    );

    setInterval(() => {
      const allStocks = [
        ...initialStocksOnWatchlist,
        ...stocksNewlyAddedToWatchlist,
      ];
      const currentPrices = collatePrices(allStocks, offsets);
      offsets = Object.keys(currentPrices).reduce(
        (acc, symbol) => ({
          ...acc,
          // Generate a new offset to mimic the stock going up or down. The new offset is the current
          // offset (or 0, if none) plus a perturbation of the current price.
          [symbol]:
            (offsets[symbol] ?? 0) + generateRandomStep(currentPrices[symbol]),
        }),
        {},
      );

      socket.emit(UPDATE_STOCK_PRICES, {
        prices: collatePrices(allStocks, offsets),
        [TIME_KEY]: new Date().getTime(),
      });
    }, 3000);

    socket.on(UPDATE_WATCHLIST, (value) => {
      // Changes to this array will get picked up by the setInterval call above, albeit on the
      // setInterval's schedule rather than immediately on receiving the socket message. This
      // *could* be addressed (i.e. by clearing and restarting the timer), but I've not yet done so.
      // addressed
      // Note that, unlike the stocks already on the watchlist, we start with a single point rather
      // than a line. This is an unhandled edge case.
      stocksNewlyAddedToWatchlist.push({
        symbol: value,
        price: generateRandomStockPrice(),
      });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(PORT, async () => {
      console.log(`> Ready on http://${HOSTNAME}:${PORT}`);
    });
});
