# ✅ Checklist de Deploy no Coolify

## Antes do Primeiro Deploy

### 1️⃣ Configurar Volume Persistente

No painel do Coolify:

1. Acesse seu projeto
2. Vá em **Storages** ou **Volumes**
3. Clique em **Add Volume**
4. Configure:
   - **Name**: `toil-uploads`
   - **Source**: `/var/lib/docker/volumes/toil-uploads/_data`
   - **Destination**: `/app/public/uploads`
   - **Type**: Volume
5. Salve

### 2️⃣ Configurar Variáveis de Ambiente

No Coolify, adicione estas variáveis:

```env
NODE_ENV=production
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=seu-secret-super-seguro-aqui
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM=seu-email@gmail.com
```

### 3️⃣ Configurar Build Command

Se o Coolify pedir:

**Build Command:**
```bash
npm install && npm run build && npx prisma generate
```

**Start Command:**
```bash
npm run start
```

---

## Após Cada Deploy

### ✅ Verificar Uploads

1. Acesse o admin
2. Faça upload de uma imagem de teste
3. Anote a URL
4. Faça um novo deploy
5. Verifique se a imagem ainda está acessível

### ✅ Verificar Banco de Dados

1. Verifique se as migrations foram aplicadas
2. Teste login no admin
3. Verifique se os dados estão intactos

---

## 🔧 Comandos Úteis

### SSH no Servidor

```bash
ssh seu-usuario@seu-servidor
```

### Verificar Volumes Docker

```bash
docker volume ls
docker volume inspect toil-uploads
```

### Ver Logs do Container

```bash
docker logs -f toil-projetos-app
```

### Acessar Container

```bash
docker exec -it toil-projetos-app sh
```

### Verificar Uploads no Container

```bash
docker exec -it toil-projetos-app ls -la /app/public/uploads
```

---

## 🚨 Troubleshooting

### Imagens Sumindo Após Deploy

**Causa**: Volume não configurado corretamente

**Solução**:
1. Verifique se o volume está montado: `docker inspect toil-projetos-app`
2. Procure por "Mounts" na saída
3. Deve aparecer `/app/public/uploads`

### Erro de Permissão ao Fazer Upload

**Causa**: Pasta sem permissão de escrita

**Solução**:
```bash
# SSH no servidor
docker exec -it toil-projetos-app chmod -R 777 /app/public/uploads
```

### Banco de Dados Não Conecta

**Causa**: DATABASE_URL incorreta

**Solução**:
1. Verifique a variável de ambiente no Coolify
2. Formato correto: `mysql://usuario:senha@host:porta/database`

---

## 📦 Estrutura de Pastas Persistentes

Após configurar o volume:

```
/app/public/uploads/
├── 7c12d41d-6733-41d9-9988-2f315f913b3b-1773847315356-178572720.jpg
├── capa_acrilicos-1773856249853-545935963.png
├── capa_cv1-1773856256617-938260612.png
├── helpchats-1773847140475-872540629.png
└── ... (todas as imagens persistem)
```

---

## 🎯 Resultado Esperado

Após configurar corretamente:

- ✅ Uploads persistem entre deploys
- ✅ Banco de dados mantém os dados
- ✅ Aplicação reinicia automaticamente
- ✅ Logs acessíveis no Coolify
- ✅ SSL configurado automaticamente

Tudo funcionando perfeitamente! 🚀
