import bcrypt from "bcryptjs";

import type { PasswordHasherService } from "../services/password-hasher.ts";

export class BcryptHasherService implements PasswordHasherService {
  constructor(private readonly saltRounds: number = 12) {}
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}


