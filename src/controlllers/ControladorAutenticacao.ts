import { FastifyRequest, FastifyReply } from 'fastify'
import { ServicoAutenticacao } from '../services/ServicoAutenticacao'

const servico = new ServicoAutenticacao()

export class ControladorAutenticacao {

  async registro(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { nome, email, senha, papel } = request.body as any

      if (!nome || !email || !senha || !papel) {
        return reply.status(400).send({
          erro: 'Dados inválidos',
          mensagem: 'nome, email, senha e papel são obrigatórios',
        })
      }

      const usuario = await servico.registro({ nome, email, senha, papel })
      const token   = await reply.jwtSign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
        { expiresIn: '7d' }
      )

      return reply.status(201).send({ usuario, token })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro',
        mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, senha } = request.body as any

      if (!email || !senha) {
        return reply.status(400).send({
          erro: 'Dados inválidos',
          mensagem: 'email e senha são obrigatórios',
        })
      }

      const usuario = await servico.login(email, senha)
      const token   = await reply.jwtSign(
        { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
        { expiresIn: '7d' }
      )

      return reply.send({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          papel: usuario.papel,
          foto: usuario.foto,
        },
        token,
      })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro',
        mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    try {
      const usuario = await servico.buscarPerfil(request.user.id)
      return reply.send({ usuario })
    } catch (err: any) {
      return reply.status(err.status ?? 500).send({
        erro: 'Erro',
        mensagem: err.mensagem ?? 'Erro interno do servidor',
      })
    }
  }
}