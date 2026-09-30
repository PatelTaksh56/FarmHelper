import React, { useState, useRef } from 'react';
import { useTranslation } from '../../i18n';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className = '',
  disabled = false,
  label,
}) => {
  const { t, languageMeta } = useTranslation();
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (disabled || state === 'recording' || state === 'processing') return;

    setErrorMessage(null);
    setState('recording');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback for browsers without native Web Speech API
      console.warn('[VoiceInput] Web Speech API not supported in this browser environment.');
      setState('error');
      setErrorMessage(t('voice.voiceUnsupported'));
      setTimeout(() => setState('idle'), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = languageMeta.browserSpeechCode || languageMeta.appCode || 'hi-IN';

      recognition.onstart = () => {
        setState('recording');
      };

      recognition.onresult = (event: any) => {
        setState('processing');
        const transcript =
          event.results && event.results[0] && event.results[0][0]
            ? event.results[0][0].transcript
            : '';

        if (transcript && transcript.trim()) {
          onTranscript(transcript.trim());
          setState('success');
          setTimeout(() => setState('idle'), 2500);
        } else {
          setState('error');
          setErrorMessage(t('voice.voiceError'));
          setTimeout(() => setState('idle'), 3500);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VoiceInput Error]', event.error);
        setState('error');
        if (event.error === 'not-allowed') {
          setErrorMessage(t('voice.micDenied'));
        } else {
          setErrorMessage(t('voice.voiceError'));
        }
        setTimeout(() => setState('idle'), 4000);
      };

      recognition.onend = () => {
        setState((prev) => (prev === 'recording' ? 'idle' : prev));
      };

      recognition.start();
    } catch (err: any) {
      console.error('[VoiceInput Exception]', err);
      setState('error');
      setErrorMessage(t('voice.recordingFailed'));
      setTimeout(() => setState('idle'), 4000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
    }
    setState('idle');
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={state === 'recording' ? stopListening : startListening}
        disabled={disabled || state === 'processing'}
        aria-label={label || t('voice.speak')}
        title={label || t('voice.speak')}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          state === 'recording'
            ? 'bg-red-600 text-white animate-pulse shadow-md'
            : state === 'processing'
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : state === 'success'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : 'bg-[#F0F4E8] hover:bg-[#E2ECCE] text-harvest-olive border border-[#91A35A]/40'
        } ${className}`}
      >
        {state === 'recording' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>{t('voice.listening')}</span>
          </>
        ) : state === 'processing' ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></span>
            <span>{t('voice.converting')}</span>
          </>
        ) : state === 'success' ? (
          <>
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{t('common.success')}</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-base">mic</span>
            <span>{label || t('voice.speak')}</span>
          </>
        )}
      </button>

      {errorMessage && (
        <span className="text-[11px] text-red-600 font-medium bg-red-50 border border-red-200 rounded px-2 py-0.5 animate-fadeIn">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
