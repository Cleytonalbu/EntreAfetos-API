import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoConvenios } from '../services/ServicoConvenios'

const servico = new ServicoConvenios()

export class ControladorConvenios {

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
      const { nome } = request.body as any
      const convenio = await servico.criar(nome)
      return reply.status(201).send({ convenio })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}