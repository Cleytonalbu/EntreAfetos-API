import { FastifyInstance } from 'fastify'
import { ControladorPacientes } from '../controlllers/ControladorPacientes'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorPacientes()

export async function rotasPacientes(app: FastifyInstance) {

  // Todos autenticados podem listar e ver detalhes
  app.get('/pacientes', {
    preHandler: [verificarAutenticacao],
  }, controlador.listar.bind(controlador))

  app.get('/pacientes/:id', {
    preHandler: [verificarAutenticacao],
  }, controlador.buscarPorId.bind(controlador))

  // Recepcionista e Gestor podem criar e atualizar
  app.post('/pacientes', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.criar.bind(controlador))

  app.put('/pacientes/:id', {
    preHandler: [verificarAutenticacao, permitir('RECEPCIONISTA', 'GESTOR')],
  }, controlador.atualizar.bind(controlador))

  // Só Gestor pode inativar
  app.delete('/pacientes/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.inativar.bind(controlador))
}