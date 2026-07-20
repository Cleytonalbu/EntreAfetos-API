import prisma from '../lib/prisma'

interface DadosClinica {
  nome?: string
  cnpj?: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  fusoHorario?: string
  formatoData?: string
}

interface ConfiguracoesClinica {
  ativarLembretes?: boolean
  permitirReagendamento?: boolean
  exigirJustificativaFaltas?: boolean
  bloquearProntuario?: boolean
  exibirFinanceiroParaProfissional?: boolean
}

export class RepositorioClinica {

  async buscar() {
    return prisma.clinica.findFirst({
      include: {
        configuracaoNotificacoes: true,
      },
    })
  }

  async criar(dados: {
    nome: string
    cnpj: string
    email: string
    telefone?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
  }) {
    return prisma.clinica.create({ data: dados })
  }

  async atualizar(id: string, dados: DadosClinica) {
    return prisma.clinica.update({
      where: { id },
      data: dados,
    })
  }

  async atualizarConfiguracoes(id: string, dados: ConfiguracoesClinica) {
    return prisma.clinica.update({
      where: { id },
      data: dados,
    })
  }

  // ── Configurações de notificação ──────────────────────────
  async listarConfiguracoesNotificacao(clinicaId: string) {
    return prisma.configuracaoNotificacao.findMany({
      where: { clinicaId },
      orderBy: { tipo: 'asc' },
    })
  }

  async salvarConfiguracaoNotificacao(clinicaId: string, tipo: string, canais: string[]) {
    const existente = await prisma.configuracaoNotificacao.findFirst({
      where: { clinicaId, tipo },
    })

    if (existente) {
      return prisma.configuracaoNotificacao.update({
        where: { id: existente.id },
        data: { canais },
      })
    }

    return prisma.configuracaoNotificacao.create({
      data: { clinicaId, tipo, canais },
    })
  }
}