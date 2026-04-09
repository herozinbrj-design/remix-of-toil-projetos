import nodemailer from "nodemailer";
import { prisma } from "../prisma.js";

async function getSmtpConfig() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "site_smtp_host",
            "site_smtp_port",
            "site_smtp_encryption",
            "site_smtp_username",
            "site_smtp_password",
            "site_smtp_from_name",
            "site_smtp_from_email",
            "site_smtp_reply_to",
          ],
        },
      },
    });

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    return {
      host: config.site_smtp_host || process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(config.site_smtp_port || process.env.SMTP_PORT || "587"),
      secure: config.site_smtp_encryption === "ssl",
      username: config.site_smtp_username || process.env.SMTP_USER || "",
      password: config.site_smtp_password || process.env.SMTP_PASS || "",
      fromName: config.site_smtp_from_name || "Toil Projetos",
      fromEmail: config.site_smtp_from_email || process.env.SMTP_FROM || "contato@toilprojetos.com.br",
      replyTo: config.site_smtp_reply_to || process.env.CONTACT_EMAIL || "",
    };
  } catch (error) {
    console.error("Erro ao buscar configurações SMTP:", error);
    // Fallback para variáveis de ambiente
    return {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      username: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASS || "",
      fromName: "Toil Projetos",
      fromEmail: process.env.SMTP_FROM || "contato@toilprojetos.com.br",
      replyTo: process.env.CONTACT_EMAIL || "",
    };
  }
}

interface LeadEmailData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
}

export async function sendLeadNotification(data: LeadEmailData) {
  const { name, email, phone, service, message } = data;
  const config = await getSmtpConfig();

  // Verificar se SMTP está configurado
  if (!config.username || !config.password) {
    console.warn("SMTP não configurado. E-mail não será enviado.");
    return { success: false, error: "SMTP não configurado" };
  }

  const transportConfig: any = {
    host: config.host,
    port: config.port,
    secure: config.secure, // true para 465, false para outros
    auth: {
      user: config.username,
      pass: config.password,
    },
  };

  // Adicionar configurações TLS se não for SSL
  if (!config.secure) {
    transportConfig.requireTLS = true;
    transportConfig.tls = {
      rejectUnauthorized: false, // Aceitar certificados auto-assinados
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #0a1628; margin-bottom: 5px; }
        .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">🎯 Novo Lead Recebido!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Toil Projetos - Sistema de Orçamentos</p>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">👤 Nome:</div>
            <div class="value">${name}</div>
          </div>
          <div class="field">
            <div class="label">📧 E-mail:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          ${phone ? `
          <div class="field">
            <div class="label">📱 Telefone:</div>
            <div class="value"><a href="tel:${phone}">${phone}</a></div>
          </div>
          ` : ''}
          ${service ? `
          <div class="field">
            <div class="label">🔧 Serviço:</div>
            <div class="value">${service}</div>
          </div>
          ` : ''}
          ${message ? `
          <div class="field">
            <div class="label">💬 Mensagem:</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>Este e-mail foi enviado automaticamente pelo sistema de orçamentos da Toil Projetos.</p>
          <p>Para responder, utilize o e-mail ou telefone informado acima.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Novo Lead Recebido - Toil Projetos

Nome: ${name}
E-mail: ${email}
${phone ? `Telefone: ${phone}` : ''}
${service ? `Serviço: ${service}` : ''}
${message ? `\nMensagem:\n${message}` : ''}

---
Este e-mail foi enviado automaticamente pelo sistema de orçamentos.
  `.trim();

  try {
    const fromAddress = config.fromName 
      ? `"${config.fromName}" <${config.fromEmail}>`
      : config.fromEmail;

    const mailOptions: any = {
      from: fromAddress,
      to: config.replyTo || config.fromEmail,
      subject: `🎯 Novo Lead: ${name} - ${service || 'Orçamento'}`,
      text: textContent,
      html: htmlContent,
    };

    if (config.replyTo) {
      mailOptions.replyTo = email; // Reply vai para o cliente
    }

    await transporter.sendMail(mailOptions);
    console.log(`✓ E-mail enviado para ${config.replyTo || config.fromEmail}`);
    return { success: true };
  } catch (error) {
    console.error("✗ Erro ao enviar e-mail:", error);
    return { success: false, error };
  }
}

export async function sendTestEmail(testEmail: string) {
  const config = await getSmtpConfig();

  if (!config.username || !config.password) {
    throw new Error("SMTP não configurado");
  }

  const transportConfig: any = {
    host: config.host,
    port: config.port,
    secure: config.secure, // true para 465, false para outros
    auth: {
      user: config.username,
      pass: config.password,
    },
  };

  // Adicionar configurações TLS se não for SSL
  if (!config.secure) {
    transportConfig.requireTLS = true;
    transportConfig.tls = {
      rejectUnauthorized: false, // Aceitar certificados auto-assinados
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">✅ Teste de E-mail</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Toil Projetos</p>
        </div>
        <div class="content">
          <p>Parabéns! Sua configuração SMTP está funcionando corretamente.</p>
          <p>Este é um e-mail de teste enviado pelo painel administrativo.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            <strong>Configuração atual:</strong><br>
            Host: ${config.host}<br>
            Porta: ${config.port}<br>
            Usuário: ${config.username}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const fromAddress = config.fromName 
    ? `"${config.fromName}" <${config.fromEmail}>`
    : config.fromEmail;

  await transporter.sendMail({
    from: fromAddress,
    to: testEmail,
    subject: "✅ Teste de Configuração SMTP - Toil Projetos",
    html: htmlContent,
  });
}
