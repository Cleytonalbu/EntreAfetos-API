import { RepositorioSalas } from '../repositories/RepositorioSalas'

const repositorio = new RepositorioSalas()

export class ServicoSalas {

  async listar() {
    return repositorio.listar()
  }
  
  async buscarPorId(id: string) {
    const sala = await repositorio.buscarPorId(id)
    if (!sala) {
      throw { status: 404, mensagem: 'Sala não encontrada' }
    }
    return sala
  }

  async criar(dados: { nome: string; descricao?: string }) {
    if (!dados.nome) {
      throw { status: 400, mensagem: 'nome é obrigatório' }
    }
    return repositorio.criar(dados)
  }

  async atualizar(id: string, dados: { nome?: string; descricao?: string }) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Sala não encontrada' }
    }
    return repositorio.atualizar(id, dados)
  }

  async inativar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Sala não encontrada' }
    }
    return repositorio.inativar(id)
  }
}