import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoTransacoes } from '../services/ServicoTransacoes'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoTransacoes()

export class ControladorTransacoes {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tipo, status, pacienteId, profissionalId, dataInicio, dataFim, pagina = '1', porPagina = '10' } =
        request.query as any
      const papel = (request.user as any).papel
      const resultado = await servico.listar({
        tipo, status, pacienteId, profissionalId, dataInicio, dataFim,
        pagina: Number(pagina), porPagina: Number(porPagina),
      }, papel)
      return reply.send({
        dados: resultado.transacoes,
        meta: {
          total: resultado.total,
          pagina: Number(pagina),
          porPagina: Number(porPagina),
          totalPaginas: Math.ceil(resultado.total / Number(porPagina)),
        },
      })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const transacao = await servico.buscarPorId(id, (request.user as any).papel)
      return reply.send({ transacao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const transacao = await servico.criar(request.body as any, (request.user as any).papel)
      return reply.status(201).send({ transacao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const transacao = await servico.atualizar(id, request.body as any, (request.user as any).papel)
      return reply.send({ transacao })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any
      const transacao = await servico.alterarStatus(id, status, (request.user as any).papel)
      return reply.send({ transacao })
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

  async historicoPaciente(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const transacoes = await servico.historicoPaciente(id)
      return reply.send({ transacoes })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async dashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { dataInicio, dataFim } = request.query as any
      const indicadores = await servico.dashboard(dataInicio, dataFim)
      return reply.send(indicadores)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}