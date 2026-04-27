import { describe, expect, jest, test } from "@jest/globals";

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  credential: {
    cert: jest.fn(),
  },
}));

jest.mock("../../src/repositories/userRepository", () => ({
  UserRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateById: jest.fn(),
  }
}));

import { UserService } from "../../src/services/userService";
import { UserRepository } from "../../src/repositories/userRepository";

describe("UserService", () => {
  const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;

  test("getUser deve retornar dados publicos do usuario", async () => {
    mockedUserRepository.findById.mockResolvedValue({
      id: "user-1",
      name: "Ana",
      email: "ana@mail.com",
      avatarDataUrl: null,
      passwordHash: "hashed",
      emailVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    const result = await UserService.getUser("user-1");

    expect(mockedUserRepository.findById).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
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

  test("getUser deve falhar quando usuario nao existir", async () => {
    mockedUserRepository.findById.mockResolvedValue(null);

    await expect(UserService.getUser("missing-id")).rejects.toThrow("Usuário não encontrado");
  });
});
