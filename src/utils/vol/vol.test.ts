import { describe, it, expect } from 'vitest';
import { pi, sin, pow } from 'mathjs/number';
import { Brent, OptionsGreeks, TypeOfOption } from './index';

describe('Brent root-finding algorithm', () => {
  it('finds the correct root for the Wikipedia example function', () => {
    const brent = new Brent(1e-15);

    const testFunc = (x: number) => (x + 3) * pow(x - 1, 2);
    const root = brent.findRoot(testFunc, -4, 4); // Interval from the Wikipedia example
    expect(root).toBeCloseTo(-3); // The expected root from the Wikipedia example
  });

  it('throws an error if the function values at the interval endpoints do not bracket the root', () => {
    const brent = new Brent();
    const testFunc = (x: number) => x * x; // Positive for all x != 0
    const runBrent = () => brent.findRoot(testFunc, 1, 2);

    expect(runBrent).toThrow(
      'Function values at the interval endpoints must bracket the root.',
    );
  });

  it('correctly finds the root for a linear function', () => {
    const brent = new Brent();
    const linearFunction = (x: number) => 2 * x - 4;
    const root = brent.findRoot(linearFunction, 0, 3);
    expect(root).toBeCloseTo(2);
  });

  it('correctly finds the root for a cubic function', () => {
    const brent = new Brent();
    const cubicFunction = (x: number) => x * x * x - x - 2;
    const root = brent.findRoot(cubicFunction, 1, 2);
    expect(root).toBeCloseTo(1.52138); // Approximate root from actual calculation
  });

  it('correctly finds the root for a trigonometric function', () => {
    const brent = new Brent(1e-15);
    const trigFunction = (x: number) => sin(x);
    const root = brent.findRoot(trigFunction, 3, 4);
    expect(root).toBeCloseTo(pi);
  });
});

describe('Options Greeks BSM and IV convergence', () => {
  it('should calculate the correct price for a European put option using Black-Scholes-Merton model', () => {
    const st = 40; // Spot price of the underlying asset
    const K = 40; // Strike price of the option
    const q = 0.05; // Dividend yield
    const t = 0.5; // Time to expiration
    const r = 0.09; // Risk-free interest rate
    const sigma = 0.3; // Volatility of the asset

    const calculatedPutPrice = OptionsGreeks.blackScholesMerton(
      TypeOfOption.Call,
      st,
      K,
      r,
      q,
      sigma,
      t,
    );

    // assertEquals in QUnit is analogous to toBeCloseTo in vitest with a precision of 4 decimal places
    expect(calculatedPutPrice).toBeCloseTo(3.6817718494101577, 2);
  });

  it('should calculate the correct implied volatility', () => {
    const S = 100; // Spot price of the underlying asset
    const K = 100; // Strike price of the option
    const sigma = 0.2; // Volatility of the asset
    const r = 0.01; // Risk-free interest rate
    const type = TypeOfOption.Call; // 'c' for call option
    const t = 0.5; // Time to expiration
    const q = 0; // Dividend yield

    const expectedPrice = 5.87602423383;
    const expectedIv = 0.2;

    // Calculate the option price using Black-Scholes-Merton model
    const price = OptionsGreeks.blackScholesMerton(type, S, K, r, q, sigma, t);

    // Calculate the implied volatility using the provided sigma function
    const impliedVol = OptionsGreeks.sigma(type, price, S, K, r, q, t);

    // Check if the calculated price and implied volatility are as expected
    expect(price).toBeCloseTo(expectedPrice, 5); // Precision to 5 decimal places
    expect(impliedVol).toBeCloseTo(expectedIv, 5); // Precision to 5 decimal places
  });
});

describe('OptionsGreeks - Greeks', () => {
  const S = 49; // Underlying asset price
  const K = 50; // Strike price
  const r = 0.05; // Risk-free interest rate
  const t = 0.3846; // Time to expiration in years
  const sigma = 0.2; // Volatility
  const q = 0; // Dividend yield
  const accuracy = 1e-12; // Tolerance for equality

  it('calculates the correct delta', () => {
    const deltaCall = OptionsGreeks.delta(
      TypeOfOption.Call,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    expect(deltaCall).toBeCloseTo(0.521601633972, accuracy);
  });

  it('calculates the correct theta', () => {
    const thetaCallAnnual = OptionsGreeks.theta(
      TypeOfOption.Call,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    expect(thetaCallAnnual).toBeCloseTo(-4.30538996455, accuracy);

    const thetaPutAnnual = OptionsGreeks.theta(
      TypeOfOption.Put,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    expect(thetaPutAnnual).toBeCloseTo(-1.8530056722, accuracy);
  });

  it('calculates the correct gamma', () => {
    const gammaCall = OptionsGreeks.gamma(S, K, r, q, sigma, t);
    expect(gammaCall).toBeCloseTo(0.0655453772525, accuracy);
  });

  it('calculates the correct vega', () => {
    const vegaCall = OptionsGreeks.vega(S, K, r, q, sigma, t);
    expect(vegaCall).toBeCloseTo(0.121052427542, accuracy);
  });

  it('calculates the correct rho', () => {
    const rhoCall = OptionsGreeks.rho(TypeOfOption.Call, S, K, r, q, sigma, t);
    expect(rhoCall).toBeCloseTo(0.089065740988, accuracy);
  });

  it('calculates the correct vanna (sensitivity of delta to volatility)', () => {
    const _vannaValue = OptionsGreeks.vanna(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct charm (rate of change of delta over time)', () => {
    const _charmCall = OptionsGreeks.charm(
      TypeOfOption.Call,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    const _charmPut = OptionsGreeks.charm(
      TypeOfOption.Put,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct vomma (sensitivity of vega to volatility)', () => {
    const _vommaValue = OptionsGreeks.vomma(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct veta (rate of change of vega over time)', () => {
    const _vetaValue = OptionsGreeks.veta(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct speed (rate of change of gamma with respect to underlying price)', () => {
    const _speedValue = OptionsGreeks.speed(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct zomma (rate of change of gamma with respect to volatility)', () => {
    const _zommaValue = OptionsGreeks.zomma(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct color (rate of change of gamma with respect to time)', () => {
    const _colorValue = OptionsGreeks.color(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct ultima (rate of change of vomma with respect to volatility)', () => {
    const _ultimaValue = OptionsGreeks.ultima(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct dual delta (sensitivity of option value to strike price)', () => {
    const _dualDeltaCall = OptionsGreeks.dualDelta(
      TypeOfOption.Call,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    const _dualDeltaPut = OptionsGreeks.dualDelta(
      TypeOfOption.Put,
      S,
      K,
      r,
      q,
      sigma,
      t,
    );
    // TODO(Include assertions based on expected value)
  });

  it('calculates the correct dual gamma (sensitivity of dual delta to strike price)', () => {
    const _dualGammaValue = OptionsGreeks.dualGamma(S, K, r, q, sigma, t);
    // TODO(Include assertions based on expected value)
  });
});
