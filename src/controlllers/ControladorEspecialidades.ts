import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoEspecialidades } from '../services/ServicoEspecialidades'
import { tratarErroPrisma } from '../lib/prismaErros'

const servico = new ServicoEspecialidades()

export class ControladorEspecialidades {

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
      const especialidade = await servico.buscarPorId(id)
      return reply.send({ especialidade })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  } 

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const especialidade = await servico.criar(request.body as any)
      return reply.status(201).send({ especialidade })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const especialidade = await servico.atualizar(id, request.body as any)
      return reply.send({ especialidade })
    } catch (err) {
      const { status, mensagem } = tratarErroPrisma(err)
      return reply.status(status).send({ erro: 'Erro', mensagem })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { ativo } = request.body as any
      const especialidade = await servico.alterarStatus(id, ativo)
      return reply.send({ especialidade })
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