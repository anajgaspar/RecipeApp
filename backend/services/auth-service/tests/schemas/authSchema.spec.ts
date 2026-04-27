import { describe, expect, test } from "@jest/globals";
import {
  RegisterSchema,
  LoginSchema,
  FirebaseLoginSchema,
  VerifyEmailSchema,
  UpdateProfileSchema,
} from "../../src/schemas/authSchema";

describe("Auth Schemas", () => {
  describe("RegisterSchema", () => {
    test("deve validar registro com dados válidos", () => {
      const data = {
        name: "Ana Silva",
        email: "ana@example.com",
        password: "securePassword123",
      };

      const result = RegisterSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    test("deve falhar sem email válido", () => {
      const data = {
        name: "Ana Silva",
        email: "not-an-email",
        password: "securePassword123",
      };

      const result = RegisterSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("email"))).toBe(
          true
        );
      }
    });

    test("deve falhar com senha com menos de 8 caracteres", () => {
      const data = {
        name: "Ana Silva",
        email: "ana@example.com",
        password: "pass123",
      };

      const result = RegisterSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("password"))).toBe(
          true
        );
      }
    });
  });

  describe("LoginSchema", () => {
    test("deve validar login com dados válidos", () => {
      const data = {
        email: "ana@example.com",
        password: "password123",
      };

      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("deve falhar com senha com menos de 6 caracteres", () => {
      const data = {
        email: "ana@example.com",
        password: "pass",
      };

      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("FirebaseLoginSchema", () => {
    test("deve validar token Firebase válido", () => {
      const data = {
        firebaseIdToken: "very-long-firebase-token-string-more-than-10-chars",
      };

      const result = FirebaseLoginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("deve falhar com token curto demais", () => {
      const data = {
        firebaseIdToken: "short",
      };

      const result = FirebaseLoginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("VerifyEmailSchema", () => {
    test("deve validar email e token de verificação", () => {
      const data = {
        email: "ana@example.com",
        token: "123456",
      };

      const result = VerifyEmailSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("deve falhar se token nao tem exatamente 6 caracteres", () => {
      const data = {
        email: "ana@example.com",
        token: "12345",
      };

      const result = VerifyEmailSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateProfileSchema", () => {
    test("deve validar atualizar apenas o nome", () => {
      const data = {
        name: "Novo Nome",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("deve validar atualizar nome e email", () => {
      const data = {
        name: "Novo Nome",
        email: "novo@example.com",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("deve falhar quando ambas as senhas nao sao fornecidas", () => {
      const data = {
        newPassword: "newPassword123",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("senha atual e a nova senha");
      }
    });

    test("deve falhar quando nenhum campo de atualizacao e fornecido", () => {
      const data = {};

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("pelo menos um campo");
      }
    });

    test("deve validar atualizacao de senha com senhas validas", () => {
      const data = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword123",
      };

      const result = UpdateProfileSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
