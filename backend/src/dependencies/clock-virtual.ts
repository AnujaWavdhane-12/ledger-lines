import { IClock } from "./clock.interface";

/**
 * A virtual clock implementation. It must be initialized with
 * a time, and every subsequent call to `getCurrentTime` will
 * return that time.
 */
export class VirtualClock implements IClock {
  private currentTime: Date;
  /**
   * Get the current virtual time.
   *
   */
  public getCurrentTime(): Date {
    if (!this.currentTime) {
      throw new Error("The virtual clock has not been set.");
    }
    return new Date(this.currentTime.getTime());
  }

  /**
   * Set the current Virtual Clock to return `date` as the current
   * date on every call.
   *
   * @param date A date
   */
  public setCurrentTime(date: Date) {
    this.currentTime = date;
  }
}
