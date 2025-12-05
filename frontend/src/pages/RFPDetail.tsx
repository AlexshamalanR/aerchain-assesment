import React, { useState, useEffect } from 'react';
import { rfpsAPI, vendorsAPI, proposalsAPI } from '../api';

interface RFPDetailProps {
  rfpId: string;
  onBack: () => void;
}

const RFPDetail: React.FC<RFPDetailProps> = ({ rfpId, onBack }) => {
  const [rfp, setRfp] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [rfpId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rfpRes, vendorsRes] = await Promise.all([
        rfpsAPI.getById(rfpId),
        vendorsAPI.getAll(),
      ]);
      setRfp(rfpRes.data);
      setVendors(vendorsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }
    try {
      setSending(true);
      await rfpsAPI.send(rfpId, selectedVendors);
      alert('RFP sent successfully!');
      setSelectedVendors([]);
    } catch (err) {
      alert('Failed to send RFP');
    } finally {
      setSending(false);
    }
  };

  const handleCompare = async () => {
    try {
      const res = await proposalsAPI.compare(rfpId);
      setComparison(res.data);
    } catch (err) {
      alert('No proposals to compare yet');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!rfp) return <div className="error-message">RFP not found</div>;

  return (
    <div className="rfp-detail">
      <button onClick={onBack} className="btn btn-secondary">
        ← Back
      </button>

      <div className="rfp-header">
        <h2>{rfp.title}</h2>
        <p className="rfp-description">{rfp.descriptionRaw}</p>
      </div>

      <div className="rfp-details-grid">
        <div className="detail-box">
          <label>Budget</label>
          <p>${rfp.budget?.toLocaleString()}</p>
        </div>
        <div className="detail-box">
          <label>Delivery</label>
          <p>{rfp.deliveryDays} days</p>
        </div>
        <div className="detail-box">
          <label>Payment Terms</label>
          <p>{rfp.paymentTerms}</p>
        </div>
        <div className="detail-box">
          <label>Warranty</label>
          <p>{rfp.warrantyMonths} months</p>
        </div>
      </div>

      {rfp.structuredJson?.items && (
        <div className="rfp-items">
          <h3>Required Items</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Specs</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {rfp.structuredJson.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.specifications || '-'}</td>
                  <td>{item.priority || 'normal'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="vendors-section">
        <h3>Select Vendors to Send RFP</h3>
        <div className="vendors-list">
          {vendors.map((vendor) => (
            <label key={vendor.id} className="vendor-checkbox">
              <input
                type="checkbox"
                checked={selectedVendors.includes(vendor.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedVendors([...selectedVendors, vendor.id]);
                  } else {
                    setSelectedVendors(selectedVendors.filter((v) => v !== vendor.id));
                  }
                }}
              />
              <span>{vendor.name} ({vendor.email})</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSendRFP}
          className="btn btn-primary"
          disabled={sending || selectedVendors.length === 0}
        >
          {sending ? 'Sending...' : 'Send RFP to Selected Vendors'}
        </button>
      </div>

      <div className="proposals-section">
        <h3>Proposals Received ({rfp.proposals?.length || 0})</h3>
        {rfp.proposals?.length > 0 && (
          <>
            <div className="proposals-list">
              {rfp.proposals.map((proposal: any) => (
                <div key={proposal.id} className="proposal-item">
                  <h4>{proposal.vendor.name}</h4>
                  <p>Price: ${proposal.totalPrice?.toLocaleString()}</p>
                  <p>Delivery: {proposal.deliveryDays} days</p>
                  <p>Completeness: {proposal.completenessScore}%</p>
                </div>
              ))}
            </div>
            <button onClick={handleCompare} className="btn btn-primary">
              Compare Proposals
            </button>
          </>
        )}
      </div>

      {comparison && (
        <div className="comparison-result">
          <h3>Proposal Comparison & Recommendation</h3>
          <div className="recommendation">
            <p className="rec-header">Recommended: {comparison.recommendation}</p>
            <p>{comparison.explanation}</p>
          </div>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Price</th>
                <th>Price Score</th>
                <th>Completeness</th>
                <th>Delivery</th>
                <th>Terms</th>
                <th>Final Score</th>
              </tr>
            </thead>
            <tbody>
              {comparison.ranking.map((item: any, idx: number) => (
                <tr key={idx} className={idx === 0 ? 'highlighted' : ''}>
                  <td>{item.vendorName}</td>
                  <td>${item.totalPrice?.toLocaleString()}</td>
                  <td>{item.priceScore.toFixed(1)}</td>
                  <td>{item.completenessScore.toFixed(1)}</td>
                  <td>{item.deliveryScore.toFixed(1)}</td>
                  <td>{item.termsScore.toFixed(1)}</td>
                  <td className="final-score">{item.finalScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RFPDetail;
