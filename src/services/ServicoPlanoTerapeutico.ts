import { RepositorioPlanoTerapeutico } from '../repositories/RepositorioPlanoTerapeutico'

const repositorio = new RepositorioPlanoTerapeutico()

const STATUS_VALIDOS = ['ATIVO', 'EM_REVISAO', 'PAUSADO', 'ENCERRADO']

export class ServicoPlanoTerapeutico {

  async buscarAtivoPorPaciente(pacienteId: string) {
    const plano = await repositorio.buscarAtivoPorPaciente(pacienteId)
    if (!plano) {
      throw { status: 404, mensagem: 'Nenhum plano terapêutico ativo encontrado para este paciente' }
    }
    return plano
  }

  async buscarPorId(id: string) {
    const plano = await repositorio.buscarPorId(id)
    if (!plano) {
      throw { status: 404, mensagem: 'Plano terapêutico não encontrado' }
    }
    return plano
  }

  async buscarHistoricoPorPaciente(pacienteId: string) {
    return repositorio.buscarHistoricoPorPaciente(pacienteId)
  }

  async criar(pacienteId: string, dados: {
    profissionalId: string
    dataAvaliacao: string
    dataInicio: string
    dataProximaRevisao: string
    versao?: string
    especialidadePrincipal: string
    outrasEspecialidades?: string[]
    localAtendimento?: string
    queixasPrincipais?: string
    necessidadesIdentificadas?: string
    objetivoGeral?: string
    estrategiasTerapeuticas?: string
    observacoes?: string
    frequenciaSemanal?: number
    duracaoSessaoMin?: number
    totalMensalSessoes?: number
  }) {
    if (!dados.profissionalId || !dados.dataAvaliacao || !dados.dataInicio || !dados.dataProximaRevisao || !dados.especialidadePrincipal) {
      throw {
        status: 400,
        mensagem: 'profissionalId, dataAvaliacao, dataInicio, dataProximaRevisao e especialidadePrincipal são obrigatórios',
      }
    }

    return repositorio.criar({
      ...dados,
      pacienteId,
      dataAvaliacao:       new Date(dados.dataAvaliacao),
      dataInicio:          new Date(dados.dataInicio),
      dataProximaRevisao:  new Date(dados.dataProximaRevisao),
    })
  }

  async atualizar(id: string, dados: any) {
    const plano = await repositorio.buscarPorId(id)
    if (!plano) {
      throw { status: 404, mensagem: 'Plano terapêutico não encontrado' }
    }

    return repositorio.atualizar(id, {
      ...dados,
      ...(dados.dataAvaliacao      && { dataAvaliacao:      new Date(dados.dataAvaliacao) }),
      ...(dados.dataInicio         && { dataInicio:         new Date(dados.dataInicio) }),
      ...(dados.dataProximaRevisao && { dataProximaRevisao: new Date(dados.dataProximaRevisao) }),
    })
  }

  async alterarStatus(id: string, status: string) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw {
        status: 400,
        mensagem: `status deve ser: ${STATUS_VALIDOS.join(', ')}`,
      }
    }

    const plano = await repositorio.buscarPorId(id)
    if (!plano) {
      throw { status: 404, mensagem: 'Plano terapêutico não encontrado' }
    }

    return repositorio.alterarStatus(id, status)
  }
}