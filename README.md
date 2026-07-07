# Entre Afetos API

API REST da plataforma **Clínica Integrada Entre Afetos** — sistema de gestão clínica multidisciplinar voltado ao acompanhamento terapêutico de crianças.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 18+ |
| Framework | Fastify |
| Linguagem | TypeScript |
| ORM | Prisma |
| Banco | PostgreSQL 16 |
| Autenticação | JWT (fastify/jwt) |
| Container | Docker |

---

## Arquitetura

```
src/
  routes/          → define endpoints e RBAC (preHandler)
  controllers/     → valida requisição e formata resposta
  services/        → regras de negócio
  repositories/    → acesso ao banco via Prisma
  middlewares/     → autenticação e autorização
  lib/             → cliente Prisma singleton
  types/           → tipos globais TypeScript
```

---

## Papéis (RBAC)

| Papel | Descrição |
|-------|-----------|
| `GESTOR` | Acesso total à plataforma |
| `RECEPCIONISTA` | Gerencia agendamentos e pacientes |
| `PROFISSIONAL` | Acessa seus pacientes, evoluções e objetivos |

---

## Configuração

### Pré-requisitos

- Node.js 18+
- Docker

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/entre-afetos-api.git
cd entre-afetos-api

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### Variáveis de ambiente

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/entre_afetos"
JWT_SECRET="entre-afetos-secret-2026"
PORT=3333
```

### Subir banco de dados

```bash
docker compose up -d
```

### Rodar migrations

```bash
npx prisma migrate dev
```

### Iniciar servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

---

## Endpoints

Base URL: `http://localhost:3333`

> 🔒 Rotas marcadas com **[AUTH]** exigem Bearer Token no header Authorization.
> 🔑 Rotas marcadas com **[PAPEL]** exigem papel específico além da autenticação.

---

### Health Check

```
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "projeto": "Entre Afetos API"
}
```

---

## Autenticação `/auth`

### Registrar usuário

```
POST /auth/registro
```

**Body:**
```json
{
  "nome": "Mariana Silva",
  "email": "mariana@entreafetos.com",
  "senha": "123456",
  "papel": "GESTOR"
}
```

> `papel` aceita: `GESTOR`, `RECEPCIONISTA`, `PROFISSIONAL` (case insensitive)

**Resposta 201:**
```json
{
  "usuario": {
    "id": "uuid",
    "nome": "Mariana Silva",
    "email": "mariana@entreafetos.com",
    "papel": "GESTOR",
    "criadoEm": "2026-06-25T13:02:20.489Z"
  },
  "token": "eyJhbGci..."
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 400 | Campos obrigatórios ausentes ou papel inválido |
| 409 | E-mail já cadastrado |

---

### Login

```
POST /auth/login
```

**Body:**
```json
{
  "email": "mariana@entreafetos.com",
  "senha": "123456"
}
```

**Resposta 200:**
```json
{
  "usuario": {
    "id": "uuid",
    "nome": "Mariana Silva",
    "email": "mariana@entreafetos.com",
    "papel": "GESTOR",
    "foto": null
  },
  "token": "eyJhbGci..."
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 400 | Campos obrigatórios ausentes |
| 401 | E-mail ou senha incorretos |
| 403 | Usuário inativo |

---

### Perfil do usuário logado

```
GET /auth/me
```

🔒 **[AUTH]**

**Resposta 200:**
```json
{
  "usuario": {
    "id": "uuid",
    "nome": "Mariana Silva",
    "email": "mariana@entreafetos.com",
    "papel": "GESTOR",
    "foto": null,
    "ativo": true,
    "criadoEm": "2026-06-25T13:02:20.489Z"
  }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 401 | Token ausente ou inválido |
| 404 | Usuário não encontrado |

---

## Pacientes `/pacientes`

### Listar pacientes

```
GET /pacientes
```

🔒 **[AUTH]** — Todos os papéis

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `busca` | string | Busca por nome, responsável ou telefone |
| `status` | string | Filtra por status (`ativo`, `inativo`) |
| `pagina` | number | Página atual (default: 1) |
| `porPagina` | number | Itens por página (default: 10) |

**Exemplo:**
```
GET /pacientes?busca=João&status=ativo&pagina=1&porPagina=10
```

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "João Miguel Silva",
      "dataNascimento": "2017-03-14T00:00:00.000Z",
      "sexo": "Masculino",
      "foto": null,
      "status": "ativo",
      "responsavel": "Juliana Lima Silva",
      "telefone": "(83) 98765-4321",
      "diagnostico": "TEA - Nível 1 de Suporte",
      "tags": ["TEA", "Nível 1"],
      "criadoEm": "2026-06-25T13:26:11.207Z"
    }
  ],
  "meta": {
    "total": 1,
    "pagina": 1,
    "porPagina": 10,
    "totalPaginas": 1
  }
}
```

---

### Buscar paciente por ID

```
GET /pacientes/:id
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "paciente": {
    "id": "uuid",
    "nome": "João Miguel Silva",
    "dataNascimento": "2017-03-14T00:00:00.000Z",
    "sexo": "Masculino",
    "foto": null,
    "status": "ativo",
    "responsavel": "Juliana Lima Silva",
    "telefone": "(83) 98765-4321",
    "diagnostico": "TEA - Nível 1 de Suporte",
    "tags": ["TEA", "Nível 1"],
    "criadoEm": "2026-06-25T13:26:11.207Z",
    "agendamentos": [...],
    "planos": [...]
  }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 404 | Paciente não encontrado |

---

### Criar paciente

```
POST /pacientes
```

🔒 **[AUTH]** 🔑 **[RECEPCIONISTA, GESTOR]**

**Body:**
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

**Campos obrigatórios:** `nome`, `dataNascimento`, `sexo`

**Resposta 201:**
```json
{
  "paciente": { ... }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 400 | Campos obrigatórios ausentes |
| 401 | Token ausente ou inválido |
| 403 | Papel sem permissão |

---

### Atualizar paciente

```
PUT /pacientes/:id
```

🔒 **[AUTH]** 🔑 **[RECEPCIONISTA, GESTOR]**

**Body:** (todos os campos são opcionais)
```json
{
  "nome": "João Miguel Silva",
  "telefone": "(83) 99999-0000",
  "diagnostico": "TEA - Nível 2 de Suporte"
}
```

**Resposta 200:**
```json
{
  "paciente": { ... }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 403 | Papel sem permissão |
| 404 | Paciente não encontrado |

---

### Inativar paciente

```
DELETE /pacientes/:id
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

> Não remove o registro — apenas altera o status para `inativo`.

**Resposta:** `204 No Content`

**Erros:**
| Status | Motivo |
|--------|--------|
| 403 | Papel sem permissão |
| 404 | Paciente não encontrado |

---

## Agendamentos `/agendamentos`

### Listar agendamentos

```
GET /agendamentos
```

🔒 **[AUTH]** — Todos os papéis

**Query params:**
| Param | Tipo | Descrição |
|-------|------|-----------|
| `data` | string | Filtra por dia no formato `YYYY-MM-DD` |
| `profissionalId` | string | Filtra por profissional |
| `pacienteId` | string | Filtra por paciente |
| `status` | string | Filtra por status |
| `pagina` | number | Página atual (default: 1) |
| `porPagina` | number | Itens por página (default: 10) |

**Exemplo:**
```
GET /agendamentos?data=2026-07-01&profissionalId=uuid
```

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "dataHora": "2026-07-01T09:00:00.000Z",
      "status": "AGENDADO",
      "observacoes": null,
      "rascunho": false,
      "paciente": {
        "id": "uuid",
        "nome": "João Miguel Silva",
        "foto": null,
        "diagnostico": "TEA - Nível 1",
        "tags": ["TEA"],
        "responsavel": "Juliana Lima Silva"
      },
      "profissional": {
        "id": "uuid",
        "usuario": { "nome": "Dra. Juliana Santos", "foto": null }
      },
      "servico": { "id": "uuid", "nome": "Consulta de acompanhamento", "duracaoMin": 50 },
      "especialidade": { "id": "uuid", "nome": "Psicologia", "cor": "#6C3FC5" },
      "convenio": { "id": "uuid", "nome": "Particular" },
      "sala": { "id": "uuid", "nome": "Sala 1" }
    }
  ],
  "meta": {
    "total": 1,
    "pagina": 1,
    "porPagina": 10,
    "totalPaginas": 1
  }
}
```

---

### Buscar agendamento por ID

```
GET /agendamentos/:id
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "agendamento": { ... }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 404 | Agendamento não encontrado |

---

### Criar agendamento

```
POST /agendamentos
```

🔒 **[AUTH]** 🔑 **[RECEPCIONISTA, GESTOR]**

**Body:**
```json
{
  "pacienteId": "uuid",
  "profissionalId": "uuid",
  "servicoId": "uuid",
  "especialidadeId": "uuid",
  "convenioId": "uuid",
  "salaId": "uuid",
  "dataHora": "2026-07-01T09:00:00",
  "observacoes": "Primeira consulta",
  "rascunho": false
}
```

**Campos obrigatórios:** `pacienteId`, `profissionalId`, `servicoId`, `dataHora`

> ⚠️ Verifica automaticamente conflito de horário do profissional.

**Resposta 201:**
```json
{
  "agendamento": { ... }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 400 | Campos obrigatórios ausentes |
| 404 | Serviço não encontrado |
| 409 | Conflito de horário do profissional |

---

### Atualizar agendamento

```
PUT /agendamentos/:id
```

🔒 **[AUTH]** 🔑 **[RECEPCIONISTA, GESTOR]**

**Body:** (todos os campos são opcionais)
```json
{
  "salaId": "uuid",
  "convenioId": "uuid",
  "observacoes": "Atualização de observação"
}
```

**Resposta 200:**
```json
{
  "agendamento": { ... }
}
```

---

### Alterar status do agendamento

```
PATCH /agendamentos/:id/status
```

🔒 **[AUTH]** — Todos os papéis

**Body:**
```json
{
  "status": "AGUARDANDO"
}
```

**Valores aceitos:**
| Status | Descrição |
|--------|-----------|
| `AGENDADO` | Agendamento confirmado |
| `AGUARDANDO` | Paciente chegou, aguardando atendimento |
| `EM_ATENDIMENTO` | Sessão em andamento |
| `CONCLUIDO` | Sessão finalizada |
| `CANCELADO` | Agendamento cancelado |

**Resposta 200:**
```json
{
  "agendamento": { ... }
}
```

**Erros:**
| Status | Motivo |
|--------|--------|
| 400 | Status inválido |
| 404 | Agendamento não encontrado |

---

### Cancelar agendamento

```
DELETE /agendamentos/:id
```

🔒 **[AUTH]** 🔑 **[RECEPCIONISTA, GESTOR]**

> Não remove o registro — altera o status para `CANCELADO`.

**Resposta:** `204 No Content`

**Erros:**
| Status | Motivo |
|--------|--------|
| 403 | Papel sem permissão |
| 404 | Agendamento não encontrado |

---

## Especialidades `/especialidades`

### Listar especialidades

```
GET /especialidades
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "Psicologia",
      "descricao": "Avaliação e acompanhamento psicológico",
      "cor": "#6C3FC5",
      "categoria": "saude_mental",
      "icone": null,
      "ativo": true
    }
  ]
}
```

---

### Criar especialidade

```
POST /especialidades
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:**
```json
{
  "nome": "Psicologia",
  "descricao": "Avaliação e acompanhamento psicológico",
  "cor": "#6C3FC5",
  "categoria": "saude_mental",
  "icone": "brain"
}
```

**Campos obrigatórios:** `nome`, `categoria`

**Resposta 201:**
```json
{
  "especialidade": { ... }
}
```

---

### Atualizar especialidade

```
PUT /especialidades/:id
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:** (todos os campos são opcionais)
```json
{
  "descricao": "Nova descrição",
  "cor": "#4B2A8A"
}
```

**Resposta 200:**
```json
{
  "especialidade": { ... }
}
```

---

### Ativar / Desativar especialidade

```
PATCH /especialidades/:id/status
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:**
```json
{
  "ativo": false
}
```

**Resposta 200:**
```json
{
  "especialidade": { ... }
}
```

---

## Serviços `/servicos`

### Listar serviços

```
GET /servicos
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "Consulta de acompanhamento",
      "duracaoMin": 50,
      "descricao": "Consulta voltada para acompanhamento terapêutico",
      "ativo": true
    }
  ]
}
```

---

### Criar serviço

```
POST /servicos
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:**
```json
{
  "nome": "Consulta de acompanhamento",
  "duracaoMin": 50,
  "descricao": "Consulta voltada para acompanhamento terapêutico"
}
```

**Campos obrigatórios:** `nome`, `duracaoMin`

**Resposta 201:**
```json
{
  "servico": { ... }
}
```

---

### Atualizar serviço

```
PUT /servicos/:id
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:** (todos os campos são opcionais)
```json
{
  "duracaoMin": 60
}
```

**Resposta 200:**
```json
{
  "servico": { ... }
}
```

---

## Convênios `/convenios`

### Listar convênios

```
GET /convenios
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "Particular",
      "ativo": true
    }
  ]
}
```

---

### Criar convênio

```
POST /convenios
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:**
```json
{
  "nome": "Particular"
}
```

**Resposta 201:**
```json
{
  "convenio": { ... }
}
```

---

## Salas `/salas`

### Listar salas

```
GET /salas
```

🔒 **[AUTH]** — Todos os papéis

**Resposta 200:**
```json
{
  "dados": [
    {
      "id": "uuid",
      "nome": "Sala 1",
      "descricao": "Sala de atendimento individual",
      "ativa": true
    }
  ]
}
```

---

### Criar sala

```
POST /salas
```

🔒 **[AUTH]** 🔑 **[GESTOR]**

**Body:**
```json
{
  "nome": "Sala 1",
  "descricao": "Sala de atendimento individual"
}
```

**Resposta 201:**
```json
{
  "sala": { ... }
}
```

---

## Códigos de resposta

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (sucesso sem retorno) |
| 400 | Dados inválidos ou ausentes |
| 401 | Não autenticado (token ausente ou inválido) |
| 403 | Sem permissão (papel insuficiente) |
| 404 | Recurso não encontrado |
| 409 | Conflito (e-mail duplicado, horário ocupado) |
| 500 | Erro interno do servidor |

---

## Módulos previstos (em desenvolvimento)

| Módulo | Status |
|--------|--------|
| Autenticação | ✅ Concluído |
| Pacientes | ✅ Concluído |
| Agendamentos | ✅ Concluído |
| Especialidades | ✅ Concluído |
| Serviços | ✅ Concluído |
| Convênios | ✅ Concluído |
| Salas | ✅ Concluído |
| Profissionais | 🔄 Em desenvolvimento |
| Plano Terapêutico | 🔜 Previsto |
| Objetivos | 🔜 Previsto |
| Evoluções | 🔜 Previsto |
| Encaminhamentos | 🔜 Previsto |
| Gráficos / Indicadores | 🔜 Previsto |
| Relatórios | 🔜 Previsto |
| Financeiro | 🔜 Previsto |
| Notificações | 🔜 Previsto |
| Mensagens | 🔜 Previsto |
| Configurações | 🔜 Previsto |

---

## Licença

Projeto proprietário — AC Software © 2026