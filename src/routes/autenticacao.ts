import { FastifyInstance } from 'fastify'
import { ControladorAutenticacao } from '../controlllers/ControladorAutenticacao'
import { verificarAutenticacao } from '../middlewares/autenticacao'

const controlador = new ControladorAutenticacao()

export async function rotasAutenticacao(app: FastifyInstance) {
  // Rotas públicas
  app.post('/auth/registro', controlador.registro.bind(controlador))
  app.post('/auth/login',    controlador.login.bind(controlador))

  // Rota protegida
  app.get('/auth/me', {
    preHandler: [verificarAutenticacao],
  }, controlador.me.bind(controlador))
}