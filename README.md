This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Running the application

You must have Node.js and one of {`npm`, `pnpm`, `yarn`} on your system.

Install the dependencies, then build and run the application as follows.

```bash
npm install && npm run build && npm run start
# or
pnpm install && pnpm build && pnpm start
# or
yarn install && yarn build && yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

No Docker setup yet :-(.

## Notes

* I've used Prisma (fronting a sqlite database) in lieu of writing manual SQL, which I hope is still within the spirit of this exercise. There's a rich discussion to be had about the time and place for ORMs, the attendant trade-offs, etc. In this case, the fastest way to get the project off the ground was to use an embedded sqlite database. But that's hardly appropriate for a production-level web app. Using something like Prisma makes it easy to, as desired, swap out the backend DB.
* Instead of using a stock API, I randomly generate numbers. Moreover, I don't wish to store stock prices in the DB. This results in occasional code contortions. See the comments in `server.js` for more details.
* Per the specs, the endpoints should be available as a REST API in addition to supporting real-time data streaming. This, combined with the above note about random generation of values, results in some non-ideal design decisions. For example, upon socket initialization, the socket back-end makes a call to our own (random-number-generating) REST API rather than having both layers e.g. fetching identical data from a third source.
* I made use of a number of online tutorials and resources in putting this together. Sources available upon request.

## Wishlist
Obviously, this isn't even close to full-fledged. Some things I'd like to tackle, given unlimited time:
  * Support Docker
  * Convert `server.js` to TypeScript, and in general, use types more robustly
  * Write a unit test for `collatePrices`, as much as a form of documentation as to ensure correctness
    * For that matter, write unit tests more broadly
  * Fix the dev server; it seems to have stopped supporting hot reloading, though I could have sworn it worked once upon a time
  * Address edge cases and other imperfections
    * Update the styling from that of a 1980s website (1990s, if we're being charitable) to something befitting the modern age
    * Make error handling/ user alerting far more robust. There are so many ways it should be improved, I hardly even know where to begin describing how!
    * Currently, when a user submits the form to add a stock to their watchlist, we must wait until the server's next `setInterval` call for the front-end to render a chart. This results in an apparent delay of up to 3 seconds. With a little refactoring, we can avoid this.
    * A user with many stocks who leaves the page open for hours will experience a browser that lags to the point of crashing. This is due to the volume of data that the front-end must keep in memory. One way to address this would be to thin the dataset once it reaches a given size.
  * Add some obvious and not-so-obvious features
    * Add a loading spinner or the like (perhaps a Suspense) to show when data is being fetched from the server, i.e. upon initial page load and when a stock is newly added to a watchlist
    * Fetch real data from a stocks API
    * Validate symbols against a canonical list of stocks
    * Support removing stocks from a watchlist
    * Add multi-user support
