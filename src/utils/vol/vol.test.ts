import { describe, it, expect } from 'vitest';
import { pi, sin, pow } from 'mathjs/number';
import { Brent } from './index';

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
