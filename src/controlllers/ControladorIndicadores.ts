import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoIndicadores } from '../services/ServicoIndicadores'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoIndicadores()

export class ControladorIndicadores {

  async painelGeral(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { dataInicio, dataFim } = request.query as any
      const dados = await servico.painelGeral(dataInicio, dataFim)
      return reply.send(dados)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async objetivos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.objetivos()
      return reply.send(dados)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async frequencia(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { dataInicio, dataFim } = request.query as any
      const dados = await servico.frequencia(dataInicio, dataFim)
      return reply.send(dados)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alertas(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.alertas()
      return reply.send(dados)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async indicadoresPaciente(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { dataInicio, dataFim } = request.query as any
      const dados = await servico.indicadoresPaciente(id, dataInicio, dataFim)
      return reply.send(dados)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}