# 🚀 Configurar Uploads Persistentes no Coolify

## Problema
Quando você faz deploy no Coolify, o container é recriado e todas as imagens em `/public/uploads` são perdidas.

## Solução: Volume Persistente

### 1️⃣ Acessar Coolify

1. Acesse seu projeto no Coolify
2. Vá em **Storages** (ou **Volumes**)

### 2️⃣ Criar Volume Persistente

Adicione um novo volume com estas configurações:

**Nome do Volume:**
```
toil-uploads
```

**Source (Caminho no Host):**
```
/var/lib/docker/volumes/toil-uploads/_data
```

**Destination (Caminho no Container):**
```
/app/public/uploads
```

**Tipo:**
- Volume

### 3️⃣ Configuração Alternativa (Bind Mount)

Se preferir usar Bind Mount:

**Source:**
```
/home/coolify/toil-projetos/uploads
```

**Destination:**
```
/app/public/uploads
```

### 4️⃣ Criar Diretório no Servidor (se usar Bind Mount)

SSH no servidor e execute:

```bash
mkdir -p /home/coolify/toil-projetos/uploads
chmod 777 /home/coolify/toil-projetos/uploads
```

### 5️⃣ Fazer Deploy

Após configurar o volume, faça o deploy. As imagens agora serão persistentes!

---

## 📁 Estrutura de Pastas Persistentes

Com o volume configurado, estas pastas serão mantidas:

```
/app/public/uploads/
├── banners/          # Imagens do carrossel home
├── portfolio/        # Imagens de projetos
├── services/         # Imagens de serviços
├── segments/         # Imagens de segmentos SEO
└── [arquivos]        # Uploads gerais
```

---

## ✅ Verificar se Funcionou

1. Faça upload de uma imagem de teste
2. Anote a URL da imagem
3. Faça um novo deploy
4. Acesse a URL da imagem novamente
5. Se a imagem ainda estiver lá, está funcionando! ✅

---

## 🔧 Troubleshooting

### Permissões Negadas

Se der erro de permissão ao fazer upload:

```bash
# SSH no servidor
ssh seu-servidor

# Dar permissão total na pasta
chmod -R 777 /var/lib/docker/volumes/toil-uploads/_data
```

### Volume não Aparece

Se o volume não aparecer no Coolify:

1. Vá em **Settings** do projeto
2. Procure por **Persistent Storage** ou **Volumes**
3. Adicione manualmente:
   - **Source**: `/var/lib/docker/volumes/toil-uploads/_data`
   - **Destination**: `/app/public/uploads`

---

## 📝 Configuração via docker-compose.yml (Alternativa)

Se o Coolify usar docker-compose, adicione:

```yaml
services:
  app:
    volumes:
      - toil-uploads:/app/public/uploads

volumes:
  toil-uploads:
    driver: local
```

---

## 🎯 Resultado Final

Após configurar:

- ✅ Imagens de **Serviços** persistem
- ✅ Imagens de **Segmentos SEO** persistem
- ✅ Imagens de **Portfólio** persistem
- ✅ Imagens do **Carrossel Home** persistem
- ✅ Imagens de **Clientes** persistem
- ✅ **Galeria de imagens** dos segmentos persiste

Todos os uploads ficam salvos mesmo após redeploy! 🎉
