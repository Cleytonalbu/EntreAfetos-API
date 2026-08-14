import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoMensagens } from '../services/ServicoMensagens'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoMensagens()

export class ControladorMensagens {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { com } = request.query as any
      const usuarioId = (request.user as any).id
      const mensagens = await servico.listar(usuarioId, com)
      return reply.send({ mensagens })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = (request.user as any).id
      const mensagem = await servico.buscarPorId(id, usuarioId)
      return reply.send({ mensagem })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioId = (request.user as any).id
      const mensagem = await servico.criar(usuarioId, request.body as any)
      return reply.status(201).send({ mensagem })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async marcarComoLida(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = (request.user as any).id
      const mensagem = await servico.marcarComoLida(id, usuarioId)
      return reply.send({ mensagem })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async marcarTodasComoLidas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { com } = request.query as any
      const usuarioId = (request.user as any).id
      await servico.marcarTodasComoLidas(usuarioId, com)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async remover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = (request.user as any).id
      await servico.remover(id, usuarioId)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}