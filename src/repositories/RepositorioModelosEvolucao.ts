import prisma from '../lib/prisma'

interface DadosModelo {
  clinicaId: string
  nome: string
  especialidade: string
  campos: any
}

export class RepositorioModelosEvolucao {

  async listar(clinicaId: string, especialidade?: string) {
    return prisma.modeloEvolucao.findMany({
      where: {
        clinicaId,
        ...(especialidade && { especialidade }),
      },
      orderBy: { nome: 'asc' },
    })
  }

  async buscarPorId(id: string) {
    return prisma.modeloEvolucao.findUnique({ where: { id } })
  }

  async criar(dados: DadosModelo) {
    return prisma.modeloEvolucao.create({ data: dados })
  }

  async atualizar(id: string, dados: Partial<DadosModelo>) {
    return prisma.modeloEvolucao.update({
      where: { id },
      data: dados,
    })
  }

  async remover(id: string) {
    return prisma.modeloEvolucao.delete({ where: { id } })
  }
}