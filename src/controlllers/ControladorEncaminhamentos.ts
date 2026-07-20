import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoEncaminhamentos } from '../services/ServicoEncaminhamentos'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoEncaminhamentos()

export class ControladorEncaminhamentos {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        pacienteId,
        profissionalOrigemId,
        especialidadeId,
        status,
        prioridade,
        dataInicio,
        dataFim,
      } = request.query as any

      const dados = await servico.listar({
        pacienteId,
        profissionalOrigemId,
        especialidadeId,
        status,
        prioridade,
        dataInicio,
        dataFim,
      })

      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const encaminhamento = await servico.buscarPorId(id)
      return reply.send({ encaminhamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const encaminhamento = await servico.criar(request.body as any)
      return reply.status(201).send({ encaminhamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any
      const encaminhamento = await servico.alterarStatus(id, status)
      return reply.send({ encaminhamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async cancelar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.cancelar(id)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}