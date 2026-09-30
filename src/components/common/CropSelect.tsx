import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../i18n';
import {
  CROP_CATALOG,
  Crop,
  CropCategory,
  searchCrops,
  mapLegacyCropName,
  getCropTranslationKey,
} from '../../data/cropCatalog';

export interface CropSelectProps {
  value: string;
  onChange: (cropValue: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
  excludeFarmAddCrops?: boolean;
}

const CATEGORY_ORDER: CropCategory[] = [
  'Cereal',
  'Pulse',
  'Oilseed',
  'Cash Crop',
  'Vegetable',
  'Fruit',
  'Spice',
  'Other',
];

export const CropSelect: React.FC<CropSelectProps> = ({
  value,
  onChange,
  label,
  className = '',
  placeholder,
  excludeFarmAddCrops = false,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCropName, setCustomCropName] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const effectivePlaceholder = placeholder || t('cropDoctor.cropSelectLabel');

  // Format crop for display using translation
  const formatCropLabel = useCallback(
    (crop: Crop) => {
      const key = getCropTranslationKey(crop.id);
      if (key) {
        const translated = t(key);
        if (translated && translated !== key) {
          return translated;
        }
      }
      return crop.name;
    },
    [t]
  );

  // Sync initial / incoming prop value
  useEffect(() => {
    if (!value) return;
    const mapped = mapLegacyCropName(value);
    const catalogMatch = CROP_CATALOG.find(
      (c) => c.name.toLowerCase() === mapped.toLowerCase() || c.name.toLowerCase() === value.toLowerCase()
    );

    if (catalogMatch && catalogMatch.id !== 'other') {
      setIsCustomMode(false);
    } else if (value.trim() && value !== 'Wheat') {
      // Check if it's a custom non-catalog crop
      const isPredefined = CROP_CATALOG.some(
        (c) => c.name.toLowerCase() === value.toLowerCase()
      );
      if (!isPredefined) {
        setIsCustomMode(true);
        setCustomCropName(value);
      }
    }
  }, [value]);

  // Filter crops based on search query
  const filteredCrops = useMemo(() => {
    return searchCrops(searchQuery, { excludeFarmAddCrops });
  }, [searchQuery, excludeFarmAddCrops]);

  // Group filtered crops by category and sort crops alphabetically within each category
  const groupedCrops = useMemo(() => {
    const map = new Map<CropCategory, Crop[]>();

    CATEGORY_ORDER.forEach((cat) => map.set(cat, []));

    filteredCrops.forEach((crop) => {
      const list = map.get(crop.category) || [];
      list.push(crop);
      map.set(crop.category, list);
    });

    // Sort crops within each category alphabetically by displayed name
    map.forEach((crops) => {
      crops.sort((a, b) => {
        const nameA = formatCropLabel(a);
        const nameB = formatCropLabel(b);
        return nameA.localeCompare(nameB);
      });
    });

    return map;
  }, [filteredCrops, formatCropLabel]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTranslatedDisplay = (val: string) => {
    if (isCustomMode) return customCropName || t('crops.other');
    const mapped = mapLegacyCropName(val);
    const key = getCropTranslationKey(mapped);
    if (key) {
      const translated = t(key);
      if (translated && translated !== key) {
        return translated;
      }
    }
    return mapped;
  };

  // Handle crop selection from dropdown
  const handleSelectCrop = (crop: Crop) => {
    if (crop.id === 'other') {
      setIsCustomMode(true);
      setCustomCropName('');
      onChange('Other');
    } else {
      setIsCustomMode(false);
      onChange(crop.name);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle custom crop name change
  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomCropName(val);
    onChange(val.trim() ? val : 'Other');
  };

  // Switch back from custom mode to predefined catalog
  const handleSwitchToCatalog = () => {
    setIsCustomMode(false);
    onChange('Wheat');
  };

  const selectedDisplay = getTranslatedDisplay(value);

  return (
    <div className={`space-y-1.5 font-body relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-charred-soil mb-1">
          {label}
        </label>
      )}

      {isCustomMode ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customCropName}
              onChange={handleCustomNameChange}
              placeholder={t('cropDoctor.cropSelectLabel')}
              className="w-full bg-[#FFFDF9] border border-harvest-olive rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-charred-soil focus:outline-none shadow-xs"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSwitchToCatalog}
              className="py-2.5 px-3 bg-[#F0F4E8] hover:bg-[#E2EBD4] text-harvest-olive-dark text-xs font-medium rounded-lg border border-[#91A35A]/30 shrink-0 transition-colors"
              title="Catalog"
            >
              Catalog
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Main Select Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }
            }}
            className="w-full bg-[#FFFDF9] border border-pressed-sand hover:border-harvest-olive/60 rounded-lg px-3.5 py-2.5 text-left text-xs sm:text-sm text-charred-soil flex items-center justify-between transition-colors shadow-xs"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="material-symbols-outlined text-harvest-olive text-lg shrink-0">
                eco
              </span>
              <span className="truncate font-medium">{selectedDisplay || effectivePlaceholder}</span>
            </div>
            <span className="material-symbols-outlined text-umber-brown text-base shrink-0">
              {isOpen ? 'expand_less' : 'unfold_more'}
            </span>
          </button>

          {/* Searchable Dropdown Popup */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#FFFDF9] border border-pressed-sand rounded-xl shadow-modal-tray p-2.5 max-h-80 overflow-y-auto space-y-2 animate-fadeIn">
              {/* Search Filter Input */}
              <div className="relative sticky top-0 bg-[#FFFDF9] z-10 pb-1.5 border-b border-pressed-sand/60">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-umber-brown text-sm">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={effectivePlaceholder}
                  className="w-full bg-[#F6F3EC] border border-pressed-sand/80 rounded-md pl-8 pr-3 py-1.5 text-xs text-charred-soil focus:bg-[#FFFDF9] focus:border-harvest-olive focus:outline-none"
                />
              </div>

              {/* Grouped Crop Options List */}
              <div className="space-y-3 pt-1">
                {Array.from(groupedCrops.entries()).map(([category, crops]) => {
                  if (crops.length === 0) return null;
                  const categoryKey = `categories.${category.toLowerCase().replace(' ', '')}`;
                  const categoryLabel = t(categoryKey) || `${category}s`;

                  return (
                    <div key={category} className="space-y-1">
                      <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-harvest-olive bg-[#F0F4E8] rounded border border-[#91A35A]/20">
                        {categoryLabel}
                      </div>
                      <div className="space-y-0.5">
                        {crops.map((crop) => {
                          const translatedLabel = formatCropLabel(crop);
                          const isSelected =
                            selectedDisplay.toLowerCase() === translatedLabel.toLowerCase() ||
                            value.toLowerCase() === crop.name.toLowerCase();

                          return (
                            <button
                              key={crop.id}
                              type="button"
                              onClick={() => handleSelectCrop(crop)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-[#F0F4E8] text-harvest-olive-dark font-semibold border border-[#91A35A]/30'
                                  : 'hover:bg-[#FAF7F2] text-charred-soil'
                              }`}
                            >
                              <div>
                                <span className="block font-medium">{translatedLabel}</span>
                                {crop.localNames.length > 0 && (
                                  <span className="text-[10px] text-umber-brown block">
                                    {crop.localNames.join(' • ')}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-umber-brown/80 shrink-0">
                                {crop.seasons.join(', ')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredCrops.length === 0 && (
                  <div className="p-4 text-center text-xs text-umber-brown space-y-2">
                    <p>No crops matching "{searchQuery}" found.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMode(true);
                        setCustomCropName(searchQuery);
                        onChange(searchQuery);
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 bg-harvest-olive text-white rounded text-xs font-medium hover:bg-harvest-olive-dark"
                    >
                      Use "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
