import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

jest.mock("../../src/repositories/userRepository", () => ({
  UserRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  }
}));

import { AuthService } from "../../src/services/authService";
import { UserRepository } from "../../src/repositories/userRepository";

describe("AuthService", () => {
  const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;

  const baseUser = {
    id: "user-1",
    name: "Ana",
    email: "ana@mail.com",
    passwordHash: "hashed-password",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };

  test("register deve criar usuario e retornar dados publicos", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);
    jest
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("123e4567-e89b-12d3-a456-426614174000");
    mockedUserRepository.create.mockResolvedValue({
      ...baseUser,
      id: "123e4567-e89b-12d3-a456-426614174000"
    });

    const result = await AuthService.register({
      name: "Ana",
      email: "ana@mail.com",
      password: "123456"
    });

    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith("ana@mail.com");
    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(mockedUserRepository.create).toHaveBeenCalledWith({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ana",
      email: "ana@mail.com",
      passwordHash: "hashed-password"
    });
    expect(result).toEqual({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Ana",
      email: "ana@mail.com",
      createdAt: baseUser.createdAt,
      updatedAt: baseUser.updatedAt
    });
  });

  test("register deve falhar quando email ja estiver em uso", async () => {

    mockedUserRepository.findByEmail.mockResolvedValue(baseUser);

    await expect(
      AuthService.register({ name: "Ana", email: "ana@mail.com", password: "123456" })
    ).rejects.toThrow("Email já em uso");
  });

  test("login deve falhar quando usuario nao existir", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null);

    await expect(AuthService.login({ email: "ana@mail.com", password: "123456" })).rejects.toThrow(
      "Credenciais inválidas!"
    );
  });

  test("login deve falhar quando senha for invalida", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(baseUser);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    await expect(AuthService.login({ email: "ana@mail.com", password: "errada" })).rejects.toThrow(
      "Credenciais inválidas!"
    );
  });

  test("login deve retornar token e usuario publico quando credenciais forem validas", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(baseUser);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
    jest.spyOn(jwt, "sign").mockReturnValue("jwt-token" as never);

    const result = await AuthService.login({ email: "ana@mail.com", password: "123456" });

    expect(jwt.sign).toHaveBeenCalledWith({ userId: "user-1" }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    expect(result).toEqual({
      token: "jwt-token",
      user: {
        id: "user-1",
        name: "Ana",
        email: "ana@mail.com",
        createdAt: baseUser.createdAt,
        updatedAt: baseUser.updatedAt
      }
    });
  });
});
