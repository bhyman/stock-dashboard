import { getStocksInRootWatchlist, addToWatchlist } from "../../prisma/stocks";

export async function GET() {
  const stocks = await getStocksInRootWatchlist();
  return Response.json({ stocks });
}

export async function POST(request: Request) {
  const data = await request.json();
  if (data.symbol) {
    addToWatchlist(String(data.symbol).toUpperCase());
    return Response.json({ success: true });
  }
  return Response.json({ success: false });
}
