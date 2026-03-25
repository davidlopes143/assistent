# Planner de Atividades

App web para gerenciamento de atividades por pessoa, com login individual.

## Funcionalidades

- Cadastro e login de usuários
- Cada usuário vê apenas suas próprias atividades
- Criar, editar, excluir e marcar atividades como concluídas
- Data de vencimento com destaque para atividades atrasadas
- Filtros: Todas, Pendentes, Atrasadas, Concluídas

## Tecnologias

**Backend:** Node.js, Express, SQLite (better-sqlite3), JWT, bcryptjs
**Frontend:** React, Vite, CSS Modules

## Como rodar

### Backend
```bash
cd backend
npm install
npm start
# Roda em http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Roda em http://localhost:3000
```

Acesse `http://localhost:3000` no navegador.
