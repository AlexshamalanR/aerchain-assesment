import express, { Router, Request, Response } from "express";
import { prisma } from "../db";

const router = Router();

// GET /api/vendors - List all vendors
router.get("/", async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// GET /api/vendors/:id - Get single vendor
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    res.json(vendor);
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ error: "Failed to fetch vendor" });
  }
});

// POST /api/vendors - Create new vendor
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, contactName, phone, notes } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ error: "Name and email are required" });
    }

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        contactName: contactName || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
    });

    res.status(201).json(vendor);
  } catch (error: any) {
    console.error("Error creating vendor:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create vendor" });
  }
});

// PUT /api/vendors/:id - Update vendor
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, contactName, phone, notes } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        contactName: contactName || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      },
    });

    res.json(vendor);
  } catch (error: any) {
    console.error("Error updating vendor:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

// DELETE /api/vendors/:id - Delete vendor
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.vendor.delete({
      where: { id },
    });

    res.json({ message: "Vendor deleted" });
  } catch (error: any) {
    console.error("Error deleting vendor:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(500).json({ error: "Failed to delete vendor" });
  }
});

export default router;
