/**
 * routes/api-keys.ts
 * API key management          admin only.
 *
 * GET    /api/api-keys                    list org API keys
 * POST   /api/api-keys                    create new key (raw key returned ONCE)
 * POST   /api/api-keys/:id/rotate          rotate key
 * DELETE /api/api-keys/:id                 revoke key
 */
import { Router, Request, Response } from 'express';
import { param } from 'express-validator';
import { apiKeyService } from '../services/apiKeyService.js';
import { authenticate, requireAdmin } from '../middleware/security.js';
import { validator } from '../middleware/validator.js';
import { CreateApiKeyDto } from '../dto/organization.dto.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

// All routes require authentication + admin role
router.use(authenticate, requireAdmin);

/*                  GET /api/api-keys                                                                                                                                                                                                                                  */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const keys = await apiKeyService.listOrgKeys(req.user!.orgId as string);
    return sendSuccess(res, keys, 200, req.id);
  }),
);

/*                  POST /api/api-keys                                                                                                                                                                                                                          */
router.post(
  '/',
  CreateApiKeyDto,
  validator,
  asyncHandler(async (req: Request, res: Response) => {
    const { name, scopes, rateLimit, expiresInDays } = req.body;

    const { rawKey, apiKey } = await apiKeyService.generateApiKey({
      orgId: req.user!.orgId as string,
      createdBy: req.user!.sub as string,
      name,
      scopes,
      rateLimit,
      expiresInDays,
    });

    return sendSuccess(
      res,
      {
        message: '            Save this key          it will not be shown again.',
        key: rawKey,
        id: apiKey._id,
        name: apiKey.name,
        scopes: apiKey.scopes,
        createdAt: apiKey.createdAt,
      },
      201,
      req.id,
    );
  }),
);

/*                  POST /api/api-keys/:id/rotate                                                                                                                          */
router.post(
  '/:id/rotate',
  [param('id').isMongoId().withMessage('Invalid key ID')],
  validator,
  asyncHandler(async (req: Request, res: Response) => {
    const { rawKey, apiKey } = await apiKeyService.rotateApiKey(
      req.params.id as string,
      req.user!.sub as string,
    );

    return sendSuccess(
      res,
      {
        message: '            Save this new key          it will not be shown again. The old key is now revoked.',
        key: rawKey,
        id: apiKey._id,
        name: apiKey.name,
      },
      200,
      req.id,
    );
  }),
);

/*                  DELETE /api/api-keys/:id                                                                                                                                                                          */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid key ID')],
  validator,
  asyncHandler(async (req: Request, res: Response) => {
    await apiKeyService.revokeApiKey(req.params.id as string);
    return sendSuccess(res, { message: 'API key revoked successfully' }, 200, req.id);
  }),
);

export default router;
