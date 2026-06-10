import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getSalesPersons = async (req: Request, res: Response) => {
  try {
    const salesPersons = await prisma.salesPerson.findMany({
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });
    res.json(salesPersons);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createSalesPerson = async (req: Request, res: Response) => {
  try {
    const salesPerson = await prisma.salesPerson.create({ 
      data: {
        ...req.body,
        salesPersonId: `SP-${Date.now()}`
      } 
    });
    res.status(201).json(salesPerson);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSalesPerson = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const salesPerson = await prisma.salesPerson.update({ where: { id }, data: req.body });
    res.json(salesPerson);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteSalesPerson = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.salesPerson.delete({ where: { id } });
    res.json({ message: 'Sales Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
