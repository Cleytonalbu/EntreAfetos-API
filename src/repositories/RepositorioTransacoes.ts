import prisma from '../lib/prisma'

interface FiltrosTransacao {
  tipo?: string
  status?: string
  pacienteId?: string
  profissionalId?: string
  dataInicio?: string
  dataFim?: string
  pagina: number
  porPagina: number
}

interface DadosTransacao {
  tipo: string
  categoria: string
  descricao: string
  valor: number
  formaPagamento?: string
  pacienteId?: string
  profissionalId?: string
  dataVencimento?: Date
}

const selectCompleto = {
  id: true,
  tipo: true,
  categoria: true,
  descricao: true,
  valor: true,
  formaPagamento: true,
  status: true,
  dataVencimento: true,
  dataPagamento: true,
  criadoEm: true,
  paciente: { select: { id: true, nome: true } },
  profissional: { select: { id: true, usuario: { select: { nome: true } } } },
}

export class RepositorioTransacoes {

  async listar({ tipo, status, pacienteId, profissionalId, dataInicio, dataFim, pagina, porPagina }: FiltrosTransacao) {
    const pular = (pagina - 1) * porPagina

    const filtroData = dataInicio && dataFim
      ? { criadoEm: { gte: new Date(`${dataInicio}T00:00:00`), lte: new Date(`${dataFim}T23:59:59`) } }
      : {}

    const where = {
      ...filtroData,
      ...(tipo           && { tipo: tipo as any }),
      ...(status         && { status: status as any }),
      ...(pacienteId     && { pacienteId }),
      ...(profissionalId && { profissionalId }),
    }

    const [transacoes, total] = await Promise.all([
      prisma.transacao.findMany({
        where, skip: pular, take: porPagina,
        orderBy: { criadoEm: 'desc' },
        select: selectCompleto,
      }),
      prisma.transacao.count({ where }),
    ])

    return { transacoes, total }
  }

  async listarPorPaciente(pacienteId: string) {
    return prisma.transacao.findMany({
      where: { pacienteId },
      orderBy: { criadoEm: 'desc' },
      select: selectCompleto,
    })
  }

  async buscarPorId(id: string) {
    return prisma.transacao.findUnique({
      where: { id },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { include: { usuario: { select: { nome: true } } } },
      },
    })
  }

  async criar(dados: DadosTransacao) {
    return prisma.transacao.create({ data: dados as any, select: selectCompleto })
  }

  async atualizar(id: string, dados: Partial<DadosTransacao>) {
    return prisma.transacao.update({ where: { id }, data: dados as any, select: selectCompleto })
  }

  async alterarStatus(id: string, status: string, dataPagamento?: Date) {
    return prisma.transacao.update({
      where: { id },
      data: { status: status as any, ...(dataPagamento && { dataPagamento }) },
      select: selectCompleto,
    })
  }

  async indicadores(inicio: Date, fim: Date) {
    const where = { criadoEm: { gte: inicio, lte: fim }, status: { not: 'CANCELADO' as any } }

    const [receitas, despesas, porCategoria] = await Promise.all([
      prisma.transacao.aggregate({ where: { ...where, tipo: 'RECEITA' }, _sum: { valor: true }, _count: true }),
      prisma.transacao.aggregate({ where: { ...where, tipo: 'DESPESA' }, _sum: { valor: true }, _count: true }),
      prisma.transacao.groupBy({ by: ['categoria', 'tipo'], where, _sum: { valor: true } }),
    ])

    const totalReceitas = Number(receitas._sum.valor ?? 0)
    const totalDespesas = Number(despesas._sum.valor ?? 0)

    return {
      periodo: { dataInicio: inicio, dataFim: fim },
      resumo: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        quantidadeReceitas: receitas._count,
        quantidadeDespesas: despesas._count,
      },
      porCategoria: porCategoria.map(item => ({
        categoria: item.categoria,
        tipo: item.tipo,
        total: Number(item._sum.valor ?? 0),
      })),
    }
  }
}