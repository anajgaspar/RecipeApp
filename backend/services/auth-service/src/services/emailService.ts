import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false
    }
});

export const EmailService = {
    async sendEmailVerification({ to, name, verificationToken }: { to: string; name: string; verificationToken: string }) {
        try {
            if (!EMAIL_USER || !EMAIL_PASS) {
                console.warn("EMAIL_USER ou EMAIL_PASS não configurados. E-mail não será enviado.");
                return false;
            }

            console.log(`Enviando e-mail de confirmação para: ${to}`);

            const htmlContent = `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Confirmação de e-mail</h2>
                <p>Olá, <strong>${name}</strong>!</p>
                <p>Seu token de confirmação é:</p>
                <p style="font-size:22px;font-weight:700;letter-spacing:2px; text-align: center; background: #f0f0f0; padding: 16px; border-radius: 8px;">${verificationToken}</p>
                <p>Digite esse código na tela de confirmação do app.</p>
                <p style="color: #9CA3AF; font-size: 13px;">
                    Se você não criou esta conta, ignore este e-mail.
                </p>
            </div>`;

            const textContent = `Olá, ${name}.\n\nSeu token de confirmação é: ${verificationToken}\n\nDigite esse código na tela de confirmação do app.`;

            await transporter.sendMail({
                from: `"Receita Na Mão" <${EMAIL_USER}>`,
                to: to,
                subject: "Receita Na Mão - Confirmação de e-mail",
                text: textContent,
                html: htmlContent,
            });

            console.log(`E-mail enviado com sucesso para: ${to}`);
            return true;
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            throw error;
        }
    }
};
