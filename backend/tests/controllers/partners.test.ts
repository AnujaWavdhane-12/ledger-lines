import { PartnerController } from "@/controllers/partners";
import { IDatabase } from "@/dependencies/database.interface";

describe("PartnerController", () => {
  let mockDatabase: jest.Mocked<IDatabase>;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
      connect: jest.fn(),
      close: jest.fn(),
      execute: jest.fn(),
    };
  });

  it("should generate a unique email address for the partner", async () => {
    // Arrange
    const controller = new PartnerController(mockDatabase, "testdomain.xdb");
    const user = {
      first_name: "John",
      last_name: "Doe",
    };
    jest.spyOn(controller, "generateSalt").mockReturnValue("mockedSalt");

    // Act
    const email = controller.generatePartnerSenderEmailAddress(user);

    // Assert
    expect(email).toBe("johndoe-mocke@testdomain.xdb");
  });

  it("Cleans a string for use in an email address", async () => {
    // Arrange
    const controller = new PartnerController(mockDatabase, "testdomain.xdb");
    const input = ["John Doe", "", " ", "@asefasio ", ""];
    const expected = ["johndoe", "", "", "asefasio", ""];

    for (let i = 0; i < input.length; i++) {
      // Act
      const cleaned = controller.cleanString(input[i]);
      // Assert
      expect(cleaned).toBe(expected[i]);
    }
  });
});
