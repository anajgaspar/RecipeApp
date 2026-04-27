import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import {
  RegisterSchema,
  LoginSchema,
  FirebaseLoginSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
} from "../schemas/authSchema";

export const AuthController = {
   async register(req: Request, res: Response) {
    try {
      const validated = RegisterSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validated.error.issues
        });
      }

      const user = await AuthService.register(validated.data);
      return res.status(201).json({
        message: "Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.",
        user
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      if (message === "Email já em uso") {
        return res.status(409).json({ error: message });
      }

      return res.status(500).json({ error: message });
    }
   },

   async login(req: Request, res: Response) {
    try {
      const validated = LoginSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validated.error.issues
        });
      }

      const result = await AuthService.login(validated.data);
      return res.status(200).json({
        message: "Login realizado com sucesso",
        token: result.token,
        user: result.user
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      if (message === "Credenciais inválidas!") {
        return res.status(401).json({ error: message });
      }

      if (message === "Email não verificado") {
        return res.status(403).json({
          error: message,
          code: "EMAIL_NOT_VERIFIED",
        });
      }

      return res.status(500).json({ error: message });
    }
   },

   async firebaseLogin(req: Request, res: Response) {
    try {
      const validated = FirebaseLoginSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validated.error.issues
        });
      }

      const result = await AuthService.firebaseLogin(validated.data.firebaseIdToken);
      return res.status(200).json({
        message: "Login Google realizado com sucesso",
        token: result.token,
        user: result.user
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      if (message === "Token Firebase inválido") {
        return res.status(401).json({ error: message });
      }

      return res.status(500).json({ error: message });
    }
   },

   async verifyEmail(req: Request, res: Response) {
    try {
      const validated = VerifyEmailSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validated.error.issues
        });
      }

      const result = await AuthService.verifyEmail(validated.data);
      return res.status(200).json({
        message: "E-mail confirmado com sucesso",
        user: result,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";

      if (message === "Token inválido ou expirado") {
        return res.status(400).json({ error: message });
      }

      return res.status(500).json({ error: message });
    }
   },

   async resendVerification(req: Request, res: Response) {
    try {
      const validated = ResendVerificationSchema.safeParse(req.body);
      if (!validated.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: validated.error.issues
        });
      }

      await AuthService.resendEmailVerification(validated.data);
      return res.status(200).json({
        message: "Se existir uma conta pendente, enviamos um novo e-mail de confirmação.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      return res.status(503).json({
        error: "Falha ao enviar e-mail de confirmação. Verifique Gmail.",
        details: message,
      });
    }
   },

   async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido." });
      }

      const [scheme, token] = authHeader.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Formato de token inválido." });
      }

      await AuthService.logout(token);
      return res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      if (message === "Token inválido ou expirado.") {
        return res.status(401).json({ error: message });
      }

      return res.status(500).json({ error: message });
    }
   }
};