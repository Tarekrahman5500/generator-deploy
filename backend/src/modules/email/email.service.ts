import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { envVariables } from 'src/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(envVariables.RESEND_API_KEY);
  }

  async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
  }) {
    try {
      const response = await this.resend.emails.send({
        from: `Maresix <${envVariables.RESEND_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
}
