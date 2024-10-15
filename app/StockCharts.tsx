import { StockChart } from "./StockChart";
import type { StockData } from "./page";
export const StockCharts = ({
  data,
  watchedStocks,
}: {
  data: StockData;
  watchedStocks: string[];
}) => (
  <>
    <header>Stock Charts</header>
    <div className="flex justify-around flex-wrap">
      {watchedStocks.length === 0 && (
        <span>No stocks yet! Try adding one.</span>
      )}
      {watchedStocks.map((symbol) => (
        <StockChart
          key={symbol}
          symbol={symbol}
          data={data.filter((obj) => symbol in obj)}
        />
      ))}
    </div>
  </>
);
