import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoPlanoTerapeutico } from '../services/ServicoPlanoTerapeutico'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoPlanoTerapeutico()

export class ControladorPlanoTerapeutico {

  async buscarAtivo(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const plano = await servico.buscarAtivoPorPaciente(id)
      return reply.send({ plano })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const plano = await servico.buscarPorId(id)
      return reply.send({ plano })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async historico(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const planos = await servico.buscarHistoricoPorPaciente(id)
      return reply.send({ dados: planos })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const plano = await servico.criar(id, request.body as any)
      return reply.status(201).send({ plano })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const plano = await servico.atualizar(id, request.body as any)
      return reply.send({ plano })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any
      const plano = await servico.alterarStatus(id, status)
      return reply.send({ plano })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}