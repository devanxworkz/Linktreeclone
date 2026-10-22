import { Router } from 'express';
import { wrap } from '../http/async.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createProduct,
  deleteProduct,
  listProducts,
  reorderProducts,
  updateProduct,
} from '../services/products.js';
import {
  productCreateSchema,
  productUpdateSchema,
  reorderSchema,
} from '../validation/schemas.js';

export const productsRouter = Router();

productsRouter.use(requireAuth);

productsRouter.get(
  '/',
  wrap(async (req, res) => {
    res.json({ products: await listProducts(req.auth!.tenantId) });
  }),
);

productsRouter.post(
  '/',
  wrap(async (req, res) => {
    const input = productCreateSchema.parse(req.body);
    res.status(201).json({ product: await createProduct(req.auth!.tenantId, input) });
  }),
);

productsRouter.put(
  '/reorder',
  wrap(async (req, res) => {
    const { ids } = reorderSchema.parse(req.body);
    res.json({ products: await reorderProducts(req.auth!.tenantId, ids) });
  }),
);

productsRouter.put(
  '/:id',
  wrap(async (req, res) => {
    const input = productUpdateSchema.parse(req.body);
    res.json({ product: await updateProduct(req.auth!.tenantId, req.params.id!, input) });
  }),
);

productsRouter.delete(
  '/:id',
  wrap(async (req, res) => {
    await deleteProduct(req.auth!.tenantId, req.params.id!);
    res.status(204).end();
  }),
);
