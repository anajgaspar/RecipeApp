import nodemailer from "nodemailer";

type SendEmailVerificationParams = {
    to: string;
    name: string;
    verificationToken: string;
};

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
const fromEmail = process.env.EMAIL_FROM ?? (gmailUser ? `Receita Na Mão <${gmailUser}>` : "Receita Na Mão <no-reply@recipeapp.local>");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? "0");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecure = process.env.SMTP_SECURE === "true";

async function trySendWithGmail(params: SendEmailVerificationParams): Promise<boolean> {
    if (!gmailUser || !gmailAppPassword) {
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser,
                pass: gmailAppPassword,
            },
        });

        await transporter.sendMail({
            from: fromEmail,
            to: params.to,
            subject: "Seu token de confirmação",
            text: `Olá, ${params.name}.\n\nSeu token de confirmação é: ${params.verificationToken}\n\nDigite esse código na tela de confirmação do app.\n\nSe você não criou esta conta, ignore esta mensagem.`,
            html: `<p>Olá, ${params.name}.</p><p>Seu token de confirmação é:</p><p style="font-size:22px;font-weight:700;letter-spacing:2px;">${params.verificationToken}</p><p>Digite esse código na tela de confirmação do app.</p><p>Se você não criou esta conta, ignore esta mensagem.</p>`,
        });

        return true;
    } catch (error) {
        console.warn("[email] Falha no Gmail.", error);
        return false;
    }
}

async function trySendWithSmtp(params: SendEmailVerificationParams): Promise<boolean> {
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        await transporter.sendMail({
            from: fromEmail,
            to: params.to,
            subject: "Seu token de confirmação",
            text: `Olá, ${params.name}.\n\nSeu token de confirmação é: ${params.verificationToken}\n\nDigite esse código na tela de confirmação do app.\n\nSe você não criou esta conta, ignore esta mensagem.`,
            html: `<p>Olá, ${params.name}.</p><p>Seu token de confirmação é:</p><p style="font-size:22px;font-weight:700;letter-spacing:2px;">${params.verificationToken}</p><p>Digite esse código na tela de confirmação do app.</p><p>Se você não criou esta conta, ignore esta mensagem.</p>`,
        });

        return true;
    } catch (error) {
        console.warn("[email] Falha no SMTP.", error);
        return false;
    }
}

export const EmailService = {
    async sendEmailVerification(params: SendEmailVerificationParams): Promise<void> {
        const gmailSent = await trySendWithGmail(params);
        if (gmailSent) {
            return;
        }

        const smtpSent = await trySendWithSmtp(params);
        if (smtpSent) {
            return;
        }

        throw new Error(
            "Falha no envio de e-mail. Configure Gmail (GMAIL_USER, GMAIL_APP_PASSWORD) ou SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)."
        );
    },
};
