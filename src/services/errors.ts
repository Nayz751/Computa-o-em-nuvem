export type ServiceErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'VALIDATION' | 'NOT_FOUND' | 'DUPLICATE' | 'CONFLICT' | 'UNKNOWN';

/** Erro de regra de negócio. Uma API real deve mapear respostas HTTP para este mesmo formato. */
export class ServiceError extends Error {
  code: ServiceErrorCode;
  constructor(message: string, code: ServiceErrorCode = 'UNKNOWN') {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.';
}
