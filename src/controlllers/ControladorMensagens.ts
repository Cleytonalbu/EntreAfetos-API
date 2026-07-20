import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoMensagens } from '../services/ServicoMensagens'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoMensagens()

export class ControladorMensagens {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuarioId = request.user.id
      const resultado = await servico.listar(usuarioId)
      return reply.send(resultado)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const mensagem = await servico.buscarPorId(id)
      return reply.send({ mensagem })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const remetenteId = request.user.id
      const { texto } = request.body as any
      const mensagem = await servico.criar({ remetenteId, texto })
      return reply.status(201).send({ mensagem })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async marcarComoLida(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuarioId = request.user.id
      const mensagem = await servico.marcarComoLida(id, usuarioId)
      return reply.send({ mensagem })
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
}