/**
 * An interface that all database connections must implement.
 * This is useful because we have multipe database engines, for
 * production we use mysql on aws, for unit testing we use sqlite.
 */
export interface IDatabase {
  /**
   * Connect to a database
   */
  connect(): Promise<IDatabase>;

  /**
   * Close this connection
   */
  close(): Promise<void>;

  /**
   * Execute a query. Intended for queries that runs a select statement (Data Query Language -DQL- statements)
   *
   * @param sql The query to run. Can accept prepared statement placeholders
   * @param values The values to replace the placeholders
   *
   * @returns an implementation specific object that contains the result of the query
   */
  query(
    sql: string,
    values: any | any[] | { [param: string]: any } | null
  ): Promise<Row[]>;

  /**
   * Execute a query. Intended for queries that modifies the database. (Data Manipulation Language -DML- statements)
   *
   * @param sql The query to run. Can accept prepared statement placeholders
   * @param values Placeholder valures
   *
   * @returns an object with the following values:
   *   - rows: The number of affected rows
   *   - lastInsertedId: the id of the last row created with an INSERT statement
   */
  execute(
    sql: string,
    values: any | any[] | { [param: string]: any }
  ): Promise<ExecuteResult>;
}

/**
 * A row in a database table, in the form of a key-value pair. Example:
 * @example
 * {
 *  id: 1,
 *  name: "John Doe",
 * }
 */
export interface Row {
  [key: string]: any;
}

/**
 * The result of a query that modifies the database
 */
export interface ExecuteResult {
  /**
   * The rows affected by the query. If the query does not have any row results, this value should be an empty array
   */
  rows: Row[];

  /**
   * The id of the last row inserted by the query, if any. This is useful for INSERT statements.
   * If the query is not an INSERT statement, this value should be null
   */
  lastInsertedId: any;
}
