import prisma from '../lib/prisma'

interface FiltrosProfissional {
  busca?: string
  especialidadeId?: string
  ativo?: boolean
}

interface DadosProfissional {
  usuarioId: string
  registro?: string
  bio?: string
}

interface DadosUsuarioProfissional {
  nome: string
  email: string
  senha: string
  registro?: string
  bio?: string
  especialidadeIds?: string[]
}

export class RepositorioProfissionais {

  async listar({ busca, especialidadeId, ativo }: FiltrosProfissional) {
    return prisma.profissional.findMany({
      where: {
        ...(especialidadeId && {
          especialidades: {
            some: { especialidadeId },
          },
        }),
        usuario: {
          ativo: ativo ?? true,
          ...(busca && {
            OR: [
              { nome: { contains: busca, mode: 'insensitive' } },
              { email: { contains: busca, mode: 'insensitive' } },
            ],
          }),
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            foto: true,
            ativo: true,
          },
        },
        especialidades: {
          include: {
            especialidade: {
              select: { id: true, nome: true, cor: true },
            },
          },
        },
      },
      orderBy: {
        usuario: { nome: 'asc' },
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.profissional.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            foto: true,
            ativo: true,
            criadoEm: true,
          },
        },
        especialidades: {
          include: {
            especialidade: {
              select: { id: true, nome: true, cor: true, categoria: true },
            },
          },
        },
      },
    })
  }

  async buscarPorUsuarioId(usuarioId: string) {
    return prisma.profissional.findUnique({
      where: { usuarioId },
    })
  }

  async criar(dados: DadosProfissional) {
    return prisma.profissional.create({
      data: {
        usuarioId: dados.usuarioId,
        registro: dados.registro,
        bio: dados.bio,
      },
    })
  }

  async vincularEspecialidades(profissionalId: string, especialidadeIds: string[]) {
    // Remove vínculos anteriores
    await prisma.profissionalEspecialidade.deleteMany({
      where: { profissionalId },
    })

    // Cria novos vínculos
    if (especialidadeIds.length > 0) {
      await prisma.profissionalEspecialidade.createMany({
        data: especialidadeIds.map((especialidadeId) => ({
          profissionalId,
          especialidadeId,
        })),
      })
    }
  }

  async atualizar(id: string, dados: Partial<DadosProfissional>) {
    return prisma.profissional.update({
      where: { id },
      data: {
        registro: dados.registro,
        bio: dados.bio,
      },
    })
  }

  async inativar(id: string) {
    const profissional = await prisma.profissional.findUnique({
      where: { id },
    })

    if (!profissional) return null

    return prisma.usuario.update({
      where: { id: profissional.usuarioId },
      data: { ativo: false },
    })
  }

  async buscarHorariosDisponiveis(profissionalId: string, data: string) {
    // Busca agendamentos do dia
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        profissionalId,
        status: { notIn: ['CANCELADO'] },
        dataHora: {
          gte: new Date(`${data}T00:00:00`),
          lte: new Date(`${data}T23:59:59`),
        },
      },
      include: {
        servico: { select: { duracaoMin: true } },
      },
      orderBy: { dataHora: 'asc' },
    })

    // Gera slots de 30 em 30 minutos das 08:00 às 18:30
    const slots = []
    const inicio = 8 * 60  // 08:00 em minutos
    const fim    = 18 * 60 + 30 // 18:30 em minutos

    for (let minuto = inicio; minuto <= fim; minuto += 30) {
      const hora     = Math.floor(minuto / 60)
      const minResto = minuto % 60
      const horario  = `${String(hora).padStart(2, '0')}:${String(minResto).padStart(2, '0')}`
      const dataHora = new Date(`${data}T${horario}:00`)

      // Verifica se o slot está ocupado
      const ocupado = agendamentos.some((ag) => {
        const inicioAg = ag.dataHora.getTime()
        const fimAg    = inicioAg + ag.servico.duracaoMin * 60 * 1000
        const slotMs   = dataHora.getTime()
        return slotMs >= inicioAg && slotMs < fimAg
      })

      slots.push({ horario, disponivel: !ocupado, dataHora })
    }

    return slots
  }
}