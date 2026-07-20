import { ControladorEncaminhamentos } from './../controlllers/ControladorEncaminhamentos';
import { FastifyInstance } from 'fastify'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorEncaminhamentos()

export async function rotasEncaminhamentos(app: FastifyInstance) {

  app.get('/encaminhamentos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listar.bind(controlador))

  app.get('/encaminhamentos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.buscarPorId.bind(controlador))

  app.post('/encaminhamentos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  app.patch('/encaminhamentos/:id/status', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.alterarStatus.bind(controlador))

  app.delete('/encaminhamentos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.cancelar.bind(controlador))
}