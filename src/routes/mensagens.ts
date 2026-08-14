import { FastifyInstance } from 'fastify'
import { ControladorMensagens } from '../controlllers/ControladorMensagens'
import { verificarAutenticacao } from '../middlewares/autenticacao'

const controlador = new ControladorMensagens()

export async function rotasMensagens(app: FastifyInstance) {

  // ?com=usuarioId filtra a conversa com uma pessoa específica; sem o filtro, traz tudo que o usuário enviou/recebeu
  app.get('/mensagens', {
    preHandler: [verificarAutenticacao],
  }, controlador.listar.bind(controlador))

  app.get('/mensagens/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.buscarPorId.bind(controlador))

  app.post('/mensagens', {
    preHandler: [verificarAutenticacao],
  }, controlador.criar.bind(controlador))

  app.patch('/mensagens/:id/lida', {
    preHandler: [verificarAutenticacao],
  }, controlador.marcarComoLida.bind(controlador))

  app.patch('/mensagens/todas/lidas', {
    preHandler: [verificarAutenticacao],
  }, controlador.marcarTodasComoLidas.bind(controlador))

  app.delete('/mensagens/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.remover.bind(controlador))
}