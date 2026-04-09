# Setup do Banco de Dados Local (Docker Desktop)

Guia para configurar o ambiente de banco de dados MySQL local usando Docker Desktop.
Este projeto já está clonado/disponível na máquina. O objetivo é apenas subir o banco local.

---

## Pré-requisitos

- Docker Desktop instalado e rodando
- Node.js instalado (v18+)
- O projeto `remix-of-toil-projetos` já disponível na máquina

---

## Passo 1 — Subir os containers (MySQL + phpMyAdmin)

Na raiz do projeto, executar:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Isso cria 2 containers:

| Container | Imagem | Porta | Descrição |
|-----------|--------|-------|-----------|
| `toil-projetos-mysql` | `mysql:8` | `3306` | Banco de dados MySQL |
| `toil-projetos-phpmyadmin` | `phpmyadmin:latest` | `8080` | Interface web do banco |

Credenciais do MySQL local:
- **Host:** `localhost`
- **Porta:** `3306`
- **Database:** `toil_projetos`
- **Usuário:** `toil`
- **Senha:** `toil123`
- **Root password:** `root123`

---

## Passo 2 — Criar o arquivo `.env`

Copiar o arquivo de exemplo:

```bash
cp .env.example .env
```

O conteúdo do `.env` deve ser:

```env
DATABASE_URL=mysql://toil:toil123@localhost:3306/toil_projetos
JWT_SECRET=dev-secret-key-local
PORT=3001
```

---

## Passo 3 — Instalar dependências (se ainda não fez)

```bash
npm install
```

---

## Passo 4 — Gerar o Prisma Client

```bash
npx prisma generate
```

---

## Passo 5 — Dar permissão total ao usuário MySQL

O Prisma precisa criar um "shadow database" para migrations. Executar:

```bash
docker exec toil-projetos-mysql mysql -u root -proot123 -e "GRANT ALL PRIVILEGES ON *.* TO 'toil'@'%'; FLUSH PRIVILEGES;"
```

---

## Passo 6 — Rodar as migrations

```bash
npx prisma migrate dev
```

Isso cria todas as tabelas no banco:
- `users` — Usuários admin
- `clients` — Clientes
- `services` — Serviços
- `portfolios` — Projetos do portfólio
- `leads` — Contatos/orçamentos
- `segments` — Segmentos de mercado
- `banners` — Banners da home
- `settings` — Configurações do site

---

## Passo 7 — Popular o banco com dados iniciais (seed)

```bash
npx prisma db seed
```

Isso cria:
- 1 usuário admin (`admin@toilprojetos.com.br` / senha: `admin123`)
- 8 segmentos (Varejo, Shopping, Corporativo, etc.)
- 6 serviços
- 8 projetos de portfólio
- 8 configurações do site

---

## Passo 7B (alternativo) — Importar um SQL existente

Se você já tem um dump `.sql` do banco da máquina anterior, ao invés de rodar o seed, importe o SQL:

```bash
docker exec -i toil-projetos-mysql mysql -u toil -ptoil123 toil_projetos < caminho/do/arquivo.sql
```

---

## Verificação

### phpMyAdmin
Abrir no navegador: **http://localhost:8080**
(Entra direto, sem pedir login)

### API Health Check
Iniciar o servidor:
```bash
npm run dev:server
```
Acessar: **http://localhost:3001/api/health**
Resposta esperada: `{"status":"ok","db":"connected"}`

---

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `docker compose -f docker-compose.dev.yml up -d` | Sobe MySQL + phpMyAdmin |
| `docker compose -f docker-compose.dev.yml down` | Para os containers |
| `docker compose -f docker-compose.dev.yml down -v` | Para e apaga os dados do banco |
| `npm run dev:server` | Inicia a API na porta 3001 |
| `npm run dev` | Inicia o frontend Vite |
| `npx prisma studio` | Abre interface visual do banco |
| `npx prisma migrate dev` | Aplica migrations pendentes |
| `npx prisma db seed` | Roda o seed (dados iniciais) |

---

## Exportar banco da máquina atual (para transferir)

Para gerar um dump SQL do banco atual:

```bash
docker exec toil-projetos-mysql mysqldump -u toil -ptoil123 toil_projetos > backup-toil-projetos.sql
```

Esse arquivo `backup-toil-projetos.sql` pode ser importado na outra máquina usando o Passo 7B.
