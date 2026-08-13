import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoAgendamentos } from '../services/ServicoAgendamentos'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoAgendamentos()

export class ControladorAgendamentos {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { data, profissionalId, pacienteId, status, pagina = '1', porPagina = '10' } =
        request.query as any
      const resultado = await servico.listar({
        data, profissionalId, pacienteId, status,
        pagina: Number(pagina),
        porPagina: Number(porPagina),
      })
      return reply.send({
        dados: resultado.agendamentos,
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
      const agendamento = await servico.buscarPorId(id)
      return reply.send({ agendamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const agendamento = await servico.criar(request.body as any)
      return reply.status(201).send({ agendamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const agendamento = await servico.atualizar(id, request.body as any)
      return reply.send({ agendamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { status } = request.body as any
      const agendamento = await servico.alterarStatus(id, status)
      return reply.send({ agendamento })
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

  // Criar bloqueio de agenda
  async criarBloqueio(request: FastifyRequest, reply: FastifyReply) {
    try {
      const agendamento = await servico.criarBloqueio(request.body as any)
      return reply.status(201).send({ agendamento })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}