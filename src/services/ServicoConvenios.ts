import { RepositorioConvenios } from '../repositories/RepositorioConvenios'

const repositorio = new RepositorioConvenios()

export class ServicoConvenios {

  async listar() {
    return repositorio.listar()
  }

  async buscarPorId(id: string) {
    const convenio = await repositorio.buscarPorId(id)
    if (!convenio) {
      throw { status: 404, mensagem: 'Convenio não encontrado' }
    }
    return convenio
  }

  async criar(nome: string) {
    if (!nome) {
      throw { status: 400, mensagem: 'nome é obrigatório' }
    }
    return repositorio.criar(nome)
  }

  async atualizar(id: string, nome: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Convenio não encontrado' }
    }
    return repositorio.atualizar(id, nome)
  }

  async inativar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Convenio não encontrado' }
    }
    return repositorio.inativar(id)
  }
}
