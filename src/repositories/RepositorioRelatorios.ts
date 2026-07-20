import prisma from '../lib/prisma'

interface Periodo {
  dataInicio: Date
  dataFim: Date
}

export class RepositorioRelatorios {

  // ── Histórico de relatórios gerados ──────────────────────
  async listarHistorico(filtros?: {
    profissionalId?: string
    pacienteId?: string
    tipo?: string
  }) {
    return prisma.relatorio.findMany({
      where: {
        ...(filtros?.profissionalId && { profissionalId: filtros.profissionalId }),
        ...(filtros?.pacienteId     && { pacienteId: filtros.pacienteId }),
        ...(filtros?.tipo           && { tipo: filtros.tipo }),
      },
      orderBy: { geradoEm: 'desc' },
      include: {
        profissional: {
          include: { usuario: { select: { id: true, nome: true } } },
        },
        paciente: {
          select: { id: true, nome: true },
        },
      },
    })
  }

  async registrarGeracao(dados: {
    profissionalId: string
    pacienteId?: string
    tipo: string
    formato: string
    periodoInicio: Date
    periodoFim: Date
  }) {
    return prisma.relatorio.create({ data: dados })
  }

  async removerRegistro(id: string) {
    return prisma.relatorio.delete({ where: { id } })
  }

  async buscarRegistro(id: string) {
    return prisma.relatorio.findUnique({ where: { id } })
  }

  // ── 1. Relatório individual da criança ───────────────────
  async relatorioIndividual(pacienteId: string, { dataInicio, dataFim }: Periodo) {
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      select: {
        id: true,
        nome: true,
        dataNascimento: true,
        sexo: true,
        responsavel: true,
        telefone: true,
        diagnostico: true,
        tags: true,
        status: true,
        criadoEm: true,
      },
    })

    if (!paciente) return null

    const [plano, objetivos, evolucoes, agendamentos, encaminhamentos] = await Promise.all([
      prisma.planoTerapeutico.findFirst({
        where: { pacienteId, status: 'ATIVO' },
        include: {
          profissional: {
            include: { usuario: { select: { nome: true } } },
          },
        },
      }),
      prisma.objetivo.findMany({
        where: { pacienteId },
        select: {
          id: true,
          nome: true,
          descricao: true,
          categoria: true,
          status: true,
          progresso: true,
          nivelDesempenho: true,
          criadoEm: true,
        },
        orderBy: { criadoEm: 'desc' },
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
          especialidade: true,
          tipoAtendimento: true,
          resultadoGeral: true,
          impactos: true,
          profissional: {
            include: { usuario: { select: { nome: true } } },
          },
          objetivosSessao: {
            select: {
              statusNaSessao: true,
              nivelDesempenho: true,
              objetivo: { select: { nome: true, categoria: true } },
            },
          },
        },
        orderBy: { dataAtendimento: 'desc' },
      }),
      prisma.agendamento.findMany({
        where: {
          pacienteId,
          dataHora: { gte: dataInicio, lte: dataFim },
        },
        select: { status: true, dataHora: true },
      }),
      prisma.encaminhamento.findMany({
        where: {
          pacienteId,
          criadoEm: { gte: dataInicio, lte: dataFim },
        },
        select: {
          id: true,
          motivo: true,
          prioridade: true,
          status: true,
          criadoEm: true,
          especialidade: { select: { nome: true } },
        },
      }),
    ])

    // Especialidades em acompanhamento
    const especialidades = [...new Set(evolucoes.map((e) => e.especialidade))]

    // Frequência
    const concluidos = agendamentos.filter((a) => a.status === 'CONCLUIDO').length
    const cancelados = agendamentos.filter((a) => a.status === 'CANCELADO').length
    const total      = agendamentos.length

    return {
      paciente,
      planoTerapeutico: plano,
      especialidadesEmAcompanhamento: especialidades,
      objetivos: {
        total: objetivos.length,
        alcancados:  objetivos.filter((o) => o.status === 'ALCANCADO').length,
        emAndamento: objetivos.filter((o) => o.status === 'EM_ANDAMENTO').length,
        lista: objetivos,
      },
      evolucoes: {
        total: evolucoes.length,
        lista: evolucoes,
      },
      frequencia: {
        totalSessoes: total,
        realizadas: concluidos,
        canceladas: cancelados,
        taxaComparecimento: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      },
      encaminhamentos,
    }
  }

  // ── 2. Relatório por especialidade ───────────────────────
  async relatorioPorEspecialidade(
    { dataInicio, dataFim }: Periodo,
    especialidadeId?: string
  ) {
    const especialidades = await prisma.especialidade.findMany({
      where: {
        ativo: true,
        ...(especialidadeId && { id: especialidadeId }),
      },
      select: { id: true, nome: true, cor: true, categoria: true },
    })

    const resultado = await Promise.all(
      especialidades.map(async (esp) => {
        const [agendamentos, profissionais] = await Promise.all([
          prisma.agendamento.findMany({
            where: {
              especialidadeId: esp.id,
              dataHora: { gte: dataInicio, lte: dataFim },
            },
            select: { pacienteId: true, status: true },
          }),
          prisma.profissionalEspecialidade.count({
            where: { especialidadeId: esp.id },
          }),
        ])

        const pacientesUnicos = new Set(agendamentos.map((a) => a.pacienteId))
        const realizadas = agendamentos.filter((a) => a.status === 'CONCLUIDO').length
        const faltas     = agendamentos.filter((a) => a.status === 'CANCELADO').length
        const total      = agendamentos.length

        // Objetivos da categoria correspondente
        const objetivos = await prisma.objetivo.findMany({
          where: { categoria: esp.categoria },
          select: { status: true, progresso: true },
        })

        const mediaEvolucao = objetivos.length > 0
          ? Math.round(objetivos.reduce((acc, o) => acc + o.progresso, 0) / objetivos.length)
          : 0

        return {
          especialidade: esp,
          criancasAtendidas: pacientesUnicos.size,
          profissionaisVinculados: profissionais,
          sessoes: {
            total,
            realizadas,
            faltas,
            taxaComparecimento: total > 0 ? Math.round((realizadas / total) * 100) : 0,
          },
          objetivos: {
            total: objetivos.length,
            alcancados: objetivos.filter((o) => o.status === 'ALCANCADO').length,
            mediaEvolucao,
          },
        }
      })
    )

    return resultado
  }

  // ── 3. Relatório por profissional ────────────────────────
  async relatorioPorProfissional(
    { dataInicio, dataFim }: Periodo,
    profissionalId?: string
  ) {
    const profissionais = await prisma.profissional.findMany({
      where: {
        usuario: { ativo: true },
        ...(profissionalId && { id: profissionalId }),
      },
      include: {
        usuario: { select: { id: true, nome: true, foto: true } },
        especialidades: {
          include: { especialidade: { select: { nome: true } } },
        },
      },
    })

    const resultado = await Promise.all(
      profissionais.map(async (prof) => {
        const [agendamentos, evolucoes, objetivos] = await Promise.all([
          prisma.agendamento.findMany({
            where: {
              profissionalId: prof.id,
              dataHora: { gte: dataInicio, lte: dataFim },
            },
            select: { pacienteId: true, status: true },
          }),
          prisma.evolucao.count({
            where: {
              profissionalId: prof.id,
              dataAtendimento: { gte: dataInicio, lte: dataFim },
              rascunho: false,
            },
          }),
          prisma.objetivo.findMany({
            where: { profissionalId: prof.id },
            select: { status: true, progresso: true },
          }),
        ])

        const pacientesUnicos = new Set(agendamentos.map((a) => a.pacienteId))
        const realizadas = agendamentos.filter((a) => a.status === 'CONCLUIDO').length
        const total      = agendamentos.length

        const mediaEvolucao = objetivos.length > 0
          ? Math.round(objetivos.reduce((acc, o) => acc + o.progresso, 0) / objetivos.length)
          : 0

        return {
          profissional: {
            id: prof.id,
            nome: prof.usuario.nome,
            foto: prof.usuario.foto,
            registro: prof.registro,
            especialidades: prof.especialidades.map((e) => e.especialidade.nome),
          },
          criancasAtendidas: pacientesUnicos.size,
          sessoes: {
            total,
            realizadas,
            taxaComparecimento: total > 0 ? Math.round((realizadas / total) * 100) : 0,
          },
          evolucoesRegistradas: evolucoes,
          objetivos: {
            total: objetivos.length,
            alcancados: objetivos.filter((o) => o.status === 'ALCANCADO').length,
            mediaEvolucao,
          },
        }
      })
    )

    return resultado
  }

  // ── 4. Relatório de objetivos ────────────────────────────
  async relatorioObjetivos(
    { dataInicio, dataFim }: Periodo,
    filtros?: { pacienteId?: string; profissionalId?: string; categoria?: string; status?: string }
  ) {
    const objetivos = await prisma.objetivo.findMany({
      where: {
        ...(filtros?.pacienteId     && { pacienteId: filtros.pacienteId }),
        ...(filtros?.profissionalId && { profissionalId: filtros.profissionalId }),
        ...(filtros?.categoria      && { categoria: filtros.categoria }),
        ...(filtros?.status         && { status: filtros.status as any }),
        criadoEm: { gte: dataInicio, lte: dataFim },
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: {
          include: { usuario: { select: { nome: true } } },
        },
        _count: { select: { sessoes: true } },
      },
      orderBy: { criadoEm: 'desc' },
    })

    // Agrupamento por status
    const porStatus = objetivos.reduce((acc: any, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1
      return acc
    }, {})

    // Agrupamento por categoria
    const porCategoria = objetivos.reduce((acc: any, o) => {
      if (!acc[o.categoria]) {
        acc[o.categoria] = { total: 0, somaProgresso: 0 }
      }
      acc[o.categoria].total += 1
      acc[o.categoria].somaProgresso += o.progresso
      return acc
    }, {})

    const resumoPorCategoria = Object.entries(porCategoria).map(
      ([categoria, dados]: [string, any]) => ({
        categoria,
        total: dados.total,
        mediaProgresso: Math.round(dados.somaProgresso / dados.total),
      })
    )

    return {
      total: objetivos.length,
      porStatus,
      porCategoria: resumoPorCategoria,
      lista: objetivos,
    }
  }

  // ── 5. Relatório de evolução clínica ─────────────────────
  async relatorioEvolucaoClinica(
    { dataInicio, dataFim }: Periodo,
    filtros?: { pacienteId?: string; especialidade?: string }
  ) {
    const evolucoes = await prisma.evolucao.findMany({
      where: {
        rascunho: false,
        dataAtendimento: { gte: dataInicio, lte: dataFim },
        ...(filtros?.pacienteId    && { pacienteId: filtros.pacienteId }),
        ...(filtros?.especialidade && { especialidade: filtros.especialidade }),
      },
      select: {
        id: true,
        dataAtendimento: true,
        especialidade: true,
        resultadoGeral: true,
        impactos: true,
        paciente: { select: { id: true, nome: true } },
        profissional: {
          include: { usuario: { select: { nome: true } } },
        },
        objetivosSessao: {
          select: {
            nivelDesempenho: true,
            statusNaSessao: true,
            objetivo: { select: { nome: true, categoria: true } },
          },
        },
      },
      orderBy: { dataAtendimento: 'asc' },
    })

    // Evolução mensal
    const porMes = evolucoes.reduce((acc: any, e) => {
      const mes = `${e.dataAtendimento.getFullYear()}-${String(e.dataAtendimento.getMonth() + 1).padStart(2, '0')}`

      if (!acc[mes]) {
        acc[mes] = { sessoes: 0, somaDesempenho: 0, countDesempenho: 0 }
      }

      acc[mes].sessoes += 1
      e.objetivosSessao.forEach((os) => {
        if (os.nivelDesempenho) {
          acc[mes].somaDesempenho  += os.nivelDesempenho
          acc[mes].countDesempenho += 1
        }
      })

      return acc
    }, {})

    const evolucaoMensal = Object.entries(porMes).map(
      ([mes, dados]: [string, any]) => ({
        mes,
        sessoes: dados.sessoes,
        mediaDesempenho: dados.countDesempenho > 0
          ? Math.round((dados.somaDesempenho / dados.countDesempenho) * 20)
          : 0,
      })
    )

    // Por especialidade
    const porEspecialidade = evolucoes.reduce((acc: any, e) => {
      if (!acc[e.especialidade]) {
        acc[e.especialidade] = { sessoes: 0, soma: 0, count: 0 }
      }
      acc[e.especialidade].sessoes += 1
      e.objetivosSessao.forEach((os) => {
        if (os.nivelDesempenho) {
          acc[e.especialidade].soma  += os.nivelDesempenho
          acc[e.especialidade].count += 1
        }
      })
      return acc
    }, {})

    const resumoPorEspecialidade = Object.entries(porEspecialidade).map(
      ([especialidade, dados]: [string, any]) => ({
        especialidade,
        sessoes: dados.sessoes,
        mediaDesempenho: dados.count > 0
          ? Math.round((dados.soma / dados.count) * 20)
          : 0,
      })
    )

    // Resultados gerais
    const resultados = evolucoes.reduce((acc: any, e) => {
      if (e.resultadoGeral) {
        acc[e.resultadoGeral] = (acc[e.resultadoGeral] ?? 0) + 1
      }
      return acc
    }, {})

    return {
      totalEvolucoes: evolucoes.length,
      evolucaoMensal,
      porEspecialidade: resumoPorEspecialidade,
      resultadosGerais: resultados,
      lista: evolucoes,
    }
  }

  // ── 6. Relatório de frequência e faltas ──────────────────
  async relatorioFrequencia(
    { dataInicio, dataFim }: Periodo,
    filtros?: { pacienteId?: string; profissionalId?: string }
  ) {
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        dataHora: { gte: dataInicio, lte: dataFim },
        ...(filtros?.pacienteId     && { pacienteId: filtros.pacienteId }),
        ...(filtros?.profissionalId && { profissionalId: filtros.profissionalId }),
      },
      select: {
        id: true,
        dataHora: true,
        status: true,
        observacoes: true,
        paciente:     { select: { id: true, nome: true } },
        profissional: {
          include: { usuario: { select: { nome: true } } },
        },
        especialidade: { select: { nome: true } },
      },
      orderBy: { dataHora: 'desc' },
    })

    const realizadas  = agendamentos.filter((a) => a.status === 'CONCLUIDO').length
    const canceladas  = agendamentos.filter((a) => a.status === 'CANCELADO').length
    const agendadas   = agendamentos.filter((a) => a.status === 'AGENDADO').length
    const aguardando  = agendamentos.filter((a) => a.status === 'AGUARDANDO').length
    const total       = agendamentos.length

    // Por paciente
    const porPaciente = agendamentos.reduce((acc: any, a) => {
      const id = a.paciente.id
      if (!acc[id]) {
        acc[id] = { nome: a.paciente.nome, total: 0, realizadas: 0, faltas: 0 }
      }
      acc[id].total += 1
      if (a.status === 'CONCLUIDO') acc[id].realizadas += 1
      if (a.status === 'CANCELADO') acc[id].faltas += 1
      return acc
    }, {})

    const resumoPorPaciente = Object.entries(porPaciente).map(
      ([id, dados]: [string, any]) => ({
        pacienteId: id,
        nome: dados.nome,
        total: dados.total,
        realizadas: dados.realizadas,
        faltas: dados.faltas,
        taxaComparecimento: dados.total > 0
          ? Math.round((dados.realizadas / dados.total) * 100)
          : 0,
      })
    ).sort((a, b) => b.faltas - a.faltas)

    return {
      resumo: {
        total,
        realizadas,
        canceladas,
        agendadas,
        aguardando,
        taxaComparecimento: total > 0 ? Math.round((realizadas / total) * 100) : 0,
      },
      porPaciente: resumoPorPaciente,
      lista: agendamentos,
    }
  }
}