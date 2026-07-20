import prisma from '../lib/prisma'

export class RepositorioMensagens {

  async listar(usuarioId: string) {
    return prisma.mensagem.findMany({
      where: { remetenteId: usuarioId },
      orderBy: { criadoEm: 'desc' },
      include: {
        remetente: {
          select: { id: true, nome: true, foto: true, papel: true },
        },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.mensagem.findUnique({
      where: { id },
      include: {
        remetente: {
          select: { id: true, nome: true, foto: true, papel: true },
        },
      },
    })
  }

  async criar(dados: { remetenteId: string; texto: string }) {
    return prisma.mensagem.create({
      data: dados,
      include: {
        remetente: {
          select: { id: true, nome: true, foto: true, papel: true },
        },
      },
    })
  }

  async marcarComoLida(id: string) {
    return prisma.mensagem.update({
      where: { id },
      data: { lida: true },
    })
  }

  async remover(id: string) {
    return prisma.mensagem.delete({ where: { id } })
  }

  async contarNaoLidas(usuarioId: string) {
    return prisma.mensagem.count({
      where: { remetenteId: usuarioId, lida: false },
    })
  }
}