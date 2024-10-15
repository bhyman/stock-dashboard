import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { TIME_KEY } from "../shared/constants";
import type { StockData } from "./page";

import styles from "./styles.module.css";

const formatTimeFromUnixTimestamp = (unixTime: number) => {
  const date = new Date(unixTime);

  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/New_York",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);

  return formatter.format(date);
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <p>
        ${payload[0].value} ({formatTimeFromUnixTimestamp(label)})
      </p>
    );
  }

  return null;
};

export const StockChart = ({
  symbol,
  data,
}: {
  symbol: string;
  data: StockData;
}) => (
  <div className={styles.stockChartContainer}>
    <header>{symbol}</header>
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={TIME_KEY}
          interval={Math.floor(data.length / 1.5)}
          // Even as we collect more data points, show a near-constant number of labels on the
          // x-axis, i.e. two or three. This is the most straightforward way to prevent crowding.
          scale="time"
          domain={["auto", "auto"]}
          tickFormatter={formatTimeFromUnixTimestamp}
          type="number"
        />
        <YAxis
          domain={[
            (dataMin: number) => Math.floor(dataMin - 50),
            (dataMax: number) => Math.ceil(dataMax + 50),
          ]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey={symbol} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
