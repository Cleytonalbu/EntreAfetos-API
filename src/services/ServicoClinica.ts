import { RepositorioClinica } from '../repositories/RepositorioClinica'

const repositorio = new RepositorioClinica()

const TIPOS_NOTIFICACAO = [
  'lembrete_consulta',
  'confirmacao_consulta',
  'faltas_ausencias',
  'novos_objetivos',
  'relatorios_prontos',
]

const CANAIS_VALIDOS = ['email', 'whatsapp', 'app']

export class ServicoClinica {

  async buscar() {
    const clinica = await repositorio.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }
    return clinica
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
    if (!dados.nome || !dados.cnpj || !dados.email) {
      throw { status: 400, mensagem: 'nome, cnpj e email são obrigatórios' }
    }

    const existente = await repositorio.buscar()
    if (existente) {
      throw { status: 409, mensagem: 'Já existe uma clínica cadastrada' }
    }

    return repositorio.criar(dados)
  }

  async atualizar(dados: any) {
    const clinica = await repositorio.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }
    return repositorio.atualizar(clinica.id, dados)
  }

  async atualizarConfiguracoes(dados: {
    ativarLembretes?: boolean
    permitirReagendamento?: boolean
    exigirJustificativaFaltas?: boolean
    bloquearProntuario?: boolean
    exibirFinanceiroParaProfissional?: boolean
  }) {
    const clinica = await repositorio.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }
    return repositorio.atualizarConfiguracoes(clinica.id, dados)
  }

  async listarConfiguracoesNotificacao() {
    const clinica = await repositorio.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }
    return repositorio.listarConfiguracoesNotificacao(clinica.id)
  }

  async salvarConfiguracaoNotificacao(tipo: string, canais: string[]) {
    if (!tipo || !canais) {
      throw { status: 400, mensagem: 'tipo e canais são obrigatórios' }
    }

    if (!TIPOS_NOTIFICACAO.includes(tipo)) {
      throw {
        status: 400,
        mensagem: `tipo deve ser: ${TIPOS_NOTIFICACAO.join(', ')}`,
      }
    }

    const canaisInvalidos = canais.filter((c) => !CANAIS_VALIDOS.includes(c))
    if (canaisInvalidos.length > 0) {
      throw {
        status: 400,
        mensagem: `canais devem ser: ${CANAIS_VALIDOS.join(', ')}`,
      }
    }

    const clinica = await repositorio.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }

    return repositorio.salvarConfiguracaoNotificacao(clinica.id, tipo, canais)
  }
}