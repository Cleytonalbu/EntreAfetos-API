import { RepositorioEncaminhamentos } from '../repositories/RepositorioEncaminhamentos'

const repositorio = new RepositorioEncaminhamentos()

const STATUS_VALIDOS    = ['PENDENTE', 'ACEITO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO']
const PRIORIDADE_VALIDA = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']

export class ServicoEncaminhamentos {

  async listar(filtros?: {
    pacienteId?: string
    profissionalOrigemId?: string
    especialidadeId?: string
    status?: string
    prioridade?: string
    dataInicio?: string
    dataFim?: string
  }) {
    return repositorio.listar(filtros)
  }

  async buscarPorId(id: string) {
    const encaminhamento = await repositorio.buscarPorId(id)
    if (!encaminhamento) {
      throw { status: 404, mensagem: 'Encaminhamento não encontrado' }
    }
    return encaminhamento
  }

  async criar(dados: {
    pacienteId: string
    profissionalOrigemId: string
    profissionalDestinoId?: string
    evolucaoId?: string
    especialidadeId?: string
    motivo: string
    observacoes?: string
    prioridade?: string
  }) {
    if (!dados.pacienteId || !dados.profissionalOrigemId || !dados.motivo) {
      throw {
        status: 400,
        mensagem: 'pacienteId, profissionalOrigemId e motivo são obrigatórios',
      }
    }

    if (dados.prioridade && !PRIORIDADE_VALIDA.includes(dados.prioridade.toUpperCase())) {
      throw {
        status: 400,
        mensagem: `prioridade deve ser: ${PRIORIDADE_VALIDA.join(', ')}`,
      }
    }

    return repositorio.criar({
      ...dados,
      prioridade: dados.prioridade?.toUpperCase() ?? 'MEDIA',
    })
  }

  async alterarStatus(id: string, status: string) {
    if (!STATUS_VALIDOS.includes(status.toUpperCase())) {
      throw {
        status: 400,
        mensagem: `status deve ser: ${STATUS_VALIDOS.join(', ')}`,
      }
    }

    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Encaminhamento não encontrado' }
    }

    if (existe.status === 'CANCELADO') {
      throw { status: 400, mensagem: 'Não é possível alterar o status de um encaminhamento cancelado' }
    }

    if (existe.status === 'CONCLUIDO') {
      throw { status: 400, mensagem: 'Não é possível alterar o status de um encaminhamento concluído' }
    }

    return repositorio.alterarStatus(id, status.toUpperCase())
  }

  async cancelar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Encaminhamento não encontrado' }
    }

    if (existe.status === 'CANCELADO') {
      throw { status: 400, mensagem: 'Encaminhamento já está cancelado' }
    }

    if (existe.status === 'CONCLUIDO') {
      throw { status: 400, mensagem: 'Não é possível cancelar um encaminhamento concluído' }
    }

    return repositorio.cancelar(id)
  }
}