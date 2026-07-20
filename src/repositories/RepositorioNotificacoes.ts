import prisma from '../lib/prisma'

interface DadosNotificacao {
  usuarioId: string
  tipo: string
  texto: string
}

export class RepositorioNotificacoes {

  async listar(usuarioId: string, filtros?: {
    lida?: boolean
    tipo?: string
  }) {
    return prisma.notificacao.findMany({
      where: {
        usuarioId,
        ...(filtros?.lida !== undefined && { lida: filtros.lida }),
        ...(filtros?.tipo && { tipo: filtros.tipo }),
      },
      orderBy: { criadoEm: 'desc' },
    })
  }

  async buscarPorId(id: string) {
    return prisma.notificacao.findUnique({ where: { id } })
  }

  async criar(dados: DadosNotificacao) {
    return prisma.notificacao.create({ data: dados })
  }

  async marcarComoLida(id: string) {
    return prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    })
  }

  async marcarTodasComoLidas(usuarioId: string) {
    return prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    })
  }

  async contarNaoLidas(usuarioId: string) {
    return prisma.notificacao.count({
      where: { usuarioId, lida: false },
    })
  }

  async remover(id: string) {
    return prisma.notificacao.delete({ where: { id } })
  }

  async removerTodas(usuarioId: string) {
    return prisma.notificacao.deleteMany({ where: { usuarioId } })
  }
}