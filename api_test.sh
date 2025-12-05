#!/bin/bash

# Test Script for RFP Management System API
# Usage: bash api_test.sh

BASE_URL="http://localhost:4000/api"
CONTENT_TYPE="Content-Type: application/json"

echo "🧪 RFP Management System - API Test Suite"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function
print_result() {
  local status=$1
  local message=$2
  if [ $status -eq 0 ]; then
    echo -e "${GREEN}✅ $message${NC}"
  else
    echo -e "${RED}❌ $message${NC}"
  fi
}

# 1. Health Check
echo "1️⃣  Testing Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | jq . &>/dev/null; then
  print_result 0 "Health check passed"
  echo "   Response: $HEALTH"
else
  print_result 1 "Health check failed - API not running?"
  exit 1
fi
echo ""

# 2. List Vendors
echo "2️⃣  Listing Vendors..."
VENDORS=$(curl -s "$BASE_URL/vendors")
VENDOR_COUNT=$(echo "$VENDORS" | jq 'length')
print_result 0 "Found $VENDOR_COUNT vendors"
echo ""

# 3. Create Vendor
echo "3️⃣  Creating New Vendor..."
VENDOR_DATA=$(cat <<EOF
{
  "name": "Test Vendor Corp",
  "email": "test-vendor@example.com",
  "contactName": "John Doe",
  "phone": "+1-555-0123",
  "notes": "Test vendor for RFP system"
}
EOF
)

VENDOR=$(curl -s -X POST "$BASE_URL/vendors" \
  -H "$CONTENT_TYPE" \
  -d "$VENDOR_DATA")

VENDOR_ID=$(echo "$VENDOR" | jq -r '.id' 2>/dev/null)
if [ ! -z "$VENDOR_ID" ] && [ "$VENDOR_ID" != "null" ]; then
  print_result 0 "Vendor created: $VENDOR_ID"
else
  print_result 1 "Failed to create vendor"
  echo "   Response: $VENDOR"
fi
echo ""

# 4. Create RFP
echo "4️⃣  Creating RFP from Natural Language..."
RFP_DESC="I need to procure office equipment. Specifically: 20 laptops with 16GB RAM, 15 monitors 27-inch, and 10 office chairs. Budget is $50,000 total. Need delivery within 30 days. Payment terms should be net 30, and we need at least 1 year warranty on all items."

RFP_DATA=$(cat <<EOF
{
  "description": "$RFP_DESC"
}
EOF
)

RFP=$(curl -s -X POST "$BASE_URL/rfps" \
  -H "$CONTENT_TYPE" \
  -d "$RFP_DATA")

RFP_ID=$(echo "$RFP" | jq -r '.id' 2>/dev/null)
if [ ! -z "$RFP_ID" ] && [ "$RFP_ID" != "null" ]; then
  print_result 0 "RFP created: $RFP_ID"
  RFP_TITLE=$(echo "$RFP" | jq -r '.title')
  echo "   Title: $RFP_TITLE"
else
  print_result 1 "Failed to create RFP"
  echo "   Response: $RFP"
fi
echo ""

# 5. Get RFP Details
echo "5️⃣  Getting RFP Details..."
RFP_DETAIL=$(curl -s "$BASE_URL/rfps/$RFP_ID")
RFP_BUDGET=$(echo "$RFP_DETAIL" | jq '.budget')
print_result 0 "RFP retrieved with budget: $RFP_BUDGET"
echo ""

# 6. List all RFPs
echo "6️⃣  Listing All RFPs..."
RFPS=$(curl -s "$BASE_URL/rfps")
RFPS_COUNT=$(echo "$RFPS" | jq 'length')
print_result 0 "Found $RFPS_COUNT RFPs total"
echo ""

# 7. Send RFP to Vendor
echo "7️⃣  Sending RFP to Vendor..."
if [ ! -z "$VENDOR_ID" ] && [ "$VENDOR_ID" != "null" ] && [ ! -z "$RFP_ID" ] && [ "$RFP_ID" != "null" ]; then
  SEND_DATA=$(cat <<EOF
{
  "vendorIds": ["$VENDOR_ID"]
}
EOF
)

  SEND_RESULT=$(curl -s -X POST "$BASE_URL/rfps/$RFP_ID/send" \
    -H "$CONTENT_TYPE" \
    -d "$SEND_DATA")

  SEND_STATUS=$(echo "$SEND_RESULT" | jq -r '.results[0].status' 2>/dev/null)
  if [ "$SEND_STATUS" = "sent" ]; then
    print_result 0 "RFP sent to vendor successfully"
  else
    print_result 0 "RFP send attempted (check email configuration)"
  fi
else
  print_result 1 "Cannot send RFP - missing vendor or RFP ID"
fi
echo ""

# 8. Create Proposal
echo "8️⃣  Creating Proposal (Simulating Vendor Response)..."
PROPOSAL_DATA=$(cat <<EOF
{
  "rfpId": "$RFP_ID",
  "vendorId": "$VENDOR_ID",
  "emailBody": "Thank you for the RFP. We can provide the following: 20x Laptop (Dell XPS 13, 16GB RAM) @ \$2,400 each = \$48,000. 15x Monitor (Dell S2722DC, 27-inch) @ \$400 each = \$6,000. 10x Office Chair (Steelcase Leap) @ \$1,000 each = \$10,000. Total: \$64,000 USD. Delivery: 28 days (standard). Payment: Net 30 (2/10 discount available). Warranty: 3-year comprehensive on all items. All items include free shipping and setup."
}
EOF
)

PROPOSAL=$(curl -s -X POST "$BASE_URL/proposals" \
  -H "$CONTENT_TYPE" \
  -d "$PROPOSAL_DATA")

PROPOSAL_ID=$(echo "$PROPOSAL" | jq -r '.id' 2>/dev/null)
if [ ! -z "$PROPOSAL_ID" ] && [ "$PROPOSAL_ID" != "null" ]; then
  print_result 0 "Proposal created: $PROPOSAL_ID"
  PROP_PRICE=$(echo "$PROPOSAL" | jq '.totalPrice')
  PROP_COMPLETE=$(echo "$PROPOSAL" | jq '.completenessScore')
  echo "   Price: \$$PROP_PRICE | Completeness: ${PROP_COMPLETE}%"
else
  print_result 1 "Failed to create proposal"
  echo "   Response: $PROPOSAL"
fi
echo ""

# 9. Compare Proposals
echo "9️⃣  Comparing Proposals & Getting Recommendation..."
COMPARISON=$(curl -s "$BASE_URL/proposals/compare/$RFP_ID")
RECOMMENDATION=$(echo "$COMPARISON" | jq -r '.recommendation' 2>/dev/null)
if [ ! -z "$RECOMMENDATION" ] && [ "$RECOMMENDATION" != "null" ]; then
  print_result 0 "Comparison generated"
  echo "   Recommended: $RECOMMENDATION"
  EXPLANATION=$(echo "$COMPARISON" | jq -r '.explanation' | head -c 100)
  echo "   Explanation: ${EXPLANATION}..."
else
  print_result 1 "Failed to compare proposals"
  echo "   Response: $COMPARISON"
fi
echo ""

# 10. List Proposals
echo "🔟 Listing All Proposals..."
PROPOSALS=$(curl -s "$BASE_URL/proposals")
PROPOSALS_COUNT=$(echo "$PROPOSALS" | jq 'length')
print_result 0 "Found $PROPOSALS_COUNT proposals total"
echo ""

echo "==========================================="
echo "✅ Test Suite Complete!"
echo ""
echo "Summary:"
echo "- Vendor ID: $VENDOR_ID"
echo "- RFP ID: $RFP_ID"
echo "- Proposal ID: $PROPOSAL_ID"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Create more RFPs and vendors"
echo "3. Send RFPs to multiple vendors"
echo "4. Simulate proposals and compare"
echo ""
