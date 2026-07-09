import prisma from '../lib/prisma'

export class RepositorioSalas {

  async listar() {
    return prisma.sala.findMany({
      where: { ativa: true },
      orderBy: { nome: 'asc' },
    })
  }

  async buscarPorId(id: string) {
    return prisma.sala.findUnique({ where: { id } })
  }

  async criar(dados: { nome: string; descricao?: string }) {
    return prisma.sala.create({ data: dados })
  }

  async atualizar(id: string, dados: { nome?: string; descricao?: string }) {
    return prisma.sala.update({ where: { id }, data: dados })
  }

  async inativar(id: string) {
    return prisma.sala.update({ where: { id }, data: { ativa: false } })
  }
}