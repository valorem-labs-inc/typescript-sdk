import { abs, erf, exp, log, max, pi, pow, sqrt } from 'mathjs/number';

// IMPORTANT: This file is brand new and has not been tested yet.
// take everything in it with a whole block of salt.
// TODOs:
// - memoize the output of pure functions
// - make sure functions are using more primitive functions where possible
// - add helpers to have interfaces work with functions

interface Market {
  t: number; // The current time in years, expressed as a decimal
  r: number; // r continuously compounded risk-free interest rate
}

interface Underlying {
  st: number; // Spot price of the underlying asset at time t
  mu: number; // μ or drift is the drift rate of the asset, 0 if assuming a risk neutral world
  sigma: number; // σ or volatility is the standard deviation of the assets' returns.
  q: number; // q continuously compounded dividend yield
}

// Enumeration for option type
enum TypeOfOption {
  Call = 'call', // The option is a call
  Put = 'put', // The option is a put
}

interface OptionData {
  type: TypeOfOption;
  T: number; // Time of expiration in years, expressed as a decimal
  K: number; // Strike price of the option
}

class Brent {
  private readonly maxIter: number;
  private readonly accuracy: number;

  constructor(accuracy = 1e-15) {
    this.maxIter = 100;
    this.accuracy = accuracy;
  }

  public findRoot(f: (x: number) => number, a: number, b: number): number {
    let ia = a;
    let ib = b;
    let fa = f(ia);
    let fb = f(ib);

    if (fa * fb >= 0) {
      throw new Error(
        'Function values at the interval endpoints must bracket the root.',
      );
    }

    if (abs(fa) < abs(fb)) {
      [ia, ib] = [ib, ia];
      [fa, fb] = [fb, fa];
    }

    let c = ia;
    let fc = fa;
    let s = ib;
    let fs = fb;
    let d = c;
    let mflag = true;

    for (let i = 0; i < this.maxIter; i++) {
      if (abs(ib - ia) < this.accuracy) {
        return s; // The root has been found with sufficient accuracy.
      } else if (fb === 0 && i !== 1) {
        return ib; // The root has been found exactly.
      } else if (fs === 0 && i !== 1) {
        return s; // The root has been found exactly.
      }

      if (fa !== fc && fb !== fc) {
        // Inverse quadratic interpolation.
        s =
          (ia * fb * fc) / ((fa - fb) * (fa - fc)) +
          (ib * fa * fc) / ((fb - fa) * (fb - fc)) +
          (c * fa * fb) / ((fc - fa) * (fc - fb));
      } else {
        // Secant method.
        s = ib - (fb * (ib - ia)) / (fb - fa);
      }

      const condition1 = !(s >= (3 * ia + ib) / 4 && s <= ib);
      const condition2 = mflag && abs(s - ib) >= abs(ib - c) / 2;
      const condition3 = !mflag && abs(s - ib) >= abs(c - d) / 2;
      const condition4 = mflag && abs(ib - c) < abs(this.accuracy);
      const condition5 = !mflag && abs(c - d) < abs(this.accuracy);

      if (condition1 || condition2 || condition3 || condition4 || condition5) {
        // Bisection method.
        s = (ia + ib) / 2;
        mflag = true;
      } else {
        mflag = false;
      }

      fs = f(s);
      d = c;
      c = ib;
      fc = fb;

      if (fa * fs < 0) {
        ib = s;
        fb = fs;
      } else {
        ia = s;
        fa = fs;
      }

      if (Math.abs(fa) < Math.abs(fb)) {
        [ia, ib] = [ib, ia];
        [fa, fb] = [fb, fa];
      }
    }

    throw new Error('Maximum number of iterations exceeded.');
  }
}

/**
 * Options Greeks and pricing calculations using the Black-Scholes model.
 */
// This is a class both for organization and future development plans.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class OptionsGreeks {
  /**
   * Calculates the cumulative distribution function for the standard normal distribution.
   * @param x - The value to calculate the CDF for.
   * @returns The CDF of the standard normal distribution at x.
   */
  public static phi(x: number): number {
    return (1 + erf(x / sqrt(2))) / 2;
  }

  /**
   * Calculates the time to expiration for an option.
   * @param T - The expiration time of the option.
   * @param t - The current time.
   * @returns The time remaining until the option's expiration, in years.
   */
  public static tau(T: number, t: number): number {
    return max(0, T - t);
  }

  /**
   * Calculates the d1 component used in the Black-Scholes formula.
   * @param st - The spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration.
   * @returns The d1 value.
   */
  public static d1(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    return (
      (log(st / K) + (r - q + pow(sigma, 2) / 2) * tau) / (sigma * sqrt(tau))
    );
  }

  /**
   * Calculates the d2 component used in the Black-Scholes formula.
   * @param d1 - The d1 value calculated from calculateD1.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration.
   * @returns The d2 value.
   */
  public static d2(d1: number, sigma: number, tau: number): number {
    return d1 - sigma * sqrt(tau);
  }

  /**
   * Calculates the fair value of a European call option using the Black-Scholes model.
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration.
   * @returns The fair value of the option.
   */
  public static blackScholesMerton(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Check for an expired option
    if (tau <= 0) {
      return 0;
    }

    // Calculate d1 and d2
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    if (type === TypeOfOption.Call) {
      // Calculate call option price
      return (
        st * exp(-q * tau) * this.phi(d1) - K * exp(-r * tau) * this.phi(d2)
      );
    }
    // Calculate put option price
    return (
      K * exp(-r * tau) * this.phi(-d2) - st * exp(-q * tau) * this.phi(-d1)
    );
  }

  /**
   * Calculates the implied volatility, or sigma, of an option using the Brent method.
   *
   * @param type - The type of option: 'call' for a call option or 'put' for a put option.
   * @param marketPrice - The current market price of the option.
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate, expressed as a decimal.
   * @param q - The dividend yield of the underlying asset, expressed as a decimal.
   * @param T - The time to expiration of the option, in years.
   * @returns The implied volatility as a decimal.
   */
  public static sigma(
    type: TypeOfOption,
    marketPrice: number,
    st: number,
    K: number,
    r: number,
    q: number,
    T: number,
  ): number {
    const brent = new Brent();
    const lowerBound = 0.001; // Lower bound for volatility search
    const upperBound = 5.0; // Upper bound for volatility search

    // Function for Brent's method to find the root
    const marketPriceDelta = (sigma: number) => {
      const optionPrice = this.blackScholesMerton(type, st, K, r, q, sigma, T);
      return optionPrice - marketPrice;
    };

    // Use Brent's method to find the implied volatility
    const impliedVolatility = brent.findRoot(
      marketPriceDelta,
      lowerBound,
      upperBound,
    );

    // Check if the implied volatility is within a reasonable range
    if (impliedVolatility < lowerBound || impliedVolatility > upperBound) {
      throw new Error('Implied volatility is outside the expected range.');
    }

    return impliedVolatility;
  }

  /**
   * Calculates the Delta (Δ) of a European option using the Black-Scholes model.
   * Delta measures the rate of change of the theoretical option value with respect to changes in the underlying asset's price.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - Time to expiration of the option, in years.
   * @returns The delta of the option. For a call option, delta ranges between 0 and 1, and for a put option, it ranges between -1 and 0.
   *
   * Practical use of delta includes understanding the equivalent stock position in an option. For example,
   * a delta of 0.5 suggests that the option's price will move $0.50 for every $1 move in the underlying asset.
   * Delta is also used for hedging strategies, where a position can be delta-hedged by taking positions in the underlying asset.
   */
  public static delta(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(st, K, r, q, sigma, tau);

    if (type === TypeOfOption.Call) {
      // Delta for a Call option
      return exp(-q * tau) * this.phi(d1);
    }
    // Delta for a Put option
    return -exp(-q * tau) * this.phi(-d1);
  }

  /**
   * Calculates the Vega of a European option, which measures the sensitivity of the option's price to changes in the volatility of the underlying asset.
   * Vega represents the amount the option's price changes for a 1 percentage point change in the volatility.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The Vega of the option, expressed as the amount the option's price will change per 1 percentage point change in volatility.
   */
  public static vega(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1
    const d1 = this.d1(st, K, r, q, sigma, tau);

    // Calculate Vega using the phi function for the standard normal probability density
    const vegaValue =
      (st * exp(-q * tau) * sqrt(tau) * exp(-pow(d1, 2) / 2)) / sqrt(2 * pi);

    // Adjust the Vega value to be per 1% change in volatility
    return vegaValue * 0.01;
  }

  /**
   * Calculates the theta (Θ) of a European option, which measures the rate of change of the option's price
   * with respect to the passage of time, also known as time decay.
   *
   * @param type - The type of option (call or put).
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration in years.
   * @returns The theta value of the option. Theta is typically negative since options lose value as time passes.
   */
  public static theta(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 using the private methods for d1 and d2 calculation
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);
    const pdfD1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);

    // Calculate the first part of the theta formula which is common between call and put
    const thetaCommon = (st * exp(-q * tau) * pdfD1 * sigma) / (2 * sqrt(tau));

    // Depending on the option type calculate the rest of the theta value
    if (type === TypeOfOption.Call) {
      // Call option theta formula
      const secondTerm = -q * st * exp(-q * tau) * this.phi(d1);
      const thirdTerm = r * K * exp(-r * tau) * this.phi(d2);
      return -(thetaCommon + secondTerm + thirdTerm);
    }
    // Put option theta formula
    const secondTerm = -q * st * exp(-q * tau) * this.phi(-d1);
    const thirdTerm = r * K * exp(-r * tau) * this.phi(-d2);
    return -thetaCommon + secondTerm + thirdTerm;
  }

  /**
   * Calculates the Rho of a European option, which measures the sensitivity of the option's price to changes in the risk-free interest rate.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The rho of the option. It is expressed as the amount of money, per share of the underlying,
   * that the value of the option will gain or lose as the risk-free interest rate rises or falls by 1 basis point per annum.
   *
   * Rho is typically the least sensitive of the Greeks and is often overlooked by traders. However, in environments where
   * interest rate shifts are expected, understanding rho can be crucial. It is particularly relevant for longer-term options
   * where a shift in interest rates could have a more pronounced effect on the option's value.
   */
  public static rho(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    if (type === TypeOfOption.Call) {
      // Rho for a Call option
      return K * tau * exp(-r * tau) * this.phi(d2) * 0.01;
    }
    // Rho for a Put option
    return -K * tau * exp(-r * tau) * this.phi(-d2) * 0.01;
  }

  /**
   * Calculates the Epsilon (ε) of a European option, which measures the sensitivity of the option's price to a change in the underlying asset's dividend yield.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The epsilon of the option, representing the sensitivity to the dividend yield.
   *
   * Epsilon is a lesser-known Greek that indicates the rate of change of the option's price relative to the dividend yield of the underlying asset.
   * It is particularly useful for options on assets with high dividend yields. A positive epsilon for a call option suggests that its price increases
   * with a decrease in dividend yield, while a negative epsilon indicates the price decreases as the dividend yield rises.
   */
  public static epsilon(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(st, K, r, q, sigma, tau);

    if (type === TypeOfOption.Call) {
      // Epsilon for a Call option
      return -st * tau * exp(-q * tau) * this.phi(d1);
    }
    // Epsilon for a Put option
    return st * tau * exp(-q * tau) * this.phi(-d1);
  }

  /**
   * Calculates the Lambda (Λ), also known as elasticity or omega, of a European option.
   * Lambda measures the percentage change in option value per percentage change in the underlying asset price.
   *
   * @param type - The type of option ('call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset's returns.
   * @param tau - The time to expiration of the option, in years.
   * @returns The lambda (elasticity) of the option.
   *
   * Lambda is a measure of leverage indicating how much the value of an option will change in response to a 1% change
   * in the price of the underlying asset. It is similar to Delta but expressed in percentage terms.
   */
  public static lambda(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the fair value of the option using the Black-Scholes formula
    const optionValue = this.blackScholesMerton(type, st, K, r, q, sigma, tau);

    // Calculate Delta as it is part of the Lambda formula
    const optionDelta = this.delta(type, st, K, r, q, sigma, tau);

    // Lambda is calculated as Delta times the ratio of the spot price to the option value
    return optionDelta * (st / optionValue);
  }

  /**
   * Calculates the Gamma (Γ) of a European option using the Black-Scholes model.
   * Gamma measures the rate of change of the option's delta with respect to changes in the underlying asset's price.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The gamma of the option.
   *
   * Gamma is used to measure the curvature of the value of an option relative to the underlying asset's price.
   * It is highest for at-the-money options and decreases as the option becomes more in-the-money or out-of-the-money.
   * Gamma is important for understanding the stability of an option's Delta, as well as the potential for
   * an option's price to move in relation to movements in the underlying asset.
   */
  public static gamma(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 using the existing method for d1 calculation
    const d1 = this.d1(st, K, r, q, sigma, tau);

    // Calculate the probability density function of d1
    const pdfD1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);

    // Calculate Gamma using the standard normal probability density function (pdf)
    return (exp(-q * tau) * pdfD1) / (st * sigma * sqrt(tau));
  }

  /**
   * Calculates the Vanna of a European option, a second-order derivative that measures the sensitivity of the option's delta
   * to changes in the underlying asset's volatility, and vice versa. It's an important measure for assessing the risk and
   * hedging strategies related to changes in volatility and the underlying asset price.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The vanna of the option, which represents the rate of change of delta with respect to volatility.
   *
   * Vanna is useful for traders who maintain delta- or vega-hedged portfolios as it helps to anticipate how the hedge
   * might perform as volatility changes or as the underlying asset price changes. It is calculated by taking the
   * partial derivative of vega with respect to the underlying asset price, which is also equal to the partial derivative
   * of delta with respect to volatility.
   */
  public static vanna(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the required d1, d2 and vega values
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const vega = this.vega(st, K, r, q, sigma, tau);

    // Calculate Vanna
    // Vanna is a second order cross derivative of the option value: ∂V/∂σ∂S
    // It can also be represented as: -e^(-qt) * phi(d1) * d2/σ
    // Which simplifies to vega * (1 - d1/(sigma * sqrt(tau))) due to Black-Scholes model properties
    return vega * (1 - d1 / (sigma * sqrt(tau)));
  }

  /**
   * Calculates the Charm of an option, which measures the rate of change of Delta over the passage of time.
   * Charm, also known as delta decay, is particularly useful when delta-hedging over periods where time decay is relevant.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The charm of the option, representing the rate of change of delta over time.
   *
   * Charm is a second-order derivative of the option value, once to the price and once to the passage of time.
   * It is the partial derivative of theta with respect to the underlying's price. This Greek is essential
   * for monitoring the effectiveness of delta-hedging strategies, especially over weekends or other periods
   * without trading.
   */
  public static charm(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // The common term in the Charm formula for both call and put options
    const commonTerm =
      -exp(-q * tau) *
      this.phi(d1) *
      ((2 * (r - q) * tau - d2 * sigma * sqrt(tau)) /
        (2 * tau * sigma * sqrt(tau)));

    if (type === TypeOfOption.Call) {
      // Charm for a Call option
      return commonTerm;
    }
    // Charm for a Put option, need to adjust the sign for the second term
    return commonTerm - q * exp(-q * tau) * this.phi(-d1);
  }

  /**
   * Calculates the Vomma of a European option, which measures the rate of change of Vega with respect to changes in volatility.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The vomma of the option.
   *
   * Vomma is a second-order Greek that measures the convexity of Vega. A positive vomma indicates that an option's Vega will
   * increase as volatility increases, suggesting that the option's price is becoming more sensitive to changes in volatility.
   * This is analogous to having a long gamma position. Vomma is particularly important for traders managing large portfolios
   * of options, where volatility risk can have a significant impact on the overall value.
   */
  public static vomma(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the d1 and d2 values using previously defined methods
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // Calculate Vega as it is required for the vomma calculation
    const vega = this.vega(st, K, r, q, sigma, tau);

    // Vomma is Vega times the d1 and d2 divided by volatility
    return vega * ((d1 * d2) / sigma);
  }

  /**
   * Calculates the Veta of a European option, which measures the rate of change in the option's vega
   * with respect to the passage of time. Veta is the second derivative of the option value function
   * with respect to volatility and time.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The veta of the option, representing the sensitivity of vega to the passage of time.
   *
   * Veta is useful for understanding how the option's sensitivity to volatility (vega) changes as time passes.
   * This can be particularly important in dynamic hedging strategies where the passage of time affects the
   * effectiveness of a vega hedge. It is often used in conjunction with theta to manage the time and volatility
   * decay of an option's price.
   */
  public static veta(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // Calculate the Vega of the option
    const vega = this.vega(st, K, r, q, sigma, tau);

    // Calculate Veta, which is the rate of change of Vega with respect to time
    return (
      -vega *
      (q + ((r - q) * d1) / (sigma * sqrt(tau)) - (1 + d1 * d2) / (2 * tau))
    );
  }

  /**
   * Calculates the probability density function (pdf) of the asset price in the Black-Scholes model at strike price K.
   * This is used in the calculation of various option Greeks and is also sometimes referred to as 'phi' or 'ϕ'.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The value of the pdf at the strike price.
   */
  public static phiK(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const part1 = exp(-r * tau) / (K * sqrt(2 * pi * sigma * sigma * tau));
    const part2 = exp(
      -pow(log(K / st) - (r - q - (sigma * sigma) / 2) * tau, 2) /
        (2 * sigma * sigma * tau),
    );

    return part1 * part2;
  }

  /**
   * Calculates the Speed of a European option, which measures the rate of change of Gamma with respect to changes in the underlying asset's price.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The speed of the option.
   */
  public static speed(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const pdfD1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);
    const term =
      -exp(-q * tau) *
      pdfD1 *
      (d1 / (sigma * sigma * tau) + 1 / (st * sigma * sqrt(tau)));

    return term / (st * st);
  }

  /**
   * Calculates the Zomma of a European option, which measures the rate of change of Gamma with respect to changes in volatility.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The zomma of the option.
   */
  public static zomma(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const gamma = this.gamma(st, K, r, q, sigma, tau);
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = d1 - sigma * sqrt(tau);

    return gamma * ((d1 * d2 - 1) / sigma);
  }

  /**
   * Calculates the Color of a European option, which measures the rate of change of Gamma with respect to the passage of time.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The color of the option.
   */
  public static color(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);
    const pdfD1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);
    const term1 =
      2 * q * tau +
      1 -
      (d1 * (2 * (r - q) * tau - d2 * sigma * sqrt(tau))) / (sigma * sqrt(tau));

    return (
      (-exp(-q * tau) * pdfD1 * term1) / (2 * st * tau * sigma * sqrt(tau))
    );
  }

  /**
   * Calculates the Ultima of a European option, which measures the sensitivity of the option's Vega to changes in volatility.
   * Ultima is a third-order Greek that gives the rate of change of Vomma with respect to changes in volatility.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The ultima of the option.
   */
  public static ultima(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(st, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);
    const vomma = this.vomma(st, K, r, q, sigma, tau);

    // Ultima calculation
    const ultima =
      (-vomma * (d1 * d2 * (1 - d1 * d2) + d1 * d1 + d2 * d2)) /
      (sigma * sigma);
    return ultima;
  }

  /**
   * Calculates the Dual Delta of a European option, which measures the sensitivity of the option's price to changes in the strike price.
   * Dual Delta is important for understanding how the option's price will change as the strike price is adjusted, holding the underlying
   * asset's price fixed.
   *
   * @param type - The type of option (either 'call' or 'put').
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The dual delta of the option.
   */
  public static dualDelta(
    type: TypeOfOption,
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d2 = this.d2(this.d1(st, K, r, q, sigma, tau), sigma, tau);

    if (type === TypeOfOption.Call) {
      // Dual Delta for a Call option
      return -exp(-r * tau) * this.phi(d2);
    }
    // Dual Delta for a Put option
    return exp(-r * tau) * this.phi(-d2);
  }

  /**
   * Calculates the Dual Gamma of a European option, which measures the rate of change of the option's Dual Delta with respect to changes
   * in the strike price. Dual Gamma provides insight into the convexity of the option's value with respect to the strike price.
   *
   * @param st - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The dual gamma of the option.
   */
  public static dualGamma(
    st: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d2 = this.d2(this.d1(st, K, r, q, sigma, tau), sigma, tau);
    const pdfD2 = exp(-pow(d2, 2) / 2) / sqrt(2 * pi);

    // Dual Gamma calculation
    return (exp(-r * tau) * pdfD2) / (K * sigma * sqrt(tau));
  }
}

export { OptionsGreeks, TypeOfOption, Brent };
export type { Market, Underlying, OptionData };
