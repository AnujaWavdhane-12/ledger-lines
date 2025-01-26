/**
 * This is an interface for Clocks. Clocks just give the current time.
 * Having this as a depenency is useful, because we have lots of time
 * based operations, and faking the current time is very useful for
 * unit tests.
 */
export interface IClock {
  /**
   * Get the current time
   */
  getCurrentTime(): Date;
}
