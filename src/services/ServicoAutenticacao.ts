import bcrypt from 'bcryptjs'
import { Papel } from '@prisma/client'
import { RepositorioUsuarios } from '../repositories/RepositorioUsuarios'

const repositorio = new RepositorioUsuarios()

export class ServicoAutenticacao {

  async registro(dados: {
    nome: string
    email: string
    senha: string
    papel: string
  }) {
    const { nome, email, senha, papel } = dados

    const papeisValidos = ['RECEPCIONISTA', 'PROFISSIONAL', 'GESTOR']
    const papelNormalizado = papel.toUpperCase()

    if (!papeisValidos.includes(papelNormalizado)) {
      throw { status: 400, mensagem: `papel deve ser: ${papeisValidos.join(', ')}` }
    }

    const usuarioExistente = await repositorio.buscarPorEmail(email)
    if (usuarioExistente) {
      throw { status: 409, mensagem: 'Já existe um usuário com esse e-mail' }
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    return repositorio.criar({
      nome,
      email,
      senha: senhaCriptografada,
      papel: papelNormalizado,
    })
  }

  async login(email: string, senha: string) {
    const usuario = await repositorio.buscarPorEmail(email)

    if (!usuario || !usuario.senha) {
      throw { status: 401, mensagem: 'E-mail ou senha incorretos' }
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      throw { status: 401, mensagem: 'E-mail ou senha incorretos' }
    }

    if (!usuario.ativo) {
      throw { status: 403, mensagem: 'Usuário inativo. Entre em contato com o administrador' }
    }

    return usuario
  }

  async buscarPerfil(id: string) {
    const usuario = await repositorio.buscarPorId(id)
    if (!usuario) {
      throw { status: 404, mensagem: 'Usuário não encontrado' }
    }
    return usuario
  }
}