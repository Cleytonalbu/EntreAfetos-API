import { RepositorioEspecialidades } from '../repositories/RepositorioEspecialidades'

const repositorio = new RepositorioEspecialidades()

export class ServicoEspecialidades {

  async listar() {
    return repositorio.listar()
  }

  async buscarPorId(id: string) {
    const especialidade = await repositorio.buscarPorId(id)
    if (!especialidade) {
      throw { status: 404, mensagem: 'Especialidade não encontrada' }
    }
    return especialidade
  }

  async criar(dados: {
    nome: string
    descricao?: string
    cor?: string
    categoria: string
    icone?: string
  }) {
    if (!dados.nome || !dados.categoria) {
      throw { status: 400, mensagem: 'nome e categoria são obrigatórios' }
    }
    return repositorio.criar(dados)
  }

  async atualizar(id: string, dados: any) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Especialidade não encontrada' }
    }
    return repositorio.atualizar(id, dados)
  }

  async alterarStatus(id: string, ativo: boolean) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Especialidade não encontrada' }
    }
    return repositorio.alterarStatus(id, ativo)
  }

  async inativar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Especialidade não encontrada' }
    }
    return repositorio.inativar(id)
  }
}