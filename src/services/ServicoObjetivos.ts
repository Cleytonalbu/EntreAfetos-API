import { RepositorioObjetivos } from '../repositories/RepositorioObjetivos'

const repositorio = new RepositorioObjetivos()

const STATUS_VALIDOS = [
  'EM_ANDAMENTO',
  'ALCANCADO',
  'PARCIALMENTE_ALCANCADO',
  'NAO_TRABALHADO',
]

export class ServicoObjetivos {

  async listar(pacienteId: string, filtros?: {
    categoria?: string
    status?: string
    planoId?: string
  }) {
    return repositorio.listar(pacienteId, filtros)
  }

  async buscarPorId(id: string) {
    const objetivo = await repositorio.buscarPorId(id)
    if (!objetivo) {
      throw { status: 404, mensagem: 'Objetivo não encontrado' }
    }
    return objetivo
  }

  async criar(pacienteId: string, dados: {
    profissionalId: string
    planoId?: string
    nome: string
    descricao?: string
    categoria: string
    progresso?: number
    nivelDesempenho?: number
  }) {
    if (!dados.profissionalId || !dados.nome || !dados.categoria) {
      throw {
        status: 400,
        mensagem: 'profissionalId, nome e categoria são obrigatórios',
      }
    }

    if (dados.progresso !== undefined && (dados.progresso < 0 || dados.progresso > 100)) {
      throw { status: 400, mensagem: 'progresso deve ser entre 0 e 100' }
    }

    return repositorio.criar({ ...dados, pacienteId })
  }

  async atualizar(id: string, dados: any) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Objetivo não encontrado' }
    }

    if (dados.progresso !== undefined && (dados.progresso < 0 || dados.progresso > 100)) {
      throw { status: 400, mensagem: 'progresso deve ser entre 0 e 100' }
    }

    return repositorio.atualizar(id, dados)
  }

  async alterarStatus(id: string, status: string) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw {
        status: 400,
        mensagem: `status deve ser: ${STATUS_VALIDOS.join(', ')}`,
      }
    }

    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Objetivo não encontrado' }
    }

    // Se alcançado, progresso vai para 100 automaticamente
    if (status === 'ALCANCADO') {
      await repositorio.atualizarProgresso(id, 100, 5)
    }

    return repositorio.alterarStatus(id, status)
  }

  async atualizarProgresso(id: string, progresso: number, nivelDesempenho?: number) {
    if (progresso < 0 || progresso > 100) {
      throw { status: 400, mensagem: 'progresso deve ser entre 0 e 100' }
    }

    if (nivelDesempenho !== undefined && (nivelDesempenho < 1 || nivelDesempenho > 5)) {
      throw { status: 400, mensagem: 'nivelDesempenho deve ser entre 1 e 5' }
    }

    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Objetivo não encontrado' }
    }

    // Se progresso chegar a 100, marca como alcançado automaticamente
    if (progresso === 100) {
      await repositorio.alterarStatus(id, 'ALCANCADO')
    }

    return repositorio.atualizarProgresso(id, progresso, nivelDesempenho)
  }

  async remover(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Objetivo não encontrado' }
    }
    return repositorio.remover(id)
  }
}