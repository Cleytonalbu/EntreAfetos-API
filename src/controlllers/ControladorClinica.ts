import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoClinica } from '../services/ServicoClinica'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoClinica()

export class ControladorClinica {

  async buscar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clinica = await servico.buscar()
      return reply.send({ clinica })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clinica = await servico.criar(request.body as any)
      return reply.status(201).send({ clinica })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clinica = await servico.atualizar(request.body as any)
      return reply.send({ clinica })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizarConfiguracoes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const clinica = await servico.atualizarConfiguracoes(request.body as any)
      return reply.send({ clinica })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async listarConfiguracoesNotificacao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.listarConfiguracoesNotificacao()
      return reply.send({ dados })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async salvarConfiguracaoNotificacao(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { tipo, canais } = request.body as any
      const config = await servico.salvarConfiguracaoNotificacao(tipo, canais)
      return reply.send({ configuracao: config })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }
}