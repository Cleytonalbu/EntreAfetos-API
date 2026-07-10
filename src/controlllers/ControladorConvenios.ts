import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoConvenios } from '../services/ServicoConvenios'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoConvenios()

export class ControladorConvenios {

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
      const convenio = await servico.buscarPorId(id)
      return reply.send({ convenio })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { nome } = request.body as any
      const convenio = await servico.criar(nome)
      return reply.status(201).send({ convenio })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { nome } = request.body as any
      const convenio = await servico.atualizar(id, nome)
      return reply.send({ convenio })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async inativar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const convenio = await servico.inativar(id)
      return reply.send({ convenio })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}