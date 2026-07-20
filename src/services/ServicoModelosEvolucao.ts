import { RepositorioModelosEvolucao } from '../repositories/RepositorioModelosEvolucao'
import { RepositorioClinica } from '../repositories/RepositorioClinica'

const repositorio         = new RepositorioModelosEvolucao()
const repositorioClinica  = new RepositorioClinica()

export class ServicoModelosEvolucao {

  async listar(especialidade?: string) {
    const clinica = await repositorioClinica.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }
    return repositorio.listar(clinica.id, especialidade)
  }

  async buscarPorId(id: string) {
    const modelo = await repositorio.buscarPorId(id)
    if (!modelo) {
      throw { status: 404, mensagem: 'Modelo de evolução não encontrado' }
    }
    return modelo
  }

  async criar(dados: {
    nome: string
    especialidade: string
    campos: any
  }) {
    if (!dados.nome || !dados.especialidade || !dados.campos) {
      throw { status: 400, mensagem: 'nome, especialidade e campos são obrigatórios' }
    }

    const clinica = await repositorioClinica.buscar()
    if (!clinica) {
      throw { status: 404, mensagem: 'Nenhuma clínica cadastrada' }
    }

    return repositorio.criar({ ...dados, clinicaId: clinica.id })
  }

  async atualizar(id: string, dados: any) {
    const modelo = await repositorio.buscarPorId(id)
    if (!modelo) {
      throw { status: 404, mensagem: 'Modelo de evolução não encontrado' }
    }
    return repositorio.atualizar(id, dados)
  }

  async remover(id: string) {
    const modelo = await repositorio.buscarPorId(id)
    if (!modelo) {
      throw { status: 404, mensagem: 'Modelo de evolução não encontrado' }
    }
    return repositorio.remover(id)
  }
}