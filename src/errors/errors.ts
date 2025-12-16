export class NotFoundError extends Error { status = 404; }
export class ForbiddenError extends Error { status = 403; }
export class BadRequestError extends Error { status = 400; }