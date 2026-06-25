import { Papel } from '@prisma/client'

export interface PayloadJWT {
  id: string
  nome: string
  email: string
  papel: Papel
}

// Extende o FastifyRequest para reconhecer o request.user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: PayloadJWT
  }
}