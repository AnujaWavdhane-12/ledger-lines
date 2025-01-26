// ////////////////////////////////////////////////////////// //
// Autgenerated code, do not change.
//
// Microservice for partner managment
//
// Generated: 2024-12-20T15:52:30.689059500-06:00[America/Mexico_City]
//
// ////////////////////////////////////////////////////////// //

import {
  BankAccountMapping,
  BankAccountMappingResult,
  BankLinkConnectionRequest,
  Client,
  LedgerAccount,
  Organization,
  Partner,
  PartnerOnboardingRequest,
  RedirectionUrl,
  SendMessageRequest,
  ShareClientParams,
  Transaction,
  TransactionCategorizationRequest,
  User,
} from "../models/sdk/models";

export interface DefaultApiInterface {
  /**
   * categorizeTransactionOnLedger - Categorize a transaction on a ledger
   *
   * Categorizes the transaction in the ledger and updates its data in the database.  This operation is meant to be called in a background task or queue.
   *
   *
   * HTTP 200: dataType: baseType: -- Transaction categorized successfully
   *
   * */
  categorizeTransactionOnLedger(
    body: TransactionCategorizationRequest
  ): Promise<void>;

  /**
   * createClient - Create a new client
   *
   * Creates a client with the given data for a given partner and a given organization.
   *
   *
   * HTTP 201: dataType: baseType: -- The client is created
   *
   * */
  createClient(body: Client): Promise<void>;

  /**
   * createTransactionForOrganization -
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- transaction creation is completed
   *
   * */
  createTransactionForOrganization(
    partnerId: number,

    organizationId: number,

    body: Transaction
  ): Promise<void>;

  /**
   * editClient - Edit client data
   *
   * Update client data
   *
   *
   * HTTP 200: dataType: baseType: -- Client was updated sucessfully.
   *
   * */
  editClient(
    body: Client,

    clientId: number
  ): Promise<void>;

  /**
   * editOrganization - Edit organization data
   *
   * update organization data
   *
   *
   * HTTP 200: dataType: baseType: -- Organization was updated sucessfully.
   *
   * */
  editOrganization(
    body: Organization,

    organizationId: number,

    partnerId: number
  ): Promise<void>;

  /**
   * getAccountingMappings -
   *
   *
   *
   *
   * HTTP 200: dataType:BankAccountMappingResult baseType:BankAccountMappingResult -- Get mappings for this client.
   *
   * */
  getAccountingMappings(clientId: number): Promise<BankAccountMappingResult>;

  /**
   * getClients - Get a list of clients
   *
   * Get a list of clients associated with the logged in partner. Use provided JWT token to look for clients of the logged partner
   *
   *
   * HTTP 200: dataType:List baseType:Client -- List of Clients
   *
   * */
  getClients(
    offset: number,

    limit: number
  ): Promise<Client[]>;

  /**
   * getFinancialInstitutionConnectionUrl -
   *
   *
   *
   *
   * HTTP 200: dataType:BankLinkConnectionRequest baseType:BankLinkConnectionRequest -- Clients for this user.
   *
   * */
  getFinancialInstitutionConnectionUrl(
    partnerId: number,

    organizationId: number
  ): Promise<BankLinkConnectionRequest>;

  /**
   * getLedgerChartOfAccounts - A list of accounts.
   *
   *
   *
   *
   * HTTP 200: dataType:List baseType:LedgerAccount -- Clients for this user.
   *
   * */
  getLedgerChartOfAccounts(
    partnerId: number,

    organizationId: number,

    ledgerId: number
  ): Promise<LedgerAccount[]>;

  /**
   * getLedgerConnectionUrl -
   *
   *
   *
   *
   * HTTP 200: dataType:RedirectionUrl baseType:RedirectionUrl -- Clients for this user.
   *
   * */
  getLedgerConnectionUrl(
    partnerId: number,

    organizationId: number,

    ledgerId: number
  ): Promise<RedirectionUrl>;

  /**
   * getLedgerDetails -
   *
   *
   *
   *
   * HTTP 200: dataType:RedirectionUrl baseType:RedirectionUrl -- Clients for this user.
   *
   * */
  getLedgerDetails(
    partnerId: number,

    organizationId: number,

    ledgerId: number
  ): Promise<RedirectionUrl>;

  /**
   * getOrganizationClients - GetOrganizationBasedClients
   *
   * get all clients from a organization
   *
   *
   * HTTP 200: dataType:List baseType:Client -- Client got sucessfully based on current organization.
   *
   * */
  getOrganizationClients(organizationId: number): Promise<Client[]>;

  /**
   * getOrganizationsForPartner -
   *
   *
   *
   *
   * HTTP 200: dataType:List baseType:Organization -- The organizations
   *
   * */
  getOrganizationsForPartner(partnerId: number): Promise<Organization[]>;

  /**
   * getPartnersFromEmails -
   *
   *
   *
   *
   * HTTP 200: dataType:List baseType:Partner -- all searched partners
   *
   * */
  getPartnersFromEmails(body: string[]): Promise<Partner[]>;

  /**
   * getTransactionId -
   *
   *
   *
   *
   * HTTP 200: dataType:Transaction baseType:Transaction -- Clients for this user.
   *
   * */
  getTransactionId(transactionId: number): Promise<Transaction>;

  /**
   * getTransactionsForClient -
   *
   *
   *
   *
   * HTTP 200: dataType:List baseType:Transaction -- Clients for this user.
   *
   * */
  getTransactionsForClient(
    clientId: number,

    merchantQuery: string,

    categorizationStatus: string,

    dateStart: string,

    dateEnd: string
  ): Promise<Transaction[]>;

  /**
   * getUserByAuth0Id -
   *
   *
   *
   *
   * HTTP 200: dataType:User baseType:User -- Get a user.
   *
   * */
  getUserByAuth0Id(auth0Id: string): Promise<User>;

  /**
   * onboardUser - Create a user with a given auth0 id
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- User was created.
   *
   * */
  onboardUser(
    body: PartnerOnboardingRequest,

    auth0Id: string
  ): Promise<void>;

  /**
   * refreshChartOfAccounts - Import the Chart of Accounts from the Ledger
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- Import Chart of Accounts Success Result
   *
   * */
  refreshChartOfAccounts(
    partnerId: number,

    organizationId: number,

    ledgerId: number
  ): Promise<void>;

  /**
   * saveMappings -
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- OK.
   *
   * */
  saveMappings(
    body: BankAccountMapping[],

    clientId: number
  ): Promise<void>;

  /**
   * saveUser - Create a user with a given auth0 id
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- User was created.
   *
   * */
  saveUser(
    body: User,

    auth0Id: string
  ): Promise<void>;

  /**
   * sendMessage - Send a message
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- Reponse.
   *
   * */
  sendMessage(
    channelId: number,

    body: SendMessageRequest
  ): Promise<void>;

  /**
   * shareClientsforPartners - Share multiple clients with multiple partners
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- shared clients with targeted partners
   *
   * */
  shareClientsforPartners(body: ShareClientParams): Promise<void>;

  /**
   * suggestCategoryForTransaction -
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- The request to suggest a category has been accepted.
   *
   * */
  suggestCategoryForTransaction(transactionId: number): Promise<void>;

  /**
   * updateTransaction - Update the category of a transaction.
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- Updated the transaction.
   *
   * */
  updateTransaction(
    body: Transaction,

    transactionId: number
  ): Promise<void>;

  /**
   * updateTransactions - Update multiple transactions at once.
   *
   *
   *
   *
   * HTTP 200: dataType: baseType: -- The transactions were accepted and updating will happen eventually.
   * HTTP 400: dataType: baseType: -- Unable to start the request.
   *
   * */
  updateTransactions(body: Transaction[]): Promise<void>;
}
