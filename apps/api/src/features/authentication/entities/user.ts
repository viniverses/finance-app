export type User = {
  name: string;
  email: string;
  id: string;
  telegramId: string | null;
  allowed: boolean | null;
  createdAt: Date;
  updatedAt: Date | null;
  passwordHash: string;
};
