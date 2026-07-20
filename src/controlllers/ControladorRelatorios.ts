import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoRelatorios } from '../services/ServicoRelatorios'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoRelatorios()

export class ControladorRelatorios {

  async listarTipos(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.listarTipos()
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async gerar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const relatorio = await servico.gerar(request.body as any)
      return reply.send(relatorio)
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async listarHistorico(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { profissionalId, pacienteId, tipo } = request.query as any
      const dados = await servico.listarHistorico({ profissionalId, pacienteId, tipo })
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async registrarGeracao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const registro = await servico.registrarGeracao(request.body as any)
      return reply.status(201).send({ registro })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async removerRegistro(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.removerRegistro(id)
      return reply.status(204).send()
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}