import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSales,
      customersCount,
      totalRevenue,
      totalInstallations,
      pendingInstallations,
      previousPendingInstallations,
      completedInstallations,
      cancelledInstallations,
      salesTrend,
      recentSales
    ] = await Promise.all([
      prisma.sale.count(),
      prisma.sale.groupBy({ by: ['phone'] }),
      prisma.sale.aggregate({ _sum: { softwarePrice: true } }),
      prisma.sale.count({ where: { installationDate: { not: null } } }),
      prisma.sale.count({ 
        where: { 
          status: { notIn: ['completed', 'cancelled'] },
          saleDate: { gte: startOfMonth }
        } 
      }),
      prisma.sale.count({ 
        where: { 
          status: { notIn: ['completed', 'cancelled'] },
          saleDate: { lt: startOfMonth }
        } 
      }),
      prisma.sale.count({ where: { status: 'completed' } }),
      prisma.sale.count({ where: { status: 'cancelled' } }),
      prisma.sale.groupBy({
        by: ['saleDate'],
        _sum: { softwarePrice: true },
      }),
      prisma.sale.findMany({
        take: 10,
        orderBy: { saleDate: 'desc' },
      })
    ]);

    res.json({
      stats: {
        totalCustomers: customersCount.length,
        totalSales,
        totalRevenue: totalRevenue._sum.softwarePrice || 0,
        totalInstallations,
        pendingInstallations,
        previousPendingInstallations,
        completedInstallations,
        cancelledInstallations,
      },
      salesTrend: salesTrend.map(s => ({
        saleDate: s.saleDate,
        revenue: s._sum.softwarePrice || 0
      })),
      recentSales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
