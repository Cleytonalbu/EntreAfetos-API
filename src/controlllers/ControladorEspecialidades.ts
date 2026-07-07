import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoEspecialidades } from '../services/ServicoEspecialidades'

const servico = new ServicoEspecialidades()

export class ControladorEspecialidades {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const dados = await servico.listar()
      return reply.send({ dados })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const especialidade = await servico.criar(request.body as any)
      return reply.status(201).send({ especialidade })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const especialidade = await servico.atualizar(id, request.body as any)
      return reply.send({ especialidade })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async alterarStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const { ativo } = request.body as any
      const especialidade = await servico.alterarStatus(id, ativo)
      return reply.send({ especialidade })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}