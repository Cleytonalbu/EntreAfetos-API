import prisma from '../lib/prisma'

interface DadosEncaminhamento {
  pacienteId: string
  profissionalOrigemId: string
  profissionalDestinoId?: string
  evolucaoId?: string
  especialidadeId?: string
  motivo: string
  observacoes?: string
  prioridade?: string
}

export class RepositorioEncaminhamentos {

  async listar(filtros?: {
    pacienteId?: string
    profissionalOrigemId?: string
    especialidadeId?: string
    status?: string
    prioridade?: string
    dataInicio?: string
    dataFim?: string
  }) {
    return prisma.encaminhamento.findMany({
      where: {
        ...(filtros?.pacienteId           && { pacienteId: filtros.pacienteId }),
        ...(filtros?.profissionalOrigemId && { profissionalOrigemId: filtros.profissionalOrigemId }),
        ...(filtros?.especialidadeId      && { especialidadeId: filtros.especialidadeId }),
        ...(filtros?.status               && { status: filtros.status as any }),
        ...(filtros?.prioridade           && { prioridade: filtros.prioridade as any }),
        ...(filtros?.dataInicio || filtros?.dataFim ? {
          criadoEm: {
            ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
            ...(filtros.dataFim    && { lte: new Date(filtros.dataFim) }),
          },
        } : {}),
      },
      orderBy: { criadoEm: 'desc' },
      include: {
        paciente: {
          select: { id: true, nome: true, foto: true, dataNascimento: true },
        },
        profissionalOrigem: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        profissionalDestino: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        especialidade: {
          select: { id: true, nome: true, cor: true },
        },
        evolucao: {
          select: { id: true, dataAtendimento: true },
        },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.encaminhamento.findUnique({
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
        profissionalOrigem: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        profissionalDestino: {
          include: {
            usuario: { select: { id: true, nome: true, foto: true } },
          },
        },
        especialidade: {
          select: { id: true, nome: true, cor: true, categoria: true },
        },
        evolucao: {
          select: {
            id: true,
            dataAtendimento: true,
            especialidade: true,
          },
        },
      },
    })
  }

  async criar(dados: DadosEncaminhamento) {
    return prisma.encaminhamento.create({
      data: {
        pacienteId:           dados.pacienteId,
        profissionalOrigemId: dados.profissionalOrigemId,
        profissionalDestinoId: dados.profissionalDestinoId,
        evolucaoId:           dados.evolucaoId,
        especialidadeId:      dados.especialidadeId,
        motivo:               dados.motivo,
        observacoes:          dados.observacoes,
        prioridade:           dados.prioridade as any ?? 'MEDIA',
      },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissionalOrigem: {
          include: {
            usuario: { select: { id: true, nome: true } },
          },
        },
        especialidade: { select: { id: true, nome: true } },
      },
    })
  }

  async alterarStatus(id: string, status: string) {
    return prisma.encaminhamento.update({
      where: { id },
      data: { status: status as any },
    })
  }

  async cancelar(id: string) {
    return prisma.encaminhamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    })
  }
}