import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const EmailService = {
    async sendEmailVerification({ to, name, verificationToken }: { to: string; name: string; verificationToken: string }) {
        try {
            if (!resendApiKey) {
                console.warn("RESEND_API_KEY não configurada. E-mail não será enviado.");
                return false;
            }

            const resend = new Resend(resendApiKey);

            console.log(`Enviando e-mail de confirmação via HTTP para: ${to}`);

            await resend.emails.send({
                from: "Receita Na Mao <onboarding@resend.dev>",
                to: [to],
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
                text: `Olá, ${name}.\n\nSeu token de confirmação é: ${verificationToken}\n\nDigite esse código na tela de confirmação do app.`,
            });

            console.log(`E-mail enviado com sucesso via Resend para: ${to}`);
            return true;
        } catch (error) {
            console.error("Erro ao enviar e-mail via Resend:", error);
            throw error;
        }
    }
};