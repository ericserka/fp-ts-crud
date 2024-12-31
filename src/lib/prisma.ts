import { PrismaClient, Prisma } from "@prisma/client";
import { DomainError } from "@/types/errors"
import { identity, pipe } from "fp-ts/function"
import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import * as R from "fp-ts/Record"

// prevent multiple instances
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Predicates for checking error types
const isPrismaKnownError = (error: unknown): error is Prisma.PrismaClientKnownRequestError =>
  error instanceof Prisma.PrismaClientKnownRequestError

const isPrismaInitError = (error: unknown): error is Prisma.PrismaClientInitializationError =>
  error instanceof Prisma.PrismaClientInitializationError

const isPrismaUnknownError = (error: unknown): error is Prisma.PrismaClientUnknownRequestError =>
  error instanceof Prisma.PrismaClientUnknownRequestError

type PrismaKnownErrorCodeHandler = (error: Prisma.PrismaClientKnownRequestError) => DomainError

const prismaKnownErrorCodeHandlers: Record<string, PrismaKnownErrorCodeHandler> = {
  P2025: (_error) => ({
    type: 'NotFoundError',
    message: 'The requested entity was not found.',
  })
}

// Specific handlers for each type of error
const handleKnownError = (error: Prisma.PrismaClientKnownRequestError): DomainError =>
  pipe(
    prismaKnownErrorCodeHandlers,
    R.lookup(error.code),
    O.map(handler => handler(error)),
    O.match(() => ({
      type: 'DatabaseError',
      message: `Unhandled database error: ${error.message} (Code: ${error.code})`,
    }), identity)
  )

const handleInitError = (_error: Prisma.PrismaClientInitializationError): DomainError => ({
  type: 'DatabaseError',
  message: 'Failed to connect to the database. Please try again later.',
})

const handleUnknownError = (error: Prisma.PrismaClientUnknownRequestError): DomainError => ({
  type: 'DatabaseError',
  message: `An unknown error occurred: ${error.message}`,
})

type ErrorHandler = (error: unknown) => O.Option<DomainError>

const errorHandlers: ErrorHandler[] = [
  (error) =>
    isPrismaKnownError(error) ? pipe(error, handleKnownError, O.some) : O.none,
  (error) =>
    isPrismaInitError(error) ? pipe(error, handleInitError, O.some) : O.none,
  (error) =>
    isPrismaUnknownError(error) ? pipe(error, handleUnknownError, O.some) : O.none,
]

export const handlePrismaError = (error: unknown): DomainError =>
  pipe(
    errorHandlers,
    A.findFirst(handler => pipe(error, handler, O.isSome)),
    O.flatMap(handler => handler(error)),
    O.match(() => ({
      type: 'DatabaseError',
      message: 'An unexpected database error occurred',
    }), identity)
  )
