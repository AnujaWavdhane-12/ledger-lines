import { BadRequestException } from "../../dependencies/exceptions"

export enum SupportedLedgers {
    QuickBooks = 1,
    Xero = 2,
}

/**
 * Converts the ledger name to a SupportedLedgers enum value.
 *
 * @param ledger a string representing the ledger
 * @returns a SupportedLedgers value, backed by an int
 * 
 * @throws BadRequestException if the ledger is not supported
 */
export function stringToSupportedLegder(ledger: string): SupportedLedgers {
    if (ledger === undefined || ledger === null) {
        throw new BadRequestException("Ledger is required");
    }
    if (ledger in SupportedLedgers) {
        return SupportedLedgers[ledger as keyof typeof SupportedLedgers];
    }
    else {
        throw new BadRequestException("Unsupported ledger: " + ledger + ". Type: " + typeof ledger);
    }
}
