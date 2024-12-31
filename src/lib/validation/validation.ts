import { ValidationError } from '@/types/errors';
import * as t from 'io-ts'
import { FieldValidationError } from '@/lib/validation/types';
import * as A from "fp-ts/Array"
import * as R from "fp-ts/Record"
import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"

export const formatValidationError = (errors: t.Errors): ValidationError => {
  const uniqueErrors = pipe(
    errors,
    A.reduce({} as Record<string, t.ValidationError>, (acc, error) => {
      const path = error.context[1].key

      return pipe(
        acc,
        R.lookup(path),
        O.match(() => R.upsertAt(path, error)(acc), () => acc)
      )
    })
  )

  const fieldsWithError = R.keys(uniqueErrors)

  const errorMessage = pipe(
    uniqueErrors,
    R.toEntries,
    A.map(([field, error]) => {
      const expectedType = error.context[1].type.name

      return (
        error.message ||
        `Invalid value for ${field}: type ${expectedType} expected`
      );
    }),
    messages => messages.join(", ")
  )

  return {
    type: 'ValidationError',
    fields: fieldsWithError,
    message: errorMessage,
  };
}

export const fieldValidationErrorToValidationError = (fieldValidationError: FieldValidationError): ValidationError => ({
  type: "ValidationError",
  fields: [fieldValidationError.field],
  message: fieldValidationError.message,
})

