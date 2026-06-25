import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import 'dotenv/config'

// Rotas
import { rotasAutenticacao } from './routes/autenticacao'

const app = Fastify({ logger: true })

// ── Plugins ──────────────────────────────────────────────
app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'fallback-secret',
})


// ── Rotas ────────────────────────────────────────────────
app.register(rotasAutenticacao)

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