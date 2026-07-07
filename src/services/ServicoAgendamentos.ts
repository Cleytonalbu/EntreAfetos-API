import { RepositorioAgendamentos } from '../repositories/RepositorioAgendamentos'
import { RepositorioServicos } from '../repositories/RepositorioServicos'

const repositorio     = new RepositorioAgendamentos()
const repoServicos    = new RepositorioServicos()

const STATUS_VALIDOS = [
  'AGENDADO', 'AGUARDANDO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO',
]

export class ServicoAgendamentos {

  async listar(filtros: {
    data?: string
    profissionalId?: string
    pacienteId?: string
    status?: string
    pagina: number
    porPagina: number
  }) {
    return repositorio.listar(filtros)
  }

  async buscarPorId(id: string) {
    const agendamento = await repositorio.buscarPorId(id)
    if (!agendamento) {
      throw { status: 404, mensagem: 'Agendamento não encontrado' }
    }
    return agendamento
  }

  async criar(dados: {
    pacienteId: string
    profissionalId: string
    servicoId: string
    especialidadeId?: string
    convenioId?: string
    salaId?: string
    dataHora: string
    observacoes?: string
    rascunho?: boolean
  }) {
    if (!dados.pacienteId || !dados.profissionalId || !dados.servicoId || !dados.dataHora) {
      throw { status: 400, mensagem: 'pacienteId, profissionalId, servicoId e dataHora são obrigatórios' }
    }

    const servico = await repoServicos.buscarPorId(dados.servicoId)
    if (!servico) {
      throw { status: 404, mensagem: 'Serviço não encontrado' }
    }

    const dataAgendamento = new Date(dados.dataHora)
    const fimAgendamento  = new Date(
      dataAgendamento.getTime() + servico.duracaoMin * 60 * 1000
    )

    const conflito = await repositorio.buscarConflito(
      dados.profissionalId,
      dataAgendamento,
      fimAgendamento
    )

    if (conflito) {
      throw { status: 409, mensagem: 'O profissional já possui um agendamento neste horário' }
    }

    return repositorio.criar({
      ...dados,
      dataHora: dataAgendamento,
    })
  }

  async atualizar(id: string, dados: any) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Agendamento não encontrado' }
    }

    return repositorio.atualizar(id, {
      ...dados,
      ...(dados.dataHora && { dataHora: new Date(dados.dataHora) }),
    })
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
      throw { status: 404, mensagem: 'Agendamento não encontrado' }
    }

    return repositorio.alterarStatus(id, status)
  }

  async cancelar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Agendamento não encontrado' }
    }
    return repositorio.cancelar(id)
  }
}