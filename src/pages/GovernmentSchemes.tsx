import React, { useState } from 'react';
import { useTranslation } from '../i18n';

export const GovernmentSchemes: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const SCHEMES = [
    {
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      agency: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      description:
        'Financial benefit of ₹6,000 per year is provided to eligible farmer families in three equal four-monthly installments of ₹2,000.',
      eligibility: ['All landholding farmer families with cultivable land'],
      url: 'https://pmkisan.gov.in',
    },
    {
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      agency: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      description:
        'Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages.',
      eligibility: ['All farmers including sharecroppers and tenant farmers growing notified crops'],
      url: 'https://pmfby.gov.in',
    },
    {
      name: 'Kisan Credit Card (KCC) Scheme',
      agency: 'Department of Agriculture & Cooperation / NABARD',
      description:
        'Timely credit support to farmers for crop production, post-harvest expenses, and maintenance of farm assets at subsidized interest rates.',
      eligibility: ['Individual/joint borrowers, SHGs, JLGs of farmers'],
      url: 'https://www.myscheme.gov.in/schemes/kcc',
    },
  ];

  const filteredSchemes = SCHEMES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-charred-soil">
            {t('schemes.title')}
          </h1>
          <p className="text-sm text-umber-brown mt-1">
            {t('schemes.subtitle')}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('common.search') + ' schemes...'}
            className="w-full bg-[#FFFDF9] border border-pressed-sand rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-charred-soil focus:border-harvest-olive focus:outline-none shadow-xs"
          />
          <span className="material-symbols-outlined text-umber-brown text-lg absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSchemes.map((scheme, idx) => (
          <div
            key={idx}
            className="bg-[#FFFDF9] rounded-xl border border-pressed-sand shadow-soft-umber p-6 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pressed-sand pb-3">
              <h2 className="font-headline text-lg font-bold text-charred-soil">
                {scheme.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0F4E8] text-harvest-olive border border-[#91A35A]/30 shrink-0 self-start sm:self-auto">
                ✓ {t('schemes.verifiedTag')}
              </span>
            </div>

            <p className="text-xs text-harvest-olive font-semibold">{scheme.agency}</p>
            <p className="text-xs sm:text-sm text-umber-brown leading-relaxed">{scheme.description}</p>

            <div className="pt-2">
              <span className="text-xs font-bold text-charred-soil block mb-1">{t('schemes.eligibility')}:</span>
              <ul className="list-disc list-inside text-xs text-umber-brown space-y-0.5">
                {scheme.eligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 flex justify-end">
              <a
                href={scheme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-harvest-olive hover:bg-harvest-olive-dark text-white text-xs font-semibold transition-colors"
              >
                <span>{t('schemes.officialPortal')}</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
