import { RepositorioSalas } from '../repositories/RepositorioSalas'

const repositorio = new RepositorioSalas()

export class ServicoSalas {

  async listar() {
    return repositorio.listar()
  }

  async criar(dados: { nome: string; descricao?: string }) {
    if (!dados.nome) {
      throw { status: 400, mensagem: 'nome é obrigatório' }
    }
    return repositorio.criar(dados)
  }
}