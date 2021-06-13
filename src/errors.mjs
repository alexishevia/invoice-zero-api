/* eslint max-classes-per-file: [0] */

export class NotFoundError extends Error {}
NotFoundError.prototype.name = "NotFoundError";

export class InvalidRequestError extends Error {}
InvalidRequestError.prototype.name = "InvalidRequestError";

export class ConflictError extends Error {}
ConflictError.prototype.name = "ConflictError";

export class FatalError extends Error {}
FatalError.prototype.name = "FatalError";
