import React, { useState, useEffect } from 'react';
import './App.css';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  mood: string;
  createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MOODS = [
  '😊 Happy',
  '😢 Sad',
  '😡 Angry',
  '😌 Calm',
  '🤔 Thoughtful',
  '😰 Anxious',
  '🥱 Tired',
  '🤩 Excited'
];

const PRIORITIES = {
  low: '😌 Low',
  medium: '😟 Medium',
  high: '😡 High'
};

function App() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [mood, setMood] = useState<string>(MOODS[0]);
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
        mood,
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
      setMood(MOODS[0]);
      fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint');
    }
  };

  const getPriorityEmoji = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low':
        return '😌';
      case 'medium':
        return '😟';
      case 'high':
        return '😡';
      default:
        return '😐';
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
        <h1>Janes Thought Portal ❤️</h1>
      </header>

      <main>
        <section className="form-section">
          <h2>Share Your Thoughts 💭</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Title:
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                How are you feeling? 🌈
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="mood-selector"
                >
                  {MOODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Severity Level:
                <div className="severity-buttons">
                  {Object.entries(PRIORITIES).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      className={`severity-button ${priority === key ? 'active' : ''}`}
                      onClick={() => setPriority(key as 'low' | 'medium' | 'high')}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share Your thoughts!(I Love You ❤️ )"
                  rows={4}
                  required
                />
              </label>
            </div>
            <button type="submit">Share 💝</button>
          </form>
        </section>

        <section className="complaints-section">
          <h2>Previous Thoughts 📝</h2>
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No thoughts shared yet. Be the first! 🌟</p>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint._id} className={`complaint-card ${complaint.priority}`}>
                  <div className="complaint-header">
                    <h3>{complaint.title}</h3>
                    <span className={`priority ${complaint.priority}`}>
                      {getPriorityEmoji(complaint.priority)}
                    </span>
                  </div>
                  <div className="mood-indicator">
                    {complaint.mood || '😊 Happy'}
                  </div>
                  <p className="complaint-description">{complaint.description}</p>
                  <div className="complaint-meta">
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
