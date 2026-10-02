import 'hono'

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: number
      email: string
    }
  }
}