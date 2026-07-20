import { FastifyInstance } from 'fastify'
import { ControladorRelatorios } from '../controlllers/ControladorRelatorios'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const controlador = new ControladorRelatorios()

export async function rotasRelatorios(app: FastifyInstance) {

  // Tipos disponíveis
  app.get('/relatorios/tipos', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listarTipos.bind(controlador))

  // Histórico de relatórios gerados
  app.get('/relatorios', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.listarHistorico.bind(controlador))

  // Gerar relatório (retorna os dados)
  app.post('/relatorios/gerar', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.gerar.bind(controlador))

  // Registrar que um relatório foi gerado/exportado
  app.post('/relatorios', {
    preHandler: [verificarAutenticacao, permitir('PROFISSIONAL', 'GESTOR')],
  }, controlador.registrarGeracao.bind(controlador))

  // Remover registro do histórico
  app.delete('/relatorios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, controlador.removerRegistro.bind(controlador))
}