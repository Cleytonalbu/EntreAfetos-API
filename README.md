# Entre Afetos API

API REST da plataforma **Clínica Integrada Entre Afetos** — sistema de gestão clínica multidisciplinar para acompanhamento terapêutico de crianças.

---

## Sumário

- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Papéis e permissões](#papéis-e-permissões)
- [Configuração](#configuração)
- [Convenções da API](#convenções-da-api)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Autenticação](#autenticação)
  - [Usuários](#usuários)
  - [Pacientes](#pacientes)
  - [Profissionais](#profissionais)
  - [Especialidades](#especialidades)
  - [Serviços](#serviços)
  - [Convênios](#convênios)
  - [Salas](#salas)
  - [Agendamentos](#agendamentos)
  - [Plano Terapêutico](#plano-terapêutico)
  - [Objetivos](#objetivos)
  - [Evoluções](#evoluções)
  - [Encaminhamentos](#encaminhamentos)
  - [Financeiro](#financeiro)
  - [Indicadores](#indicadores)
  - [Relatórios](#relatórios)
  - [Notificações](#notificações)
  - [Mensagens](#mensagens)
  - [Configurações](#configurações)
- [Códigos de resposta](#códigos-de-resposta)
- [Status dos módulos](#status-dos-módulos)
- [Débitos técnicos](#débitos-técnicos)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 18+ |
| Framework | Fastify |
| Linguagem | TypeScript |
| ORM | Prisma 6 |
| Banco | PostgreSQL 16 |
| Autenticação | JWT (`@fastify/jwt`) |
| Hash de senha | bcryptjs |
| Container | Docker |

---

## Arquitetura

Quatro camadas com responsabilidade única:

```
Request
   ↓
routes/         → define endpoint, aplica RBAC via preHandler
   ↓
controllers/    → valida entrada, formata resposta HTTP
   ↓
services/       → regras de negócio e validações de domínio
   ↓
repositories/   → acesso ao banco via Prisma
   ↓
PostgreSQL
```

### Estrutura de pastas

```
src/
  routes/          autenticacao, pacientes, agendamentos, profissionais,
                   auxiliares, planoTerapeutico, objetivos, evolucoes,
                   encaminhamentos, indicadores, relatorios, notificacoes,
                   mensagens, configuracoes
  controllers/     um Controlador por domínio
  services/        um Servico por domínio
  repositories/    um Repositorio por domínio
  middlewares/     autenticacao.ts (verificarAutenticacao + permitir)
  lib/             prisma.ts, prismaErros.ts
  types/           tipos globais e extensão do FastifyJWT
  server.ts        bootstrap da aplicação
prisma/
  schema.prisma    20 models + 8 enums
  migrations/
```

### Tratamento de erros

Erros do Prisma são traduzidos para HTTP em `lib/prismaErros.ts`:

| Código Prisma | HTTP | Significado |
|---------------|------|-------------|
| P2002 | 409 | Violação de campo único |
| P2003 | 400 | Referência inválida (FK) |
| P2014 | 400 | Violação de relacionamento |
| P2025 | 404 | Registro não encontrado |
| ValidationError | 400 | Dados inválidos |

Erros de negócio lançados pelos services usam o formato `{ status, mensagem }` e são repassados diretamente.

---

## Papéis e permissões

| Papel | Escopo |
|-------|--------|
| `GESTOR` | Acesso total — configurações, indicadores, cadastros, relatórios |
| `PROFISSIONAL` | Módulo clínico — pacientes, planos, objetivos, evoluções, encaminhamentos |
| `RECEPCIONISTA` | Operação — agendamentos, cadastro de pacientes, mensagens |

### Como o RBAC funciona

```typescript
// middlewares/autenticacao.ts
export function permitir(...papeis: Papel[]) {
  return async (request, reply) => {
    if (!papeis.includes(request.user.papel)) {
      return reply.status(403).send({ erro: 'Acesso negado', ... })
    }
  }
}

// routes/exemplo.ts
app.delete('/recurso/:id', {
  preHandler: [verificarAutenticacao, permitir('GESTOR')],
}, controlador.remover)
```

---

## Configuração

### Pré-requisitos

- Node.js 18+
- Docker

### Instalação

```bash
git clone <repo>
cd entre-afetos-api
npm install
cp .env.example .env
```

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entre_afetos"
JWT_SECRET="sua-chave-secreta"
PORT=3333
```

### Subir o banco

```bash
docker compose up -d
```

### Migrations

```bash
npx prisma migrate dev
```

### Rodar

```bash
npm run dev      # desenvolvimento com hot reload
npm run build    # compilar
npm start        # produção
```

### Extensão do PostgreSQL

Para busca sem acentuação:

```bash
npx prisma db execute --file ./prisma/extensions.sql
```

Conteúdo do arquivo:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

---

## Convenções da API

**Base URL:** `http://localhost:3333`

**Autenticação:** header `Authorization: Bearer <token>`

**Notação usada abaixo:**

- 🔒 exige autenticação
- 🔑 exige papel específico

**Formato de erro:**

```json
{
  "erro": "Erro",
  "mensagem": "Descrição do que aconteceu"
}
```

**Formato de listagem paginada:**

```json
{
  "dados": [...],
  "meta": {
    "total": 42,
    "pagina": 1,
    "porPagina": 10,
    "totalPaginas": 5
  }
}
```

**Soft delete:** `DELETE` não remove fisicamente na maioria dos recursos — altera `status` ou `ativo` para inativo. Exceções: Objetivos, Notificações, Mensagens e registros de Relatório, que são removidos de fato.

---
## Endpoints

### Health Check

```http
GET /health
```

Rota pública. Retorna `{ "status": "ok", "projeto": "Entre Afetos API" }`.

---

### Autenticação

#### Registrar usuário

```http
POST /auth/registro
```

```json
{
  "nome": "Mariana Silva",
  "email": "mariana@entreafetos.com",
  "senha": "123456",
  "papel": "GESTOR"
}
```

O campo `papel` aceita `GESTOR`, `PROFISSIONAL` ou `RECEPCIONISTA` — case insensitive. Retorna `201` com o usuário e um token JWT válido por 7 dias.

> Para cadastrar profissionais use `POST /profissionais` — essa rota cria o usuário **e** o registro de Profissional vinculado.

| Erro | Motivo |
|------|--------|
| 400 | Campos obrigatórios ausentes ou papel inválido |
| 409 | E-mail já cadastrado |

---

#### Login

```http
POST /auth/login
```

```json
{
  "email": "mariana@entreafetos.com",
  "senha": "123456"
}
```

Retorna `200` com dados do usuário e token.

| Erro | Motivo |
|------|--------|
| 400 | Campos obrigatórios ausentes |
| 401 | E-mail ou senha incorretos |
| 403 | Usuário inativo |

---

#### Perfil do usuário logado

```http
GET /auth/me
```

🔒 Retorna os dados atualizados do usuário do token. Usado pelo frontend na inicialização para montar o layout conforme o papel.

---

### Usuários

Gestão de recepcionistas e gestores. Para profissionais use `/profissionais`.

#### Listar por papel

```http
GET /usuarios?papel=RECEPCIONISTA&busca=ana
```

🔒 🔑 `GESTOR`

O parâmetro `papel` é obrigatório. `busca` filtra por nome ou e-mail.

#### Buscar por ID

```http
GET /usuarios/:id
```

🔒 🔑 `GESTOR`

#### Atualizar

```http
PUT /usuarios/:id
```

🔒 🔑 `GESTOR`

```json
{ "nome": "Ana Silva", "foto": "https://..." }
```

#### Inativar

```http
DELETE /usuarios/:id
```

🔒 🔑 `GESTOR` — retorna `204`. Define `ativo = false`.

---

### Pacientes

#### Listar

```http
GET /pacientes?busca=joao&status=ativo&pagina=1&porPagina=10
```

🔒 Todos os papéis autenticados.

| Param | Descrição |
|-------|-----------|
| `busca` | Nome, responsável ou telefone — ignora acentuação |
| `status` | `ativo` ou `inativo` |
| `pagina` | Padrão 1 |
| `porPagina` | Padrão 10 |

#### Buscar por ID

```http
GET /pacientes/:id
```

🔒 Retorna o paciente com os 5 últimos agendamentos e o plano terapêutico ativo.

#### Criar

```http
POST /pacientes
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

```json
{
  "nome": "João Miguel Silva",
  "dataNascimento": "2017-03-14",
  "sexo": "Masculino",
  "responsavel": "Juliana Lima Silva",
  "telefone": "(83) 98765-4321",
  "diagnostico": "TEA - Nível 1 de Suporte",
  "tags": ["TEA", "Nível 1"]
}
```

Obrigatórios: `nome`, `dataNascimento`, `sexo`.

#### Atualizar

```http
PUT /pacientes/:id
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR` — todos os campos opcionais.

#### Inativar

```http
DELETE /pacientes/:id
```

🔒 🔑 `GESTOR` — retorna `204`. Define `status = "inativo"`.

---

### Profissionais

#### Listar

```http
GET /profissionais?busca=camila&especialidadeId=uuid&ativo=true
```

🔒 Retorna profissionais com usuário e especialidades vinculadas.

#### Buscar por ID

```http
GET /profissionais/:id
```

🔒

#### Criar

```http
POST /profissionais
```

🔒 🔑 `GESTOR`

```json
{
  "nome": "Dra. Camila Soares",
  "email": "camila@entreafetos.com",
  "senha": "123456",
  "registro": "CRP-12345",
  "bio": "Psicóloga especializada em desenvolvimento infantil",
  "especialidadeIds": ["uuid-psicologia", "uuid-fono"]
}
```

Cria o `Usuario` com papel `PROFISSIONAL` **e** o registro `Profissional`, vinculando as especialidades. Não retorna token — o profissional obtém o dele via `POST /auth/login`.

> ⚠️ O `id` do Profissional é diferente do `id` do Usuário. Rotas clínicas usam o `profissionalId`.

#### Atualizar

```http
PUT /profissionais/:id
```

🔒 🔑 `GESTOR`

```json
{
  "nome": "Dra. Camila Soares Silva",
  "bio": "...",
  "registro": "CRP-12345-SP",
  "especialidadeIds": ["uuid"]
}
```

Passar `especialidadeIds` substitui todos os vínculos existentes.

#### Inativar

```http
DELETE /profissionais/:id
```

🔒 🔑 `GESTOR` — retorna `204`. Define `ativo = false` no usuário vinculado.

#### Horários disponíveis

```http
GET /profissionais/:id/horarios-disponiveis?data=2026-07-15
```

🔒 Retorna slots de 30 em 30 minutos entre 08:00 e 18:30, marcando cada um como disponível ou ocupado com base nos agendamentos do dia e na duração de cada serviço.

```json
{
  "slots": [
    { "horario": "08:00", "disponivel": true,  "dataHora": "2026-07-15T08:00:00.000Z" },
    { "horario": "09:00", "disponivel": false, "dataHora": "2026-07-15T09:00:00.000Z" }
  ]
}
```

| Erro | Motivo |
|------|--------|
| 400 | `data` não informada |
| 404 | Profissional não encontrado |

---

### Especialidades

```http
GET    /especialidades              🔒
GET    /especialidades/:id          🔒
POST   /especialidades              🔒 🔑 GESTOR
PUT    /especialidades/:id          🔒 🔑 GESTOR
PATCH  /especialidades/:id/status   🔒 🔑 GESTOR
DELETE /especialidades/:id          🔒 🔑 GESTOR
```

Criação:

```json
{
  "nome": "Psicologia",
  "descricao": "Avaliação e acompanhamento psicológico",
  "cor": "#6C3FC5",
  "categoria": "saude_mental",
  "icone": "brain"
}
```

Obrigatórios: `nome`, `categoria`. O campo `nome` é único — duplicatas retornam `409`.

Alterar status: `{ "ativo": false }`. O `DELETE` faz o mesmo, retornando `204`.

---

### Serviços

```http
GET    /servicos          🔒
GET    /servicos/:id      🔒
POST   /servicos          🔒 🔑 GESTOR
PUT    /servicos/:id      🔒 🔑 GESTOR
DELETE /servicos/:id      🔒 🔑 GESTOR
```

```json
{
  "nome": "Consulta de acompanhamento",
  "duracaoMin": 50,
  "descricao": "Consulta voltada para acompanhamento terapêutico"
}
```

Obrigatórios: `nome`, `duracaoMin`. A duração é usada no cálculo de conflito de horário dos agendamentos.

---

### Convênios

```http
GET    /convenios        🔒
GET    /convenios/:id    🔒
POST   /convenios        🔒 🔑 GESTOR
PUT    /convenios/:id    🔒 🔑 GESTOR
DELETE /convenios/:id    🔒 🔑 GESTOR
```

Body: `{ "nome": "Particular" }`

---

### Salas

```http
GET    /salas        🔒
GET    /salas/:id    🔒
POST   /salas        🔒 🔑 GESTOR
PUT    /salas/:id    🔒 🔑 GESTOR
DELETE /salas/:id    🔒 🔑 GESTOR
```

```json
{ "nome": "Sala 1", "descricao": "Sala de atendimento individual" }
```

---
### Agendamentos

#### Listar

```http
GET /agendamentos?data=2026-07-10&profissionalId=uuid&status=AGENDADO&pagina=1
```

🔒 Filtros: `data` (dia específico, `YYYY-MM-DD`), `profissionalId`, `pacienteId`, `status`, paginação.

Retorna cada agendamento com paciente, profissional, serviço, especialidade, convênio e sala.

#### Buscar por ID

```http
GET /agendamentos/:id
```

🔒

#### Criar

```http
POST /agendamentos
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

```json
{
  "pacienteId": "uuid",
  "profissionalId": "uuid",
  "servicoId": "uuid",
  "especialidadeId": "uuid",
  "convenioId": "uuid",
  "salaId": "uuid",
  "dataHora": "2026-07-10T09:00:00",
  "observacoes": "Primeira consulta",
  "rascunho": false
}
```

Obrigatórios: `pacienteId`, `profissionalId`, `servicoId`, `dataHora`.

**Verificação de conflito:** antes de criar, o sistema calcula o intervalo do agendamento usando a `duracaoMin` do serviço e verifica se o profissional já tem compromisso sobreposto. Agendamentos cancelados são ignorados.

| Erro | Motivo |
|------|--------|
| 400 | Campos obrigatórios ausentes |
| 404 | Serviço não encontrado |
| 409 | Profissional já tem agendamento no horário |

#### Atualizar

```http
PUT /agendamentos/:id
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

#### Alterar status

```http
PATCH /agendamentos/:id/status
```

🔒 Todos os papéis — a recepção marca chegada, o profissional marca atendimento.

```json
{ "status": "AGUARDANDO" }
```

| Status | Quando |
|--------|--------|
| `AGENDADO` | Estado inicial |
| `AGUARDANDO` | Paciente chegou na clínica |
| `EM_ATENDIMENTO` | Sessão em andamento |
| `CONCLUIDO` | Sessão finalizada |
| `CANCELADO` | Cancelado ou falta |

#### Cancelar

```http
DELETE /agendamentos/:id
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR` — retorna `204`. Define `status = CANCELADO`.

#### Bloquear horário

```http
POST /agendamentos/bloqueio
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

```json
{
  "profissionalId": "uuid",
  "dataHora": "2026-08-20T12:00:00",
  "dataFim": "2026-08-20T13:00:00",
  "motivo": "Almoço",
  "salaId": "uuid"
}
```

Obrigatórios: `profissionalId`, `dataHora`, `dataFim`. `motivo` e `salaId` são opcionais.

Cria um `Agendamento` com `tipo = BLOQUEIO`, sem `pacienteId` nem `servicoId`. Usa a mesma verificação de conflito de horário dos atendimentos — um bloqueio impede criar atendimento no mesmo horário do profissional, e vice-versa. `GET /agendamentos` retorna bloqueios misturados com atendimentos na listagem; nesses registros `paciente` e `servico` vêm `null`, e o front deve usar o campo `tipo` para diferenciar a renderização na agenda.

Para **desbloquear**, use a rota de cancelamento existente: `DELETE /agendamentos/:id` (define `status = CANCELADO` e libera o horário).

| Erro | Motivo |
|------|--------|
| 400 | `profissionalId`, `dataHora` ou `dataFim` ausentes, ou `dataFim` anterior/igual a `dataHora` |
| 409 | O profissional já tem agendamento ou bloqueio nesse horário |

---

### Plano Terapêutico

#### Plano ativo do paciente

```http
GET /pacientes/:id/plano-terapeutico
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

Retorna o plano com status `ATIVO`, incluindo paciente, profissional responsável e objetivos vinculados. Retorna `404` se o paciente não tiver plano ativo.

#### Histórico de planos

```http
GET /pacientes/:id/plano-terapeutico/historico
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — todos os planos do paciente, do mais recente ao mais antigo, com contagem de objetivos.

#### Criar plano

```http
POST /pacientes/:id/plano-terapeutico
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{
  "profissionalId": "uuid",
  "dataAvaliacao": "2026-02-10",
  "dataInicio": "2026-02-10",
  "dataProximaRevisao": "2026-08-10",
  "versao": "1.0",
  "especialidadePrincipal": "Psicologia",
  "outrasEspecialidades": ["Fonoaudiologia", "Terapia Ocupacional"],
  "localAtendimento": "Clínica Entre Afetos",
  "queixasPrincipais": "Dificuldades na comunicação funcional",
  "necessidadesIdentificadas": "Desenvolvimento da comunicação e regulação emocional",
  "objetivoGeral": "Promover o desenvolvimento global da criança",
  "estrategiasTerapeuticas": "Intervenções baseadas em ABA, TEACCH e ESDM",
  "observacoes": "Plano elaborado com base na avaliação inicial",
  "frequenciaSemanal": 3,
  "duracaoSessaoMin": 50,
  "totalMensalSessoes": 12
}
```

Obrigatórios: `profissionalId`, `dataAvaliacao`, `dataInicio`, `dataProximaRevisao`, `especialidadePrincipal`.

> ⚠️ Criar um novo plano **encerra automaticamente** o plano ativo anterior do paciente (`status = ENCERRADO`).

#### Buscar por ID

```http
GET /planos-terapeuticos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Atualizar

```http
PUT /planos-terapeuticos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Alterar status

```http
PATCH /planos-terapeuticos/:id/status
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{ "status": "EM_REVISAO" }
```

Valores: `ATIVO`, `EM_REVISAO`, `PAUSADO`, `ENCERRADO`.

---

### Objetivos

#### Listar objetivos do paciente

```http
GET /pacientes/:id/objetivos?categoria=comunicacao&status=EM_ANDAMENTO&planoId=uuid
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Criar

```http
POST /pacientes/:id/objetivos
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{
  "profissionalId": "uuid",
  "planoId": "uuid",
  "nome": "Ampliar comunicação funcional",
  "descricao": "Utilizar frases de 3 a 4 palavras para expressar necessidades",
  "categoria": "comunicacao",
  "progresso": 0,
  "nivelDesempenho": 3
}
```

Obrigatórios: `profissionalId`, `nome`, `categoria`. O `progresso` vai de 0 a 100, o `nivelDesempenho` de 1 a 5.

#### Buscar por ID

```http
GET /objetivos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — inclui paciente, profissional, plano e as 5 últimas sessões em que o objetivo foi trabalhado.

#### Atualizar

```http
PUT /objetivos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Alterar status

```http
PATCH /objetivos/:id/status
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{ "status": "ALCANCADO" }
```

Valores: `EM_ANDAMENTO`, `ALCANCADO`, `PARCIALMENTE_ALCANCADO`, `NAO_TRABALHADO`.

> Marcar como `ALCANCADO` define automaticamente `progresso = 100` e `nivelDesempenho = 5`.

#### Atualizar progresso

```http
PATCH /objetivos/:id/progresso
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{ "progresso": 70, "nivelDesempenho": 4 }
```

> Definir `progresso = 100` marca o objetivo como `ALCANCADO` automaticamente.

| Erro | Motivo |
|------|--------|
| 400 | `progresso` fora de 0–100 ou `nivelDesempenho` fora de 1–5 |

#### Remover

```http
DELETE /objetivos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — retorna `204`. Remove fisicamente do banco.

---

### Evoluções

Registro clínico das sessões realizadas.

#### Listar evoluções do paciente

```http
GET /pacientes/:id/evolucoes?profissionalId=uuid&dataInicio=2026-07-01&dataFim=2026-07-31&rascunho=false
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Criar

```http
POST /evolucoes
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{
  "pacienteId": "uuid",
  "profissionalId": "uuid",
  "agendamentoId": "uuid",
  "modeloEvolucaoId": "uuid",
  "dataAtendimento": "2026-07-11",
  "horaInicio": "09:00",
  "horaFim": "09:50",
  "especialidade": "Psicologia",
  "tipoAtendimento": "individual",
  "localAtendimento": "Clínica Entre Afetos",
  "evolucaoEscrita": "João esteve participativo durante a sessão...",
  "resultadoGeral": "dentro_esperado",
  "impactos": ["comunicacao", "interacao_social", "atencao"],
  "observacoes": "Boa receptividade às atividades propostas",
  "respostas": { "comportamento_observado": "Tranquilo, engajado nas atividades", "interacao_social": 4 },
  "rascunho": true,
  "objetivosSessao": [
    {
      "objetivoId": "uuid",
      "statusNaSessao": "Em evolução",
      "nivelDesempenho": 4
    }
  ]
}
```

Obrigatórios: `pacienteId`, `profissionalId`, `dataAtendimento`, `horaInicio`, `horaFim`, `especialidade`, `tipoAtendimento`.

`modeloEvolucaoId` (opcional) referencia o [Modelo de Evolução](#configurações) usado para preencher a sessão; `respostas` (opcional, JSON livre) guarda as respostas de cada campo do modelo, com a mesma estrutura de chaves definida em `campos.secoes` do modelo. Ambos são independentes de `evolucaoEscrita`/`observacoes` — o frontend decide se usa o formulário livre, um modelo, ou os dois.

| Campo | Valores aceitos |
|-------|-----------------|
| `tipoAtendimento` | `individual`, `grupo`, `domiciliar`, `teleconsulta` |
| `resultadoGeral` | `abaixo_esperado`, `dentro_esperado`, `acima_esperado` |

O array `objetivosSessao` cria os vínculos na tabela pivô `ObjetivoSessao` e atualiza o `nivelDesempenho` de cada objetivo trabalhado.

#### Buscar por ID

```http
GET /evolucoes/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — inclui paciente, profissional, agendamento, modelo de evolução vinculado, objetivos da sessão, anexos e encaminhamentos gerados.

#### Atualizar

```http
PUT /evolucoes/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

> Só funciona enquanto `rascunho = true`. Evoluções assinadas retornam `400`.

#### Assinar

```http
POST /evolucoes/:id/assinar
```

🔒 🔑 `PROFISSIONAL`

Define `rascunho = false` e registra `assinadoEm`. A partir daí a evolução fica imutável.

| Erro | Motivo |
|------|--------|
| 400 | Já assinada, ou `evolucaoEscrita` vazia |
| 403 | Usuário não é o profissional responsável pela evolução |
| 404 | Evolução não encontrada |

#### Remover

```http
DELETE /evolucoes/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — retorna `204`. Só remove rascunhos; evoluções assinadas retornam `400`.

---

### Encaminhamentos

#### Listar

```http
GET /encaminhamentos?pacienteId=uuid&status=PENDENTE&prioridade=ALTA&dataInicio=2026-07-01
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

Filtros: `pacienteId`, `profissionalOrigemId`, `especialidadeId`, `status`, `prioridade`, `dataInicio`, `dataFim`.

#### Buscar por ID

```http
GET /encaminhamentos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Criar

```http
POST /encaminhamentos
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{
  "pacienteId": "uuid",
  "profissionalOrigemId": "uuid",
  "profissionalDestinoId": "uuid",
  "evolucaoId": "uuid",
  "especialidadeId": "uuid",
  "motivo": "Necessidade de avaliação da comunicação funcional",
  "observacoes": "Paciente mantém dificuldades expressivas",
  "prioridade": "ALTA"
}
```

Obrigatórios: `pacienteId`, `profissionalOrigemId`, `motivo`.

Prioridades: `BAIXA`, `MEDIA` (padrão), `ALTA`, `URGENTE`.

#### Alterar status

```http
PATCH /encaminhamentos/:id/status
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{ "status": "ACEITO" }
```

Fluxo: `PENDENTE` → `ACEITO` → `EM_ATENDIMENTO` → `CONCLUIDO`.

> Encaminhamentos com status `CONCLUIDO` ou `CANCELADO` não podem mais ter o status alterado.

#### Cancelar

```http
DELETE /encaminhamentos/:id
```

🔒 🔑 `PROFISSIONAL`, `GESTOR` — retorna `204`. Define `status = CANCELADO`. Não é possível cancelar um encaminhamento já concluído.

---

### Financeiro

Receitas (cobranças de pacientes) e despesas da clínica. `RECEPCIONISTA` só enxerga e movimenta transações do tipo `RECEITA` — `DESPESA` é exclusiva do `GESTOR`, mesmo as rotas sendo compartilhadas.

#### Listar

```http
GET /transacoes?tipo=RECEITA&status=PENDENTE&pacienteId=uuid&dataInicio=2026-01-01&dataFim=2026-12-31&pagina=1
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

Quando quem chama é `RECEPCIONISTA`, o filtro `tipo=RECEITA` é aplicado automaticamente pelo backend, independente do que vier na query.

#### Buscar por ID

```http
GET /transacoes/:id
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR` — retorna `403` se `RECEPCIONISTA` tentar buscar uma transação `DESPESA` diretamente por ID.

#### Criar

```http
POST /transacoes
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

```json
{
  "tipo": "RECEITA",
  "categoria": "Consulta",
  "descricao": "Sessão de psicologia - João Miguel",
  "valor": 150.00,
  "formaPagamento": "Pix",
  "pacienteId": "uuid",
  "profissionalId": "uuid",
  "dataVencimento": "2026-08-20"
}
```

Obrigatórios: `tipo`, `categoria`, `descricao`, `valor`. `valor` deve ser maior que zero.

| Erro | Motivo |
|------|--------|
| 400 | Campo obrigatório ausente ou `valor` ≤ 0 |
| 403 | `RECEPCIONISTA` tentando criar `tipo = "DESPESA"` |

#### Atualizar

```http
PUT /transacoes/:id
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR` — só funciona enquanto o status é `PENDENTE` ou `VENCIDO`. Transações já `RECEBIDO`/`PAGO`/`CANCELADO` retornam `400`. `RECEPCIONISTA` recebe `403` ao tentar editar uma `DESPESA`.

#### Alterar status (dar baixa)

```http
PATCH /transacoes/:id/status
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

```json
{ "status": "RECEBIDO" }
```

Valores: `PENDENTE`, `RECEBIDO`, `PAGO`, `VENCIDO`, `CANCELADO`. Marcar como `RECEBIDO` ou `PAGO` preenche `dataPagamento` automaticamente. Transações já finalizadas (`PAGO`, `RECEBIDO` ou `CANCELADO`) não podem ter o status alterado de novo.

#### Cancelar

```http
DELETE /transacoes/:id
```

🔒 🔑 `GESTOR` — retorna `204`. Define `status = CANCELADO` (soft delete, segue o padrão do resto da API).

#### Histórico financeiro do paciente

```http
GET /pacientes/:id/financeiro
```

🔒 🔑 `RECEPCIONISTA`, `GESTOR`

#### Dashboard financeiro

```http
GET /financeiro/dashboard?dataInicio=2026-01-01&dataFim=2026-12-31
```

🔒 🔑 `GESTOR`

```json
{
  "periodo": { "dataInicio": "...", "dataFim": "..." },
  "resumo": {
    "totalReceitas": 18500.00,
    "totalDespesas": 6200.00,
    "saldo": 12300.00,
    "quantidadeReceitas": 124,
    "quantidadeDespesas": 18
  },
  "porCategoria": [
    { "categoria": "Consulta", "tipo": "RECEITA", "total": 15200.00 }
  ]
}
```

Quando `dataInicio`/`dataFim` não são informados, o período padrão é dos últimos 6 meses até hoje, igual aos Indicadores.

---
### Indicadores

Agregações para os dashboards. Todas as rotas aceitam `dataInicio` e `dataFim` (`YYYY-MM-DD`); quando omitidos, o período padrão é dos últimos 6 meses até hoje.

#### Painel geral da clínica

```http
GET /indicadores?dataInicio=2026-01-01&dataFim=2026-12-31
```

🔒 🔑 `GESTOR`

```json
{
  "periodo": { "dataInicio": "...", "dataFim": "..." },
  "contadores": {
    "criancasCadastradas": 156,
    "profissionaisAtivos": 18,
    "objetivosAtivos": 842,
    "objetivosAlcancados": 324,
    "objetivosEmEvolucao": 472,
    "faltasRegistradas": 18
  },
  "criancasPorEspecialidade": [
    { "especialidadeId": "uuid", "nome": "Psicologia", "cor": "#6C3FC5", "total": 82 }
  ],
  "criancasPorProfissional": [
    { "profissionalId": "uuid", "nome": "Dra. Juliana", "foto": null, "total": 32 }
  ],
  "comparecimento": {
    "comparecimentos": 582,
    "faltas": 18,
    "agendados": 25,
    "emAtendimento": 3,
    "total": 628,
    "taxaComparecimento": 91
  },
  "resumoObjetivos": {
    "total": 842,
    "porStatus": [
      { "status": "ALCANCADO", "total": 324, "percentual": 38 }
    ]
  },
  "evolucaoPorEspecialidade": [
    { "categoria": "comunicacao", "mediaEvolucao": 75, "totalObjetivos": 224 }
  ],
  "evolucaoPorPeriodo": [
    { "mes": "2026-01", "sessoes": 98, "mediaDesempenho": 42 }
  ]
}
```

#### Indicadores de objetivos

```http
GET /indicadores/objetivos
```

🔒 🔑 `GESTOR` — total e distribuição por status com percentuais.

#### Indicadores de frequência

```http
GET /indicadores/frequencia?dataInicio=2026-01-01&dataFim=2026-12-31
```

🔒 🔑 `GESTOR` — comparecimentos, faltas e taxa de comparecimento.

#### Alertas de gestão

```http
GET /indicadores/alertas
```

🔒 🔑 `GESTOR`

```json
{
  "criancasSemAtendimento": {
    "total": 12,
    "detalhes": [
      { "id": "uuid", "nome": "João Miguel", "ultimoAtendimento": "2026-06-20T..." }
    ]
  },
  "objetivosDesatualizados": { "total": 28 },
  "profissionaisOciosos": {
    "total": 4,
    "detalhes": [
      { "id": "uuid", "nome": "Dr. Rafael", "agendamentosProximos": 2 }
    ]
  }
}
```

Regras dos alertas:

| Alerta | Critério |
|--------|----------|
| Crianças sem atendimento | Último atendimento concluído há mais de 15 dias |
| Objetivos desatualizados | `atualizadoEm` há mais de 30 dias, com status em andamento |
| Profissionais ociosos | Menos de 5 agendamentos nos próximos 7 dias |

#### Indicadores de um paciente

```http
GET /pacientes/:id/indicadores?dataInicio=2026-01-01&dataFim=2026-12-31
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

Alimenta a tela de Gráficos do paciente:

```json
{
  "evolucaoGeral": 72,
  "desempenhoPorCategoria": [
    { "categoria": "comunicacao", "media": 75, "totalObjetivos": 5 }
  ],
  "objetivos": {
    "total": 12,
    "porStatus": { "EM_ANDAMENTO": 7, "ALCANCADO": 3 },
    "lista": [...]
  },
  "frequencia": {
    "totalSessoes": 20,
    "concluidos": 18,
    "cancelados": 2,
    "taxaComparecimento": 90
  },
  "evolucoes": {
    "total": 18,
    "historico": [
      { "id": "uuid", "data": "...", "resultadoGeral": "dentro_esperado", "objetivosTrabalhados": 5 }
    ]
  }
}
```

---

### Relatórios

A API retorna os **dados** em JSON — a renderização e exportação para PDF/Excel ficam a cargo do frontend.

#### Tipos disponíveis

```http
GET /relatorios/tipos
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

| Tipo | Descrição | Requer paciente |
|------|-----------|-----------------|
| `individual` | Perfil completo da criança | Sim |
| `por_especialidade` | Panorama por especialidade | Não |
| `por_profissional` | Desempenho dos profissionais | Não |
| `objetivos` | Acompanhamento de objetivos | Não |
| `evolucao_clinica` | Evolução ao longo do tempo | Não |
| `frequencia` | Presenças, faltas e cancelamentos | Não |

#### Gerar relatório

```http
POST /relatorios/gerar
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

```json
{
  "tipo": "individual",
  "pacienteId": "uuid",
  "dataInicio": "2026-01-01",
  "dataFim": "2026-12-31"
}
```

Filtros aceitos por tipo:

| Tipo | Filtros opcionais |
|------|-------------------|
| `individual` | — (`pacienteId` obrigatório) |
| `por_especialidade` | `especialidadeId` |
| `por_profissional` | `profissionalId` |
| `objetivos` | `pacienteId`, `profissionalId`, `categoria`, `status` |
| `evolucao_clinica` | `pacienteId`, `especialidade` |
| `frequencia` | `pacienteId`, `profissionalId` |

Resposta:

```json
{
  "tipo": "individual",
  "periodo": { "dataInicio": "...", "dataFim": "..." },
  "dados": { ... }
}
```

#### Registrar exportação

```http
POST /relatorios
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

Grava no histórico que um relatório foi exportado. Chamado pelo frontend quando o usuário baixa o PDF ou Excel.

```json
{
  "profissionalId": "uuid",
  "pacienteId": "uuid",
  "tipo": "individual",
  "formato": "PDF",
  "dataInicio": "2026-01-01",
  "dataFim": "2026-12-31"
}
```

#### Histórico

```http
GET /relatorios?tipo=individual&profissionalId=uuid&pacienteId=uuid
```

🔒 🔑 `PROFISSIONAL`, `GESTOR`

#### Remover do histórico

```http
DELETE /relatorios/:id
```

🔒 🔑 `GESTOR` — retorna `204`.

---

### Notificações

Notificações são sempre do usuário autenticado — o `usuarioId` vem do token.

#### Listar

```http
GET /notificacoes?lida=false&tipo=novo_agendamento
```

🔒

```json
{
  "notificacoes": [...],
  "totalNaoLidas": 3
}
```

#### Criar

```http
POST /notificacoes
```

🔒

```json
{
  "usuarioId": "uuid",
  "tipo": "novo_agendamento",
  "texto": "Novo agendamento criado para João Miguel amanhã às 09:00"
}
```

Tipos aceitos: `lembrete_consulta`, `confirmacao_consulta`, `faltas_ausencias`, `novos_objetivos`, `relatorios_prontos`, `novo_agendamento`, `pagamento_recebido`, `encaminhamento`, `geral`.

#### Marcar como lida

```http
PATCH /notificacoes/:id/lida
```

🔒 Só o dono da notificação — outros retornam `403`.

#### Marcar todas como lidas

```http
PATCH /notificacoes/todas/lidas
```

🔒 Retorna `204`.

#### Remover

```http
DELETE /notificacoes/:id
```

🔒 Só o dono. Retorna `204`.

#### Remover todas

```http
DELETE /notificacoes
```

🔒 Retorna `204`.

---

### Mensagens

Comunicação interna da clínica. O remetente vem do token.

```http
GET    /mensagens             🔒
GET    /mensagens/:id         🔒
POST   /mensagens             🔒
PATCH  /mensagens/:id/lida    🔒
DELETE /mensagens/:id         🔒
```

Criação:

```json
{ "texto": "Reunião de alinhamento hoje às 14h na sala 1." }
```

Limite de 1000 caracteres. Só o remetente pode marcar como lida ou remover.

> ⚠️ Ver [Débitos técnicos](#débitos-técnicos) — o modelo atual não tem destinatário.

---

### Configurações

#### Dados da clínica

```http
GET /clinica
```

🔒 Todos os papéis podem ler.

```http
POST /clinica
```

🔒 🔑 `GESTOR`

```json
{
  "nome": "Clínica Integrada Entre Afetos",
  "cnpj": "35.123.456/0001-00",
  "email": "contato@entreafetos.com.br",
  "telefone": "(83) 98765-4321",
  "endereco": "Rua das Flores, 123",
  "cidade": "Guarabira",
  "estado": "PB",
  "cep": "58200-000"
}
```

Obrigatórios: `nome`, `cnpj`, `email`. O sistema é single-tenant — só existe uma clínica. Tentar criar uma segunda retorna `409`.

```http
PUT /clinica
```

🔒 🔑 `GESTOR`

#### Configurações gerais

```http
PUT /clinica/configuracoes
```

🔒 🔑 `GESTOR`

```json
{
  "ativarLembretes": true,
  "permitirReagendamento": true,
  "exigirJustificativaFaltas": true,
  "bloquearProntuario": false,
  "exibirFinanceiroParaProfissional": false
}
```

#### Configurações de notificação

```http
GET /clinica/notificacoes-config
PUT /clinica/notificacoes-config
```

🔒 🔑 `GESTOR`

```json
{
  "tipo": "lembrete_consulta",
  "canais": ["email", "whatsapp", "app"]
}
```

Tipos: `lembrete_consulta`, `confirmacao_consulta`, `faltas_ausencias`, `novos_objetivos`, `relatorios_prontos`.
Canais: `email`, `whatsapp`, `app`.

O `PUT` faz upsert — cria se não existir, atualiza se já existir.

#### Modelos de evolução

Templates customizáveis por especialidade.

```http
GET    /modelos-evolucao?especialidade=Psicologia   🔒
GET    /modelos-evolucao/:id                        🔒
POST   /modelos-evolucao                            🔒 🔑 GESTOR
PUT    /modelos-evolucao/:id                        🔒 🔑 GESTOR
DELETE /modelos-evolucao/:id                        🔒 🔑 GESTOR
```

```json
{
  "nome": "Modelo Padrão - Psicologia",
  "especialidade": "Psicologia",
  "campos": {
    "secoes": [
      { "titulo": "Comportamento observado", "tipo": "texto" },
      { "titulo": "Interação social", "tipo": "escala", "min": 1, "max": 5 },
      { "titulo": "Estratégias", "tipo": "multiselect", "opcoes": ["ABA", "TEACCH"] }
    ]
  }
}
```

O campo `campos` é JSON livre — o frontend interpreta a estrutura para renderizar o formulário.

---

## Códigos de resposta

| Código | Uso |
|--------|-----|
| 200 | Sucesso com corpo |
| 201 | Recurso criado |
| 204 | Sucesso sem corpo (deletes e ações em lote) |
| 400 | Dados inválidos, ausentes ou regra de negócio violada |
| 401 | Token ausente, inválido ou expirado |
| 403 | Papel sem permissão para o recurso |
| 404 | Recurso não encontrado |
| 409 | Conflito — duplicidade ou horário ocupado |
| 500 | Erro interno |

---

## Status dos módulos

| Módulo | Rotas | Status |
|--------|-------|--------|
| Autenticação | 3 | ✅ |
| Usuários | 4 | ✅ |
| Pacientes | 5 | ✅ |
| Profissionais | 6 | ✅ |
| Especialidades | 6 | ✅ |
| Serviços | 5 | ✅ |
| Convênios | 5 | ✅ |
| Salas | 5 | ✅ |
| Agendamentos | 7 | ✅ |
| Plano Terapêutico | 6 | ✅ |
| Objetivos | 7 | ✅ |
| Evoluções | 6 | ✅ |
| Encaminhamentos | 5 | ✅ |
| Indicadores | 5 | ✅ |
| Relatórios | 5 | ✅ |
| Notificações | 6 | ✅ |
| Mensagens | 5 | ✅ |
| Configurações | 10 | ✅ |
| Financeiro | 8 | ✅ |

Total: **18 módulos**, **~108 rotas**.

---

## Débitos técnicos

Pontos conhecidos a resolver conforme o projeto evolui:

**Mensagens sem destinatário**
O model `Mensagem` só tem `remetenteId`. O campo `lida` não faz sentido sem alguém que receba. Refatorar para incluir `destinatarioId` e transformar em chat interno de fato, ou considerar integração com WhatsApp para comunicação com responsáveis.

**Upload de anexos**
O model `Anexo` existe e as evoluções já retornam o array, mas não há rota de upload implementada. Falta definir o storage (S3 ou similar) e criar `POST /evolucoes/:id/anexos`.

**Portal do responsável**
As telas mapeadas não incluem login para pais/responsáveis. Se for necessário, exige um quarto papel e revisão do RBAC.

**Paginação inconsistente**
Pacientes e Agendamentos paginam; Profissionais, Objetivos, Evoluções e Encaminhamentos retornam listas completas. Padronizar conforme o volume de dados crescer.

**Refresh token**
O JWT expira em 7 dias sem mecanismo de renovação. Implementar refresh token para sessões mais longas sem comprometer segurança.

---

## Licença

Projeto proprietário — AC Software © 2026