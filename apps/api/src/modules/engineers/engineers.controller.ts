import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getEngineers = async (req: Request, res: Response) => {
  try {
    const engineers = await prisma.engineer.findMany({
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });
    res.json(engineers);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createEngineer = async (req: Request, res: Response) => {
  try {
    const engineer = await prisma.engineer.create({ 
      data: {
        ...req.body,
        engineerId: `ENG-${Date.now()}`
      } 
    });
    res.status(201).json(engineer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEngineer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const engineer = await prisma.engineer.update({ where: { id }, data: req.body });
    res.json(engineer);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteEngineer = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.engineer.delete({ where: { id } });
    res.json({ message: 'Engineer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
