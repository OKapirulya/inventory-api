export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  quantity: number
  user_id: number
  created_at: Date
  updated_at: Date
}

export interface CreateProductDTO {
  name: string
  description?: string
  price: number
  quantity: number
}

export interface UpdateProductDTO {
  name?: string
  description?: string
  price?: number
  quantity?: number
}