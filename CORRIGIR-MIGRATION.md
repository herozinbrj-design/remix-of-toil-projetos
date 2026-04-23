# 🔧 Corrigir Migration com Erro

## Execute estes comandos:

### 1️⃣ Marcar migration como resolvida
```bash
npx prisma migrate resolve --rolled-back 20260423000003_separate_seo_segments
```

### 2️⃣ Aplicar migrations novamente
```bash
npx prisma migrate deploy
```

### 3️⃣ Se ainda der erro, use db push
```bash
npx prisma db push --accept-data-loss
```

### 4️⃣ Regenerar Prisma Client
```bash
npx prisma generate
```

### 5️⃣ Reiniciar servidor
```bash
npm run dev
```

---

## ⚠️ Se a tabela segments já tiver os campos, pode dar erro

Nesse caso, execute manualmente no MySQL:

```sql
-- Verificar se os campos existem
DESCRIBE segments;

-- Se existirem, remover manualmente:
ALTER TABLE segments DROP COLUMN slug;
ALTER TABLE segments DROP COLUMN subtitle;
ALTER TABLE segments DROP COLUMN image;
ALTER TABLE segments DROP COLUMN gallery;
```

Depois execute os passos acima novamente.
