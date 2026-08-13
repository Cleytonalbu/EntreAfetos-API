import prisma from '../lib/prisma'

interface FiltrosAgendamento {
  data?: string
  profissionalId?: string
  pacienteId?: string
  status?: string
  pagina: number
  porPagina: number
}

interface DadosAgendamento {
  pacienteId: string
  profissionalId: string
  servicoId: string
  especialidadeId?: string
  convenioId?: string
  salaId?: string
  dataHora: Date
  dataFim?: Date
  observacoes?: string
  rascunho?: boolean
}

interface DadosBloqueio {
  profissionalId: string
  dataHora: Date
  dataFim: Date
  motivo?: string
  salaId?: string
}

const selectCompleto = {
  id: true,
  dataHora: true,
  status: true,
  observacoes: true,
  rascunho: true,
  criadoEm: true,
  paciente: {
    select: {
      id: true,
      nome: true,
      foto: true,
      dataNascimento: true,
      diagnostico: true,
      tags: true,
      responsavel: true,
    },
  },
  profissional: {
    select: {
      id: true,
      usuario: { select: { nome: true, foto: true } },
      especialidades: {
        select: {
          especialidade: { select: { nome: true } },
        },
      },
    },
  },
  servico: { select: { id: true, nome: true, duracaoMin: true } },
  especialidade: { select: { id: true, nome: true, cor: true } },
  convenio: { select: { id: true, nome: true } },
  sala: { select: { id: true, nome: true } },
}

export class RepositorioAgendamentos {

  async listar({ data, profissionalId, pacienteId, status, pagina, porPagina }: FiltrosAgendamento) {
    const pular = (pagina - 1) * porPagina

    const filtroData = data
      ? {
          dataHora: {
            gte: new Date(`${data}T00:00:00`),
            lte: new Date(`${data}T23:59:59`),
          },
        }
      : {}

    const where = {
      ...filtroData,
      ...(profissionalId && { profissionalId }),
      ...(pacienteId    && { pacienteId }),
      ...(status        && { status: status as any }),
    }

    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        skip: pular,
        take: porPagina,
        orderBy: { dataHora: 'asc' },
        select: selectCompleto,
      }),
      prisma.agendamento.count({ where }),
    ])

    return { agendamentos, total }
  }

  async buscarPorId(id: string) {
    return prisma.agendamento.findUnique({
      where: { id },
      include: {
        paciente: true,
        profissional: {
          include: {
            usuario: { select: { nome: true, foto: true, email: true } },
          },
        },
        servico: true,
        especialidade: true,
        convenio: true,
        sala: true,
      },
    })
  }

  async buscarConflito(profissionalId: string, dataHora: Date, fimAgendamento: Date) {
    return prisma.agendamento.findFirst({
      where: {
        profissionalId,
        status: { notIn: ['CANCELADO'] },
        AND: [
          { dataHora: { lt: fimAgendamento } },
          { dataHora: { gte: dataHora } },
        ],
      },
    })
  }

  async criar(dados: DadosAgendamento) {
    return prisma.agendamento.create({
      data: { ...dados, tipo: 'ATENDIMENTO' },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: {
          include: { usuario: { select: { nome: true } } },
        },
        servico: true,
        sala: true,
        convenio: true,
      },
    })
  }

  async criarBloqueio(dados: DadosBloqueio) {
    return prisma.agendamento.create({
      data: {
        tipo: 'BLOQUEIO',
        profissionalId: dados.profissionalId,
        dataHora: dados.dataHora,
        dataFim: dados.dataFim,
        motivo: dados.motivo,
        salaId: dados.salaId,
      },
      include: {
        profissional: {
          include: { usuario: { select: { nome: true } } },
        },
        sala: true,
      },
    })
  }

  async atualizar(id: string, dados: Partial<DadosAgendamento>) {
    return prisma.agendamento.update({ where: { id }, data: dados })
  }

  async alterarStatus(id: string, status: string) {
    return prisma.agendamento.update({
      where: { id },
      data: { status: status as any },
    })
  }

  async cancelar(id: string) {
    return prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO' },
    })
  }
}