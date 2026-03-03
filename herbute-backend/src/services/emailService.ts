import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendMail = async ({
    to,
    subject,
    html
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    const info = await transporter.sendMail({
        from: `"ReclamTrack" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
    logger.info(`              Email envoy     : ${info.messageId}`);
    return info;
};
