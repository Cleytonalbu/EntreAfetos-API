import prisma from '../lib/prisma'

interface DadosAnexo {
  evolucaoId: string
  nomeArquivo: string
  tipo: string
  tamanhoBytes: number
  url: string // chave do objeto no storage, não uma URL pública
}

export class RepositorioAnexos {

  async criar(dados: DadosAnexo) {
    return prisma.anexo.create({ data: dados })
  }

  async buscarPorId(id: string) {
    return prisma.anexo.findUnique({ where: { id } })
  }

  async listarPorEvolucao(evolucaoId: string) {
    return prisma.anexo.findMany({
      where: { evolucaoId },
      orderBy: { criadoEm: 'desc' },
    })
  }

  async remover(id: string) {
    return prisma.anexo.delete({ where: { id } })
  }
}