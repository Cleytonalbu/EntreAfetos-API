import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoNotificacoes } from '../services/ServicoNotificacoes'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoNotificacoes()

export class ControladorNotificacoes {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioId = request.user.id
      const { lida, tipo } = request.query as any

      const resultado = await servico.listar(usuarioId, {
        lida: lida === 'true' ? true : lida === 'false' ? false : undefined,
        tipo,
      })

      return reply.send(resultado)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const notificacao = await servico.criar(request.body as any)
      return reply.status(201).send({ notificacao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async marcarComoLida(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = request.user.id
      const notificacao = await servico.marcarComoLida(id, usuarioId)
      return reply.send({ notificacao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async marcarTodasComoLidas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioId = request.user.id
      await servico.marcarTodasComoLidas(usuarioId)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async remover(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = request.user.id
      await servico.remover(id, usuarioId)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async removerTodas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioId = request.user.id
      await servico.removerTodas(usuarioId)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}