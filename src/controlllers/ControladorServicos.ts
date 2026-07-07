import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoServicos } from '../services/ServicoServicos'

const servico = new ServicoServicos()

export class ControladorServicos {

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
      const servicoCriado = await servico.criar(request.body as any)
      return reply.status(201).send({ servico: servicoCriado })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const servicoAtualizado = await servico.atualizar(id, request.body as any)
      return reply.send({ servico: servicoAtualizado })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}