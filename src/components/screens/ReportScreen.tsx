import React, { useState, useRef } from 'react';
import { Report, Sector, EvidenceItem, Coords, ToastType } from '../../types';
import CameraModal from '../modals/CameraModal';
import SubmitOverlay from '../modals/SubmitOverlay';
import { useCamera } from '../../hooks/useCamera';

interface ReportScreenProps {
  onSubmit: (report: Report) => void;
  showToast: (msg: string, type?: ToastType) => void;
  anonMode: boolean;
  onToggleAnon: () => void;
}

const sectors: { id: Sector; icon: string; label: string }[] = [
  { id: 'Education', icon: '🎓', label: 'Education' },
  { id: 'Healthcare', icon: '🏥', label: 'Healthcare' },
  { id: 'BBMP/Infra', icon: '🚧', label: 'BBMP/Infra' },
  { id: 'Police/Other', icon: '👮', label: 'Police/Other' },
];

const ReportScreen: React.FC<ReportScreenProps> = ({
  onSubmit,
  showToast,
  anonMode,
  onToggleAnon,
}) => {
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);
  const [description, setDescription] = useState<string>('');
  const [attachedEvidence, setAttachedEvidence] = useState<EvidenceItem[]>([]);
  const [detectedWard, setDetectedWard] = useState<string>('Bengaluru City');
  const [detectedCoords, setDetectedCoords] = useState<Coords>({
    lat: 12.9716,
    lng: 77.5946,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitOverlay, setShowSubmitOverlay] = useState<boolean>(false);
  const [submitToken, setSubmitToken] = useState<string>('');
  const [submitId, setSubmitId] = useState<string>('');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const {
    isOpen: isCameraOpen,
    mode: camMode,
    isRecording,
    videoRef,
    openCamera,
    closeCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationDetect = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    showToast('Detecting location...', 'amber');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDetectedCoords({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const ward =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city ||
            'Bengaluru City';
          setDetectedWard(ward);
          showToast(`Location set to ${ward}`, 'success');
        } catch (err) {
          setDetectedWard('Bengaluru City');
          showToast('Could not detect specific ward, using default', 'amber');
        }
      },
      () => {
        showToast('Failed to detect location', 'error');
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedEvidence((prev) => [
            ...prev,
            { type, data: event.target!.result as string, file },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEvidence = (index: number) => {
    setAttachedEvidence((prev) => prev.filter((_, i) => i !== index));
  };

  const openCameraDialog = async (mode: 'photo' | 'video') => {
    try {
      await openCamera(mode);
    } catch (err) {
      showToast('Camera access denied', 'error');
    }
  };

  const handleSubmit = () => {
    if (!currentSector) {
      showToast('Please select a sector', 'error');
      return;
    }
    if (description.length < 20) {
      showToast('Description must be at least 20 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    setShowSubmitOverlay(true);
    setSubmitMessage('Encrypting…');
    setSubmitSuccess(false);

    setTimeout(() => {
      setSubmitMessage('Posting to officials…');

      setTimeout(() => {
        const id = 'SPK' + Math.floor(1000 + Math.random() * 9000);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomChars = Array.from({ length: 4 }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
        const token = 'SPK-' + Date.now().toString().slice(-4) + '-' + randomChars;

        setSubmitToken(token);
        setSubmitId(id);
        setSubmitSuccess(true);
        setSubmitMessage('Report Submitted Successfully!');

        const photos = attachedEvidence.filter((e) => e.type === 'image').length;
        const videos = attachedEvidence.filter((e) => e.type === 'video').length;

        const report: Report = {
          id,
          token,
          sector: currentSector,
          description,
          ward: detectedWard,
          lat: detectedCoords.lat,
          lng: detectedCoords.lng,
          timestamp: Date.now(),
          status: 'Received',
          upvotes: 0,
          comments: [],
          evidenceCount: { photos, videos },
          evidenceData: attachedEvidence,
        };

        onSubmit(report);
      }, 1000);
    }, 900);
  };

  const formStyle: React.CSSProperties = {
    opacity: currentSector ? 1 : 0.4,
    pointerEvents: currentSector ? 'auto' : 'none',
    transition: 'opacity 0.3s',
  };

  return (
    <div className="screen active">
      <div className="screen-inner">
        <h2 className="screen-title">
          <span className="screen-title-icon">🏠</span> Report an Issue
        </h2>

        {/* Anonymous Banner */}
        <div className={`anon-banner ${anonMode ? 'on' : 'off'}`} onClick={onToggleAnon}>
          <span id="anon-text">{anonMode ? '🔒 Anonymous mode is ON' : '⚠️ Anonymous mode is OFF'}</span>
          <div className={`toggle-switch ${anonMode ? 'active' : ''}`} id="anon-toggle"></div>
        </div>

        <p className="section-label">Select <span>Sector</span></p>
        <div className="sector-grid" id="sector-grid">
          {sectors.map((s) => (
            <div
              key={s.id}
              className={`g-card sector-card ${currentSector === s.id ? 'selected' : ''}`}
              onClick={() => setCurrentSector(s.id)}
            >
              <span className="sector-icon">{s.icon}</span>{s.label}
            </div>
          ))}
        </div>

        <div id="report-form-area" style={formStyle}>
          <p className="section-label">Describe the <span>Issue</span></p>
          <textarea
            id="report-desc"
            className="form-input"
            placeholder="What happened? Where? Any details you noticed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
          <div className="flex justify-between mb-4 text-sm" style={{ color: 'var(--muted-lt)', fontWeight: 600 }}>
            <span id="desc-error" className={`text-red ${description.length >= 20 ? 'hidden' : ''}`}>Minimum 20 characters.</span>
            <span id="char-count">{description.length}/500</span>
          </div>

          <p className="section-label">Evidence <span>Capture</span></p>
          <div className="evidence-btns">
            <button className="evidence-btn" onClick={() => openCameraDialog('photo')}>
              <span className="ev-icon">📷</span>Photo
            </button>
            <button className="evidence-btn" onClick={() => openCameraDialog('video')}>
              <span className="ev-icon">🎥</span>Video
            </button>
            <button className="evidence-btn" onClick={() => fileInputRef.current?.click()}>
              <span className="ev-icon">⬆️</span>Upload
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
            </button>
          </div>

          {attachedEvidence.length > 0 && (
            <div className="media-preview-strip">
              {attachedEvidence.map((item, index) => (
                <div key={index} className="media-thumbnail">
                  {item.type === 'image' ? (
                    <img src={item.data} alt="evidence" />
                  ) : (
                    <video src={item.data} />
                  )}
                  <div className="media-thumbnail-remove" onClick={() => removeEvidence(index)}>
                    ✕
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="btn-location" onClick={handleLocationDetect}>
            <span className="flex items-center gap-2"><span>📍</span><span>{detectedWard}</span></span>
            <span style={{ color: 'var(--muted)' }}>›</span>
          </button>

          <button
            className="btn-primary w-full"
            style={{ marginTop: '8px' }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Anonymous Report →'}
          </button>
        </div>
      </div>

      <CameraModal
        isOpen={isCameraOpen}
        mode={camMode}
        isRecording={isRecording}
        videoRef={videoRef}
        onClose={closeCamera}
        onCapture={() => {
          const data = capturePhoto();
          if (data) {
            setAttachedEvidence((prev) => [...prev, { type: 'image', data }]);
          }
          closeCamera();
        }}
        onRecordToggle={() => {
          if (isRecording) {
            stopRecording();
          } else {
            startRecording((blob) => {
              const url = URL.createObjectURL(blob);
              setAttachedEvidence((prev) => [...prev, { type: 'video', data: url, file: blob }]);
              closeCamera();
            });
          }
        }}
      />

      <SubmitOverlay
        isVisible={showSubmitOverlay}
        isLoading={!submitSuccess}
        message={submitMessage}
        token={submitToken}
        reportId={submitId}
        onClose={() => {
          setShowSubmitOverlay(false);
          setIsSubmitting(false);
          setCurrentSector(null);
          setDescription('');
          setAttachedEvidence([]);
        }}
      />
    </div>
  );
};

export default ReportScreen;
