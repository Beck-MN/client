import React, { useState, useEffect } from 'react';
import './App.css';

interface Thought {
  id: number;
  content: string;
  type: 'thought' | 'complaint';
  severity?: number;
  feeling: string;
  createdAt: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const FEELINGS = [
  '😊 Happy',
  '😢 Sad',
  '😡 Angry',
  '😌 Calm',
  '🤔 Thoughtful',
  '😰 Anxious',
  '🥱 Tired',
  '🤩 Excited'
];

function App() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [content, setContent] = useState('');
  const [type, setType] = useState<'thought' | 'complaint'>('thought');
  const [severity, setSeverity] = useState<number>(1);
  const [feeling, setFeeling] = useState<string>(FEELINGS[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThoughts();
  }, []);

  const fetchThoughts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/thoughts`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setThoughts(data.thoughts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      setError('Failed to load thoughts');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const thoughtData = {
        content,
        type,
        feeling,
        ...(type === 'complaint' && { severity })
      };

      const response = await fetch(`${API_URL}/api/thoughts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thoughtData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setContent('');
      setSeverity(1);
      fetchThoughts();
    } catch (error) {
      console.error('Error submitting thought:', error);
      setError('Failed to submit thought');
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
        <h1>Jane's Daily Thoughts ❤️</h1>
      </header>

      <main>
        <section className="form-section">
          <h2>Share Your Thoughts</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Type:
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'thought' | 'complaint')}
                >
                  <option value="thought">Thought</option>
                  <option value="complaint">Complaint</option>
                </select>
              </label>
            </div>

            {type === 'complaint' && (
              <div className="form-group">
                <label>
                  Severity:
                  <div className="severity-selector">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`severity-button ${severity === level ? 'active' : ''}`}
                        onClick={() => setSeverity(level)}
                      >
                        {'⚡'.repeat(level)}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            )}

            <div className="form-group">
              <label>
                Feeling:
                <select
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="feeling-selector"
                >
                  {FEELINGS.map((feel) => (
                    <option key={feel} value={feel}>
                      {feel}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? (I love you and miss you)"
                rows={4}
                required
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </section>

        <section className="thoughts-section">
          <h2>Previous Entries</h2>
          <div className="thoughts-list">
            {thoughts.length === 0 ? (
              <p>No thoughts yet. Be the first to share!</p>
            ) : (
              thoughts.map((thought) => (
                <div key={thought.id} className={`thought-card ${thought.type}`}>
                  <div className="thought-header">
                    <span className="thought-feeling">{thought.feeling}</span>
                    {thought.type === 'complaint' && (
                      <span className="thought-severity">{'⚡'.repeat(thought.severity || 0)}</span>
                    )}
                  </div>
                  <p className="thought-content">{thought.content}</p>
                  <div className="thought-meta">
                    <span className="thought-type">{thought.type}</span>
                    <span className="thought-date">
                      {new Date(thought.createdAt).toLocaleDateString()}
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
