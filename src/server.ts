import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

// Rotas
import { rotasAutenticacao } from './routes/autenticacao'
import { rotasPacientes } from './routes/pacientes'
import { rotasAuxiliares } from './routes/auxiliares'
import { rotasAgendamentos } from './routes/agendamentos'
import { rotasProfissionais } from './routes/profissionais'
import { rotasPlanoTerapeutico } from './routes/planoTerapeutico'
import { rotasObjetivos } from './routes/objetivos'
import { rotasEvolucoes } from './routes/evolucoes'
import { rotasEncaminhamentos } from './routes/encaminhamentos'
import { rotasNotificacoes } from './routes/notificacoes'
import { rotasMensagens } from './routes/mensagens'
import { rotasConfiguracoes } from './routes/configuracoes'
import { rotasIndicadores } from './routes/indicadores'
import { rotasRelatorios } from './routes/relatorios'

const app = Fastify({ logger: true })

// ── Plugins ──────────────────────────────────────────────
app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'fallback-secret',
})


// ── Rotas ────────────────────────────────────────────────
app.register(async (instance) => {
  instance.register(rotasAutenticacao)
  instance.register(rotasPacientes)
  instance.register(rotasAuxiliares)
  instance.register(rotasAgendamentos)
  instance.register(rotasProfissionais)
  instance.register(rotasPlanoTerapeutico)
  instance.register(rotasObjetivos)
  instance.register(rotasEvolucoes)
  instance.register(rotasEncaminhamentos)
  instance.register(rotasNotificacoes)
  instance.register(rotasMensagens)
  instance.register(rotasConfiguracoes)
  instance.register(rotasIndicadores)
  instance.register(rotasRelatorios)
})
// ── Health check ─────────────────────────────────────────
app.get('/health', async () => {
  return { status: 'ok', projeto: 'Entre Afetos API' }
})

// ── Start ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT) ?? 3333

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})