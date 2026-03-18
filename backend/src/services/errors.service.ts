class ServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
  }
}

const isServiceError = (error: unknown): error is ServiceError => {
  return error instanceof ServiceError;
};

module.exports = {
  ServiceError,
  isServiceError,
};

export {};
