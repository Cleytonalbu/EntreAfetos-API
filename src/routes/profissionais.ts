import { FastifyInstance } from 'fastify'
import { ControladorProfissionais } from '../controlllers/ControladorProfissionais'
import { ControladorUsuarios } from '../controlllers/ControladorUsuarios'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const profissionais = new ControladorProfissionais()
const usuarios      = new ControladorUsuarios()

export async function rotasProfissionais(app: FastifyInstance) {

  // ── Profissionais ────────────────────────────────────────
  app.get('/profissionais', {
    preHandler: [verificarAutenticacao],
  }, profissionais.listar.bind(profissionais))

  app.get('/profissionais/:id', {
    preHandler: [verificarAutenticacao],
  }, profissionais.buscarPorId.bind(profissionais))

  app.post('/profissionais', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, profissionais.criar.bind(profissionais))

  app.put('/profissionais/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, profissionais.atualizar.bind(profissionais))

  app.delete('/profissionais/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, profissionais.inativar.bind(profissionais))

  app.get('/profissionais/:id/horarios-disponiveis', {
    preHandler: [verificarAutenticacao],
  }, profissionais.horariosDisponiveis.bind(profissionais))

  // ── Usuários (recepcionistas, gestores) ──────────────────
  app.get('/usuarios', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, usuarios.listarPorPapel.bind(usuarios))

  app.get('/usuarios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, usuarios.buscarPorId.bind(usuarios))

  app.put('/usuarios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, usuarios.atualizar.bind(usuarios))

  app.delete('/usuarios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, usuarios.inativar.bind(usuarios))
}