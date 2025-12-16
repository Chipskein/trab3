import nodemailer, { Transporter } from 'nodemailer';
import { NotificationService } from '../interface/notification-service.js';
import { configDotenv } from 'dotenv';
configDotenv();

export class EmailNotificationService implements NotificationService {

    private transporter: Transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('EmailNotificationService initialized with SMTP server:', process.env.SMTP_HOST);
    }

    async notifyPollClosed(input: {
        to: string;
        pollTitle: string;
        closedAt: Date;
        winnerOption: string;
        totalVotes: number;
    }): Promise<void> {
        const { to, pollTitle, closedAt, winnerOption, totalVotes } = input;

        await this.transporter.sendMail({
            from: 'no-reply@enquetes.local',
            to,
            subject: `Enquete encerrada: ${pollTitle}`,
            html: `
        <h2>Enquete encerrada</h2>
        <p><strong>Título:</strong> ${pollTitle}</p>
        <p><strong>Encerrada em:</strong> ${closedAt.toLocaleString()}</p>
        <p><strong>Opção vencedora:</strong> ${winnerOption}</p>
        <p><strong>Total de votos:</strong> ${totalVotes}</p>
      `,
        });
    }
}
