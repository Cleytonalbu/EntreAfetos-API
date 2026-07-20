import { RepositorioIndicadores } from '../repositories/RepositorioIndicadores'

const repositorio = new RepositorioIndicadores()

function resolverPeriodo(dataInicio?: string, dataFim?: string) {
  const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : new Date()

  const inicio = dataInicio
    ? new Date(`${dataInicio}T00:00:00`)
    : (() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 6)
        return d
      })()

  if (inicio > fim) {
    throw { status: 400, mensagem: 'dataInicio não pode ser maior que dataFim' }
  }

  return { dataInicio: inicio, dataFim: fim }
}

export class ServicoIndicadores {

  async painelGeral(dataInicio?: string, dataFim?: string) {
    const periodo = resolverPeriodo(dataInicio, dataFim)

    const [
      contadores,
      criancasPorEspecialidade,
      criancasPorProfissional,
      comparecimento,
      resumoObjetivos,
      evolucaoPorEspecialidade,
      evolucaoPorPeriodo,
    ] = await Promise.all([
      repositorio.contadoresGerais(periodo),
      repositorio.criancasPorEspecialidade(),
      repositorio.criancasPorProfissional(),
      repositorio.comparecimentoEFaltas(periodo),
      repositorio.resumoObjetivos(),
      repositorio.evolucaoPorEspecialidade(),
      repositorio.evolucaoPorPeriodo(periodo),
    ])

    return {
      periodo: {
        dataInicio: periodo.dataInicio,
        dataFim:    periodo.dataFim,
      },
      contadores,
      criancasPorEspecialidade,
      criancasPorProfissional,
      comparecimento,
      resumoObjetivos,
      evolucaoPorEspecialidade,
      evolucaoPorPeriodo,
    }
  }

  async objetivos() {
    return repositorio.resumoObjetivos()
  }

  async frequencia(dataInicio?: string, dataFim?: string) {
    const periodo = resolverPeriodo(dataInicio, dataFim)
    return repositorio.comparecimentoEFaltas(periodo)
  }

  async alertas() {
    return repositorio.alertasGestao()
  }

  async indicadoresPaciente(pacienteId: string, dataInicio?: string, dataFim?: string) {
    if (!pacienteId) {
      throw { status: 400, mensagem: 'pacienteId é obrigatório' }
    }
    const periodo = resolverPeriodo(dataInicio, dataFim)
    return repositorio.indicadoresPaciente(pacienteId, periodo)
  }
}