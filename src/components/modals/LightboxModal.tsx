import React from 'react';
import { EvidenceItem } from '../../types';

interface LightboxModalProps {
  isOpen: boolean;
  evidence: EvidenceItem | null;
  onClose: () => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  evidence,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={onClose}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.9)',
      }}
    >
      <div
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-40px',
            right: '0',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '32px',
            cursor: 'pointer',
          }}
        >
          &times;
        </button>

        {!evidence || !evidence.data ? (
          <div
            className="placeholder"
            style={{
              padding: '60px',
              background: '#222',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h2>Protected Evidence</h2>
          </div>
        ) : evidence.type === 'image' ? (
          <img
            src={evidence.data}
            alt="Evidence"
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        ) : (
          <video
            src={evidence.data}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '80vh' }}
          />
        )}
      </div>
    </div>
  );
};

export default LightboxModal;
