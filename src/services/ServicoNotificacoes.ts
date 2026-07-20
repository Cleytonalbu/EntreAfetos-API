import { RepositorioNotificacoes } from '../repositories/RepositorioNotificacoes'

const repositorio = new RepositorioNotificacoes()

const TIPOS_VALIDOS = [
  'lembrete_consulta',
  'confirmacao_consulta',
  'faltas_ausencias',
  'novos_objetivos',
  'relatorios_prontos',
  'novo_agendamento',
  'pagamento_recebido',
  'encaminhamento',
  'geral',
]

export class ServicoNotificacoes {

  async listar(usuarioId: string, filtros?: {
    lida?: boolean
    tipo?: string
  }) {
    const notificacoes = await repositorio.listar(usuarioId, filtros)
    const totalNaoLidas = await repositorio.contarNaoLidas(usuarioId)

    return { notificacoes, totalNaoLidas }
  }

  async criar(dados: {
    usuarioId: string
    tipo: string
    texto: string
  }) {
    if (!dados.usuarioId || !dados.tipo || !dados.texto) {
      throw { status: 400, mensagem: 'usuarioId, tipo e texto são obrigatórios' }
    }

    if (!TIPOS_VALIDOS.includes(dados.tipo)) {
      throw {
        status: 400,
        mensagem: `tipo deve ser: ${TIPOS_VALIDOS.join(', ')}`,
      }
    }

    return repositorio.criar(dados)
  }

  async marcarComoLida(id: string, usuarioId: string) {
    const notificacao = await repositorio.buscarPorId(id)
    if (!notificacao) {
      throw { status: 404, mensagem: 'Notificação não encontrada' }
    }

    if (notificacao.usuarioId !== usuarioId) {
      throw { status: 403, mensagem: 'Você não tem permissão para acessar esta notificação' }
    }

    return repositorio.marcarComoLida(id)
  }

  async marcarTodasComoLidas(usuarioId: string) {
    return repositorio.marcarTodasComoLidas(usuarioId)
  }

  async remover(id: string, usuarioId: string) {
    const notificacao = await repositorio.buscarPorId(id)
    if (!notificacao) {
      throw { status: 404, mensagem: 'Notificação não encontrada' }
    }

    if (notificacao.usuarioId !== usuarioId) {
      throw { status: 403, mensagem: 'Você não tem permissão para remover esta notificação' }
    }

    return repositorio.remover(id)
  }

  async removerTodas(usuarioId: string) {
    return repositorio.removerTodas(usuarioId)
  }
}