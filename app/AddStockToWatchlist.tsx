import { useState } from "react";
import { UPDATE_WATCHLIST } from "../shared/constants";
import { socket } from "../shared/socket";

import { Message } from "./Message";

export const AddStockToWatchlist = ({
  watchedStocks,
}: {
  watchedStocks: string[];
}) => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const setErrorMessage = (msg: string) => {
    setMessage(msg);
    setMessageType("error");
  };

  const setSuccessMessage = (msg: string) => {
    setMessage(msg);
    setMessageType("success");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStockSymbol(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const re = /^[a-zA-Z]{1,4}$/;
    const isValidSymbol = re.test(stockSymbol);

    if (!isValidSymbol) {
      setErrorMessage(
        `"${stockSymbol}" is not a valid stock symbol. Ensure you've entered something that consists of 1 - 4 alphabetical characters.`,
      );
      return;
    }

    const canonicalStockSymbol = stockSymbol.toUpperCase();

    if (new Set(watchedStocks).has(canonicalStockSymbol)) {
      setErrorMessage(`${stockSymbol} is already in your watchlist.`);
      return;
    }

    try {
      const response = await fetch("/stocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: canonicalStockSymbol }),
      });

      socket.emit(UPDATE_WATCHLIST, canonicalStockSymbol);

      if (!response.ok) {
        throw new Error("Network response was bad");
      }

      const data = await response.json();

      if (data?.success) {
        setSuccessMessage(
          `Success! ${canonicalStockSymbol} will show up shortly.`,
        );
      } else {
        setErrorMessage(
          `There was a problem adding ${stockSymbol} to your watchlist.`,
        );
      }

      setStockSymbol("");
    } catch (error) {
      console.error("Error submitting stock symbol:", error);
    }
  };

  // I borrowed these from Tailwind Examples pages.
  const tailwindInputExample =
    "shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline max-w-48";
  const tailwindButtonExample =
    "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 mx-2 rounded focus:outline-none focus:shadow-outline";

  return (
    <>
      <header>Add Stocks</header>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={stockSymbol}
          onChange={handleInputChange}
          placeholder="Enter stock symbol"
          required
          className={tailwindInputExample}
        />
        <button type="submit" className={tailwindButtonExample}>
          Submit
        </button>
      </form>
      <Message type={messageType} message={message} />
    </>
  );
};
