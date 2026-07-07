import prisma from '../lib/prisma'

export class RepositorioUsuarios {

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } })
  }

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        ativo: true,
        criadoEm: true,
      },
    })
  }

  async criar(dados: {
    nome: string
    email: string
    senha: string
    papel: string
  }) {
    return prisma.usuario.create({
      data: dados as any,
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        criadoEm: true,
      },
    })
  }
}