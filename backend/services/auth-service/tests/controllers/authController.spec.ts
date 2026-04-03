import { Request, Response } from "express";

jest.mock("../../src/services/authService", () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn()
  }
}));

import { AuthController } from "../../src/controllers/authController";
import { AuthService } from "../../src/services/authService";

function createResponseMock(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

  test("register deve retornar 400 quando payload for invalido", async () => {
    const req = { body: { email: "ana@mail.com", password: "123456" } } as Request;
    const res = createResponseMock();

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Dados inválidos"
      })
    );
  });

  test("register deve retornar 201 quando usuario for criado", async () => {
    const req = {
      body: { name: "Ana", email: "ana@mail.com", password: "123456" }
    } as Request;
    const res = createResponseMock();
    mockedAuthService.register.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      emailVerified: false,
      emailVerificationSent: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    await AuthController.register(req, res);

    expect(mockedAuthService.register).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456"
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("register deve retornar 409 quando email ja estiver em uso", async () => {
    const req = {
      body: { name: "Ana", email: "ana@mail.com", password: "123456" }
    } as Request;
    const res = createResponseMock();
    mockedAuthService.register.mockRejectedValue(new Error("Email já em uso"));

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email já em uso" });
  });

  test("login deve retornar 400 quando payload for invalido", async () => {
    const req = { body: { email: "invalido" } } as Request;
    const res = createResponseMock();

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Dados inválidos"
      })
    );
  });

  test("login deve retornar 200 quando credenciais forem validas", async () => {
    const req = { body: { email: "ana@mail.com", password: "123456" } } as Request;
    const res = createResponseMock();
    mockedAuthService.login.mockResolvedValue({
      token: "jwt-token",
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    });

    await AuthController.login(req, res);

    expect(mockedAuthService.login).toHaveBeenCalledWith({
      email: "ana@mail.com",
      password: "123456"
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("login deve retornar 401 para credenciais invalidas", async () => {
    const req = { body: { email: "ana@mail.com", password: "wrong123" } } as Request;
    const res = createResponseMock();
    mockedAuthService.login.mockRejectedValue(new Error("Credenciais inválidas!"));

    await AuthController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Credenciais inválidas!" });
  });
});
