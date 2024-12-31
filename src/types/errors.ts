export type ValidationError = {
  type: 'ValidationError'
  fields: string[]
  message: string
}

export type NotFoundError = {
  type: 'NotFoundError'
  message: string
}

export type DatabaseError = {
  type: 'DatabaseError'
  message: string
}

export type RequestError = {
  type: 'RequestError'
  message: string
}

export type DomainError = ValidationError | NotFoundError | DatabaseError | RequestError
export type ErrorType = "ValidationError" | "NotFoundError" | "DatabaseError" | "RequestError"
