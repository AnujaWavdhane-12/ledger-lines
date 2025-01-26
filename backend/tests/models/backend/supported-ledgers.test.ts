import { SupportedLedgers, stringToSupportedLegder } from "@/models/backend";

describe("SupportedLedgers", () => {
  it("should have QuickBooks as 1", () => {
    expect(SupportedLedgers.QuickBooks).toBe(1);
  });

  it("should have Xero as 2", () => {
    expect(SupportedLedgers.Xero).toBe(2);
  });
});

describe("stringToSupportedLegder", () => {
  it("should return QuickBooks for 'QuickBooks'", () => {
    expect(stringToSupportedLegder("QuickBooks")).toBe(
      SupportedLedgers.QuickBooks
    );
  });

  it("should return Xero for 'Xero'", () => {
    expect(stringToSupportedLegder("Xero")).toBe(SupportedLedgers.Xero);
  });

  it("should throw an error for an unsupported ledger", () => {
    expect(() => stringToSupportedLegder("Unsupported")).toThrowError(
      "Unsupported ledger: Unsupported"
    );
  });

  it("should throw an error for a null ledger", () => {
    const ledger: any = null;
    expect(() => stringToSupportedLegder(ledger)).toThrowError(
      "Ledger is required"
    );
  });

  it("should throw an error for an undefined ledger", () => {
    const ledger: any = undefined;
    expect(() => stringToSupportedLegder(ledger)).toThrowError(
      "Ledger is required"
    );
  });
});
