import { OpenAI } from "openai";
import { config } from "./config";

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

// Define structured RFP schema for JSON response
interface RFPItem {
  name: string;
  quantity: number;
  specifications?: string;
  unitPrice?: number;
  priority?: string;
}

interface StructuredRFP {
  title: string;
  description: string;
  items: RFPItem[];
  budget: number;
  currency: string;
  deliveryDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  notes: string;
}

interface VendorProposalData {
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totalPrice: number;
  currency: string;
  deliveryDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  notes: string;
  completenessPercentage: number;
}

interface ComparisonResult {
  ranking: Array<{
    vendorName: string;
    vendorEmail: string;
    totalPrice: number;
    priceScore: number;
    completenessScore: number;
    deliveryScore: number;
    termsScore: number;
    finalScore: number;
  }>;
  recommendation: string;
  explanation: string;
}

/**
 * Parse natural language RFP description into structured format
 */
export async function parseRFPFromNaturalLanguage(description: string): Promise<StructuredRFP> {
  const systemPrompt = `You are an expert procurement specialist. Convert natural language procurement requirements into a structured JSON format.
  
  Return ONLY a valid JSON object (no markdown, no extra text) matching this schema:
  {
    "title": "string - concise RFP title",
    "description": "string - full description",
    "items": [
      {
        "name": "string",
        "quantity": number,
        "specifications": "string",
        "unitPrice": number or null,
        "priority": "high/medium/low"
      }
    ],
    "budget": number,
    "currency": "string - e.g. USD",
    "deliveryDays": number,
    "paymentTerms": "string - e.g. net 30",
    "warrantyMonths": number,
    "notes": "string"
  }
  
  Be precise with numbers and units. Extract all requirements mentioned.`;

  const userPrompt = `Parse this procurement requirement:\n\n${description}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "{}";
  
  // Clean response: remove markdown code blocks if present
  const jsonString = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const parsed: StructuredRFP = JSON.parse(jsonString);
  return parsed;
}

/**
 * Parse vendor response email and extract proposal details
 */
export async function parseVendorProposal(
  emailBody: string,
  attachmentText?: string
): Promise<VendorProposalData> {
  const systemPrompt = `You are an expert at parsing vendor proposals and quotations.
  Extract pricing, delivery, payment terms, warranty, and line items from vendor responses.
  
  Return ONLY a valid JSON object (no markdown, no extra text) matching this schema:
  {
    "items": [
      {
        "name": "string",
        "quantity": number,
        "unitPrice": number,
        "lineTotal": number
      }
    ],
    "totalPrice": number,
    "currency": "string",
    "deliveryDays": number,
    "paymentTerms": "string",
    "warrantyMonths": number,
    "notes": "string - any exclusions, caveats, special terms",
    "completenessPercentage": number - estimate 0-100 of how complete the response is
  }
  
  For missing values, use sensible defaults or null. Be conservative with estimates.`;

  const emailContent = attachmentText 
    ? `EMAIL BODY:\n${emailBody}\n\nATTACHMENT TEXT:\n${attachmentText}`
    : emailBody;

  const userPrompt = `Parse this vendor proposal:\n\n${emailContent}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content || "{}";
  
  const jsonString = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const parsed: VendorProposalData = JSON.parse(jsonString);
  return parsed;
}

/**
 * Compare proposals and generate recommendation
 */
export async function compareProposalsAndRecommend(
  rfp: StructuredRFP,
  proposals: Array<{
    vendorName: string;
    vendorEmail: string;
    data: VendorProposalData;
  }>
): Promise<ComparisonResult> {
  // Calculate scores
  const scoredProposals = proposals.map((proposal) => {
    // Price score: inverse normalized (lower is better)
    const prices = proposals.map((p) => p.data.totalPrice);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const priceScore =
      ((maxPrice - proposal.data.totalPrice) / priceRange) * 100;

    // Completeness: 0-100 from proposal
    const completenessScore = proposal.data.completenessPercentage || 60;

    // Delivery score: bonus for meeting deadline
    const deliveryScore =
      proposal.data.deliveryDays <= rfp.deliveryDays ? 100 : 50;

    // Terms score: warranty + payment terms
    const termsScore =
      (proposal.data.warrantyMonths >= rfp.warrantyMonths ? 50 : 25) +
      (proposal.data.paymentTerms.toLowerCase().includes("net 30") ? 50 : 25);

    // Weighted final score
    const finalScore =
      priceScore * 0.4 +
      completenessScore * 0.3 +
      deliveryScore * 0.15 +
      termsScore * 0.15;

    return {
      vendorName: proposal.vendorName,
      vendorEmail: proposal.vendorEmail,
      totalPrice: proposal.data.totalPrice,
      priceScore,
      completenessScore,
      deliveryScore,
      termsScore,
      finalScore,
    };
  });

  // Sort by final score
  scoredProposals.sort((a, b) => b.finalScore - a.finalScore);
  const topVendor = scoredProposals[0];

  // Generate AI explanation
  const comparisonContext = `
RFP Summary:
- Budget: ${rfp.budget} ${rfp.currency}
- Delivery: ${rfp.deliveryDays} days
- Warranty: ${rfp.warrantyMonths} months

Proposals Evaluated:
${scoredProposals
  .map(
    (p) => `
- ${p.vendorName} (${p.vendorEmail})
  Total: ${p.totalPrice} ${proposals[0].data.currency}
  Price Score: ${p.priceScore.toFixed(1)}/100
  Completeness: ${p.completenessScore.toFixed(1)}/100
  Delivery: ${p.deliveryScore.toFixed(1)}/100
  Terms: ${p.termsScore.toFixed(1)}/100
  Final Score: ${p.finalScore.toFixed(1)}/100`
  )
  .join("\n")}

Recommendation: ${topVendor.vendorName}
`;

  const systemPrompt = `You are a procurement expert. Provide a concise, professional recommendation summary.
Focus on why the top-ranked vendor should be selected. Mention any trade-offs or considerations.`;

  const userPrompt = `${comparisonContext}\n\nProvide a 2-3 sentence executive summary explaining why ${topVendor.vendorName} is the recommended choice.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 200,
  });

  const explanation = response.choices[0]?.message?.content || "See scoring above.";

  return {
    ranking: scoredProposals,
    recommendation: `${topVendor.vendorName} (${topVendor.vendorEmail})`,
    explanation,
  };
}
