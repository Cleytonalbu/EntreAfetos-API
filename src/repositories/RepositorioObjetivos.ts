import prisma from '../lib/prisma'

interface DadosObjetivo {
  pacienteId: string
  profissionalId: string
  planoId?: string
  nome: string
  descricao?: string
  categoria: string
  progresso?: number
  nivelDesempenho?: number
}

export class RepositorioObjetivos {

  async listar(pacienteId: string, filtros?: {
    categoria?: string
    status?: string
    planoId?: string
  }) {
    return prisma.objetivo.findMany({
      where: {
        pacienteId,
        ...(filtros?.categoria && { categoria: filtros.categoria }),
        ...(filtros?.status    && { status: filtros.status as any }),
        ...(filtros?.planoId   && { planoId: filtros.planoId }),
      },
      orderBy: { criadoEm: 'desc' },
      include: {
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
        _count: {
          select: { sessoes: true },
        },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.objetivo.findUnique({
      where: { id },
      include: {
        paciente: {
          select: { id: true, nome: true, foto: true },
        },
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        plano: {
          select: {
            id: true,
            versao: true,
            status: true,
            especialidadePrincipal: true,
          },
        },
        sessoes: {
          orderBy: { evolucao: { dataAtendimento: 'desc' } },
          take: 5,
          include: {
            evolucao: {
              select: { id: true, dataAtendimento: true },
            },
          },
        },
      },
    })
  }

  async criar(dados: DadosObjetivo) {
    return prisma.objetivo.create({
      data: {
        ...dados,
        progresso: dados.progresso ?? 0,
      },
      include: {
        profissional: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
      },
    })
  }

  async atualizar(id: string, dados: Partial<DadosObjetivo & { status: string }>) {
    return prisma.objetivo.update({
      where: { id },
      data: dados as any,
    })
  }

  async alterarStatus(id: string, status: string) {
    return prisma.objetivo.update({
      where: { id },
      data: { status: status as any },
    })
  }

  async atualizarProgresso(id: string, progresso: number, nivelDesempenho?: number) {
    return prisma.objetivo.update({
      where: { id },
      data: {
        progresso,
        ...(nivelDesempenho !== undefined && { nivelDesempenho }),
      },
    })
  }

  async remover(id: string) {
    return prisma.objetivo.delete({ where: { id } })
  }
}