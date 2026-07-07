import { FastifyInstance } from 'fastify'
import { ControladorAgendamentos } from '../controlllers/ControladorAgendamentos'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorAgendamentos()

export async function rotasAgendamentos(app: FastifyInstance) {

  // Todos autenticados podem listar e ver detalhes
  app.get('/agendamentos', {
    preHandler: [verificarAutenticacao],
  }, controlador.listar.bind(controlador))

  app.get('/agendamentos/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.buscarPorId.bind(controlador))

  // Recepcionista e Gestor criam e editam
  app.post('/agendamentos', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  app.put('/agendamentos/:id', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  // Todos autenticados podem alterar status (recepção muda para aguardando, profissional para concluído)
  app.patch('/agendamentos/:id/status', {
    preHandler: [verificarAutenticacao],
  }, controlador.alterarStatus.bind(controlador))

  // Só Gestor e Recepcionista cancelam
  app.delete('/agendamentos/:id', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.cancelar.bind(controlador))
}