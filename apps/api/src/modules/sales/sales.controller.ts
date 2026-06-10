import { Request, Response } from 'express';
import prisma from '../../database/prisma';

export const getSales = async (req: Request, res: Response) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        salesPerson: true,
        engineer: true,
        devices: true,
      },
      orderBy: { saleDate: 'desc' },
    });
    
    // Flatten data for the frontend
    const formattedSales = sales.map(sale => {
      return {
        id: sale.id,
        saleNumber: sale.saleNumber,
        saleDate: sale.saleDate,
        installDate: sale.installationDate,
        customerName: sale.customerName,
        businessName: sale.businessName,
        phone: sale.phone,
        location: sale.location,
        address: sale.address,
        soldBy: sale.salesPerson.name,
        softPrice: sale.softwarePrice,
        mCharge: sale.monthlyCharge,
        advance: sale.advanceAmount,
        due: sale.dueAmount,
        engineerName: sale.engineer?.name || 'N/A',
        engineerId: sale.engineerId,
        status: sale.status,
        update: sale.remarks,
        deviceNames: sale.devices.map(d => d.name).join(', '),
        deviceIds: sale.devices.map(d => d.id),
      };
    });

    res.json(formattedSales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    customerName,
    businessName,
    phone,
    location,
    address,
    saleDate,
    softwarePrice,
    monthlyCharge,
    advanceAmount,
    installDate,
    engineerName,
    status,
    followupUpdate,
    deviceIds,
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let engineerId = undefined;
      if (engineerName !== undefined) {
        if (engineerName && engineerName.trim() !== "") {
          let engineer = await tx.engineer.findFirst({
            where: { name: { equals: engineerName.trim() } }
          });

          if (!engineer) {
            engineer = await tx.engineer.create({
              data: {
                engineerId: `ENG-${Date.now()}`,
                name: engineerName.trim(),
                phone: '0000000000',
                joiningDate: new Date(),
              }
            });
          }
          engineerId = engineer.id;
        } else {
          engineerId = null; 
        }
      }

      const currentSale = await tx.sale.findUnique({ where: { id } });
      if (!currentSale) throw new Error("Sale not found");

      const finalPrice = softwarePrice !== undefined ? parseFloat(softwarePrice) : currentSale.softwarePrice;
      const finalAdvance = advanceAmount !== undefined ? parseFloat(advanceAmount) : currentSale.advanceAmount;

      // Handle multiple phone numbers
      let formattedPhone = phone;
      if (Array.isArray(phone)) {
        formattedPhone = phone.filter(p => p && p.trim() !== "").join(', ');
      }

      const sale = await tx.sale.update({
        where: { id },
        data: {
          customerName: customerName,
          businessName: businessName,
          phone: formattedPhone,
          location: location,
          address: address,
          saleDate: saleDate ? new Date(saleDate) : undefined,
          softwarePrice: finalPrice,
          monthlyCharge: monthlyCharge !== undefined ? parseFloat(monthlyCharge) : undefined,
          advanceAmount: finalAdvance,
          dueAmount: finalPrice - finalAdvance,
          installationDate: installDate ? new Date(installDate) : undefined,
          engineerId: engineerId !== undefined ? engineerId : undefined,
          status: status,
          remarks: followupUpdate,
          devices: deviceIds ? {
            set: deviceIds.map((deviceId: string) => ({ id: deviceId }))
          } : undefined,
        }
      });

      return sale;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update sale' });
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.sale.delete({ where: { id } });
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete sale' });
  }
};

export const createSale = async (req: Request, res: Response) => {
  const {
    customerName,
    businessName,
    phone,
    location, 
    address,
    saleDate,
    softwarePrice,
    monthlyCharge,
    advanceAmount,
    deviceIds, 
    installDate,
    engineerName,
    soldBy,
    status, 
    followupUpdate,
  } = req.body;

  try {
    const softwarePriceNum = parseFloat(softwarePrice) || 0;
    const advanceAmountNum = parseFloat(advanceAmount) || 0;
    const dueAmount = softwarePriceNum - advanceAmountNum;
    const saleNumber = `SALE-${Date.now()}`;

    // Handle multiple phone numbers
    let formattedPhone = phone;
    if (Array.isArray(phone)) {
      formattedPhone = phone.filter(p => p && p.trim() !== "").join(', ');
    }

    const sale = await prisma.$transaction(async (tx) => {
      let engineerId = null;
      if (engineerName && engineerName.trim() !== "") {
        let engineer = await tx.engineer.findFirst({
          where: { name: { equals: engineerName.trim() } }
        });

        if (!engineer) {
          engineer = await tx.engineer.create({
            data: {
              engineerId: `ENG-${Date.now()}`,
              name: engineerName.trim(),
              phone: '0000000000',
              joiningDate: new Date(),
            }
          });
        }
        engineerId = engineer.id;
      }

      let salesPersonId = null;
      if (soldBy && soldBy.trim() !== "") {
        let salesPerson = await tx.salesPerson.findFirst({
          where: { name: { equals: soldBy.trim() } }
        });

        if (!salesPerson) {
          salesPerson = await tx.salesPerson.create({
            data: {
              salesPersonId: `SP-${Date.now()}`,
              name: soldBy.trim(),
            }
          });
        }
        salesPersonId = salesPerson.id;
      } else {
        let defaultSP = await tx.salesPerson.findFirst({ where: { name: 'Admin' } });
        if (!defaultSP) {
          defaultSP = await tx.salesPerson.create({
            data: { salesPersonId: 'SP-ADMIN', name: 'Admin' }
          });
        }
        salesPersonId = defaultSP.id;
      }

      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          saleDate: saleDate ? new Date(saleDate) : new Date(),
          customerName,
          businessName,
          phone: formattedPhone,
          location,
          address,
          softwarePrice: softwarePriceNum,
          advanceAmount: advanceAmountNum,
          dueAmount: dueAmount,
          monthlyCharge: parseFloat(monthlyCharge) || 0,
          salesPersonId: salesPersonId,
          engineerId: engineerId,
          installationDate: installDate ? new Date(installDate) : null,
          status: status || 'pending',
          remarks: followupUpdate,
          devices: deviceIds ? {
            connect: deviceIds.map((deviceId: string) => ({ id: deviceId }))
          } : undefined,
        },
      });

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
