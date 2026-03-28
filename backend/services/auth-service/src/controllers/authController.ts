import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { RegisterSchema, LoginSchema } from "../schemas/authSchema";

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
        message: "Usuário registrado com sucesso",
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

      return res.status(500).json({ error: message });
    }
   }
};