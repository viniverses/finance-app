import {
  RegisterRequestSchema,
  RegisterResponseSchema,
} from '../schemas/register.ts';

export const registerOpenApi = {
  body: RegisterRequestSchema,
  response: {
    201: RegisterResponseSchema,
  },
  detail: {
    tags: ['Authentication'],
    summary: 'Register',
    description: 'Registers a new user',
    operationId: 'register',
  },
};


