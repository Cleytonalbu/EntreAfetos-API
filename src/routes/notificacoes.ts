import { FastifyInstance } from 'fastify'
import { ControladorNotificacoes } from '../controlllers/ControladorNotificacoes'
import { verificarAutenticacao } from '../middlewares/autenticacao'

const controlador = new ControladorNotificacoes()

export async function rotasNotificacoes(app: FastifyInstance) {

  // Listar notificações do usuário logado
  app.get('/notificacoes', {
    preHandler: [verificarAutenticacao],
  }, controlador.listar.bind(controlador))

  // Criar notificação (sistema interno)
  app.post('/notificacoes', {
    preHandler: [verificarAutenticacao],
  }, controlador.criar.bind(controlador))

  // Marcar uma como lida
  app.patch('/notificacoes/:id/lida', {
    preHandler: [verificarAutenticacao],
  }, controlador.marcarComoLida.bind(controlador))

  // Marcar todas como lidas
  app.patch('/notificacoes/todas/lidas', {
    preHandler: [verificarAutenticacao],
  }, controlador.marcarTodasComoLidas.bind(controlador))

  // Remover uma notificação
  app.delete('/notificacoes/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.remover.bind(controlador))

  // Remover todas as notificações
  app.delete('/notificacoes', {
    preHandler: [verificarAutenticacao],
  }, controlador.removerTodas.bind(controlador))
}