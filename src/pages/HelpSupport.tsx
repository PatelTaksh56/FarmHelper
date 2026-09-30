import React from 'react';
import { useTranslation } from '../i18n';

export const HelpSupport: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
          {t('help.title')}
        </h1>
        <p className="text-sm text-umber-brown mt-1">
          {t('help.subtitle')}
        </p>
      </div>

      {/* Kisan Call Centre Feature Card */}
      <div className="bg-[#4A3528] text-[#FFFDF9] rounded-xl border border-[#3D2C21] shadow-modal-tray p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#91A35A]/20 border border-[#91A35A]/40 flex items-center justify-center text-[#D7EB9A]">
            <span className="material-symbols-outlined text-3xl">support_agent</span>
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold text-[#F8F5EE]">
              {t('help.kisanCallCenter')}
            </h2>
            <p className="text-xs text-[#C4B9AA]">
              Ministry of Agriculture & Farmers Welfare, Government of India
            </p>
          </div>
        </div>

        <p className="text-sm text-[#F8F5EE]/90 leading-relaxed max-w-2xl">
          Toll-free telephonic support answering farmer inquiries across 22 regional Indian languages. Qualified agricultural graduates address seed selection, fertilizer dosage, crop protection, and mandi prices.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#6F5748]/50">
          <div>
            <span className="text-xs text-[#C4B9AA] block">Official Toll-Free Number</span>
            <span className="font-headline text-3xl font-bold text-[#D7EB9A] tracking-wider">
              1800-180-1551
            </span>
            <span className="text-xs text-[#C4B9AA] block mt-0.5">Operates 6:00 AM – 10:00 PM all 7 days</span>
          </div>

          <a
            href="tel:18001801551"
            className="py-3 px-6 rounded-md bg-[#718342] hover:bg-[#5D6D34] text-[#FFFDF9] font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            <span>Call 1800-180-1551</span>
          </a>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 sm:p-8 space-y-4">
        <h3 className="font-headline text-lg font-bold text-charred-soil border-b border-pressed-sand pb-3">
          {t('help.faqTitle')}
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-pressed-sand">
            <h4 className="font-bold text-charred-soil mb-1">
              How does FarmHelper isolate my farm records?
            </h4>
            <p className="text-umber-brown">
              Every farm plot, crop doctor diagnosis, and soil analysis is linked directly to your authenticated Firebase UID and protected by server-side Firestore security rules. No other farmer or guest can view your records.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#FAF7F2] border border-pressed-sand">
            <h4 className="font-bold text-charred-soil mb-1">
              Are Crop Doctor diagnoses 100% guaranteed?
            </h4>
            <p className="text-umber-brown">
              No. AI models provide guidance based on leaf visual patterns. Severe blight or epidemic infestations should always be confirmed by your district Krishi Vigyan Kendra (KVK) or the Kisan Helpline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
