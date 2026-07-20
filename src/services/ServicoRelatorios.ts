import { RepositorioRelatorios } from '../repositories/RepositorioRelatorios'

const repositorio = new RepositorioRelatorios()

const TIPOS_VALIDOS = [
  'individual',
  'por_especialidade',
  'por_profissional',
  'objetivos',
  'evolucao_clinica',
  'frequencia',
]

function resolverPeriodo(dataInicio?: string, dataFim?: string) {
  const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date()

  const inicio = dataInicio
    ? new Date(`${dataInicio}T00:00:00`)
    : (() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 1)
        return d
      })()

  if (inicio > fim) {
    throw { status: 400, mensagem: 'dataInicio não pode ser maior que dataFim' }
  }

  return { dataInicio: inicio, dataFim: fim }
}

export class ServicoRelatorios {

  async listarTipos() {
    return [
      {
        tipo: 'individual',
        nome: 'Relatório Individual da Criança',
        descricao: 'Visão completa do acompanhamento e evolução da criança',
        requerPaciente: true,
      },
      {
        tipo: 'por_especialidade',
        nome: 'Relatório por Especialidade',
        descricao: 'Panorama das crianças atendidas por especialidade',
        requerPaciente: false,
      },
      {
        tipo: 'por_profissional',
        nome: 'Relatório por Profissional',
        descricao: 'Desempenho e acompanhamento dos profissionais',
        requerPaciente: false,
      },
      {
        tipo: 'objetivos',
        nome: 'Relatório de Objetivos',
        descricao: 'Acompanhamento detalhado dos objetivos terapêuticos',
        requerPaciente: false,
      },
      {
        tipo: 'evolucao_clinica',
        nome: 'Relatório de Evolução Clínica',
        descricao: 'Análise da evolução clínica ao longo do tempo',
        requerPaciente: false,
      },
      {
        tipo: 'frequencia',
        nome: 'Relatório de Frequência e Faltas',
        descricao: 'Resumo de frequência, faltas e sessões no período',
        requerPaciente: false,
      },
    ]
  }

  async gerar(params: {
    tipo: string
    dataInicio?: string
    dataFim?: string
    pacienteId?: string
    profissionalId?: string
    especialidadeId?: string
    especialidade?: string
    categoria?: string
    status?: string
  }) {
    if (!params.tipo) {
      throw { status: 400, mensagem: 'tipo é obrigatório' }
    }

    if (!TIPOS_VALIDOS.includes(params.tipo)) {
      throw {
        status: 400,
        mensagem: `tipo deve ser: ${TIPOS_VALIDOS.join(', ')}`,
      }
    }

    const periodo = resolverPeriodo(params.dataInicio, params.dataFim)

    switch (params.tipo) {
      case 'individual': {
        if (!params.pacienteId) {
          throw { status: 400, mensagem: 'pacienteId é obrigatório para o relatório individual' }
        }
        const dados = await repositorio.relatorioIndividual(params.pacienteId, periodo)
        if (!dados) {
          throw { status: 404, mensagem: 'Paciente não encontrado' }
        }
        return { tipo: params.tipo, periodo, dados }
      }

      case 'por_especialidade': {
        const dados = await repositorio.relatorioPorEspecialidade(
          periodo,
          params.especialidadeId
        )
        return { tipo: params.tipo, periodo, dados }
      }

      case 'por_profissional': {
        const dados = await repositorio.relatorioPorProfissional(
          periodo,
          params.profissionalId
        )
        return { tipo: params.tipo, periodo, dados }
      }

      case 'objetivos': {
        const dados = await repositorio.relatorioObjetivos(periodo, {
          pacienteId:     params.pacienteId,
          profissionalId: params.profissionalId,
          categoria:      params.categoria,
          status:         params.status,
        })
        return { tipo: params.tipo, periodo, dados }
      }

      case 'evolucao_clinica': {
        const dados = await repositorio.relatorioEvolucaoClinica(periodo, {
          pacienteId:    params.pacienteId,
          especialidade: params.especialidade,
        })
        return { tipo: params.tipo, periodo, dados }
      }

      case 'frequencia': {
        const dados = await repositorio.relatorioFrequencia(periodo, {
          pacienteId:     params.pacienteId,
          profissionalId: params.profissionalId,
        })
        return { tipo: params.tipo, periodo, dados }
      }

      default:
        throw { status: 400, mensagem: 'Tipo de relatório não implementado' }
    }
  }

  async listarHistorico(filtros?: {
    profissionalId?: string
    pacienteId?: string
    tipo?: string
  }) {
    return repositorio.listarHistorico(filtros)
  }

  async registrarGeracao(dados: {
    profissionalId: string
    pacienteId?: string
    tipo: string
    formato?: string
    dataInicio?: string
    dataFim?: string
  }) {
    if (!dados.profissionalId || !dados.tipo) {
      throw { status: 400, mensagem: 'profissionalId e tipo são obrigatórios' }
    }

    if (!TIPOS_VALIDOS.includes(dados.tipo)) {
      throw {
        status: 400,
        mensagem: `tipo deve ser: ${TIPOS_VALIDOS.join(', ')}`,
      }
    }

    const periodo = resolverPeriodo(dados.dataInicio, dados.dataFim)

    return repositorio.registrarGeracao({
      profissionalId: dados.profissionalId,
      pacienteId:     dados.pacienteId,
      tipo:           dados.tipo,
      formato:        dados.formato ?? 'PDF',
      periodoInicio:  periodo.dataInicio,
      periodoFim:     periodo.dataFim,
    })
  }

  async removerRegistro(id: string) {
    const registro = await repositorio.buscarRegistro(id)
    if (!registro) {
      throw { status: 404, mensagem: 'Registro de relatório não encontrado' }
    }
    return repositorio.removerRegistro(id)
  }
}