import React, { useState, useEffect, useRef } from 'react';

interface DemoScreenProps {
  onGoToReport: () => void;
}

const DemoScreen: React.FC<DemoScreenProps> = ({ onGoToReport }) => {
  const [step, setStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPlaying && step < 8) {
      intervalRef.current = setTimeout(() => {
        setStep((s) => s + 1);
      }, 3500);
    } else if (step === 8) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [step, isPlaying]);

  const nextStep = () => setStep((s) => Math.min(8, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));
  const togglePlay = () => setIsPlaying(!isPlaying);


  return (
    <div className="screen active">
      <div className="screen-inner">
        <h2 className="screen-title"><span className="screen-title-icon">▶️</span> How It Works</h2>

        <div className="demo-container">
          <div className="demo-progress">
            <div className="demo-progress-bar" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>

          <div className={`demo-step ${step === 1 ? 'active' : ''}`}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', lineHeight: 1, marginBottom: '16px' }}>See corruption?<br /><span className="text-red">Report it in 60s.</span></h3>
            <p style={{ color: 'var(--muted-lt)', fontSize: '15px' }}>No logins. No tracing. Just impact.</p>
          </div>

          <div className={`demo-step ${step === 2 ? 'active' : ''}`}>
            <p className="section-label mb-4">1. Select Sector</p>
            <div className="sector-grid" style={{ pointerEvents: 'none' }}>
              <div className="g-card sector-card selected"><span className="sector-icon">🎓</span>Education</div>
              <div className="g-card sector-card" style={{ opacity: 0.4 }}><span className="sector-icon">🏥</span>Healthcare</div>
            </div>
          </div>

          <div className={`demo-step ${step === 3 ? 'active' : ''}`}>
            <p className="section-label mb-4">2. Capture Evidence</p>
            <div className="flex gap-4">
              <div style={{ width: '80px', height: '80px', background: 'var(--black)', borderRadius: '10px', border: '2px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📷</div>
              <div style={{ width: '80px', height: '80px', background: 'var(--black-2)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', opacity: 0.5 }}>🎥</div>
            </div>
          </div>

          <div className={`demo-step ${step === 4 ? 'active' : ''}`}>
            <p className="section-label mb-4">3. Auto-Location</p>
            <div className="btn-location" style={{ pointerEvents: 'none', borderColor: 'var(--green)' }}>
              <span className="flex items-center gap-2"><span>📍</span><span style={{ color: 'var(--green)' }}>Jayanagar, Ward 153</span></span>
              <span style={{ color: 'var(--green)' }}>✓</span>
            </div>
          </div>

          <div className={`demo-step ${step === 5 ? 'active' : ''}`}>
            <p className="section-label mb-4">4. Zero-Knowledge Proof</p>
            <div className="token-box" style={{ fontSize: '16px', wordBreak: 'break-all' }}>
              ENCRYPTING...<br />
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>0x7A9B3F...D8E2</span>
            </div>
          </div>

          <div className={`demo-step ${step === 6 ? 'active' : ''}`}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>You're ready.</h3>
            <button className="btn-primary" onClick={onGoToReport} style={{ width: '100%', maxWidth: '200px' }}>
              Start Reporting
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button className="btn-ghost" onClick={prevStep} disabled={step === 1}>← Prev</button>
          <button className="btn-ghost" onClick={togglePlay} style={{ width: '60px' }}>{isPlaying ? '⏸' : '▶'}</button>
          <button className="btn-ghost" onClick={nextStep} disabled={step === 6}>Next →</button>
        </div>
      </div>
    </div>
  );
};

export default DemoScreen;
