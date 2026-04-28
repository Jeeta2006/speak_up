import React from 'react';

interface CameraModalProps {
  isOpen: boolean;
  mode: 'photo' | 'video';
  isRecording: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  onClose: () => void;
  onCapture: () => void;
  onRecordToggle: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  mode,
  isRecording,
  videoRef,
  onClose,
  onCapture,
  onRecordToggle,
}) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div
        className="modal-content camera-modal"
        style={{
          background: '#000',
          height: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          className="modal-header"
          style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: 0, color: '#fff' }}>
            {mode === 'photo' ? 'Take Photo' : 'Record Video'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
            }}
          >
            &times;
          </button>
        </div>

        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div
          className="camera-controls"
          style={{
            padding: '32px',
            display: 'flex',
            justifyContent: 'center',
            background: '#000',
          }}
        >
          {mode === 'photo' ? (
            <button
              onClick={onCapture}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid #888',
              }}
            />
          ) : (
            <button
              onClick={onRecordToggle}
              className={isRecording ? 'recording' : ''}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isRecording ? 'transparent' : 'var(--red)',
                border: '4px solid #fff',
                transition: 'all 0.3s',
              }}
            >
              {isRecording && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    background: 'var(--red)',
                    borderRadius: '4px',
                    margin: '0 auto',
                  }}
                ></div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
