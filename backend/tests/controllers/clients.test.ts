import { ClientController } from "../../src/controllers/clients";
import { IDatabase } from "@/dependencies/database.interface";

describe("ClientsController", () => {
  it("Creates a client", async () => {
    // Arrange
    const conn: IDatabase = {
      execute: jest.fn(
        () =>
          new Promise((resolve, reject) =>
            resolve({ rows: [], lastInsertedId: "1" })
          )
      ),
      query: jest.fn(() => new Promise((resolve, reject) => resolve([]))),
      connect: jest.fn(() => new Promise((resolve, reject) => resolve(conn))),
      close: jest.fn(() => new Promise((resolve, reject) => resolve())),
    };

    const controller = new ClientController(conn);

    // Act
    const result = await controller.createClient({
      first_name: "John",
      last_name: "Doe",
      email: "john@doe.com",
      partner_uid: 1,
      organization: {
        name: "Test Organization",
      },
    });

    // Assert
    expect(result).not.toBeNull();
  });
});
