import { AccountingController } from "@/controllers/accounting";

describe("AccountingController", () => {
  it("Creates a LedgerAccount object with createLedgerAccountObject", async () => {
    // Act
    const ledgerAccount = AccountingController.createLedgerAccountObject(
      {
        type: "asset",
        sub_type: "cash",
        transaction_category_id: 1,
        account_id: "abcdef",
        account_name: "Test Account",
        ledger_id: 1,
      },
      true,
      "type",
      "sub_type",
      {}
    );

    // Assert
    expect(ledgerAccount).not.toBeNull();
    expect(ledgerAccount.name).toBe("Test Account");
    expect(ledgerAccount.type).toBe("type");
    expect(ledgerAccount.sub_type).toBe("sub_type");
    expect(ledgerAccount.is_transfer_compatible).toBe(true);
    expect(ledgerAccount.ledger_account_data).toEqual({});
    expect(ledgerAccount.account_id).not.toBeNull();
  });

  it("Creates a valid LedgerAccount object with rowToLedgerAccount with QuickBooks account data", async () => {
    // Act
    const ledgerAccount = AccountingController.rowToLedgerAccount({
      account_type: "asset",
      account_sub_type: "cash",
      transaction_category_id: 1,
      account_id: "abcdef",
      account_name: "Test Account",
      ledger_id: "QuickBooks",
    });

    // Assert
    expect(ledgerAccount).not.toBeNull();
    expect(ledgerAccount.name).toBe("Test Account");
    expect(ledgerAccount.type).toBe("asset");
    expect(ledgerAccount.sub_type).toBe("cash");
    expect(ledgerAccount.is_transfer_compatible).toBe(false);
    expect(ledgerAccount.ledger_account_data).toEqual({
      AccountType: "asset",
      AccountSubType: "cash",
    });
    expect(ledgerAccount.account_id).toBe("abcdef");
  });

  it("Creates a valid LedgerAccount object with rowToLedgerAccount with Xero account data", async () => {
    // Act
    const ledgerAccount = AccountingController.rowToLedgerAccount({
      account_type: "asset",
      account_sub_type: "cash",
      transaction_category_id: 1,
      account_id: "abcdef",
      account_name: "Test Account",
      ledger_id: "Xero",
      ledger_account_data: {
        Type: "BANK",
        Class: "ASSET",
        BankAccountType: "BANK",
      },
    });

    // Assert
    expect(ledgerAccount).not.toBeNull();
    expect(ledgerAccount.name).toBe("Test Account");
    expect(ledgerAccount.type).toBe("Asset");
    expect(ledgerAccount.sub_type).toBe("Bank account");
    expect(ledgerAccount.is_transfer_compatible).toBe(true);
    expect(ledgerAccount.ledger_account_data).toEqual({
      Type: "BANK",
      Class: "ASSET",
      BankAccountType: "BANK",
    });
    expect(ledgerAccount.account_id).toBe("abcdef");
  });
});
