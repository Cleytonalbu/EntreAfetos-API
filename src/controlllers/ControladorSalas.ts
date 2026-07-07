import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoSalas } from '../services/ServicoSalas'

const servico = new ServicoSalas()

export class ControladorSalas {

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
      const sala = await servico.criar(request.body as any)
      return reply.status(201).send({ sala })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}