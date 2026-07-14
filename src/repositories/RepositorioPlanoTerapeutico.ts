import prisma from '../lib/prisma'

interface DadosPlano {
  pacienteId: string
  profissionalId: string
  dataAvaliacao: Date
  dataInicio: Date
  dataProximaRevisao: Date
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
}

export class RepositorioPlanoTerapeutico {

  async buscarAtivoPorPaciente(pacienteId: string) {
    return prisma.planoTerapeutico.findFirst({
      where: {
        pacienteId,
        status: 'ATIVO',
      },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            dataNascimento: true,
            diagnostico: true,
            foto: true,
          },
        },
        profissional: {
          include: {
            usuario: {
              select: { id: true, nome: true, foto: true },
            },
          },
        },
        objetivos: {
          orderBy: { criadoEm: 'desc' },
          select: {
            id: true,
            nome: true,
            categoria: true,
            status: true,
            progresso: true,
            nivelDesempenho: true,
          },
        },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.planoTerapeutico.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            dataNascimento: true,
            diagnostico: true,
            foto: true,
          },
        },
        profissional: {
          include: {
            usuario: {
              select: { id: true, nome: true, foto: true },
            },
          },
        },
        objetivos: {
          orderBy: { criadoEm: 'desc' },
        },
      },
    })
  }

  async buscarHistoricoPorPaciente(pacienteId: string) {
    return prisma.planoTerapeutico.findMany({
      where: { pacienteId },
      orderBy: { criadoEm: 'desc' },
      include: {
        profissional: {
          include: {
            usuario: {
              select: { id: true, nome: true },
            },
          },
        },
        _count: {
          select: { objetivos: true },
        },
      },
    })
  }

  async criar(dados: DadosPlano) {
    // Encerra plano ativo anterior se existir
    await prisma.planoTerapeutico.updateMany({
      where: {
        pacienteId: dados.pacienteId,
        status: 'ATIVO',
      },
      data: { status: 'ENCERRADO' },
    })

    return prisma.planoTerapeutico.create({
      data: {
        ...dados,
        outrasEspecialidades: dados.outrasEspecialidades ?? [],
      },
      include: {
        paciente: {
          select: { id: true, nome: true },
        },
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
      },
    })
  }

  async atualizar(id: string, dados: Partial<DadosPlano>) {
    return prisma.planoTerapeutico.update({
      where: { id },
      data: {
        ...dados,
        ...(dados.outrasEspecialidades && {
          outrasEspecialidades: dados.outrasEspecialidades,
        }),
      },
    })
  }

  async alterarStatus(id: string, status: string) {
    return prisma.planoTerapeutico.update({
      where: { id },
      data: { status: status as any },
    })
  }
}