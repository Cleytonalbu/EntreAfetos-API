import prisma from '../lib/prisma'

interface DadosEspecialidade {
  nome: string
  descricao?: string
  cor?: string
  categoria: string
  icone?: string
}

export class RepositorioEspecialidades {

  async listar() {
    return prisma.especialidade.findMany({
      orderBy: { nome: 'asc' },
    })
  }

  async buscarPorId(id: string) {
    return prisma.especialidade.findUnique({ where: { id } })
  }

  async criar(dados: DadosEspecialidade) {
    return prisma.especialidade.create({ data: dados })
  }

  async atualizar(id: string, dados: Partial<DadosEspecialidade>) {
    return prisma.especialidade.update({ where: { id }, data: dados })
  }

  async alterarStatus(id: string, ativo: boolean) {
    return prisma.especialidade.update({ where: { id }, data: { ativo } })
  }
}