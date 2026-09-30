import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n';

interface AudioPlayerButtonProps {
  textToSpeak: string;
  className?: string;
  label?: string;
}

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  textToSpeak,
  className = '',
  label,
}) => {
  const { t, languageMeta } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Stop speaking when unmounted or language changes
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [languageMeta.appCode]);

  const handleToggleSpeech = () => {
    setErrorMessage(null);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setErrorMessage(t('tts.ttsUnavailable'));
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    if (!textToSpeak || !textToSpeak.trim()) return;

    // Cancel any active speech before starting new utterance
    synth.cancel();

    const cleanText = textToSpeak.replace(/[\#\*\_\`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const targetLangCode = languageMeta.ttsVoiceCode || languageMeta.browserSpeechCode || 'hi-IN';
    utterance.lang = targetLangCode;

    // Attempt to match best installed voice for target language
    const voices = synth.getVoices();
    const matchingVoice = voices.find(
      (v) =>
        v.lang === targetLangCode ||
        v.lang.startsWith(targetLangCode.split('-')[0])
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.warn('[TTS Error]', e);
      setIsPlaying(false);
      setErrorMessage(t('tts.ttsError'));
      setTimeout(() => setErrorMessage(null), 4000);
    };

    setIsPlaying(true);
    synth.speak(utterance);
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggleSpeech}
        aria-label={label || (isPlaying ? t('tts.stopListening') : t('tts.listen'))}
        title={label || (isPlaying ? t('tts.stopListening') : t('tts.listen'))}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isPlaying
            ? 'bg-amber-600 text-white animate-pulse shadow-md'
            : 'bg-[#F0F4E8] hover:bg-[#E2ECCE] text-harvest-olive border border-[#91A35A]/40'
        } ${className}`}
      >
        <span className="material-symbols-outlined text-base">
          {isPlaying ? 'volume_off' : 'volume_up'}
        </span>
        <span>
          {isPlaying
            ? t('tts.stopListening')
            : label || t('tts.listen')}
        </span>
      </button>

      {errorMessage && (
        <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 animate-fadeIn">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
