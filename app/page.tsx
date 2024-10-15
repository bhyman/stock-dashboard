"use client";

import { useEffect, useState } from "react";
import { socket } from "../shared/socket";
import { TIME_KEY, UPDATE_STOCK_PRICES } from "../shared/constants";

import { StockCharts } from "./StockCharts";
import { AddStockToWatchlist } from "./AddStockToWatchlist";

import styles from "./styles.module.css";

export type StockData = {
  [key: string]: number;
  [TIME_KEY]: number;
}[];

type UpdateStockPricesEvent = {
  prices: { [key: string]: number };
  [TIME_KEY]: number;
};

export default function Home() {
  const [data, setData] = useState<StockData>([]);

  useEffect(() => {
    const onUpdateStockPrices = (value: UpdateStockPricesEvent) => {
      setData((d) => [
        ...d,
        {
          ...value.prices,
          [TIME_KEY]: value[TIME_KEY] ?? new Date().getTime(),
        },
      ]);
    };

    socket.on(UPDATE_STOCK_PRICES, onUpdateStockPrices);

    return () => {
      socket.off(UPDATE_STOCK_PRICES, onUpdateStockPrices);
    };
  }, []);

  const watchedStocks = Object.keys(data.at(-1) ?? {}).filter(
    (key) => key !== TIME_KEY,
  );

  return (
    <div className="flex">
      <div className={`${styles.basicBox} max-w-6xl`}>
        <StockCharts data={data} watchedStocks={watchedStocks} />
      </div>
      <div className={`${styles.basicBox} self-start max-w-80`}>
        <AddStockToWatchlist watchedStocks={watchedStocks} />
      </div>
    </div>
  );
}
