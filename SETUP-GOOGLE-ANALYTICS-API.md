# Como Configurar Google Analytics Data API

Este guia explica como configurar a API do Google Analytics para mostrar dados reais no dashboard.

## ⚠️ Importante

O Google Analytics está funcionando e rastreando visitantes! Você pode ver os dados em tempo real em:
https://analytics.google.com → Relatórios → Tempo real

Porém, para mostrar esses dados no dashboard do admin, precisamos configurar a **Google Analytics Data API**.

## 📋 Passo a Passo

### 1. Criar Service Account no Google Cloud

1. Acesse https://console.cloud.google.com
2. Crie um projeto ou selecione um existente
3. No menu lateral, vá em **APIs & Services → Library**
4. Procure por "Google Analytics Data API"
5. Clique em **Enable** (Ativar)
6. Vá em **APIs & Services → Credentials**
7. Clique em **Create Credentials → Service Account**
8. Preencha:
   - **Service account name**: `analytics-reader`
   - **Service account ID**: (gerado automaticamente)
   - **Description**: `Leitura de dados do Google Analytics`
9. Clique em **Create and Continue**
10. Pule as permissões opcionais (clique em **Continue**)
11. Clique em **Done**

### 2. Criar chave JSON

1. Na lista de Service Accounts, clique no que você acabou de criar
2. Vá na aba **Keys**
3. Clique em **Add Key → Create new key**
4. Escolha **JSON**
5. Clique em **Create**
6. Um arquivo JSON será baixado automaticamente
7. **Guarde esse arquivo em segurança!**

### 3. Dar acesso ao Service Account no GA4

1. Copie o email do Service Account (algo como `analytics-reader@seu-projeto.iam.gserviceaccount.com`)
2. Acesse https://analytics.google.com
3. Vá em **Admin** (canto inferior esquerdo)
4. Na coluna **Propriedade**, clique em **Acesso à propriedade**
5. Clique no botão **+** (Adicionar usuários)
6. Cole o email do Service Account
7. Selecione a função: **Visualizador**
8. Desmarque "Notificar este usuário por e-mail"
9. Clique em **Adicionar**

### 4. Obter o Property ID

1. No Google Analytics, vá em **Admin**
2. Na coluna **Propriedade**, clique em **Detalhes da propriedade**
3. Copie o **ID da propriedade** (um número como `123456789`)

### 5. Configurar no Admin

1. Acesse o admin do site: https://toilprojetos.com.br/admin
2. Vá em **Configurações → Google**
3. Na seção **Google Analytics 4 (GA4)**:
   - **Ativar Analytics**: Ativado
   - **Measurement ID**: G-1Q0L6CPZJD (já configurado)
   - **Property ID**: Cole o número que você copiou (ex: 123456789)
4. Clique em **Salvar Integrações Google**

### 6. Adicionar credenciais no Coolify (IMPORTANTE!)

1. Abra o arquivo JSON que você baixou no Passo 2
2. Copie **TODO** o conteúdo do arquivo (é um JSON grande)
3. Acesse o Coolify: https://coolify.integrasac.com.br
4. Vá no projeto **toilprojetos**
5. Clique em **Environment Variables**
6. Clique em **+ Add**
7. Preencha:
   - **Key**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value**: Cole o conteúdo completo do arquivo JSON
8. Clique em **Save**
9. **Reinicie a aplicação** (Deploy → Restart)

**Exemplo do conteúdo que você deve colar:**
```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123456",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "analytics-reader@seu-projeto.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

⚠️ **IMPORTANTE**: Cole o JSON completo, incluindo as chaves `{` e `}` no início e fim!

## ✅ Testar

Depois de configurar:

1. Acesse o dashboard: https://toilprojetos.com.br/admin
2. Os cards de visitantes devem mostrar dados reais
3. Se não aparecer, verifique os logs do servidor

## 🔍 Troubleshooting

### Erro: "Permission denied"
- Verifique se o Service Account tem acesso à propriedade do GA4
- Aguarde alguns minutos após adicionar o acesso

### Erro: "Property not found"
- Verifique se o Property ID está correto
- Deve ser apenas o número, sem prefixos

### Dados não aparecem
- Verifique se há visitantes no GA4 (Tempo real)
- Aguarde alguns minutos para os dados serem processados
- Verifique os logs do servidor para erros

## 📚 Documentação

- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Autenticação](https://cloud.google.com/docs/authentication/getting-started)
