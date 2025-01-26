import { IDatabase, Row, ExecuteResult } from "./database.interface";
import * as sqlite3 from 'sqlite3';
import { logger } from "./logger";
const fs = require("fs").promises;

/**
 * SQLite compiled to JavaScript
 */
export class SQLiteDatabaseConnection implements IDatabase {
  private static instance: SQLiteDatabaseConnection;
  private connection: any;
  private readonly dbPath = './data/propio.db';
  private static initialized = false;

  private constructor() {
    // Ensure the data directory exists
    const dir = './data';
    if (!require('fs').existsSync(dir)){
      require('fs').mkdirSync(dir);
    }
  }

  public static async getInstance(): Promise<SQLiteDatabaseConnection> {
    if (!SQLiteDatabaseConnection.instance) {
      SQLiteDatabaseConnection.instance = new SQLiteDatabaseConnection();
      await SQLiteDatabaseConnection.instance.connect();
    }
    return SQLiteDatabaseConnection.instance;
  }

  public async connect(): Promise<IDatabase> {
    try {
      this.connection = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err);
          throw err;
        }
        console.log('Connected to the SQLite database.');
      });
    } catch (e) {
      console.error("Unable to connect to the database", e);
      throw e;
    }

    try {
      if (!SQLiteDatabaseConnection.initialized) {
        await this.load();
        SQLiteDatabaseConnection.initialized = true;
      }
    } catch (e) {
      console.error("Unable to load the database database", e);
      throw e;
    }

    return this;
  }

  /**
   * Load the main database sql script and create the database
   * in the in-memory sqlite database.
   *
   * @returns void
   */
  public async load(): Promise<void> {
    let fileContents = "";

    try {
      fileContents = await fs.readFile("database.sql", "utf8");
    } catch (err) {
      console.error(err);
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        this.connection.exec(fileContents, (err: Error) => {
          if (err) {
            console.error("===========================");
            console.error("Unable to initialize the DB", err);
            console.error("===========================");
            reject(err);
          } else {
            console.log("===========================");
            console.log("Successfully initialized the DB");
            console.log("===========================");
            resolve();
          }
        });
      });
    } catch (e) {
      throw e;
    }
  }

  public async close(): Promise<void> {
    this.connection.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }

  /**
   * Querying the DB returns the data in a separate column, and
   * value form. We preffer the data to be key-value. So this
   * utility function will do that.
   */
  private serialize(data: any): Row[] {
    // The database returns data in the following format:
    // [
    //     {
    //         "columns": [ "id", "name" ],
    //         "values": [
    //             [ 1, "doggo" ],
    //             [ 2, "porkbun" ]
    //         ]
    //     }
    // ]

    const result: Row[] = [];
    for (let i = 0; i < data[0]["values"].length; i++) {
      const row = {};
      for (let j = 0; j < data[0]["columns"].length; j++) {
        row[data[0]["columns"][j]] = data[0]["values"][i][j];
      }
      result.push(row);
    }
    return result;
  }

  public async execute(
    sql: string,
    values: any | any[] | { [param: string]: any }
  ): Promise<ExecuteResult> {
    return new Promise((resolve, reject) => {
      this.connection.run(sql, values, function(err: Error) {
        if (err) {
          reject(err);
        } else {
          resolve({
            rows: [],
            lastInsertedId: this.lastID
          });
        }
      });
    });
  }

  public async query(
    sql: string,
    values: any | any[] | { [param: string]: any }
  ): Promise<Row[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(sql, values, (err, rows) => {
        if (err) {
          console.error('Error executing query:', err.message);
          logger.error(err)
          reject(err)
        } else {
          resolve(rows)
        }
      });
    });
  }
}
