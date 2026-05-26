import { Request, Response } from 'express';
import { getProductos as getProductosModel, getKardexByProducto, getLotesByProducto, registrarMovimientoModel, getReporteConsolidadoModel,  getDashboardModel } from '../models/kardexModels';

export const getProductos = async (_req: Request, res: Response) => {
  try {
    const data = await getProductosModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getKardex = async (req: Request, res: Response) => {
  try {
    const { id_producto } = req.params;
    const data = await getKardexByProducto(Number(id_producto));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener Kardex' });
  }
};

export const getLotes = async (req: Request, res: Response) => {
  try {
    const { id_producto } = req.params;
    const data = await getLotesByProducto(Number(id_producto));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener lotes' });
  }
};

export const registrarMovimiento = async (req: Request, res: Response) => {
  try {
    const id_usuario = (req as any).user?.id;
    const kardex = await registrarMovimientoModel({ ...req.body, id_usuario });
    res.json({ success: true, kardex });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReporteConsolidado = async (_req: Request, res: Response) => {
  try {
    const data = await getReporteConsolidadoModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const data = await getDashboardModel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar dashboard' });
  }
};