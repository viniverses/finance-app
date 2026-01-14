import type { JwtService, JwtSignPayload, JwtTokens } from '../services/jwt.ts';

type SignInFunction = (user: { id: string; name: string; email: string }) => Promise<JwtTokens>;

export class ElysiaJwtService implements JwtService {
  constructor(private readonly signIn: SignInFunction) {}

  async sign(payload: JwtSignPayload): Promise<JwtTokens> {
    return await this.signIn(payload);
  }
}
