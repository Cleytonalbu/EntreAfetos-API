import { FastifyInstance } from 'fastify'
import { ControladorAnexos } from '../controlllers/ControladorAnexos'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorAnexos()

export async function rotasAnexos(app: FastifyInstance) {

  app.post('/evolucoes/:id/anexos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.enviar.bind(controlador))

  app.get('/evolucoes/:id/anexos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listarPorEvolucao.bind(controlador))

  // URL assinada de 5 min — o front baixa direto do storage, não passa pela API
  app.get('/anexos/:id/download', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.download.bind(controlador))

  app.delete('/anexos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.remover.bind(controlador))
}