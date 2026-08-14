import prisma from '../lib/prisma'

interface DadosMensagem {
  remetenteId: string
  destinatarioId: string
  texto: string
}

const selectCompleto = {
  id: true,
  texto: true,
  lida: true,
  criadoEm: true,
  remetente: { select: { id: true, nome: true, foto: true, papel: true } },
  destinatario: { select: { id: true, nome: true, foto: true, papel: true } },
}

export class RepositorioMensagens {

  async listarDoUsuario(usuarioId: string, comUsuarioId?: string) {
    const where = comUsuarioId
      ? {
          OR: [
            { remetenteId: usuarioId, destinatarioId: comUsuarioId },
            { remetenteId: comUsuarioId, destinatarioId: usuarioId },
          ],
        }
      : { OR: [{ remetenteId: usuarioId }, { destinatarioId: usuarioId }] }

    return prisma.mensagem.findMany({
      where,
      orderBy: { criadoEm: 'asc' },
      select: selectCompleto,
    })
  }

  async contarNaoLidas(usuarioId: string) {
    return prisma.mensagem.count({
      where: { destinatarioId: usuarioId, lida: false },
    })
  }

  async buscarPorId(id: string) {
    return prisma.mensagem.findUnique({ where: { id }, select: selectCompleto })
  }

  async criar(dados: DadosMensagem) {
    return prisma.mensagem.create({ data: dados, select: selectCompleto })
  }

  async marcarComoLida(id: string) {
    return prisma.mensagem.update({ where: { id }, data: { lida: true }, select: selectCompleto })
  }

  async marcarTodasComoLidas(usuarioId: string, comUsuarioId?: string) {
    return prisma.mensagem.updateMany({
      where: {
        destinatarioId: usuarioId,
        lida: false,
        ...(comUsuarioId && { remetenteId: comUsuarioId }),
      },
      data: { lida: true },
    })
  }

  async remover(id: string) {
    return prisma.mensagem.delete({ where: { id } })
  }
}