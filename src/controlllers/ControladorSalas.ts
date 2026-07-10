import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoSalas } from '../services/ServicoSalas'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoSalas()

export class ControladorSalas {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.listar()
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const sala = await servico.buscarPorId(id)
      return reply.send({ sala })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const sala = await servico.criar(request.body as any)
      return reply.status(201).send({ sala })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const sala = await servico.atualizar(id, request.body as any)
      return reply.send({ sala })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async inativar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const sala = await servico.inativar(id)
      return reply.send({ sala })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}