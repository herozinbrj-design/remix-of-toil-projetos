# Configuração de E-mail (SMTP)

Este guia explica como configurar o envio de e-mails para notificações de leads/orçamentos através do painel administrativo.

---

## Configuração pelo Painel Admin

### 1. Acesse as Configurações

1. Faça login no painel admin: `/admin/login`
2. Vá em **Configurações** no menu lateral
3. Clique em **E-mail (SMTP)** na seção "INTEGRAÇÕES"

### 2. Preencha os Dados do Servidor SMTP

**Servidor SMTP:**
- **Host**: Endereço do servidor SMTP (ex: `smtp.gmail.com`)
- **Porta**: Porta do servidor (geralmente `587` para TLS ou `465` para SSL)
- **Criptografia**: Selecione TLS, SSL ou Nenhuma
- **Usuário**: Seu e-mail completo
- **Senha**: Senha do e-mail ou senha de app

**Remetente Padrão:**
- **Nome**: Nome que aparecerá como remetente (ex: "TOIL Projetos")
- **E-mail**: E-mail que aparecerá como remetente
- **Reply-To**: E-mail para onde as respostas serão enviadas (opcional)

### 3. Teste a Configuração

1. Clique no botão **"Enviar E-mail de Teste"**
2. O sistema salvará as configurações e enviará um e-mail de teste
3. Verifique sua caixa de entrada (e spam) para confirmar o recebimento

### 4. Salve as Configurações

Clique em **"Salvar SMTP"** para garantir que tudo está salvo.

---

## Configuração com Gmail

### Passo 1: Ativar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Ative a "Verificação em duas etapas"

### Passo 2: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione "E-mail" e "Outro (nome personalizado)"
3. Digite "Toil Projetos" e clique em "Gerar"
4. Copie a senha de 16 caracteres gerada

### Passo 3: Configurar no Painel

No painel admin, em **Configurações > E-mail (SMTP)**:

```
Host: smtp.gmail.com
Porta: 587
Criptografia: TLS
Usuário: seu-email@gmail.com
Senha: xxxx xxxx xxxx xxxx  (senha de app gerada)
Nome: TOIL Projetos
E-mail: seu-email@gmail.com
Reply-To: seu-email@gmail.com
```

---

## Outros Provedores de E-mail

### Outlook/Hotmail

```
Host: smtp-mail.outlook.com
Porta: 587
Criptografia: TLS
Usuário: seu-email@outlook.com
Senha: sua-senha
```

### SendGrid

```
Host: smtp.sendgrid.net
Porta: 587
Criptografia: TLS
Usuário: apikey
Senha: SG.xxxxxxxxxxxxx  (API Key do SendGrid)
```

### Mailgun

```
Host: smtp.mailgun.org
Porta: 587
Criptografia: TLS
Usuário: postmaster@seu-dominio.mailgun.org
Senha: sua-senha-mailgun
```

### Amazon SES

```
Host: email-smtp.us-east-1.amazonaws.com
Porta: 587
Criptografia: TLS
Usuário: seu-access-key-id
Senha: sua-secret-access-key
```

---

## Como Funciona

### Quando um Lead é Recebido

1. Cliente preenche o formulário de contato no site
2. Dados são salvos no banco de dados
3. Sistema busca as configurações SMTP do banco
4. E-mail é enviado automaticamente para o endereço configurado em "Reply-To" ou "E-mail"

### Formato do E-mail

- **Assunto**: 🎯 Novo Lead: [Nome] - [Serviço]
- **Conteúdo HTML** com:
  - Nome do cliente
  - E-mail (clicável)
  - Telefone (clicável)
  - Serviço selecionado
  - Mensagem completa

---

## Troubleshooting

### Erro: "Invalid login"
- Verifique se o e-mail e senha estão corretos
- Para Gmail, certifique-se de usar a senha de app, não a senha da conta
- Teste fazer login manualmente no webmail com as mesmas credenciais

### Erro: "Connection timeout"
- Verifique se a porta está correta (587 para TLS, 465 para SSL)
- Verifique se o firewall não está bloqueando a conexão
- Tente mudar a criptografia (TLS ↔ SSL)

### E-mails não chegam
- Verifique a pasta de spam
- Confirme que o e-mail em "Reply-To" ou "E-mail" está correto
- Use o botão "Enviar E-mail de Teste" para verificar
- Verifique os logs do servidor para erros

### Erro: "SMTP não configurado"
- Preencha todos os campos obrigatórios (Host, Porta, Usuário, Senha)
- Clique em "Salvar SMTP" antes de testar
- Aguarde alguns segundos e tente novamente

---

## Variáveis de Ambiente (Fallback)

Se preferir, você ainda pode usar variáveis de ambiente como fallback. O sistema tentará usar as configurações do banco primeiro, e se não encontrar, usará as variáveis de ambiente.

Adicione no arquivo `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="Toil Projetos <contato@toilprojetos.com.br>"
CONTACT_EMAIL="contato@toilprojetos.com.br"
```

**Nota**: As configurações do painel admin têm prioridade sobre as variáveis de ambiente.

---

## Logs

Os logs de envio de e-mail aparecem no console do servidor:

```bash
# Sucesso
✓ E-mail enviado para contato@toilprojetos.com.br

# Erro
✗ Erro ao enviar e-mail: [detalhes do erro]

# SMTP não configurado
⚠ SMTP não configurado. E-mail não será enviado.
```

---

## Segurança

⚠️ **IMPORTANTE**:
- As configurações SMTP são salvas no banco de dados
- Use senhas de app, não senhas de conta
- Em produção, use serviços profissionais (SendGrid, Mailgun, SES)
- Mantenha as credenciais seguras
- Nunca compartilhe senhas de app publicamente
