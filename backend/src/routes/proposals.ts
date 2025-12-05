import express, { Router, Request, Response } from "express";
import { prisma } from "../db";
import { parseVendorProposal, compareProposalsAndRecommend } from "../ai";

const router = Router();

// GET /api/proposals - List all proposals
router.get("/", async (req: Request, res: Response) => {
  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        rfp: true,
        vendor: true,
      },
      orderBy: { receivedAt: "desc" },
    });
    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// GET /api/proposals/:id - Get single proposal
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        rfp: true,
        vendor: true,
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    res.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    res.status(500).json({ error: "Failed to fetch proposal" });
  }
});

// POST /api/proposals - Manually add/parse proposal
router.post("/", async (req: Request, res: Response) => {
  try {
    const { rfpId, vendorId, emailBody, attachmentText } = req.body;

    if (!rfpId || !vendorId || !emailBody) {
      return res
        .status(400)
        .json({
          error:
            "rfpId, vendorId, and emailBody are required",
        });
    }

    // Check if proposal already exists for this RFP-Vendor pair
    const existing = await prisma.proposal.findUnique({
      where: {
        rfpId_vendorId: { rfpId, vendorId },
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "Proposal already exists for this RFP-Vendor pair" });
    }

    console.log("🤖 Parsing vendor proposal with AI...");
    const parsed = await parseVendorProposal(emailBody, attachmentText);

    console.log("💾 Saving proposal to database...");
    const proposal = await prisma.proposal.create({
      data: {
        rfpId,
        vendorId,
        rawEmailBody: emailBody,
        parsedJson: parsed,
        totalPrice: parsed.totalPrice,
        currency: parsed.currency,
        deliveryDays: parsed.deliveryDays,
        paymentTerms: parsed.paymentTerms,
        warrantyMonths: parsed.warrantyMonths,
        completenessScore: parsed.completenessPercentage,
      },
      include: {
        rfp: true,
        vendor: true,
      },
    });

    res.status(201).json(proposal);
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ error: "Failed to create proposal" });
  }
});

// GET /api/proposals/compare/:rfpId - Compare all proposals for an RFP
router.get("/compare/:rfpId", async (req: Request, res: Response) => {
  try {
    const { rfpId } = req.params;

    const rfp = await prisma.rFP.findUnique({
      where: { id: rfpId },
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

    if (rfp.proposals.length === 0) {
      return res
        .status(400)
        .json({ error: "No proposals for this RFP" });
    }

    console.log("🤖 Comparing proposals with AI...");
    const result = await compareProposalsAndRecommend(
      rfp.structuredJson as any,
      rfp.proposals.map((p) => ({
        vendorName: p.vendor.name,
        vendorEmail: p.vendor.email,
        data: p.parsedJson as any,
      }))
    );

    res.json(result);
  } catch (error) {
    console.error("Error comparing proposals:", error);
    res.status(500).json({ error: "Failed to compare proposals" });
  }
});

export default router;
