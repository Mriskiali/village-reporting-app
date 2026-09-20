import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih atau cari...',
  label,
  disabled = false,
  className = '',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedLabel = value 
    ? options.find(opt => opt.value === value)?.label 
    : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div 
        className={`min-h-12 w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none transition-colors cursor-pointer flex items-center justify-between ${
          disabled 
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
            : isOpen
              ? 'border-orange-500 ring-2 ring-orange-500'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedLabel ? (
            <div className="truncate text-gray-900">{selectedLabel}</div>
          ) : (
            <div className="text-gray-400 truncate">{placeholder}</div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {selectedLabel && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setSearchQuery('');
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="overflow-y-auto max-h-44">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                    value === option.value ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Tidak ditemukan hasil
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;