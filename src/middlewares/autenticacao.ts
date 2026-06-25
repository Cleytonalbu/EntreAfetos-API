import { FastifyRequest, FastifyReply } from 'fastify'
import { Papel } from '@prisma/client'

// Verifica se o token JWT é válido
export async function verificarAutenticacao(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      erro: 'Não autorizado',
      mensagem: 'Token inválido ou expirado',
    })
  }
}

// Verifica se o usuário tem o papel necessário
export function permitir(...papeis: Papel[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { papel } = request.user

    if (!papeis.includes(papel)) {
      return reply.status(403).send({
        erro: 'Acesso negado',
        mensagem: 'Você não tem permissão para acessar este recurso',
      })
    }
  }
}