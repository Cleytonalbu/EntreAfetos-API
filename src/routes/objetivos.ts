import { FastifyInstance } from 'fastify'
import { ControladorObjetivos } from '../controlllers/ControladorObjetivos'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorObjetivos()

export async function rotasObjetivos(app: FastifyInstance) {

  // Listar objetivos do paciente
  app.get('/pacientes/:id/objetivos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listar.bind(controlador))

  // Criar objetivo para o paciente
  app.post('/pacientes/:id/objetivos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  // Buscar objetivo por ID
  app.get('/objetivos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.buscarPorId.bind(controlador))

  // Atualizar objetivo
  app.put('/objetivos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  // Alterar status
  app.patch('/objetivos/:id/status', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.alterarStatus.bind(controlador))

  // Atualizar progresso
  app.patch('/objetivos/:id/progresso', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.atualizarProgresso.bind(controlador))

  // Remover objetivo
  app.delete('/objetivos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.remover.bind(controlador))
}