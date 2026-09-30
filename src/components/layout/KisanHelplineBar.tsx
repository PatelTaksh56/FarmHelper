import React from 'react';

export const KisanHelplineBar: React.FC = () => {
  return (
    <div className="w-full bg-[#4A3528] text-[#F8F5EE] py-2 px-4 sm:px-6 flex items-center justify-between border-b border-[#3D2C21] z-30 flex-shrink-0">
      {/* Left: Helpline info */}
      <a
        href="tel:18001801551"
        className="flex items-center gap-2.5 group"
        title="Call National Kisan Call Centre"
      >
        <span className="w-7 h-7 rounded-lg bg-[#91A35A]/20 border border-[#91A35A]/40 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#D7EB9A] text-sm">support_agent</span>
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-medium text-[#C4B9AA] whitespace-nowrap">
            Kisan Helpline (Toll Free):
          </span>
          <span className="text-sm font-bold text-[#D7EB9A] tracking-widest group-hover:underline whitespace-nowrap">
            1800-180-1551
          </span>
        </div>
      </a>

      {/* Right: Status indicator */}
      <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#C4B9AA] shrink-0">
        <span>6:00 AM – 10:00 PM</span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-[#91A35A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#91A35A] animate-pulse"></span>
          Farmer Assistance
        </span>
      </div>
    </div>
  );
};
