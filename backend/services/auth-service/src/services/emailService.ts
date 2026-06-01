// @ts-ignore
import emailjs from '@emailjs/nodejs';

export const EmailService = {
    async sendEmailVerification({ to, name, verificationToken }: { to: string; name: string; verificationToken: string }) {
        try {
            console.log(`Enviando e-mail de confirmação via EmailJS para: ${to}`);

            await emailjs.send(
                'service_t4laafa', 
                'template_puxechl',  
                {
                    to: to,                
                    name: name,            
                    verificationToken: verificationToken 
                },
                {
                    publicKey: process.env.EMAILJS_PUBLIC_KEY,
                    privateKey: process.env.EMAILJS_PRIVATE_KEY,
                }
            );

            console.log(`E-mail enviado com sucesso para: ${to}`);
            return true;
        } catch (error) {
            console.error("Erro ao enviar e-mail pelo EmailJS:", error);
            throw error;
        }
    }
};