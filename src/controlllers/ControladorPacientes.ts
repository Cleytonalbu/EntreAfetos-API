import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoPacientes } from '../services/ServicoPacientes'

const servico = new ServicoPacientes()

export class ControladorPacientes {

  async listar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { busca, status, pagina = '1', porPagina = '10' } = request.query as any
      const resultado = await servico.listar({
        busca, status,
        pagina: Number(pagina),
        porPagina: Number(porPagina),
      })
      return reply.send({
        dados: resultado.pacientes,
        meta: {
          total: resultado.total,
          pagina: Number(pagina),
          porPagina: Number(porPagina),
          totalPaginas: Math.ceil(resultado.total / Number(porPagina)),
        },
      })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async buscarPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const paciente = await servico.buscarPorId(id)
      return reply.send({ paciente })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async criar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const paciente = await servico.criar(request.body as any)
      return reply.status(201).send({ paciente })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async atualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      const paciente = await servico.atualizar(id, request.body as any)
      return reply.send({ paciente })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async inativar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any
      await servico.inativar(id)
      return reply.status(204).send()
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro', mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}