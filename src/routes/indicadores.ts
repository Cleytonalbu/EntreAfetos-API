import { FastifyInstance } from 'fastify'
import { ControladorIndicadores } from '../controlllers/ControladorIndicadores'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorIndicadores()

export async function rotasIndicadores(app: FastifyInstance) {

  // Painel geral da clínica — só gestor
  app.get('/indicadores', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.painelGeral.bind(controlador))

  app.get('/indicadores/objetivos', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.objetivos.bind(controlador))

  app.get('/indicadores/frequencia', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.frequencia.bind(controlador))

  app.get('/indicadores/alertas', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.alertas.bind(controlador))

  // Indicadores de um paciente — profissional e gestor
  app.get('/pacientes/:id/indicadores', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.indicadoresPaciente.bind(controlador))
}