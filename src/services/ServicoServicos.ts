import { RepositorioServicos } from '../repositories/RepositorioServicos'

const repositorio = new RepositorioServicos()

export class ServicoServicos {

  async listar() {
    return repositorio.listar()
  }

  async criar(dados: { nome: string; duracaoMin: number; descricao?: string }) {
    if (!dados.nome || !dados.duracaoMin) {
      throw { status: 400, mensagem: 'nome e duracaoMin são obrigatórios' }
    }
    return repositorio.criar(dados)
  }

  async atualizar(id: string, dados: any) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Serviço não encontrado' }
    }
    return repositorio.atualizar(id, dados)
  }
}