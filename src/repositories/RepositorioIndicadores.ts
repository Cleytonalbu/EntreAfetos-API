import prisma from '../lib/prisma'

interface Periodo {
  dataInicio: Date
  dataFim: Date
}

export class RepositorioIndicadores {

  // ── Contadores gerais ────────────────────────────────────
  async contadoresGerais({ dataInicio, dataFim }: Periodo) {
    const [
      criancasCadastradas,
      profissionaisAtivos,
      objetivosAtivos,
      objetivosAlcancados,
      objetivosEmEvolucao,
      faltasRegistradas,
    ] = await Promise.all([
      prisma.paciente.count({ where: { status: 'ativo' } }),
      prisma.profissional.count({ where: { usuario: { ativo: true } } }),
      prisma.objetivo.count({ where: { status: 'EM_ANDAMENTO' } }),
      prisma.objetivo.count({ where: { status: 'ALCANCADO' } }),
      prisma.objetivo.count({ where: { status: 'PARCIALMENTE_ALCANCADO' } }),
      prisma.agendamento.count({
        where: {
          status: 'CANCELADO',
          dataHora: { gte: dataInicio, lte: dataFim },
        },
      }),
    ])

    return {
      criancasCadastradas,
      profissionaisAtivos,
      objetivosAtivos,
      objetivosAlcancados,
      objetivosEmEvolucao,
      faltasRegistradas,
    }
  }

  // ── Crianças por especialidade ───────────────────────────
  async criancasPorEspecialidade() {
    const resultado = await prisma.agendamento.groupBy({
      by: ['especialidadeId'],
      _count: { pacienteId: true },
      where: { especialidadeId: { not: null } },
    })

    const especialidades = await prisma.especialidade.findMany({
      select: { id: true, nome: true, cor: true },
    })

    return resultado.map((r) => {
      const esp = especialidades.find((e) => e.id === r.especialidadeId)
      return {
        especialidadeId: r.especialidadeId,
        nome:  esp?.nome ?? 'Sem especialidade',
        cor:   esp?.cor ?? null,
        total: r._count.pacienteId,
      }
    })
  }

  // ── Crianças por profissional ────────────────────────────
  async criancasPorProfissional() {
    const resultado = await prisma.agendamento.groupBy({
      by: ['profissionalId'],
      _count: { pacienteId: true },
    })

    const profissionais = await prisma.profissional.findMany({
      include: { usuario: { select: { nome: true, foto: true } } },
    })

    return resultado.map((r) => {
      const prof = profissionais.find((p) => p.id === r.profissionalId)
      return {
        profissionalId: r.profissionalId,
        nome:  prof?.usuario.nome ?? 'Desconhecido',
        foto:  prof?.usuario.foto ?? null,
        total: r._count.pacienteId,
      }
    })
  }

  // ── Comparecimento e faltas ──────────────────────────────
  async comparecimentoEFaltas({ dataInicio, dataFim }: Periodo) {
    const [concluidos, cancelados, agendados, emAtendimento] = await Promise.all([
      prisma.agendamento.count({
        where: { status: 'CONCLUIDO', dataHora: { gte: dataInicio, lte: dataFim } },
      }),
      prisma.agendamento.count({
        where: { status: 'CANCELADO', dataHora: { gte: dataInicio, lte: dataFim } },
      }),
      prisma.agendamento.count({
        where: { status: 'AGENDADO', dataHora: { gte: dataInicio, lte: dataFim } },
      }),
      prisma.agendamento.count({
        where: { status: 'EM_ATENDIMENTO', dataHora: { gte: dataInicio, lte: dataFim } },
      }),
    ])

    const total = concluidos + cancelados + agendados + emAtendimento
    const taxaComparecimento = total > 0
      ? Math.round((concluidos / total) * 100)
      : 0

    return {
      comparecimentos: concluidos,
      faltas: cancelados,
      agendados,
      emAtendimento,
      total,
      taxaComparecimento,
    }
  }

  // ── Resumo de objetivos ──────────────────────────────────
  async resumoObjetivos() {
    const resultado = await prisma.objetivo.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const total = resultado.reduce((acc, r) => acc + r._count.id, 0)

    return {
      total,
      porStatus: resultado.map((r) => ({
        status: r.status,
        total:  r._count.id,
        percentual: total > 0 ? Math.round((r._count.id / total) * 100) : 0,
      })),
    }
  }

  // ── Evolução média por especialidade ─────────────────────
  async evolucaoPorEspecialidade() {
    const objetivos = await prisma.objetivo.findMany({
      select: {
        categoria: true,
        progresso: true,
      },
    })

    const agrupado = objetivos.reduce((acc: any, o) => {
      if (!acc[o.categoria]) {
        acc[o.categoria] = { soma: 0, count: 0 }
      }
      acc[o.categoria].soma  += o.progresso
      acc[o.categoria].count += 1
      return acc
    }, {})

    return Object.entries(agrupado).map(([categoria, dados]: [string, any]) => ({
      categoria,
      mediaEvolucao: Math.round(dados.soma / dados.count),
      totalObjetivos: dados.count,
    }))
  }

  // ── Evolução por período (mensal) ────────────────────────
  async evolucaoPorPeriodo({ dataInicio, dataFim }: Periodo) {
    const evolucoes = await prisma.evolucao.findMany({
      where: {
        dataAtendimento: { gte: dataInicio, lte: dataFim },
        rascunho: false,
      },
      select: {
        dataAtendimento: true,
        objetivosSessao: {
          select: { nivelDesempenho: true },
        },
      },
      orderBy: { dataAtendimento: 'asc' },
    })

    const porMes = evolucoes.reduce((acc: any, e) => {
      const mes = `${e.dataAtendimento.getFullYear()}-${String(e.dataAtendimento.getMonth() + 1).padStart(2, '0')}`

      if (!acc[mes]) {
        acc[mes] = { soma: 0, count: 0, sessoes: 0 }
      }

      acc[mes].sessoes += 1

      e.objetivosSessao.forEach((os) => {
        if (os.nivelDesempenho) {
          acc[mes].soma  += os.nivelDesempenho
          acc[mes].count += 1
        }
      })

      return acc
    }, {})

    return Object.entries(porMes).map(([mes, dados]: [string, any]) => ({
      mes,
      sessoes: dados.sessoes,
      mediaDesempenho: dados.count > 0
        ? Math.round((dados.soma / dados.count) * 20) // converte escala 1-5 para 0-100
        : 0,
    }))
  }

  // ── Alertas de gestão ────────────────────────────────────
  async alertasGestao() {
    const quinzeDiasAtras = new Date()
    quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15)

    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    const seteDiasFrente = new Date()
    seteDiasFrente.setDate(seteDiasFrente.getDate() + 7)

    // Crianças sem atendimento há mais de 15 dias
    const pacientesAtivos = await prisma.paciente.findMany({
      where: { status: 'ativo' },
      select: {
        id: true,
        nome: true,
        agendamentos: {
          where: { status: 'CONCLUIDO' },
          orderBy: { dataHora: 'desc' },
          take: 1,
          select: { dataHora: true },
        },
      },
    })

    const criancasSemAtendimento = pacientesAtivos.filter((p) => {
      if (p.agendamentos.length === 0) return true
      return p.agendamentos[0].dataHora < quinzeDiasAtras
    })

    // Objetivos sem atualização há mais de 30 dias
    const objetivosDesatualizados = await prisma.objetivo.count({
      where: {
        status: { in: ['EM_ANDAMENTO', 'PARCIALMENTE_ALCANCADO'] },
        atualizadoEm: { lt: trintaDiasAtras },
      },
    })

    // Profissionais com agenda ociosa nos próximos 7 dias
    const profissionais = await prisma.profissional.findMany({
      where: { usuario: { ativo: true } },
      select: {
        id: true,
        usuario: { select: { nome: true } },
        agendamentos: {
          where: {
            dataHora: { gte: new Date(), lte: seteDiasFrente },
            status: { notIn: ['CANCELADO'] },
          },
          select: { id: true },
        },
      },
    })

    const profissionaisOciosos = profissionais.filter(
      (p) => p.agendamentos.length < 5
    )

    return {
      criancasSemAtendimento: {
        total: criancasSemAtendimento.length,
        detalhes: criancasSemAtendimento.slice(0, 10).map((c) => ({
          id: c.id,
          nome: c.nome,
          ultimoAtendimento: c.agendamentos[0]?.dataHora ?? null,
        })),
      },
      objetivosDesatualizados: {
        total: objetivosDesatualizados,
      },
      profissionaisOciosos: {
        total: profissionaisOciosos.length,
        detalhes: profissionaisOciosos.slice(0, 10).map((p) => ({
          id: p.id,
          nome: p.usuario.nome,
          agendamentosProximos: p.agendamentos.length,
        })),
      },
    }
  }

  // ── Indicadores de um paciente específico ────────────────
  async indicadoresPaciente(pacienteId: string, { dataInicio, dataFim }: Periodo) {
    const [objetivos, evolucoes, agendamentos] = await Promise.all([
      prisma.objetivo.findMany({
        where: { pacienteId },
        select: {
          id: true,
          nome: true,
          categoria: true,
          status: true,
          progresso: true,
          nivelDesempenho: true,
        },
      }),
      prisma.evolucao.findMany({
        where: {
          pacienteId,
          dataAtendimento: { gte: dataInicio, lte: dataFim },
          rascunho: false,
        },
        select: {
          id: true,
          dataAtendimento: true,
          resultadoGeral: true,
          objetivosSessao: {
            select: {
              objetivoId: true,
              nivelDesempenho: true,
              statusNaSessao: true,
            },
          },
        },
        orderBy: { dataAtendimento: 'asc' },
      }),
      prisma.agendamento.findMany({
        where: {
          pacienteId,
          dataHora: { gte: dataInicio, lte: dataFim },
        },
        select: { status: true, dataHora: true },
      }),
    ])

    // Evolução geral (média de progresso dos objetivos)
    const evolucaoGeral = objetivos.length > 0
      ? Math.round(objetivos.reduce((acc, o) => acc + o.progresso, 0) / objetivos.length)
      : 0

    // Desempenho por categoria
    const porCategoria = objetivos.reduce((acc: any, o) => {
      if (!acc[o.categoria]) {
        acc[o.categoria] = { soma: 0, count: 0 }
      }
      acc[o.categoria].soma  += o.progresso
      acc[o.categoria].count += 1
      return acc
    }, {})

    const desempenhoPorCategoria = Object.entries(porCategoria).map(
      ([categoria, dados]: [string, any]) => ({
        categoria,
        media: Math.round(dados.soma / dados.count),
        totalObjetivos: dados.count,
      })
    )

    // Frequência
    const concluidos = agendamentos.filter((a) => a.status === 'CONCLUIDO').length
    const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO').length
    const totalAgendamentos = agendamentos.length

    const taxaComparecimento = totalAgendamentos > 0
      ? Math.round((concluidos / totalAgendamentos) * 100)
      : 0

    // Objetivos por status
    const objetivosPorStatus = objetivos.reduce((acc: any, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {})

    return {
      evolucaoGeral,
      desempenhoPorCategoria,
      objetivos: {
        total: objetivos.length,
        porStatus: objetivosPorStatus,
        lista: objetivos,
      },
      frequencia: {
        totalSessoes: totalAgendamentos,
        concluidos,
        cancelados,
        taxaComparecimento,
      },
      evolucoes: {
        total: evolucoes.length,
        historico: evolucoes.map((e) => ({
          id: e.id,
          data: e.dataAtendimento,
          resultadoGeral: e.resultadoGeral,
          objetivosTrabalhados: e.objetivosSessao.length,
        })),
      },
    }
  }
}