import { GetUserProfileResponseSchema } from '../schemas/get-user-profile.ts';

export const getProfileOpenApi = {
  response: {
    200: GetUserProfileResponseSchema,
  },
  detail: {
    tags: ['Authentication'],
    summary: 'Profile',
    description: 'Returns the authenticated user profile',
    operationId: 'getProfile',
    security: [{ bearerAuth: [] }],
  },
};


