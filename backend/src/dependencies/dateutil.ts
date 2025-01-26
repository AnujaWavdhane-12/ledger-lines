//
// Date utility functions
//

import dateFormat from "dateformat";
import { logger } from "./logger";

export class dateutils {
  public static tozulufroms(datetimestring: string): string {
    try {
      return dateFormat(Date.parse(`${datetimestring} GMT`), "isoUtcDateTime");
    } catch (dateFormatError) {
      return "-";
    }
  }

  public static datetimeToDatabase(dateTime: Date) {
    if (isNaN(dateTime.getTime())) {
      // this date is effectively null
      throw new Error("NaN date provided when parsing date to db");
    }

    return (
      `${dateTime.getUTCFullYear()}-${
        dateTime.getUTCMonth() + 1
      }-${dateTime.getUTCDate()}` +
      ` ${dateTime.getUTCHours()}:${dateTime.getUTCMinutes()}:${dateTime.getUTCSeconds()}`
    );
  }

  /**
   * Dates in the DB are UTC always, this turns that string into
   * a JavaScript Date
   *
   * @param date The string date as read from the DB
   */
  public static datetimeFromDatabase(date: string) {
    try {
      // Split timestamp into [ Y, M, D, h, m, s ]
      const dateParts = date.split(/[- :]/);
      if (dateParts.length === 3) {
        // missing h, m, s
        dateParts.push(...["00", "00", "00"]);
      }

      // Apply each element to the Date function
      return new Date(
        Date.UTC(
          Number(dateParts[0]),
          Number(dateParts[1]) - 1,
          Number(dateParts[2]),
          Number(dateParts[3]),
          Number(dateParts[4]),
          Number(dateParts[5])
        )
      );
    } catch (e) {
      logger.error(`Unable to parse the string into date: ${date}`);
      throw e;
    }
  }
}
