export class NotFoundException extends Error {
  constructor(
    message: string = "Not found.",
    public messageToUser: string | null = null
  ) {
    super(message);
    if (!messageToUser) {
      this.messageToUser = message;
    }
  }
  public message: string;
}

export class ForbiddenException extends Error {
  constructor(
    message: string = "Forbidden.",
    public messageToUser: string | null = null
  ) {
    super(message);
    if (!messageToUser) {
      this.messageToUser = message;
    }
  }
  public message: string;
}
export class BadRequestException extends Error {
  constructor(
    message: string = "Bad request.",
    public messageToUser: string | null = null
  ) {
    super(message);
    if (!messageToUser) {
      this.messageToUser = message;
    }
  }
  public message: string;
}

export class GenericException extends Error {
  constructor(
    message: string = "Something went wrong.",
    public messageToUser: string | null = null
  ) {
    super(message);
    if (!messageToUser) {
      this.messageToUser = message;
    }
  }
  public message: string;
}

export class MappingNotFoundException extends NotFoundException {
  constructor(
    message: string = "Mapping not found.",
    public messageToUser: string | null = null
  ) {
    super(message, messageToUser);
  }
}
