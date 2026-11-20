import { Request, Response } from 'express';
import { getProducts, createProduct, getProductById, updateProduct, inactivarProduct, activarProduct } from '../models/productoModels';
import { currentUserId } from '../utils/currentUser';

const ctx = (req: Request) => ({
  idUsuario: currentUserId(req),
  ip: req.ip ?? null,
});

const fail = (res: Response, error: any, porDefecto: string, nombre: string) => {
  console.error(`${nombre}:`, error);
  if (error?.code === '23503') {
    return res.status(400).json({ message: 'La categoría o la finca seleccionada no existe' });
  }
  res.status(500).json({ message: error?.message || porDefecto });
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    res.json(await getProducts());
  } catch (error) {
    fail(res, error, 'Error al obtener productos', 'getAllProducts');
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    res.json(await createProduct(req.body, ctx(req)));
  } catch (error) {
    fail(res, error, 'Error al crear producto', 'addProduct');
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    res.json(await getProductById(Number(req.params.id)));
  } catch (error) {
    fail(res, error, 'Error al obtener producto', 'getProduct');
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    res.json(await updateProduct(Number(req.params.id), req.body, ctx(req)));
  } catch (error) {
    fail(res, error, 'Error al actualizar producto', 'editProduct');
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  try {
    await inactivarProduct(Number(req.params.id), ctx(req));
    res.json({ message: 'Producto inactivado' });
  } catch (error) {
    fail(res, error, 'Error al eliminar producto', 'removeProduct');
  }
};

export const inactivarProductController = async (req: Request, res: Response) => {
  try {
    res.json(await inactivarProduct(Number(req.params.id), ctx(req)));
  } catch (error) {
    fail(res, error, 'Error al inactivar producto', 'inactivarProduct');
  }
};

export const activarProductController = async (req: Request, res: Response) => {
  try {
    res.json(await activarProduct(Number(req.params.id), ctx(req)));
  } catch (error) {
    fail(res, error, 'Error al activar producto', 'activarProduct');
  }
};