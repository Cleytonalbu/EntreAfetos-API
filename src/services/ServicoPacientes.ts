import { RepositorioPacientes } from '../repositories/RepositorioPacientes'

const repositorio = new RepositorioPacientes()

export class ServicoPacientes {

  async listar(filtros: {
    busca?: string
    status?: string
    pagina: number
    porPagina: number
  }) {
    return repositorio.listar(filtros)
  }

  async buscarPorId(id: string) {
    const paciente = await repositorio.buscarPorId(id)
    if (!paciente) {
      throw { status: 404, mensagem: 'Paciente não encontrado' }
    }
    return paciente
  }

  async criar(dados: {
    nome: string
    dataNascimento: string
    sexo: string
    foto?: string
    responsavel?: string
    telefone?: string
    diagnostico?: string
    tags?: string[]
  }) {
    if (!dados.nome || !dados.dataNascimento || !dados.sexo) {
      throw { status: 400, mensagem: 'nome, dataNascimento e sexo são obrigatórios' }
    }

    return repositorio.criar({
      ...dados,
      dataNascimento: new Date(dados.dataNascimento),
      tags: dados.tags ?? [],
    })
  }

  async atualizar(id: string, dados: any) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Paciente não encontrado' }
    }

    return repositorio.atualizar(id, {
      ...dados,
      ...(dados.dataNascimento && {
        dataNascimento: new Date(dados.dataNascimento),
      }),
    })
  }

  async inativar(id: string) {
    const existe = await repositorio.buscarPorId(id)
    if (!existe) {
      throw { status: 404, mensagem: 'Paciente não encontrado' }
    }
    return repositorio.inativar(id)
  }
}