import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array"
import * as O from "fp-ts/Option"
import * as R from "fp-ts/Record"
import { isNonNegativeInteger } from "@/lib/helpers/numbers";
import { pipe } from "fp-ts/lib/function";
import { CreateProductCodec, CreateProductInput, UpdateProductCodec, UpdateProductInput } from "@/types/product";
import { fieldValidationErrorToValidationError, formatValidationError } from "@/lib/validation/validation";
import { ValidationError } from "@/types/errors";
import { Validation } from "@/lib/validation/types";

const validateProductName = (
  name: string
): Validation<string> =>
  name.length >= 3
    ? E.right(name)
    : E.left({ field: "name", message: "Name must be at least 3 characters" });

const validateProductDescription = (
  description?: string
): Validation<string | undefined> =>
  description && description.length > 500
    ? E.left({
      field: "description",
      message: "Description must be less than 500 characters",
    })
    : E.right(description);

const validateProductPrice = (
  price: number
): Validation<number> =>
  isNonNegativeInteger(price)
    ? E.right(price)
    : E.left({
      field: "price",
      message: "Price must be a non-negative integer",
    });

const validateProductStock = (
  stock: number
): Validation<number> =>
  isNonNegativeInteger(stock)
    ? E.right(stock)
    : E.left({
      field: "stock",
      message: "Stock must be a non-negative integer",
    });

type Validators = Record<string, (value: any) => Validation<any>>

const validators: Validators = {
  name: validateProductName,
  price: validateProductPrice,
  stock: validateProductStock,
  description: validateProductDescription
}

export const validateCreateProduct = (input: unknown): E.Either<ValidationError, CreateProductInput> =>
  pipe(
    CreateProductCodec.decode(input),
    E.mapLeft((errors) => formatValidationError(errors)),
    E.flatMap((data) =>
      pipe(
        R.toEntries(data),
        A.map(([k, v]) => validators[k](v)),
        A.sequence(E.Applicative),
        E.map(() => data),
        E.mapLeft(fieldValidationErrorToValidationError)
      )
    )
  );

export const validateUpdateProduct = (input: unknown): E.Either<ValidationError, UpdateProductInput> =>
  pipe(
    UpdateProductCodec.decode(input),
    E.mapLeft((errors) => formatValidationError(errors)),
    E.flatMap((data) =>
      pipe(
        Object.entries(data),
        A.filterMap(([k, v]) => (v !== undefined ? O.some(validators[k](v)) : O.none)),
        A.sequence(E.Applicative),
        E.map(() => data),
        E.mapLeft(fieldValidationErrorToValidationError)
      )
    )
  );
