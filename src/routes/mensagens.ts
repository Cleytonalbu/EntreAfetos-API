import { FastifyInstance } from 'fastify'
import { ControladorMensagens } from '../controlllers/ControladorMensagens'
import { verificarAutenticacao } from '../middlewares/autenticacao'

const controlador = new ControladorMensagens()

export async function rotasMensagens(app: FastifyInstance) {

  // Listar mensagens do usuário logado
  app.get('/mensagens', {
    preHandler: [verificarAutenticacao],
  }, controlador.listar.bind(controlador))

  // Buscar mensagem por ID
  app.get('/mensagens/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.buscarPorId.bind(controlador))

  // Criar mensagem
  app.post('/mensagens', {
    preHandler: [verificarAutenticacao],
  }, controlador.criar.bind(controlador))

  // Marcar como lida
  app.patch('/mensagens/:id/lida', {
    preHandler: [verificarAutenticacao],
  }, controlador.marcarComoLida.bind(controlador))

  // Remover mensagem
  app.delete('/mensagens/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.remover.bind(controlador))
}