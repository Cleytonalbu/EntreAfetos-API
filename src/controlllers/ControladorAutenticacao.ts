import { FastifyRequest, FastifyReply } from 'fastify'
import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma'
import { Papel } from '@prisma/client'

interface BodyRegistro {
  nome: string
  email: string
  senha: string
  papel: Papel
}

interface BodyLogin {
  email: string
  senha: string
}

export class ControladorAutenticacao {

  // POST /auth/registro
  async registro(request: FastifyRequest, reply: FastifyReply) {
    const { nome, email, senha, papel } = request.body as BodyRegistro

    // Validações básicas
    if (!nome || !email || !senha || !papel) {
      return reply.status(400).send({
        erro: 'Dados inválidos',
        mensagem: 'nome, email, senha e papel são obrigatórios',
      })
    }

    // Verifica se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    })

    if (usuarioExistente) {
      return reply.status(409).send({
        erro: 'Conflito',
        mensagem: 'Já existe um usuário com esse e-mail',
      })
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    // Cria o usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaCriptografada,
        papel,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        criadoEm: true,
      },
    })

    // Gera o token JWT
    const token = await reply.jwtSign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
      { expiresIn: '7d' }
    )

    return reply.status(201).send({ usuario, token })
  }

  // POST /auth/login
  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, senha } = request.body as BodyLogin

    if (!email || !senha) {
      return reply.status(400).send({
        erro: 'Dados inválidos',
        mensagem: 'email e senha são obrigatórios',
      })
    }

    // Busca o usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario || !usuario.senha) {
      return reply.status(401).send({
        erro: 'Credenciais inválidas',
        mensagem: 'E-mail ou senha incorretos',
      })
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha)

    if (!senhaValida) {
      return reply.status(401).send({
        erro: 'Credenciais inválidas',
        mensagem: 'E-mail ou senha incorretos',
      })
    }

    if (!usuario.ativo) {
      return reply.status(403).send({
        erro: 'Acesso negado',
        mensagem: 'Usuário inativo. Entre em contato com o administrador',
      })
    }

    // Gera o token JWT
    const token = await reply.jwtSign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
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
  }

  // GET /auth/me
  async me(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.user

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        ativo: true,
        criadoEm: true,
      },
    })

    if (!usuario) {
      return reply.status(404).send({
        erro: 'Não encontrado',
        mensagem: 'Usuário não encontrado',
      })
    }

    return reply.send({ usuario })
  }
}