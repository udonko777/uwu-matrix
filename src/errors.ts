export class MatrixError extends Error {
  static {
    this.prototype.name = "MatrixError";
  }
  constructor(message: string, options: ErrorOptions) {
    super(message, options);
  }
}

type ValidationErrorOptions = ErrorOptions & {
  cause: {
    reason: string;
    value: unknown;
  };
};

export class ValidationError extends MatrixError {
  constructor(message: string, options: ValidationErrorOptions) {
    super(message, options);
  }
}

export class SingularMatrixError extends MatrixError {
  constructor(options: ErrorOptions) {
    super("Matrix is singular and cannot be inverted.", options);
    this.name = "SingularMatrixError";
  }
}
