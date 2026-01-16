import { JWTPayload } from '@/shared/http/plugins/jwt.ts';
import type { JwtService, JwtSignPayload, JwtTokens } from '../services/jwt.ts';

type ElysiaJwt = {
  sign: (payload: JWTPayload) => Promise<string>;
};

export class ElysiaJwtService implements JwtService {
  constructor(private readonly jwt: ElysiaJwt) {}

  async sign(payload: JwtSignPayload): Promise<JwtTokens> {
    const accessToken = await this.jwt.sign({
      id: payload.id,
      name: payload.name,
      email: payload.email,
    });

    const expiresIn = 7 * 24 * 60 * 60; // 7 dias
    const exp = Math.floor(Date.now() / 1000) + expiresIn;

    const refreshToken = await this.jwt.sign({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      exp,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
