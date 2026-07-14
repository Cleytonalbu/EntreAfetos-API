import { FastifyInstance } from 'fastify'
import { ControladorPlanoTerapeutico } from '../controlllers/ControladorPlanoTerapeutico'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorPlanoTerapeutico()

export async function rotasPlanoTerapeutico(app: FastifyInstance) {

  // Buscar plano ativo do paciente
  app.get('/pacientes/:id/plano-terapeutico', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.buscarAtivo.bind(controlador))

  // Histórico de planos do paciente
  app.get('/pacientes/:id/plano-terapeutico/historico', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.historico.bind(controlador))

  // Criar plano para o paciente
  app.post('/pacientes/:id/plano-terapeutico', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  // Buscar plano por ID
  app.get('/planos-terapeuticos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.buscarPorId.bind(controlador))

  // Editar plano
  app.put('/planos-terapeuticos/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  // Alterar status do plano
  app.patch('/planos-terapeuticos/:id/status', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.alterarStatus.bind(controlador))
}