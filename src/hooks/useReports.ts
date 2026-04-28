import { useState, useCallback } from 'react';
import { Report } from '../types';
import { DB_KEY, API_BASE } from '../utils';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>(() => {
    try {
      const stored = localStorage.getItem(DB_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [myTokens, setMyTokens] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('speakup_tokens');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [upvoted, setUpvoted] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('speakup_upvoted');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const loadReports = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/reports`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setReports(data);
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (error) {
      try {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
          setReports(JSON.parse(stored));
        }
      } catch (e) {
        // Fallback already handled by initial state
      }
    }
  }, []);

  const addReport = useCallback((report: Report) => {
    setReports(prev => {
      const newReports = [report, ...prev];
      localStorage.setItem(DB_KEY, JSON.stringify(newReports));
      return newReports;
    });

    setMyTokens(prev => {
      const newTokens = [...prev, report.token];
      localStorage.setItem('speakup_tokens', JSON.stringify(newTokens));
      return newTokens;
    });
  }, []);

  const toggleUpvote = useCallback(
    async (id: string, deviceToken: string): Promise<boolean> => {
      const isCurrentlyUpvoted = upvoted.includes(id);
      const newIsUpvoted = !isCurrentlyUpvoted;

      const updateLocalState = () => {
        setUpvoted(prev => {
          const newUpvoted = newIsUpvoted
            ? [...prev, id]
            : prev.filter(v => v !== id);
          localStorage.setItem('speakup_upvoted', JSON.stringify(newUpvoted));
          return newUpvoted;
        });

        setReports(prev => {
          const newReports = prev.map(r => {
            if (r.id === id) {
              return { ...r, upvotes: r.upvotes + (newIsUpvoted ? 1 : -1) };
            }
            return r;
          });
          localStorage.setItem(DB_KEY, JSON.stringify(newReports));
          return newReports;
        });
      };

      try {
        const response = await fetch(`${API_BASE}/api/reports/${id}/upvote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: deviceToken }),
        });

        if (!response.ok) {
          throw new Error('Network error');
        }

        updateLocalState();
        return newIsUpvoted;
      } catch (error) {
        updateLocalState();
        return newIsUpvoted;
      }
    },
    [upvoted]
  );

  const addComment = useCallback(
    async (id: string, text: string): Promise<void> => {
      const newComment = { text, time: 'Just now' };

      const updateLocalState = () => {
        setReports(prev => {
          const newReports = prev.map(r => {
            if (r.id === id) {
              return { ...r, comments: [...r.comments, newComment] };
            }
            return r;
          });
          localStorage.setItem(DB_KEY, JSON.stringify(newReports));
          return newReports;
        });
      };

      try {
        await fetch(`${API_BASE}/api/reports/${id}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComment),
        });
        updateLocalState();
      } catch (error) {
        updateLocalState();
      }
    },
    []
  );

  return {
    reports,
    myTokens,
    upvoted,
    loadReports,
    addReport,
    toggleUpvote,
    addComment,
  };
};
