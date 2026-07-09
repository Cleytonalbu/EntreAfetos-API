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

  app.get('/especialidades/:id', {
    preHandler: [verificarAutenticacao],
  }, especialidades.buscarPorId.bind(especialidades))

  app.post('/especialidades', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.criar.bind(especialidades))

  app.put('/especialidades/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.atualizar.bind(especialidades))

  app.patch('/especialidades/:id/status', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.alterarStatus.bind(especialidades))

  app.delete('/especialidades/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, especialidades.inativar.bind(especialidades))
  
  // ── Serviços ─────────────────────────────────────────────
  app.get('/servicos', {
    preHandler: [verificarAutenticacao],
  }, servicos.listar.bind(servicos))

  app.get('/servicos/:id', {
    preHandler: [verificarAutenticacao],
  }, servicos.buscarPorId.bind(servicos))

  app.post('/servicos', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, servicos.criar.bind(servicos))

  app.put('/servicos/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, servicos.atualizar.bind(servicos))

  app.delete('/servicos/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, servicos.inativar.bind(servicos))

  // ── Convênios ────────────────────────────────────────────
  app.get('/convenios', {
    preHandler: [verificarAutenticacao],
  }, convenios.listar.bind(convenios))

  app.get('/convenios/:id', {
    preHandler: [verificarAutenticacao],
  }, convenios.buscarPorId.bind(convenios))

  app.post('/convenios', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, convenios.criar.bind(convenios))
  
  app.put('/convenios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, convenios.atualizar.bind(convenios))

  app.delete('/convenios/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, convenios.inativar.bind(convenios))

  // ── Salas ────────────────────────────────────────────────
  app.get('/salas', {
    preHandler: [verificarAutenticacao],
  }, salas.listar.bind(salas))

  app.get('/salas/:id', {
    preHandler: [verificarAutenticacao],
  }, salas.buscarPorId.bind(salas))

  app.post('/salas', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, salas.criar.bind(salas))

  app.put('/salas/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, salas.atualizar.bind(salas))

  app.delete('/salas/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, salas.inativar.bind(salas))
}