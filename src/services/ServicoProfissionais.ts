import { RepositorioProfissionais } from '../repositories/RepositorioProfissionais'
import { RepositorioUsuarios } from '../repositories/RepositorioUsuarios'
import bcrypt from 'bcryptjs'

const repositorio       = new RepositorioProfissionais()
const repositorioUsuarios = new RepositorioUsuarios()

export class ServicoProfissionais {

  async listar(filtros: {
    busca?: string
    especialidadeId?: string
    ativo?: boolean
  }) {
    return repositorio.listar(filtros)
  }

  async buscarPorId(id: string) {
    const profissional = await repositorio.buscarPorId(id)
    if (!profissional) {
      throw { status: 404, mensagem: 'Profissional não encontrado' }
    }
    return profissional
  }

  async criar(dados: {
    nome: string
    email: string
    senha: string
    registro?: string
    bio?: string
    especialidadeIds?: string[]
  }) {
    if (!dados.nome || !dados.email || !dados.senha) {
      throw { status: 400, mensagem: 'nome, email e senha são obrigatórios' }
    }

    // Cria o usuário
    const senhaCriptografada = await bcrypt.hash(dados.senha, 10)
    const usuario = await repositorioUsuarios.criar({
      nome:  dados.nome,
      email: dados.email,
      senha: senhaCriptografada,
      papel: 'PROFISSIONAL',
    })

    // Cria o registro de profissional vinculado ao usuário
    const profissional = await repositorio.criar({
      usuarioId: usuario.id,
      registro:  dados.registro,
      bio:       dados.bio,
    })

    // Vincula especialidades se informadas
    if (dados.especialidadeIds && dados.especialidadeIds.length > 0) {
      await repositorio.vincularEspecialidades(
        profissional.id,
        dados.especialidadeIds
      )
    }

    return repositorio.buscarPorId(profissional.id)
  }

  async atualizar(id: string, dados: {
    nome?: string
    foto?: string
    registro?: string
    bio?: string
    especialidadeIds?: string[]
  }) {
    const profissional = await repositorio.buscarPorId(id)
    if (!profissional) {
      throw { status: 404, mensagem: 'Profissional não encontrado' }
    }

    // Atualiza dados do usuário se necessário
    if (dados.nome || dados.foto) {
      await repositorioUsuarios.atualizar(profissional.usuarioId, {
        nome: dados.nome,
        foto: dados.foto,
      })
    }

    // Atualiza dados do profissional
    await repositorio.atualizar(id, {
      registro: dados.registro,
      bio:      dados.bio,
    })

    // Atualiza especialidades se informadas
    if (dados.especialidadeIds) {
      await repositorio.vincularEspecialidades(id, dados.especialidadeIds)
    }

    return repositorio.buscarPorId(id)
  }

  async inativar(id: string) {
    const profissional = await repositorio.buscarPorId(id)
    if (!profissional) {
      throw { status: 404, mensagem: 'Profissional não encontrado' }
    }
    return repositorio.inativar(id)
  }

  async buscarHorariosDisponiveis(id: string, data: string) {
    if (!data) {
      throw { status: 400, mensagem: 'data é obrigatória (formato: YYYY-MM-DD)' }
    }

    const profissional = await repositorio.buscarPorId(id)
    if (!profissional) {
      throw { status: 404, mensagem: 'Profissional não encontrado' }
    }

    return repositorio.buscarHorariosDisponiveis(id, data)
  }
}