import { Either } from 'fp-ts/Either'

export type FieldValidationError = {
  field: string
  message: string
}

export type Validation<T> = Either<FieldValidationError, T>
