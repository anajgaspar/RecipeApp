import { describe, expect, jest, test } from "@jest/globals";

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  credential: {
    cert: jest.fn(),
  },
}));

import { Request, Response } from "express";

jest.mock("../../src/services/userService", () => ({
  UserService: {
    getUser: jest.fn()
  }
}));

import { UserController } from "../../src/controllers/userController";
import { UserService } from "../../src/services/userService";

function createResponseMock(): Response {
  const res = {} as Response;
  res.status = jest.fn(() => res) as unknown as Response["status"];
  res.json = jest.fn(() => res) as unknown as Response["json"];
  return res;
}

describe("UserController", () => {
  const mockedUserService = UserService as jest.Mocked<typeof UserService>;

  test("getProfile deve retornar 401 quando userId nao for enviado", async () => {
    const req = {} as Request;
    const res = createResponseMock();

    await UserController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário não autenticado." });
  });

  test("getProfile deve retornar 200 com dados publicos do usuario", async () => {
    const req = { userId: "user-1" } as unknown as Request;
    const res = createResponseMock();
    mockedUserService.getUser.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        avatarDataUrl: null,
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    });

    await UserController.getProfile(req, res);

    expect(mockedUserService.getUser).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        avatarDataUrl: null,
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    });
  });

  test("getProfile deve retornar 404 quando usuario nao existir", async () => {
    const req = { userId: "user-404" } as unknown as Request;
    const res = createResponseMock();
    mockedUserService.getUser.mockRejectedValue(new Error("Usuário não encontrado"));

    await UserController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado" });
  });

  test("getProfile deve retornar 500 para erro inesperado", async () => {
    const req = { userId: "user-1" } as unknown as Request;
    const res = createResponseMock();
    mockedUserService.getUser.mockRejectedValue(new Error("Falha interna"));

    await UserController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Falha interna" });
  });
});
