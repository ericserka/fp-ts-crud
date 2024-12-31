import * as t from 'io-ts'
import * as tt from 'io-ts-types'

// Codecs
export const ProductCodec = t.type({
  id: t.string,
  name: t.string,
  description: t.union([t.string, t.null]),
  price: t.number,
  stock: t.number,
  createdAt: tt.date,
  updatedAt: tt.date
})

const createProductAttrs = {
  name: t.string,
  description: t.union([t.string, t.undefined]),
  price: t.number,
  stock: t.number
}

export const CreateProductCodec = t.type(createProductAttrs)

export const UpdateProductCodec = t.partial(createProductAttrs)

// Runtime types

export type Product = t.TypeOf<typeof ProductCodec>
export type CreateProductInput = t.TypeOf<typeof CreateProductCodec>
export type UpdateProductInput = t.TypeOf<typeof UpdateProductCodec>
