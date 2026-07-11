import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoProfissionais } from '../services/ServicoProfissionais'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoProfissionais()

export class ControladorProfissionais {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { busca, especialidadeId, ativo } = request.query as any
      const dados = await servico.listar({
        busca,
        especialidadeId,
        ativo: ativo === 'false' ? false : true,
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
      const profissional = await servico.buscarPorId(id)
      return reply.send({ profissional })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const profissional = await servico.criar(request.body as any)
      return reply.status(201).send({ profissional })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const profissional = await servico.atualizar(id, request.body as any)
      return reply.send({ profissional })
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

  async horariosDisponiveis(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { data } = request.query as any
      const slots = await servico.buscarHorariosDisponiveis(id, data)
      return reply.send({ slots })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}