import { RepositorioMensagens } from '../repositories/RepositorioMensagens'

const repositorio = new RepositorioMensagens()

export class ServicoMensagens {

  async listar(usuarioId: string) {
    const mensagens    = await repositorio.listar(usuarioId)
    const totalNaoLidas = await repositorio.contarNaoLidas(usuarioId)
    return { mensagens, totalNaoLidas }
  }

  async buscarPorId(id: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }
    return mensagem
  }

  async criar(dados: { remetenteId: string; texto: string }) {
    if (!dados.remetenteId || !dados.texto) {
      throw { status: 400, mensagem: 'remetenteId e texto são obrigatórios' }
    }

    if (dados.texto.trim().length === 0) {
      throw { status: 400, mensagem: 'O texto da mensagem não pode estar vazio' }
    }

    if (dados.texto.length > 1000) {
      throw { status: 400, mensagem: 'O texto da mensagem não pode ter mais de 1000 caracteres' }
    }

    return repositorio.criar(dados)
  }

  async marcarComoLida(id: string, usuarioId: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }

    if (mensagem.remetenteId !== usuarioId) {
      throw { status: 403, mensagem: 'Você não tem permissão para acessar esta mensagem' }
    }

    return repositorio.marcarComoLida(id)
  }

  async remover(id: string, usuarioId: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }

    if (mensagem.remetenteId !== usuarioId) {
      throw { status: 403, mensagem: 'Você não tem permissão para remover esta mensagem' }
    }

    return repositorio.remover(id)
  }
}