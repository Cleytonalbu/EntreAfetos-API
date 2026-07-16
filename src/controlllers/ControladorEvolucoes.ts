import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoEvolucoes } from '../services/ServicoEvolucoes'
import { tratarErroPrisma } from '../lib/prismaErros'
import prisma from '../lib/prisma'

const servico = new ServicoEvolucoes()

export class ControladorEvolucoes {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { profissionalId, dataInicio, dataFim, rascunho } = request.query as any
      const dados = await servico.listar(id, {
        profissionalId,
        dataInicio,
        dataFim,
        rascunho: rascunho === 'true' ? true : rascunho === 'false' ? false : undefined,
      })
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const evolucao = await servico.buscarPorId(id)
      return reply.send({ evolucao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const evolucao = await servico.criar(request.body as any)
      return reply.status(201).send({ evolucao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const evolucao = await servico.atualizar(id, request.body as any)
      return reply.send({ evolucao })
    } catch (err) {
      console.log('ERRO COMPLETO:', JSON.stringify(err, null, 2))
      console.log('ERRO STACK:', err)
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async assinar(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as any

    // Busca o profissional pelo usuarioId do token
    const profissional = await prisma.profissional.findUnique({
      where: { usuarioId: request.user.id },
    })

    if (!profissional) {
      return reply.status(403).send({
        erro: 'Acesso negado',
        mensagem: 'Usuário não é um profissional cadastrado',
      })
    }

    const evolucao = await servico.assinar(id, profissional.id)
    return reply.send({ evolucao })
  } catch (err) {
    const { status, mensagem } = tratarErroPrisma(err)
    return reply.status(status).send({ erro: 'Erro', mensagem })
  }
}

  async remover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.remover(id)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}