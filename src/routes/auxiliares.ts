import { FastifyInstance } from 'fastify'
import { ControladorEspecialidades } from '../controlllers/ControladorEspecialidades'
import { ControladorServicos } from '../controlllers/ControladorServicos'
import { ControladorConvenios } from '../controlllers/ControladorConvenios'
import { ControladorSalas } from '../controlllers/ControladorSalas'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const especialidades = new ControladorEspecialidades()
const servicos = new ControladorServicos()
const convenios = new ControladorConvenios()
const salas = new ControladorSalas()

export async function rotasAuxiliares(app: FastifyInstance) {

  // ── Especialidades ──────────────────────────────────────
  app.get('/especialidades', {
    preHandler: [verificarAutenticacao],
  }, especialidades.listar.bind(especialidades))

  app.post('/especialidades', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.criar.bind(especialidades))

  app.put('/especialidades/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.atualizar.bind(especialidades))

  app.patch('/especialidades/:id/status', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.alterarStatus.bind(especialidades))

  // ── Serviços ─────────────────────────────────────────────
  app.get('/servicos', {
    preHandler: [verificarAutenticacao],
  }, servicos.listar.bind(servicos))

  app.post('/servicos', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, servicos.criar.bind(servicos))

  app.put('/servicos/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, servicos.atualizar.bind(servicos))

  // ── Convênios ────────────────────────────────────────────
  app.get('/convenios', {
    preHandler: [verificarAutenticacao],
  }, convenios.listar.bind(convenios))

  app.post('/convenios', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, convenios.criar.bind(convenios))

  // ── Salas ────────────────────────────────────────────────
  app.get('/salas', {
    preHandler: [verificarAutenticacao],
  }, salas.listar.bind(salas))

  app.post('/salas', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, salas.criar.bind(salas))
}