import { Papel } from '@prisma/client'
import { RepositorioUsuarios } from '../repositories/RepositorioUsuarios'

const repositorio = new RepositorioUsuarios()

const papeisValidos = ['RECEPCIONISTA', 'PROFISSIONAL', 'GESTOR']

export class ServicoUsuarios {

  async listarPorPapel(papel: string, busca?: string) {
    if (!papeisValidos.includes(papel.toUpperCase())) {
      throw { status: 400, mensagem: `papel deve ser: ${papeisValidos.join(', ')}` }
    }
    return repositorio.listarPorPapel(papel.toUpperCase() as Papel, busca)
  }

  async buscarPorId(id: string) {
    const usuario = await repositorio.buscarPorId(id)
    if (!usuario) {
      throw { status: 404, mensagem: 'Usuário não encontrado' }
    }
    return usuario
  }

  async atualizar(id: string, dados: { nome?: string; foto?: string }) {
    const usuario = await repositorio.buscarPorId(id)
    if (!usuario) {
      throw { status: 404, mensagem: 'Usuário não encontrado' }
    }
    return repositorio.atualizar(id, dados)
  }

  async inativar(id: string) {
    const usuario = await repositorio.buscarPorId(id)
    if (!usuario) {
      throw { status: 404, mensagem: 'Usuário não encontrado' }
    }
    return repositorio.inativar(id)
  }
}