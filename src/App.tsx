import React, { useState, useEffect } from 'react';
import './App.css';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/api/complaints`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setComplaints(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to load complaints');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      const complaintData = {
        title,
        description,
        priority,
        status: 'pending'
      };

      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTitle('');
      setDescription('');
      setPriority('low');
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint');
    }
  };

  if (loading) {
    return <div className="app-container">Loading...</div>;
  }

  if (error) {
    return <div className="app-container error">{error}</div>;
  }

  return (
    <div className="app-container">
      <header>
        <h1>Complaint Portal</h1>
      </header>

      <main>
        <section className="form-section">
          <h2>Submit a Complaint</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter complaint title"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Priority:
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your complaint"
                  rows={4}
                  required
                />
              </label>
            </div>
            <button type="submit">Submit Complaint</button>
          </form>
        </section>

        <section className="complaints-section">
          <h2>All Complaints</h2>
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints yet.</p>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint._id} className={`complaint-card ${complaint.priority}`}>
                  <div className="complaint-header">
                    <h3>{complaint.title}</h3>
                    <span className={`status ${complaint.status}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="complaint-description">{complaint.description}</p>
                  <div className="complaint-meta">
                    <span className={`priority ${complaint.priority}`}>
                      Priority: {complaint.priority}
                    </span>
                    <span className="date">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
