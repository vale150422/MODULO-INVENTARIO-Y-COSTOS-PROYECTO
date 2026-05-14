import { Request, Response } from 'express';
import { getProveedores, getProveedorById, createProveedor, updateProveedor, deleteProveedor } from '../models/provedorModels';

export const getAllProveedores = async (_req: Request, res: Response) => {
  try {
    const data = await getProveedores();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

export const getProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await getProveedorById(Number(id));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proveedor' });
  }
};

export const addProveedor = async (req: Request, res: Response) => {
  try {
    const newProveedor = await createProveedor(req.body);
    res.json(newProveedor);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

export const editProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateProveedor(Number(id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

export const removeProveedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteProveedor(Number(id));
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};