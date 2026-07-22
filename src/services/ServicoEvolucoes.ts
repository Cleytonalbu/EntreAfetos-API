import { RepositorioEvolucoes } from '../repositories/RepositorioEvolucoes'
import { RepositorioObjetivos } from '../repositories/RepositorioObjetivos'

const repositorio          = new RepositorioEvolucoes()
const repositorioObjetivos = new RepositorioObjetivos()

const TIPOS_ATENDIMENTO  = ['individual', 'grupo', 'domiciliar', 'teleconsulta']
const RESULTADOS_GERAIS  = ['abaixo_esperado', 'dentro_esperado', 'acima_esperado']

export class ServicoEvolucoes {

  async listar(pacienteId: string, filtros?: {
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    rascunho?: boolean
  }) {
    return repositorio.listar(pacienteId, filtros)
  }

  async buscarPorId(id: string) {
    const evolucao = await repositorio.buscarPorId(id)
    if (!evolucao) {
      throw { status: 404, mensagem: 'Evolução não encontrada' }
    }
    return evolucao
  }

  async criar(dados: {

    pacienteId: string
    profissionalId: string
    agendamentoId?: string
    modeloEvolucaoId?: string
    dataAtendimento: string
    horaInicio: string
    horaFim: string
    especialidade: string
    tipoAtendimento: string
    localAtendimento?: string
    evolucaoEscrita?: string
    resultadoGeral?: string
    impactos?: string[]
    observacoes?: string
    respostas?: any
    rascunho?: boolean
    objetivosSessao?: {
      objetivoId: string
      statusNaSessao: string
      nivelDesempenho?: number
    }[]
  }) {
    if (!dados.pacienteId || !dados.profissionalId || !dados.dataAtendimento ||
        !dados.horaInicio  || !dados.horaFim        || !dados.especialidade   ||
        !dados.tipoAtendimento) {
      throw {
        status: 400,
        mensagem: 'pacienteId, profissionalId, dataAtendimento, horaInicio, horaFim, especialidade e tipoAtendimento são obrigatórios',
      }
    }

    if (!TIPOS_ATENDIMENTO.includes(dados.tipoAtendimento)) {
      throw {
        status: 400,
        mensagem: `tipoAtendimento deve ser: ${TIPOS_ATENDIMENTO.join(', ')}`,
      }
    }

    if (dados.resultadoGeral && !RESULTADOS_GERAIS.includes(dados.resultadoGeral)) {
      throw {
        status: 400,
        mensagem: `resultadoGeral deve ser: ${RESULTADOS_GERAIS.join(', ')}`,
      }
    }

    const evolucao = await repositorio.criar({
      pacienteId:        dados.pacienteId,
      profissionalId:    dados.profissionalId,
      agendamentoId:     dados.agendamentoId,
      modeloEvolucaoId:  dados.modeloEvolucaoId,
      dataAtendimento:   new Date(dados.dataAtendimento),
      horaInicio:        new Date(`${dados.dataAtendimento}T${dados.horaInicio}`),
      horaFim:           new Date(`${dados.dataAtendimento}T${dados.horaFim}`),
      especialidade:     dados.especialidade,
      tipoAtendimento:   dados.tipoAtendimento,
      localAtendimento:  dados.localAtendimento,
      evolucaoEscrita:   dados.evolucaoEscrita,
      resultadoGeral:    dados.resultadoGeral,
      impactos:          dados.impactos,
      observacoes:       dados.observacoes,
      respostas:         dados.respostas,
      rascunho:          dados.rascunho,
})

    // Vincula objetivos da sessão se informados
    if (dados.objetivosSessao && dados.objetivosSessao.length > 0) {
      await repositorio.vincularObjetivosSessao(evolucao.id, dados.objetivosSessao)

      // Atualiza progresso dos objetivos trabalhados
      for (const obj of dados.objetivosSessao) {
        if (obj.nivelDesempenho) {
          const objetivo = await repositorioObjetivos.buscarPorId(obj.objetivoId)
          if (objetivo) {
            await repositorioObjetivos.atualizarProgresso(
              obj.objetivoId,
              objetivo.progresso,
              obj.nivelDesempenho
            )
          }
        }
      }
    }

    return repositorio.buscarPorId(evolucao.id)
  }

  async atualizar(id: string, dados: any) {
    const evolucao = await repositorio.buscarPorId(id)
    if (!evolucao) {
      throw { status: 404, mensagem: 'Evolução não encontrada' }
    }

    if (!evolucao.rascunho) {
      throw { status: 400, mensagem: 'Não é possível editar uma evolução já assinada' }
    }

    if (dados.tipoAtendimento && !TIPOS_ATENDIMENTO.includes(dados.tipoAtendimento)) {
      throw {
        status: 400,
        mensagem: `tipoAtendimento deve ser: ${TIPOS_ATENDIMENTO.join(', ')}`,
      }
    }

    // Atualiza objetivos da sessão se informados
    if (dados.objetivosSessao) {
      await repositorio.vincularObjetivosSessao(id, dados.objetivosSessao)
      delete dados.objetivosSessao
    }

    return repositorio.atualizar(id, {
      ...dados,
      ...(dados.dataAtendimento && { dataAtendimento: new Date(dados.dataAtendimento) }),
      ...(dados.horaInicio      && dados.dataAtendimento && {
        horaInicio: new Date(`${dados.dataAtendimento}T${dados.horaInicio}`),
      }),
      ...(dados.horaFim         && dados.dataAtendimento && {
        horaFim: new Date(`${dados.dataAtendimento}T${dados.horaFim}`),
      }),
    })
  }

  async assinar(id: string, profissionalId: string) {
    const evolucao = await repositorio.buscarPorId(id)
    if (!evolucao) {
      throw { status: 404, mensagem: 'Evolução não encontrada' }
    }

    if (!evolucao.rascunho) {
      throw { status: 400, mensagem: 'Evolução já foi assinada' }
    }

    if (evolucao.profissionalId !== profissionalId) {
      throw { status: 403, mensagem: 'Apenas o profissional responsável pode assinar esta evolução' }
    }

    if (!evolucao.evolucaoEscrita) {
      throw { status: 400, mensagem: 'A evolução escrita é obrigatória antes de assinar' }
    }

    return repositorio.assinar(id, profissionalId)
  }

  async remover(id: string) {
    const evolucao = await repositorio.buscarPorId(id)
    if (!evolucao) {
      throw { status: 404, mensagem: 'Evolução não encontrada' }
    }

    if (!evolucao.rascunho) {
      throw { status: 400, mensagem: 'Não é possível remover uma evolução já assinada' }
    }

    return repositorio.remover(id)
  }
}