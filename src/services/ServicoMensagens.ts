import { RepositorioMensagens } from '../repositories/RepositorioMensagens'
import prisma from '../lib/prisma'

const repositorio = new RepositorioMensagens()

export class ServicoMensagens {

  async listar(usuarioId: string, comUsuarioId?: string) {
    return repositorio.listarDoUsuario(usuarioId, comUsuarioId)
  }

  async buscarPorId(id: string, usuarioId: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }
    if (mensagem.remetente.id !== usuarioId && mensagem.destinatario.id !== usuarioId) {
      throw { status: 403, mensagem: 'Acesso negado' }
    }
    return mensagem
  }

  async criar(remetenteId: string, dados: { destinatarioId: string; texto: string }) {
    if (!dados.destinatarioId || !dados.texto?.trim()) {
      throw { status: 400, mensagem: 'destinatarioId e texto são obrigatórios' }
    }
    if (dados.destinatarioId === remetenteId) {
      throw { status: 400, mensagem: 'Não é possível enviar mensagem para si mesmo' }
    }

    const destinatario = await prisma.usuario.findUnique({ where: { id: dados.destinatarioId } })
    if (!destinatario || !destinatario.ativo) {
      throw { status: 404, mensagem: 'Destinatário não encontrado ou inativo' }
    }

    return repositorio.criar({ remetenteId, destinatarioId: dados.destinatarioId, texto: dados.texto.trim() })
  }

  async marcarComoLida(id: string, usuarioId: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }
    if (mensagem.destinatario.id !== usuarioId) {
      throw { status: 403, mensagem: 'Apenas o destinatário pode marcar a mensagem como lida' }
    }
    return repositorio.marcarComoLida(id)
  }

  async marcarTodasComoLidas(usuarioId: string, comUsuarioId?: string) {
    return repositorio.marcarTodasComoLidas(usuarioId, comUsuarioId)
  }

  async remover(id: string, usuarioId: string) {
    const mensagem = await repositorio.buscarPorId(id)
    if (!mensagem) {
      throw { status: 404, mensagem: 'Mensagem não encontrada' }
    }
    if (mensagem.remetente.id !== usuarioId && mensagem.destinatario.id !== usuarioId) {
      throw { status: 403, mensagem: 'Acesso negado' }
    }
    return repositorio.remover(id)
  }
}