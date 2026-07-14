import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoObjetivos } from '../services/ServicoObjetivos'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoObjetivos()

export class ControladorObjetivos {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { categoria, status, planoId } = request.query as any
      const dados = await servico.listar(id, { categoria, status, planoId })
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const objetivo = await servico.buscarPorId(id)
      return reply.send({ objetivo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const objetivo = await servico.criar(id, request.body as any)
      return reply.status(201).send({ objetivo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const objetivo = await servico.atualizar(id, request.body as any)
      return reply.send({ objetivo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any
      const objetivo = await servico.alterarStatus(id, status)
      return reply.send({ objetivo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizarProgresso(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { progresso, nivelDesempenho } = request.body as any
      const objetivo = await servico.atualizarProgresso(id, progresso, nivelDesempenho)
      return reply.send({ objetivo })
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