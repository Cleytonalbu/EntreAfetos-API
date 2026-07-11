import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoUsuarios } from '../services/ServicoUsuarios'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoUsuarios()

export class ControladorUsuarios {

  async listarPorPapel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { papel, busca } = request.query as any
      if (!papel) {
        return reply.status(400).send({
          erro: 'Dados inválidos',
          mensagem: 'papel é obrigatório como query param',
        })
      }
      const dados = await servico.listarPorPapel(papel, busca)
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuario = await servico.buscarPorId(id)
      return reply.send({ usuario })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const usuario = await servico.atualizar(id, request.body as any)
      return reply.send({ usuario })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async inativar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.inativar(id)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}