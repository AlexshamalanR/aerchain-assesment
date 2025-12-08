import express, { Router, Request, Response } from "express";
import { prisma } from "../db";
import { parseRFPFromNaturalLanguage } from "../ai";
import { sendRFPEmail } from "../email";

const router = Router();

// GET /api/rfps - List all RFPs
router.get("/", async (req: Request, res: Response) => {
  try {
    const rfps = await prisma.rFP.findMany({
      include: {
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(rfps);
  } catch (error) {
    console.error("Error fetching RFPs:", error);
    res.status(500).json({ error: "Failed to fetch RFPs" });
  }
});

// GET /api/rfps/:id - Get single RFP with proposals
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rfp = await prisma.rFP.findUnique({
      where: { id },
      include: {
        proposals: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    res.json(rfp);
  } catch (error) {
    console.error("Error fetching RFP:", error);
    res.status(500).json({ error: "Failed to fetch RFP" });
  }
});

// POST /api/rfps - Create new RFP from natural language
router.post("/", async (req: Request, res: Response) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    console.log("🤖 Parsing RFP from natural language...");
    const structured = await parseRFPFromNaturalLanguage(description);

    console.log("💾 Saving RFP to database...");
    const rfp = await prisma.rFP.create({
      data: {
        title: structured.title,
        descriptionRaw: description,
        structuredJson: JSON.parse(JSON.stringify(structured)),
        budget: structured.budget,
        currency: structured.currency,
        deliveryDays: structured.deliveryDays,
        paymentTerms: structured.paymentTerms,
        warrantyMonths: structured.warrantyMonths,
      },
    });

    res.status(201).json(rfp);
  } catch (error) {
    console.error("Error creating RFP:", error);
    res.status(500).json({ error: "Failed to create RFP" });
  }
});

// POST /api/rfps/:id/send - Send RFP to selected vendors
router.post("/:id/send", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { vendorIds } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds)) {
      return res
        .status(400)
        .json({ error: "vendorIds array is required" });
    }

    const rfp = await prisma.rFP.findUnique({
      where: { id },
    });

    if (!rfp) {
      return res.status(404).json({ error: "RFP not found" });
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
    });

    const results: any[] = [];

    for (const vendor of vendors) {
      try {
        // Prepare RFP content
        const structured = rfp.structuredJson as any;
        let rfpContent = `Title: ${rfp.title}\n\n`;
        rfpContent += `Budget: ${rfp.budget} ${rfp.currency}\n`;
        rfpContent += `Delivery Required: ${rfp.deliveryDays} days\n`;
        rfpContent += `Payment Terms: ${rfp.paymentTerms}\n`;
        rfpContent += `Warranty: ${rfp.warrantyMonths} months\n\n`;

        if (structured.items && Array.isArray(structured.items)) {
          rfpContent += `Items Required:\n`;
          structured.items.forEach((item: any, idx: number) => {
            rfpContent += `${idx + 1}. ${item.name} (Qty: ${item.quantity})`;
            if (item.specifications) {
              rfpContent += ` - ${item.specifications}`;
            }
            rfpContent += `\n`;
          });
        }

        await sendRFPEmail({
          vendorEmail: vendor.email,
          vendorName: vendor.name,
          rfpTitle: rfp.title,
          rfpContent,
          rfpId: rfp.id,
        });

        // Log email
        await prisma.emailLog.create({
          data: {
            rfpId: rfp.id,
            vendorEmail: vendor.email,
            subject: `RFP: ${rfp.title}`,
            status: "sent",
          },
        });

        results.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          status: "sent",
        });
      } catch (vendorError) {
        console.error(`Failed to send RFP to ${vendor.email}:`, vendorError);
        results.push({
          vendorId: vendor.id,
          vendorName: vendor.name,
          status: "failed",
          error: String(vendorError),
        });
      }
    }

    res.json({
      rfpId: rfp.id,
      totalVendors: vendors.length,
      results,
    });
  } catch (error) {
    console.error("Error sending RFP:", error);
    res.status(500).json({ error: "Failed to send RFP" });
  }
});

export default router;
