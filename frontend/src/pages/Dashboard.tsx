import React, { useState, useEffect } from 'react';
import { rfpsAPI, vendorsAPI } from '../api';

interface DashboardProps {
  onSelectRFP: (id: string) => void;
  onCreateRFP: () => void;
  onManageVendors: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectRFP, onCreateRFP, onManageVendors }) => {
  const [rfps, setRfps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      setLoading(true);
      const response = await rfpsAPI.getAll();
      setRfps(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch RFPs:', err);
      setError('Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>RFP Dashboard</h2>
        <div className="dashboard-actions">
          <button onClick={onCreateRFP} className="btn btn-primary">
            + Create RFP
          </button>
          <button onClick={onManageVendors} className="btn btn-secondary">
            👥 Manage Vendors
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading RFPs...</div>
      ) : rfps.length === 0 ? (
        <div className="empty-state">
          <p>No RFPs yet. Create one to get started!</p>
          <button onClick={onCreateRFP} className="btn btn-primary btn-large">
            Create Your First RFP
          </button>
        </div>
      ) : (
        <div className="rfps-grid">
          {rfps.map((rfp) => (
            <div key={rfp.id} className="rfp-card" onClick={() => onSelectRFP(rfp.id)}>
              <h3>{rfp.title}</h3>
              <p className="rfp-budget">💰 Budget: ${rfp.budget?.toLocaleString() || 'N/A'}</p>
              <p className="rfp-delivery">📅 Delivery: {rfp.deliveryDays} days</p>
              <p className="rfp-date">Created: {new Date(rfp.createdAt).toLocaleDateString()}</p>
              <div className="rfp-proposals">
                {rfp.proposals?.length || 0} proposals received
              </div>
              <button className="btn btn-small" onClick={() => onSelectRFP(rfp.id)}>
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
