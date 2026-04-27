import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "../../src/middlewares/authMiddleware";
import { TokenBlacklistRepository } from "../../src/repositories/tokenBlacklistRepository";

jest.mock("../../src/repositories/tokenBlacklistRepository", () => ({
  TokenBlacklistRepository: {
    isTokenRevoked: jest.fn(),
  },
}));

jest.mock("jsonwebtoken");

const mockTokenBlacklistRepository = TokenBlacklistRepository as jest.Mocked<typeof TokenBlacklistRepository>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("AuthMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn().mockReturnThis() as unknown as (body?: any) => Response,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test("deve falhar quando authorization header nao esta presente", async () => {
    req.headers = {};

    await AuthMiddleware.authenticateUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token não fornecido." });
    expect(next).not.toHaveBeenCalled();
  });

  test("deve falhar quando formato de authorization nao eh Bearer", async () => {
    req.headers = { authorization: "Basic token123" };

    await AuthMiddleware.authenticateUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Formato de token inválido." });
    expect(next).not.toHaveBeenCalled();
  });

  test("deve falhar quando token esta na blacklist", async () => {
    const token = "valid-token";
    req.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistRepository.isTokenRevoked.mockResolvedValue(true);

    await AuthMiddleware.authenticateUser(req as Request, res as Response, next);

    expect(mockTokenBlacklistRepository.isTokenRevoked).toHaveBeenCalledWith(token);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token inválido ou expirado." });
    expect(next).not.toHaveBeenCalled();
  });

  test("deve falhar quando token eh invalido", async () => {
    const token = "invalid-token";
    req.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistRepository.isTokenRevoked.mockResolvedValue(false);
    mockJwt.verify.mockImplementation(() => {
      throw new Error("Token inválido");
    });

    await AuthMiddleware.authenticateUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token inválido ou expirado." });
    expect(next).not.toHaveBeenCalled();
  });

  test("deve passar quando token eh valido", async () => {
    const token = "valid-token";
    const userId = "user-123";
    req.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistRepository.isTokenRevoked.mockResolvedValue(false);
    mockJwt.verify.mockReturnValue({ userId } as any);

    await AuthMiddleware.authenticateUser(req as Request, res as Response, next);

    expect(mockTokenBlacklistRepository.isTokenRevoked).toHaveBeenCalledWith(token);
    expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET as string);
    expect((req as any).userId).toBe(userId);
    expect(next).toHaveBeenCalled();
  });
});
