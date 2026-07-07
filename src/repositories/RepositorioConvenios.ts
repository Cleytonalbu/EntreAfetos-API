import prisma from '../lib/prisma'

export class RepositorioConvenios {

  async listar() {
    return prisma.convenio.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    })
  }

  async buscarPorId(id: string) {
    return prisma.convenio.findUnique({ where: { id } })
  }

  async criar(nome: string) {
    return prisma.convenio.create({ data: { nome } })
  }
}