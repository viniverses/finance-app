export interface JwtSignPayload {
  id: string;
  name: string;
  email: string;
}

export type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface JwtService {
  sign(payload: JwtSignPayload): Promise<JwtTokens>;
}


