import { FastifyInstance } from 'fastify'
import { ControladorClinica } from '../controlllers/ControladorClinica'
import { ControladorModelosEvolucao } from '../controlllers/ControladorModelosEvolucao'
import { verificarAutenticacao, permitir } from '../middlewares/autenticacao'

const clinica = new ControladorClinica()
const modelos = new ControladorModelosEvolucao()

export async function rotasConfiguracoes(app: FastifyInstance) {

  // ── Clínica ──────────────────────────────────────────────
  app.get('/clinica', {
    preHandler: [verificarAutenticacao],
  }, clinica.buscar.bind(clinica))

  app.post('/clinica', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, clinica.criar.bind(clinica))

  app.put('/clinica', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, clinica.atualizar.bind(clinica))

  // ── Configurações gerais ─────────────────────────────────
  app.put('/clinica/configuracoes', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, clinica.atualizarConfiguracoes.bind(clinica))

  // ── Configurações de notificação ─────────────────────────
  app.get('/clinica/notificacoes-config', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, clinica.listarConfiguracoesNotificacao.bind(clinica))

  app.put('/clinica/notificacoes-config', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, clinica.salvarConfiguracaoNotificacao.bind(clinica))

  // ── Modelos de evolução ──────────────────────────────────
  app.get('/modelos-evolucao', {
    preHandler: [verificarAutenticacao],
  }, modelos.listar.bind(modelos))

  app.get('/modelos-evolucao/:id', {
    preHandler: [verificarAutenticacao],
  }, modelos.buscarPorId.bind(modelos))

  app.post('/modelos-evolucao', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, modelos.criar.bind(modelos))

  app.put('/modelos-evolucao/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, modelos.atualizar.bind(modelos))

  app.delete('/modelos-evolucao/:id', {
    preHandler: [verificarAutenticacao, permitir('GESTOR')],
  }, modelos.remover.bind(modelos))
}