import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoModelosEvolucao } from '../services/ServicoModelosEvolucao'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoModelosEvolucao()

export class ControladorModelosEvolucao {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { especialidade } = request.query as any
      const dados = await servico.listar(especialidade)
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const modelo = await servico.buscarPorId(id)
      return reply.send({ modelo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const modelo = await servico.criar(request.body as any)
      return reply.status(201).send({ modelo })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const modelo = await servico.atualizar(id, request.body as any)
      return reply.send({ modelo })
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