import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT'), 10),
      secure: parseInt(this.configService.get<string>('SMTP_PORT'), 10) === 465,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const mailFrom = this.configService.get<string>('SMTP_FROM');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
          }
          .logo-span {
            color: #f59e0b;
          }
          .content {
            line-height: 1.6;
            font-size: 16px;
            color: #cbd5e1;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #f59e0b;
            color: #000000 !important;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #d97706;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            text-align: center;
            font-size: 12px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ML <span class="logo-span">Estoque</span></div>
          </div>
          <div class="content">
            <p>Olá, ${name},</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no sistema <strong>ML Estoque</strong>.</p>
            <p>Para prosseguir com a redefinição de sua senha, clique no botão abaixo:</p>
            <div class="button-container">
              <a href="${resetLink}" class="button" target="_blank">Redefinir Minha Senha</a>
            </div>
            <p>Se você não fez essa solicitação, por favor desconsidere este e-mail. A sua senha atual continuará ativa.</p>
            <p>Este link expira em 1 hora.</p>
          </div>
          <div class="footer">
            <p>© 2026 ML Estoque. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Recuperação de Senha - ML Estoque',
        text: `Olá ${name}, para redefinir sua senha acesse o link: ${resetLink}`,
        html: htmlContent,
      });
      this.logger.log(`E-mail de recuperação de senha enviado com sucesso para ${email}`);
    } catch (error) {
      this.logger.error(`Falha ao enviar e-mail para ${email}: ${error.message}`);
      throw error;
    }
  }
}
