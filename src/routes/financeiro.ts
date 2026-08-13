import { FastifyInstance } from 'fastify'
import { ControladorTransacoes } from '../controlllers/ControladorTransacoes'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorTransacoes()

export async function rotasFinanceiro(app: FastifyInstance) {

  // Recepcionista só vê receitas (cobranças); Gestor vê tudo — filtro fica no service
  app.get('/transacoes', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.listar.bind(controlador))

  app.get('/transacoes/:id', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.buscarPorId.bind(controlador))

  app.post('/transacoes', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  app.put('/transacoes/:id', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  app.patch('/transacoes/:id/status', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.alterarStatus.bind(controlador))

  // Só Gestor cancela uma transação
  app.delete('/transacoes/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.remover.bind(controlador))

  // Histórico financeiro do paciente
  app.get('/pacientes/:id/financeiro', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.historicoPaciente.bind(controlador))

  // Painel — só Gestor
  app.get('/financeiro/dashboard', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.dashboard.bind(controlador))
}