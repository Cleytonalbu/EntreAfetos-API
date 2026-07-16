import prisma from '../lib/prisma'

interface DadosEvolucao {
  pacienteId: string
  profissionalId: string
  agendamentoId?: string
  dataAtendimento: Date
  horaInicio: Date
  horaFim: Date
  especialidade: string
  tipoAtendimento: string
  localAtendimento?: string
  evolucaoEscrita?: string
  resultadoGeral?: string
  impactos?: string[]
  observacoes?: string
  rascunho?: boolean
}

interface DadosObjetivoSessao {
  objetivoId: string
  statusNaSessao: string
  nivelDesempenho?: number
}

export class RepositorioEvolucoes {

  async listar(pacienteId: string, filtros?: {
    profissionalId?: string
    dataInicio?: string
    dataFim?: string
    rascunho?: boolean
  }) {
    return prisma.evolucao.findMany({
      where: {
        pacienteId,
        ...(filtros?.profissionalId && { profissionalId: filtros.profissionalId }),
        ...(filtros?.rascunho !== undefined && { rascunho: filtros.rascunho }),
        ...(filtros?.dataInicio || filtros?.dataFim ? {
          dataAtendimento: {
            ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
            ...(filtros.dataFim    && { lte: new Date(filtros.dataFim) }),
          },
        } : {}),
      },
      orderBy: { dataAtendimento: 'desc' },
      include: {
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        _count: {
          select: {
            objetivosSessao: true,
            anexos: true,
          },
        },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.evolucao.findUnique({
      where: { id },
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            foto: true,
            dataNascimento: true,
            diagnostico: true,
          },
        },
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        agendamento: {
          select: {
            id: true,
            dataHora: true,
            servico: { select: { nome: true, duracaoMin: true } },
          },
        },
        objetivosSessao: {
          include: {
            objetivo: {
              select: {
                id: true,
                nome: true,
                categoria: true,
                progresso: true,
              },
            },
          },
        },
        anexos: true,
        encaminhamentos: {
          select: {
            id: true,
            especialidadeId: true,
            motivo: true,
            prioridade: true,
            status: true,
          },
        },
      },
    })
  }

  async criar(dados: DadosEvolucao) {
    return prisma.evolucao.create({
      data: {
        ...dados,
        impactos: dados.impactos ?? [],
        rascunho: dados.rascunho ?? true,
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
      },
    })
  }

  async atualizar(id: string, dados: Partial<DadosEvolucao>) {
    return prisma.evolucao.update({
      where: { id },
      data: dados as any,
    })
  }

  async vincularObjetivosSessao(evolucaoId: string, objetivos: DadosObjetivoSessao[]) {
    // Remove vínculos anteriores
    console.log('vincularObjetivosSessao', {evolucaoId, objetivos})
    await prisma.objetivoSessao.deleteMany({ where: { evolucaoId } })

    // Cria novos vínculos
    if (objetivos.length > 0) {
      await prisma.objetivoSessao.createMany({
        data: objetivos.map((o) => ({
          evolucaoId,
          objetivoId:     o.objetivoId,
          statusNaSessao: o.statusNaSessao,
          nivelDesempenho: o.nivelDesempenho,
        })),
      })
    }
  }

  async assinar(id: string, profissionalId: string) {
    return prisma.evolucao.update({
      where: { id },
      data: {
        rascunho:  false,
        assinadoEm: new Date(),
      },
    })
  }

  async remover(id: string) {
    // Remove vínculos antes de deletar
    await prisma.objetivoSessao.deleteMany({ where: { evolucaoId: id } })
    await prisma.anexo.deleteMany({ where: { evolucaoId: id } })
    return prisma.evolucao.delete({ where: { id } })
  }
}