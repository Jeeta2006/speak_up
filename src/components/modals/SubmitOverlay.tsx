import React, { useEffect, useRef } from 'react';

interface SubmitOverlayProps {
  isVisible: boolean;
  isLoading: boolean;
  message: string;
  token: string;
  reportId: string;
  onClose: () => void;
}

const SubmitOverlay: React.FC<SubmitOverlayProps> = ({
  isVisible,
  isLoading,
  message,
  token,
  reportId,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && isVisible && containerRef.current) {
      // Generate confetti
      for (let i = 0; i < 60; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = `${Math.random() * 100}%`;
        conf.style.top = `${-10 - Math.random() * 20}%`;
        conf.style.backgroundColor = ['#3D9BFF', '#FFB800', '#00C97A', '#FF2D2D'][
          Math.floor(Math.random() * 4)
        ];
        conf.style.animationDelay = `${Math.random() * 2}s`;
        containerRef.current.appendChild(conf);

        setTimeout(() => {
          if (containerRef.current && containerRef.current.contains(conf)) {
            containerRef.current.removeChild(conf);
          }
        }, 3000);
      }
    }
  }, [isLoading, isVisible]);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    alert('Token copied!');
  };

  if (!isVisible) return null;

  return (
    <div
      className={`modal-overlay active`}
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
      }}
    >
      <div
        className="submit-card"
        style={{
          background: 'var(--bg-card)',
          padding: '32px',
          borderRadius: '16px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%',
        }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ margin: '0 auto 24px auto' }}></div>
            <h3 style={{ color: 'var(--text)' }}>{message}</h3>
          </>
        ) : (
          <>
            <div
              style={{
                margin: '0 auto 24px auto',
                width: '64px',
                height: '64px',
                background: 'var(--green)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h2 style={{ marginBottom: '8px' }}>Report Submitted</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              {message}
            </p>

            <div
              style={{
                background: '#111',
                border: '1px solid #333',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                }}
              >
                Your Secure Token (ID: {reportId})
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#000',
                  padding: '8px 12px',
                  borderRadius: '4px',
                }}
              >
                <code
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 'bold',
                    fontSize: '16px',
                  }}
                >
                  {token}
                </code>
                <button
                  onClick={copyToken}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  📋
                </button>
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '16px' }}
              onClick={onClose}
            >
              Track your report &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmitOverlay;
