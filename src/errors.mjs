export class NotFoundError extends Error {
  name = 'NotFoundError'
  constructor(message) {
    super(message)
  }
}

export class InvalidRequestError extends Error {
  name = 'InvalidRequestError'
  constructor(message) {
    super(message)
  }
}

export class ConflictError extends Error {
  name = 'ConflictError'
  constructor(message) {
    super(message)
  }
}

export class FatalError extends Error {
  name = 'FatalError'
  constructor(message) {
    super(message)
  }
}

