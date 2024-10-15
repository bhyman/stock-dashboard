export const generateRandomStep = (scalar: number) =>
  // First, note we create a 50% chance of the step being positive or negative. Thereafter, the step
  // is equal to a random value between 0.5% - 1% of the scalar.
  // As follows:
  // Take a random number in [0, 1), scale by 1% so we're in [0, .01), add .01 so we're in [.01, .02),
  // i.e 1% - 2%. Then multiply by the actual scalar. Finally, halve this.
  (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.01 + 0.01) * scalar * 0.5;

export const generateRandomStockPrice = () =>
  Number((20 + Math.random() * (500 - 20 + 1)).toPrecision(5));
