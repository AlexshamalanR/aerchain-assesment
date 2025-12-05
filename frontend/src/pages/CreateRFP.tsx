import React, { useState } from 'react';
import { rfpsAPI } from '../api';

interface CreateRFPProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CreateRFP: React.FC<CreateRFPProps> = ({ onBack, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Please enter a procurement description');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await rfpsAPI.create(description);
      alert('RFP created successfully!');
      setDescription('');
      onSuccess();
    } catch (err) {
      setError('Failed to create RFP');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-rfp">
      <button onClick={onBack} className="btn btn-secondary">
        ← Back
      </button>

      <div className="create-rfp-form">
        <h2>Create New RFP</h2>
        <p className="help-text">
          Describe what you want to procure in natural language. Our AI will convert it into a structured RFP.
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Procurement Requirement:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
            rows={10}
            className="textarea-large"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-large"
          disabled={loading}
        >
          {loading ? 'Creating RFP...' : 'Create RFP'}
        </button>
      </div>

      <div className="examples-section">
        <h3>Example Inputs:</h3>
        <div className="example">
          <strong>Office Equipment:</strong>
          <p>
            "I need office furniture for 50 people. Budget $100k. Need 50 desks, 50 chairs, 10 meeting tables.
            All should be delivered and assembled within 2 weeks. Payment net 30. Need 2-year warranty on all items."
          </p>
        </div>
        <div className="example">
          <strong>Software Services:</strong>
          <p>
            "Looking for a cloud collaboration platform for 200 users. Budget $50k/year. Must include video
            conferencing, file sharing, and project management. Need dedicated support. Annual contract with
            net 30 payment terms."
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRFP;
