import prisma from '../lib/prisma'

export class RepositorioServicos {
  async buscarPorId(id: string) {
    return prisma.servico.findUnique({ where: { id } })
  }

  async listar() {
    return prisma.servico.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    })
  }

  async criar(dados: { nome: string; duracaoMin: number; descricao?: string }) {
    return prisma.servico.create({ data: dados })
  }

  async atualizar(id: string, dados: Partial<{ nome: string; duracaoMin: number; descricao: string }>) {
    return prisma.servico.update({ where: { id }, data: dados })
  }
}