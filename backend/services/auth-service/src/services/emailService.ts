import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser) throw new Error("GMAIL_USER não definido.");
if (!gmailAppPassword) throw new Error("GMAIL_APP_PASSWORD não definido.");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailUser,
        pass: gmailAppPassword,
    },
});

export const EmailService = {
    async sendEmailVerification({ to, name, verificationToken }: { to: string; name: string; verificationToken: string }) {
        try {
            console.log(`Enviando email de confirmação para: ${to}`);
            
            await transporter.sendMail({
                from: `"Receita Na Mão" <${gmailUser}>`,
                to,
                subject: "Receita Na Mão - Confirmação de e-mail",
                html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Confirmação de e-mail</h2>
                    <p>Olá, <strong>${name}</strong>!</p>
                    <p>Seu token de confirmação é:</p>
                    <p style="font-size:22px;font-weight:700;letter-spacing:2px; text-align: center; background: #f0f0f0; padding: 16px; border-radius: 8px;">${verificationToken}</p>
                    <p>Digite esse código na tela de confirmação do app.</p>
                    <p style="color: #9CA3AF; font-size: 13px;">
                        Se você não criou esta conta, ignore este e-mail.
                    </p>
                </div>`,
                text: `Olá, ${name}.\n\nSeu token de confirmação é: ${verificationToken}\n\nDigite esse código na tela de confirmação do app.\n\nSe você não criou esta conta, ignore esta mensagem.`,
            });

            console.log(`Email de confirmação enviado com sucesso para: ${to}`);
            return true;
        } catch (error) {
            console.error("Erro ao enviar email de confirmação:", error);
            throw error;
        }
    }
}
