import { RepositorioTransacoes } from '../repositories/RepositorioTransacoes'

const repositorio = new RepositorioTransacoes()

const TIPOS_VALIDOS = ['RECEITA', 'DESPESA']
const STATUS_VALIDOS = ['PENDENTE', 'RECEBIDO', 'PAGO', 'VENCIDO', 'CANCELADO']

export class ServicoTransacoes {

  async listar(filtros: any, papel: string) {
    if (papel === 'RECEPCIONISTA') {
      filtros.tipo = 'RECEITA' // recepção só enxerga cobranças de paciente
    }
    return repositorio.listar(filtros)
  }

  async buscarPorId(id: string, papel: string) {
    const transacao = await repositorio.buscarPorId(id)
    if (!transacao) {
      throw { status: 404, mensagem: 'Transação não encontrada' }
    }
    if (papel === 'RECEPCIONISTA' && transacao.tipo === 'DESPESA') {
      throw { status: 403, mensagem: 'Acesso negado' }
    }
    return transacao
  }

  async criar(dados: {
    tipo: string; categoria: string; descricao: string; valor: number
    formaPagamento?: string; pacienteId?: string; profissionalId?: string; dataVencimento?: string
  }, papel: string) {
    if (!dados.tipo || !TIPOS_VALIDOS.includes(dados.tipo)) {
      throw { status: 400, mensagem: `tipo deve ser: ${TIPOS_VALIDOS.join(', ')}` }
    }
    if (!dados.categoria || !dados.descricao || dados.valor === undefined) {
      throw { status: 400, mensagem: 'categoria, descricao e valor são obrigatórios' }
    }
    if (dados.valor <= 0) {
      throw { status: 400, mensagem: 'valor deve ser maior que zero' }
    }
    if (dados.tipo === 'DESPESA' && papel !== 'GESTOR') {
      throw { status: 403, mensagem: 'Apenas o Gestor pode registrar despesas' }
    }

    return repositorio.criar({
      ...dados,
      dataVencimento: dados.dataVencimento ? new Date(dados.dataVencimento) : undefined,
    })
  }

  async atualizar(id: string, dados: any, papel: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Transação não encontrada' }
    }
    if (existe.tipo === 'DESPESA' && papel !== 'GESTOR') {
      throw { status: 403, mensagem: 'Apenas o Gestor pode alterar despesas' }
    }
    if (!['PENDENTE', 'VENCIDO'].includes(existe.status)) {
      throw { status: 400, mensagem: 'Só é possível editar transações pendentes' }
    }

    return repositorio.atualizar(id, {
      ...dados,
      ...(dados.dataVencimento && { dataVencimento: new Date(dados.dataVencimento) }),
    })
  }

  async alterarStatus(id: string, status: string, papel: string) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw { status: 400, mensagem: `status deve ser: ${STATUS_VALIDOS.join(', ')}` }
    }

    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Transação não encontrada' }
    }
    if (existe.tipo === 'DESPESA' && papel !== 'GESTOR') {
      throw { status: 403, mensagem: 'Apenas o Gestor pode dar baixa em despesas' }
    }
    if (['PAGO', 'RECEBIDO', 'CANCELADO'].includes(existe.status)) {
      throw { status: 400, mensagem: 'Transação já finalizada' }
    }

    const dataPagamento = ['RECEBIDO', 'PAGO'].includes(status) ? new Date() : undefined
    return repositorio.alterarStatus(id, status, dataPagamento)
  }

  async remover(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Transação não encontrada' }
    }
    return repositorio.alterarStatus(id, 'CANCELADO')
  }

  async historicoPaciente(pacienteId: string) {
    return repositorio.listarPorPaciente(pacienteId)
  }

  async dashboard(dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setMonth(new Date().getMonth() - 6))
    const fim = dataFim ? new Date(dataFim) : new Date()
    return repositorio.indicadores(inicio, fim)
  }
}