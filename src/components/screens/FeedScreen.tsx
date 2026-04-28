import React, { useState, useRef } from 'react';
import { Report, Sector, SortOption, ToastType } from '../../types';
import { getSectorStyle, getStatusColor, timeAgo } from '../../utils';

interface FeedScreenProps {
  reports: Report[];
  upvoted: string[];
  onUpvote: (id: string) => Promise<boolean>;
  onComment: (id: string, text: string) => Promise<void>;
  showToast: (msg: string, type?: ToastType) => void;
}

const ALL_SECTORS: ('All' | Sector)[] = [
  'All',
  'Education',
  'Healthcare',
  'BBMP/Infra',
  'Police/Other',
];

const FeedScreen: React.FC<FeedScreenProps> = ({
  reports,
  upvoted,
  onUpvote,
  onComment,
  showToast,
}) => {
  const [filter, setFilter] = useState<'All' | Sector>('All');
  const [sort, setSort] = useState<SortOption>('newest');
  const [openComments, setOpenComments] = useState<string[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const touchStartX = useRef<number>(0);

  const filteredReports = reports
    .filter((r) => filter === 'All' || r.sector === filter)
    .sort((a, b) => {
      if (sort === 'newest') return b.timestamp - a.timestamp;
      if (sort === 'upvotes') return b.upvotes - a.upvotes;
      return 0;
    });

  const handleUpvote = async (id: string) => {
    const isNowUpvoted = await onUpvote(id);
    if (isNowUpvoted) {
      showToast('🔥 Upvoted!', 'success');
    } else {
      showToast('Upvote removed', 'amber');
    }
  };

  const handleShare = async (id: string) => {
    const link = `${window.location.origin}/report/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('🔗 Share link copied!', 'success');
    } catch (e) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    if (diff > 60) {
      handleUpvote(id);
    } else if (diff < -60) {
      handleShare(id);
    }
  };

  const toggleComments = (id: string) => {
    setOpenComments((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCommentChange = (id: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handlePostComment = async (id: string) => {
    const text = commentInputs[id];
    if (!text || text.trim().length === 0) return;

    await onComment(id, text);
    setCommentInputs((prev) => ({ ...prev, [id]: '' }));
    showToast('Comment posted', 'success');
  };

  return (
    <div className="screen active">
      <div className="screen-inner">
        <div className="flex justify-between items-center mb-4">
          <h2 className="screen-title" style={{ marginBottom: 0 }}>
            <span className="screen-title-icon">📡</span> Live Feed
          </h2>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '8px 36px 8px 12px', marginBottom: 0, fontSize: '13px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="upvotes">Top Voted</option>
          </select>
        </div>

        <div className="filter-row">
          {ALL_SECTORS.map((s) => (
            <span
              key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'Education' ? '🎓 Education' : s === 'Healthcare' ? '🏥 Healthcare' : s === 'BBMP/Infra' ? '🚧 BBMP/Infra' : s === 'Police/Other' ? '👮 Police' : 'All'}
            </span>
          ))}
        </div>

        <div id="feed-container">
          {filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted-lt)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontWeight: 700 }}>No reports yet</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Be the first to raise your voice</div>
            </div>
          ) : (
            filteredReports.map((report) => {
              const sectorStyle = getSectorStyle(report.sector);
              const statusColor = getStatusColor(report.status);
              const isUpvoted = upvoted.includes(report.id);
              const commentsOpen = openComments.includes(report.id);

              return (
                <div
                  key={report.id}
                  className="feed-card"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={(e) => handleTouchEnd(e, report.id)}
                >
                  <div className="feed-header">
                    <span className={`pill ${sectorStyle.cls}`}>
                      {sectorStyle.text}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, border: '1px solid currentColor', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                      ● {report.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="feed-title">{report.id}</div>

                  <div className="feed-desc">
                    {report.description && report.description.length > 140
                      ? report.description.substring(0, 140) + '…'
                      : report.description}
                  </div>

                  {(report.evidenceCount.photos > 0 || report.evidenceCount.videos > 0) && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {report.evidenceCount.photos > 0 && (
                        <span className="pill pill-blue" style={{ cursor: 'pointer' }}>
                          📷 {report.evidenceCount.photos} photo{report.evidenceCount.photos > 1 ? 's' : ''}
                        </span>
                      )}
                      {report.evidenceCount.videos > 0 && (
                        <span className="pill pill-red" style={{ cursor: 'pointer' }}>
                          🎥 {report.evidenceCount.videos} video{report.evidenceCount.videos > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="feed-footer">
                    <span>📍 {report.ward} · {timeAgo(report.timestamp)}</span>
                    <div className="flex gap-4">
                      <span
                        className={`upvote-btn ${isUpvoted ? 'active' : ''}`}
                        onClick={() => handleUpvote(report.id)}
                      >
                        <span>🔥</span> <span className="count">{report.upvotes || 0}</span>
                      </span>
                      <span style={{ cursor: 'pointer' }} onClick={() => toggleComments(report.id)}>
                        💬 {report.comments.length || 0}
                      </span>
                      <span style={{ cursor: 'pointer' }} onClick={() => handleShare(report.id)}>
                        🔗
                      </span>
                    </div>
                  </div>

                  {commentsOpen && (
                    <div className="comments-section" style={{ display: 'block' }}>
                      {report.comments.map((c, i) => (
                        <div key={i} className="comment-item">
                          <div className="comment-meta">Anon · {c.time}</div>
                          <div style={{ fontSize: '14px' }}>{c.text}</div>
                        </div>
                      ))}

                      <div className="flex mt-2 gap-2">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Add anonymous comment…"
                          style={{ flex: 1, marginBottom: 0, padding: '10px 14px' }}
                          value={commentInputs[report.id] || ''}
                          onChange={(e) =>
                            handleCommentChange(report.id, e.target.value)
                          }
                        />
                        <button
                          className="btn-primary"
                          style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
                          onClick={() => handlePostComment(report.id)}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedScreen;
