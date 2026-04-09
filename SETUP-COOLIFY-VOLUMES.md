# Configuração de Volumes Persistentes no Coolify

## Problema
As imagens enviadas para `/public/uploads` são perdidas a cada deploy porque o container Docker é recriado.

## Solução
Configurar um volume persistente no Coolify para manter os arquivos entre deploys.

## Passos para Configurar

### 1. Acesse o Painel do Coolify
- URL: https://coolify.integrasac.com.br
- Faça login

### 2. Navegue até a Aplicação
- Vá em "Applications"
- Selecione "toilprojetos" (mushy-meerkat-jos0s00gwc8sggogcooc4c8w)

### 3. Configure o Volume Persistente
- Clique na aba "Storages" ou "Volumes"
- Clique em "Add Volume" ou "Add Storage"
- Preencha:
  - **Name**: `uploads-volume`
  - **Source (Host Path)**: `/data/toilprojetos/uploads`
  - **Destination (Container Path)**: `![alt text](image.png)`
  - **Mount Type**: `bind` ou `volume`
  - Marque como **Persistent**

### 4. Salve e Faça Redeploy
- Salve a configuração
- Faça um novo deploy da aplicação

## Verificação
Após configurar, as imagens em `/public/uploads` serão mantidas entre deploys.

## Alternativa: Usar Serviço de Storage Externo
Para maior confiabilidade, considere usar:
- AWS S3
- Cloudflare R2
- DigitalOcean Spaces
- Backblaze B2

Isso garante que as imagens fiquem em um serviço dedicado e não dependam do servidor.
