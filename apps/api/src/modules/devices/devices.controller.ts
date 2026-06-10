import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDevice = async (req: Request, res: Response) => {
  const { name, imageUrl } = req.body;
  try {
    const device = await prisma.device.create({
      data: { name, imageUrl },
    });
    res.status(201).json(device);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Device with this name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, imageUrl } = req.body;
  try {
    const device = await prisma.device.update({
      where: { id },
      data: { name, imageUrl },
    });
    res.json(device);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Device with this name already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.device.delete({
      where: { id },
    });
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
