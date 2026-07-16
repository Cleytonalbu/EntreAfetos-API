import { FastifyInstance } from 'fastify'
import { ControladorEvolucoes } from '../controlllers/ControladorEvolucoes'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorEvolucoes()

export async function rotasEvolucoes(app: FastifyInstance) {

  // Listar evoluções do paciente
  app.get('/pacientes/:id/evolucoes', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listar.bind(controlador))

  // Criar evolução
  app.post('/evolucoes', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  // Buscar evolução por ID
  app.get('/evolucoes/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.buscarPorId.bind(controlador))

  // Atualizar evolução (só rascunho)
  app.put('/evolucoes/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  // Assinar evolução
  app.post('/evolucoes/:id/assinar', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL')],
  }, controlador.assinar.bind(controlador))

  // Remover rascunho
  app.delete('/evolucoes/:id', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.remover.bind(controlador))
}