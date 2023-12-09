import { abs, erf, exp, log, max, pi, pow, sqrt } from 'mathjs';

interface Market {
  t: number; // The current time in years, expressed as a decimal
  r: number; // r continuously compounded risk-free interest rate
}

interface Underlying {
  S_t: number; // Spot price of the underlying asset at time t
  mu: number; // μ or drift is the drift rate of the asset, 0 if assuming a risk neutral world
  sigma: number; // σ or volatility is the standard deviation of the assets' returns.
  q: number; // q continuously compounded dividend yield
}

// Enumeration for option type
enum OptionType {
  Call = 'call', // The option is a call
  Put = 'put', // The option is a put
}

interface OptionData {
  type: OptionType;
  T: number; // Time of expiration in years, expressed as a decimal
  K: number; // Strike price of the option
}

/**
 * Options Greeks and pricing calculations using the Black-Scholes model.
 */
class OptionsGreeks {
  /**
   * Calculates the cumulative distribution function for the standard normal distribution.
   * @param x The value to calculate the CDF for.
   * @returns The CDF of the standard normal distribution at x.
   */
  private static phi(x: number): number {
    return (1 + erf(x / sqrt(2))) / 2;
  }

  /**
   * Calculates the time to expiration for an option.
   * @param T The expiration time of the option.
   * @param t The current time.
   * @returns The time remaining until the option's expiration, in years.
   */
  public static tau(T: number, t: number): number {
    return max(0, T - t);
  }

  /**
   * Calculates the d1 component used in the Black-Scholes formula.
   * @param S_t The spot price of the underlying asset.
   * @param K The strike price of the option.
   * @param r The risk-free interest rate.
   * @param q The dividend yield.
   * @param sigma The volatility of the asset.
   * @param tau - The time to expiration.
   * @returns The d1 value.
   */
  private static d1(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    return (
      (log(S_t / K) + (r - q + pow(sigma, 2) / 2) * tau) / (sigma * sqrt(tau))
    );
  }

  /**
   * Calculates the d2 component used in the Black-Scholes formula.
   * @param d1 - The d1 value calculated from calculateD1.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration.
   * @returns The d2 value.
   */
  private static d2(d1: number, sigma: number, tau: number): number {
    return d1 - sigma * sqrt(tau);
  }

  /**
   * Calculates the fair value of a European call option using the Black-Scholes model.
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param S_t The current spot price of the underlying asset.
   * @param K The strike price of the option.
   * @param r The risk-free interest rate.
   * @param q The dividend yield.
   * @param sigma The volatility of the asset.
   * @param tau The time to expiration.
   * @returns The fair value of the call option.
   */
  public static blackScholesMerton(
    type: OptionType,
    S_t: number,
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
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    if (type === OptionType.Call) {
      // Calculate call option price
      return (
        S_t * exp(-q * tau) * this.phi(d1) - K * exp(-r * tau) * this.phi(d2)
      );
    } 
      // Calculate put option price
      return (
        K * exp(-r * tau) * this.phi(-d2) - S_t * exp(-q * tau) * this.phi(-d1)
      );
    
  }

  /**
   * Calculates the implied volatility of an option using the Newton-Raphson method.
   *
   * @param type The type of option: 'call' for a call option or 'put' for a put option.
   * @param marketPrice The current market price of the option.
   * @param S_t The current spot price of the underlying asset.
   * @param K The strike price of the option.
   * @param r The risk-free interest rate, expressed as a decimal.
   * @param q The dividend yield of the underlying asset, expressed as a decimal.
   * @param tau The time to expiration of the option, in years.
   * @returns The implied volatility as a decimal.
   */
  public static sigma(
    type: OptionType,
    marketPrice: number,
    S_t: number,
    K: number,
    r: number,
    q: number,
    tau: number,
  ): number {
    let sigma = 0.2; // Start with an initial guess for implied volatility
    let sigmaPrev = 0.0;
    const tolerance = 1e-5; // Set a tolerance level for convergence
    let priceDifference =
      marketPrice - this.blackScholesMerton(type, S_t, K, r, q, sigma, tau);

    // Iterate until the price difference is within the tolerance level
    while (abs(priceDifference) > tolerance) {
      const vega = this.vega(S_t, K, r, q, sigma, tau); // Calculate the vega of the option
      if (vega === 0) {
        throw 'Vega is zero. The Newton-Raphson method will not converge.';
      }
      sigmaPrev = sigma;
      // Adjust sigma by the Newton-Raphson step
      sigma = sigma - priceDifference / vega;

      // If the change in sigma is less than the tolerance, convergence is assumed
      if (abs(sigma - sigmaPrev) < tolerance) break;

      // Recalculate the price difference with the new sigma
      priceDifference =
        marketPrice - this.blackScholesMerton(type, S_t, K, r, q, sigma, tau);
    }

    return sigma; // Return the implied volatility
  }

  /**
   * Calculates the Delta (Δ) of a European option using the Black-Scholes model.
   * Delta measures the rate of change of the theoretical option value with respect to changes in the underlying asset's price.
   *
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - Time to expiration of the option, in years.
   * @returns {number} The delta of the option. For a call option, delta ranges between 0 and 1, and for a put option, it ranges between -1 and 0.
   *
   * @description
   * Practical use of delta includes understanding the equivalent stock position in an option. For example,
   * a delta of 0.5 suggests that the option's price will move $0.50 for every $1 move in the underlying asset.
   * Delta is also used for hedging strategies, where a position can be delta-hedged by taking positions in the underlying asset.
   */
  public static delta(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(S_t, K, r, q, sigma, tau);

    if (type === OptionType.Call) {
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
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The Vega of the option. This value is expressed as the amount of money per underlying share that the option's value will gain or lose as volatility rises or falls by 1 percentage point.
   *
   * @description
   * Vega is crucial for assessing how sensitive an option is to changes in the market volatility. It is especially important in volatile markets where option prices can be greatly affected by changes in volatility. For options strategies like straddles, where the outcome is heavily dependent on volatility, Vega can provide key insights into the potential risk and reward.
   */
  public static vega(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1
    const d1 = this.d1(S_t, K, r, q, sigma, tau);

    // Calculate Vega using the phi function for the standard normal probability density
    return (
      (S_t * exp(-q * tau) * sqrt(tau) * exp(-pow(d1, 2) / 2)) / sqrt(2 * pi)
    ); // Vega is often represented per 1% change in volatility, i.e., in decimal form
  }

  /**
   * Calculates the theta (Θ) of a European option, which measures the rate of change of the option's price
   * with respect to the passage of time, also known as time decay.
   *
   * @param type The type of option (call or put).
   * @param S_t The current spot price of the underlying asset.
   * @param K The strike price of the option.
   * @param r The risk-free interest rate.
   * @param q The dividend yield.
   * @param sigma The volatility of the asset.
   * @param tau The time to expiration in years.
   * @returns The theta value of the option. Theta is typically negative since options lose value as time passes.
   */
  public static theta(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 using the private methods for d1 and d2 calculation
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // Calculate the first part of the theta formula which is common between call and put
    const thetaCommon =
      (-S_t * sigma * exp(-q * tau) * this.phi(d1)) / (2 * sqrt(tau));

    // Depending on the option type calculate the rest of the theta value
    if (type === OptionType.Call) {
      // Call option theta formula
      return thetaCommon - r * K * exp(-r * tau) * this.phi(d2);
    } 
      // Put option theta formula
      return thetaCommon + r * K * exp(-r * tau) * this.phi(-d2);
    
  }

  /**
   * Calculates the Rho of a European option, which measures the sensitivity of the option's price to changes in the risk-free interest rate.
   *
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The rho of the option. It is expressed as the amount of money, per share of the underlying,
   * that the value of the option will gain or lose as the risk-free interest rate rises or falls by 1.0% per annum (100 basis points).
   *
   * @description
   * Rho is typically the least sensitive of the Greeks and is often overlooked by traders. However, in environments where
   * interest rate shifts are expected, understanding rho can be crucial. It is particularly relevant for longer-term options
   * where a shift in interest rates could have a more pronounced effect on the option's value.
   */
  public static rho(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    if (type === OptionType.Call) {
      // Rho for a Call option
      return K * tau * exp(-r * tau) * this.phi(d2);
    } 
      // Rho for a Put option
      return -K * tau * exp(-r * tau) * this.phi(-d2);
    
  }

  /**
   * Calculates the Epsilon (ε) of a European option, which measures the sensitivity of the option's price to a change in the underlying asset's dividend yield.
   *
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The epsilon of the option, representing the sensitivity to the dividend yield.
   *
   * @description
   * Epsilon is a lesser-known Greek that indicates the rate of change of the option's price relative to the dividend yield of the underlying asset.
   * It is particularly useful for options on assets with high dividend yields. A positive epsilon for a call option suggests that its price increases
   * with a decrease in dividend yield, while a negative epsilon indicates the price decreases as the dividend yield rises.
   */
  public static epsilon(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(S_t, K, r, q, sigma, tau);

    if (type === OptionType.Call) {
      // Epsilon for a Call option
      return -S_t * tau * exp(-q * tau) * this.phi(d1);
    } 
      // Epsilon for a Put option
      return S_t * tau * exp(-q * tau) * this.phi(-d1);
    
  }

  /**
   * Calculates the Lambda (Λ), also known as elasticity or omega, of a European option.
   * Lambda measures the percentage change in option value per percentage change in the underlying asset price.
   *
   * @param {OptionType} type - The type of option ('call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset's returns.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The lambda (elasticity) of the option.
   *
   * @description
   * Lambda is a measure of leverage indicating how much the value of an option will change in response to a 1% change
   * in the price of the underlying asset. It is similar to Delta but expressed in percentage terms.
   */
  public static lambda(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the fair value of the option using the Black-Scholes formula
    const optionValue = this.blackScholesMerton(type, S_t, K, r, q, sigma, tau);

    // Calculate Delta as it is part of the Lambda formula
    const optionDelta = this.delta(type, S_t, K, r, q, sigma, tau);

    // Lambda is calculated as Delta times the ratio of the spot price to the option value
    return optionDelta * (S_t / optionValue);
  }

  /**
   * Calculates the Gamma (Γ) of a European option using the Black-Scholes model.
   * Gamma measures the rate of change of the option's delta with respect to changes in the underlying asset's price.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The gamma of the option.
   *
   * @description
   * Gamma is used to measure the curvature of the value of an option relative to the underlying asset's price.
   * It is highest for at-the-money options and decreases as the option becomes more in-the-money or out-of-the-money.
   * Gamma is important for understanding the stability of an option's Delta, as well as the potential for
   * an option's price to move in relation to movements in the underlying asset.
   */
  public static gamma(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 using the existing method for d1 calculation
    const d1 = this.d1(S_t, K, r, q, sigma, tau);

    // Calculate the probability density function of d1
    const pdf_d1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);

    // Calculate Gamma using the standard normal probability density function (pdf)
    return (exp(-q * tau) * pdf_d1) / (S_t * sigma * sqrt(tau));
  }

  /**
   * Calculates the Vanna of a European option, a second-order derivative that measures the sensitivity of the option's delta
   * to changes in the underlying asset's volatility, and vice versa. It's an important measure for assessing the risk and
   * hedging strategies related to changes in volatility and the underlying asset price.
   *
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The vanna of the option, which represents the rate of change of delta with respect to volatility.
   *
   * @description
   * Vanna is useful for traders who maintain delta- or vega-hedged portfolios as it helps to anticipate how the hedge
   * might perform as volatility changes or as the underlying asset price changes. It is calculated by taking the
   * partial derivative of vega with respect to the underlying asset price, which is also equal to the partial derivative
   * of delta with respect to volatility.
   */
  public static vanna(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the required d1, d2 and vega values
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);
    const vega = this.vega(S_t, K, r, q, sigma, tau);

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
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The charm of the option, representing the rate of change of delta over time.
   *
   * @description
   * Charm is a second-order derivative of the option value, once to the price and once to the passage of time.
   * It is the partial derivative of theta with respect to the underlying's price. This Greek is essential
   * for monitoring the effectiveness of delta-hedging strategies, especially over weekends or other periods
   * without trading.
   */
  public static charm(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // The common term in the Charm formula for both call and put options
    const commonTerm =
      -exp(-q * tau) *
      this.phi(d1) *
      ((2 * (r - q) * tau - d2 * sigma * sqrt(tau)) /
        (2 * tau * sigma * sqrt(tau)));

    if (type === OptionType.Call) {
      // Charm for a Call option
      return commonTerm;
    } 
      // Charm for a Put option, need to adjust the sign for the second term
      return commonTerm - q * exp(-q * tau) * this.phi(-d1);
    
  }

  /**
   * Calculates the Vomma of a European option, which measures the rate of change of Vega with respect to changes in volatility.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The vomma of the option.
   *
   * @description
   * Vomma is a second-order Greek that measures the convexity of Vega. A positive vomma indicates that an option's Vega will
   * increase as volatility increases, suggesting that the option's price is becoming more sensitive to changes in volatility.
   * This is analogous to having a long gamma position. Vomma is particularly important for traders managing large portfolios
   * of options, where volatility risk can have a significant impact on the overall value.
   */
  public static vomma(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate the d1 and d2 values using previously defined methods
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // Calculate Vega as it is required for the vomma calculation
    const vega = this.vega(S_t, K, r, q, sigma, tau);

    // Vomma is Vega times the d1 and d2 divided by volatility
    return vega * ((d1 * d2) / sigma);
  }

  /**
   * Calculates the Veta of a European option, which measures the rate of change in the option's vega
   * with respect to the passage of time. Veta is the second derivative of the option value function
   * with respect to volatility and time.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The veta of the option, representing the sensitivity of vega to the passage of time.
   *
   * @description
   * Veta is useful for understanding how the option's sensitivity to volatility (vega) changes as time passes.
   * This can be particularly important in dynamic hedging strategies where the passage of time affects the
   * effectiveness of a vega hedge. It is often used in conjunction with theta to manage the time and volatility
   * decay of an option's price.
   */
  public static veta(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    // Calculate d1 and d2 components used in the Black-Scholes model
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);

    // Calculate the Vega of the option
    const vega = this.vega(S_t, K, r, q, sigma, tau);

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
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The value of the pdf at the strike price.
   */
  public static phiK(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const part1 = exp(-r * tau) / (K * sqrt(2 * pi * sigma * sigma * tau));
    const part2 = exp(
      -pow(log(K / S_t) - (r - q - (sigma * sigma) / 2) * tau, 2) /
        (2 * sigma * sigma * tau),
    );

    return part1 * part2;
  }

  /**
   * Calculates the Speed of a European option, which measures the rate of change of Gamma with respect to changes in the underlying asset's price.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The speed of the option.
   */
  public static speed(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const pdf_d1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);
    const term =
      -exp(-q * tau) *
      pdf_d1 *
      (d1 / (sigma * sigma * tau) + 1 / (S_t * sigma * sqrt(tau)));

    return term / (S_t * S_t);
  }

  /**
   * Calculates the Zomma of a European option, which measures the rate of change of Gamma with respect to changes in volatility.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The zomma of the option.
   */
  public static zomma(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const gamma = this.gamma(S_t, K, r, q, sigma, tau);
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = d1 - sigma * sqrt(tau);

    return gamma * ((d1 * d2 - 1) / sigma);
  }

  /**
   * Calculates the Color of a European option, which measures the rate of change of Gamma with respect to the passage of time.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The color of the option.
   */
  public static color(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const pdf_d1 = exp(-pow(d1, 2) / 2) / sqrt(2 * pi);
    const term1 =
      2 * q * tau +
      1 -
      (d1 * (2 * (r - q) * tau - d2 * sigma * sqrt(tau))) / (sigma * sqrt(tau));

    return (
      (-exp(-q * tau) * pdf_d1 * term1) / (2 * S_t * tau * sigma * sqrt(tau))
    );
  }

  /**
   * Calculates the Ultima of a European option, which measures the sensitivity of the option's Vega to changes in volatility.
   * Ultima is a third-order Greek that gives the rate of change of Vomma with respect to changes in volatility.
   *
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The ultima of the option.
   */
  public static ultima(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d1 = this.d1(S_t, K, r, q, sigma, tau);
    const d2 = this.d2(d1, sigma, tau);
    const vega = this.vega(S_t, K, r, q, sigma, tau);
    const vomma = this.vomma(S_t, K, r, q, sigma, tau);

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
   * @param {OptionType} type - The type of option (either 'call' or 'put').
   * @param {number} S_t - The current spot price of the underlying asset.
   * @param {number} K - The strike price of the option.
   * @param {number} r - The risk-free interest rate.
   * @param {number} q - The dividend yield of the underlying asset.
   * @param {number} sigma - The volatility of the asset.
   * @param {number} tau - The time to expiration of the option, in years.
   * @returns {number} The dual delta of the option.
   */
  public static dualDelta(
    type: OptionType,
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d2 = this.d2(this.d1(S_t, K, r, q, sigma, tau), sigma, tau);

    if (type === OptionType.Call) {
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
   * @param S_t - The current spot price of the underlying asset.
   * @param K - The strike price of the option.
   * @param r - The risk-free interest rate.
   * @param q - The dividend yield of the underlying asset.
   * @param sigma - The volatility of the asset.
   * @param tau - The time to expiration of the option, in years.
   * @returns The dual gamma of the option.
   */
  public static dualGamma(
    S_t: number,
    K: number,
    r: number,
    q: number,
    sigma: number,
    tau: number,
  ): number {
    const d2 = this.d2(this.d1(S_t, K, r, q, sigma, tau), sigma, tau);
    const pdf_d2 = exp(-pow(d2, 2) / 2) / sqrt(2 * pi);

    // Dual Gamma calculation
    return (exp(-r * tau) * pdf_d2) / (K * sigma * sqrt(tau));
  }
}

export default OptionsGreeks;
