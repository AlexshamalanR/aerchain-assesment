import React, { useState, useEffect } from 'react';
import { vendorsAPI } from '../api';

interface VendorsProps {
  onBack: () => void;
}

const Vendors: React.FC<VendorsProps> = ({ onBack }) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactName: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await vendorsAPI.getAll();
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorsAPI.create(formData);
      setFormData({
        name: '',
        email: '',
        contactName: '',
        phone: '',
        notes: '',
      });
      setShowForm(false);
      alert('Vendor added successfully!');
      fetchVendors();
    } catch (err: any) {
      alert(`Failed to add vendor: ${err.response?.data?.error || 'Unknown error'}`);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorsAPI.delete(id);
        alert('Vendor deleted');
        fetchVendors();
      } catch (err) {
        alert('Failed to delete vendor');
      }
    }
  };

  return (
    <div className="vendors-page">
      <button onClick={onBack} className="btn btn-secondary">
        ← Back
      </button>

      <h2>Vendor Management</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="btn btn-primary"
      >
        {showForm ? 'Cancel' : '+ Add New Vendor'}
      </button>

      {showForm && (
        <form onSubmit={handleAddVendor} className="vendor-form">
          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., TechCorp Solutions"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@vendor.com"
            />
          </div>

          <div className="form-group">
            <label>Contact Name</label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="John Smith"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0101"
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Reliable vendor, fast delivery..."
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Add Vendor
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="empty-state">
          <p>No vendors yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="vendors-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.contactName || '-'}</td>
                  <td>{vendor.phone || '-'}</td>
                  <td>{vendor.notes || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vendors;
