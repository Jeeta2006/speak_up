import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsOpen(false);
    setIsRecording(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
  }, [stream]);

  const openCamera = useCallback(async (requestedMode: 'photo' | 'video') => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: requestedMode === 'video',
      });
      setStream(mediaStream);
      setMode(requestedMode);
      setIsOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRecording = useCallback((onStop: (blob: Blob) => void) => {
    if (!stream) return;
    
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'video/mp4';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      onStop(blob);
      chunksRef.current = [];
    };

    mediaRecorder.start();
    setIsRecording(true);

    // Auto-stop after 60 seconds
    timerRef.current = setTimeout(() => {
      stopRecording();
    }, 60000);
  }, [stream, stopRecording]);

  return {
    stream,
    isOpen,
    mode,
    isRecording,
    videoRef,
    openCamera,
    closeCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  };
};
