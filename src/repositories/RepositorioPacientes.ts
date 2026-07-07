import prisma from '../lib/prisma'

interface FiltrosPaciente {
  busca?: string
  status?: string
  pagina: number
  porPagina: number
}

interface DadosPaciente {
  nome: string
  dataNascimento: Date
  sexo: string
  foto?: string
  responsavel?: string
  telefone?: string
  diagnostico?: string
  tags?: string[]
}

export class RepositorioPacientes {

  async listar({ busca, status, pagina, porPagina }: FiltrosPaciente) {
    const pular = (pagina - 1) * porPagina

    const where = {
      ...(status && { status }),
      ...(busca && {
        OR: [
          { nome:        { contains: busca, mode: 'insensitive' as const } },
          { responsavel: { contains: busca, mode: 'insensitive' as const } },
          { telefone:    { contains: busca, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [pacientes, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip: pular,
        take: porPagina,
        orderBy: { nome: 'asc' },
        select: {
          id: true,
          nome: true,
          dataNascimento: true,
          sexo: true,
          foto: true,
          status: true,
          responsavel: true,
          telefone: true,
          diagnostico: true,
          tags: true,
          criadoEm: true,
        },
      }),
      prisma.paciente.count({ where }),
    ])

    return { pacientes, total }
  }

  async buscarPorId(id: string) {
    return prisma.paciente.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        dataNascimento: true,
        sexo: true,
        foto: true,
        status: true,
        responsavel: true,
        telefone: true,
        diagnostico: true,
        tags: true,
        criadoEm: true,
        agendamentos: {
          take: 5,
          orderBy: { dataHora: 'desc' },
          select: {
            id: true,
            dataHora: true,
            status: true,
            profissional: {
              select: {
                usuario: { select: { nome: true } },
              },
            },
          },
        },
        planos: {
          where: { status: 'ATIVO' },
          take: 1,
          select: {
            id: true,
            status: true,
            dataInicio: true,
            dataProximaRevisao: true,
            especialidadePrincipal: true,
          },
        },
      },
    })
  }

  async criar(dados: DadosPaciente) {
    return prisma.paciente.create({ data: dados })
  }

  async atualizar(id: string, dados: Partial<DadosPaciente>) {
    return prisma.paciente.update({ where: { id }, data: dados })
  }

  async inativar(id: string) {
    return prisma.paciente.update({
      where: { id },
      data: { status: 'inativo' },
    })
  }
}