import { RepositorioConvenios } from '../repositories/RepositorioConvenios'

const repositorio = new RepositorioConvenios()

export class ServicoConvenios {

  async listar() {
    return repositorio.listar()
  }

  async criar(nome: string) {
    if (!nome) {
      throw { status: 400, mensagem: 'nome é obrigatório' }
    }
    return repositorio.criar(nome)
  }
}