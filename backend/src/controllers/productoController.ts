import { Request, Response } from 'express';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../models/productoModels';

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const data = await getProducts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const newProduct = await createProduct(req.body);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getProductById(Number(id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateProduct(Number(id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProduct(Number(id));
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};