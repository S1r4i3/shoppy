export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 400) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const ERR = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  INVALID_RESET_CODE: 'INVALID_RESET_CODE',
};
