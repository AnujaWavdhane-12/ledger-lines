import { IClock } from "./clock.interface";

/**
 * A real clock implementation, that is, every call to
 * `getCurrentTime()` will return the current date/time
 * by calling new Date()
 */
export class RealClock implements IClock {
  /**
   * Get the current time
   */
  public getCurrentTime(): Date {
    return new Date();
  }
}
