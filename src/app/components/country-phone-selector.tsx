import { useState, useRef, useEffect, useCallback } from "react";

export interface Country {
  code: string;   // ISO 3166-1 alpha-2
  name: string;
  dial: string;   // e.g. "+63"
  flag: string;   // emoji flag
  placeholder: string;
  maxDigits: number;
}

export const COUNTRIES: Country[] = [
  { code: "PH", name: "Philippines",        dial: "+63",  flag: "🇵🇭", placeholder: "9XX XXX XXXX",   maxDigits: 10 },
  { code: "US", name: "United States",      dial: "+1",   flag: "🇺🇸", placeholder: "XXX XXX XXXX",   maxDigits: 10 },
  { code: "CA", name: "Canada",             dial: "+1",   flag: "🇨🇦", placeholder: "XXX XXX XXXX",   maxDigits: 10 },
  { code: "GB", name: "United Kingdom",     dial: "+44",  flag: "🇬🇧", placeholder: "7XXX XXXXXX",    maxDigits: 11 },
  { code: "AU", name: "Australia",          dial: "+61",  flag: "🇦🇺", placeholder: "4XX XXX XXX",    maxDigits: 9  },
  { code: "NZ", name: "New Zealand",        dial: "+64",  flag: "🇳🇿", placeholder: "XX XXX XXXX",    maxDigits: 9  },
  { code: "SG", name: "Singapore",          dial: "+65",  flag: "🇸🇬", placeholder: "XXXX XXXX",      maxDigits: 8  },
  { code: "MY", name: "Malaysia",           dial: "+60",  flag: "🇲🇾", placeholder: "1X XXX XXXX",    maxDigits: 10 },
  { code: "ID", name: "Indonesia",          dial: "+62",  flag: "🇮🇩", placeholder: "8XX XXXX XXXX",  maxDigits: 12 },
  { code: "TH", name: "Thailand",           dial: "+66",  flag: "🇹🇭", placeholder: "0X XXXX XXXX",   maxDigits: 10 },
  { code: "VN", name: "Vietnam",            dial: "+84",  flag: "🇻🇳", placeholder: "9XX XXX XXXX",   maxDigits: 10 },
  { code: "MM", name: "Myanmar",            dial: "+95",  flag: "🇲🇲", placeholder: "9XX XXX XXXX",   maxDigits: 10 },
  { code: "KH", name: "Cambodia",           dial: "+855", flag: "🇰🇭", placeholder: "XX XXX XXX",     maxDigits: 9  },
  { code: "LA", name: "Laos",               dial: "+856", flag: "🇱🇦", placeholder: "20 XX XXX XXX",  maxDigits: 10 },
  { code: "BN", name: "Brunei",             dial: "+673", flag: "🇧🇳", placeholder: "XXX XXXX",       maxDigits: 7  },
  { code: "TL", name: "Timor-Leste",        dial: "+670", flag: "🇹🇱", placeholder: "7XX XXXXX",      maxDigits: 8  },
  { code: "CN", name: "China",              dial: "+86",  flag: "🇨🇳", placeholder: "1XX XXXX XXXX",  maxDigits: 11 },
  { code: "TW", name: "Taiwan",             dial: "+886", flag: "🇹🇼", placeholder: "9XX XXX XXX",    maxDigits: 9  },
  { code: "HK", name: "Hong Kong",          dial: "+852", flag: "🇭🇰", placeholder: "XXXX XXXX",      maxDigits: 8  },
  { code: "MO", name: "Macau",              dial: "+853", flag: "🇲🇴", placeholder: "6XXX XXXX",      maxDigits: 8  },
  { code: "JP", name: "Japan",              dial: "+81",  flag: "🇯🇵", placeholder: "70 XXXX XXXX",   maxDigits: 10 },
  { code: "KR", name: "South Korea",        dial: "+82",  flag: "🇰🇷", placeholder: "10 XXXX XXXX",   maxDigits: 10 },
  { code: "IN", name: "India",              dial: "+91",  flag: "🇮🇳", placeholder: "98XXX XXXXX",    maxDigits: 10 },
  { code: "PK", name: "Pakistan",           dial: "+92",  flag: "🇵🇰", placeholder: "3XX XXXXXXX",    maxDigits: 10 },
  { code: "BD", name: "Bangladesh",         dial: "+880", flag: "🇧🇩", placeholder: "1XXX XXXXXX",    maxDigits: 10 },
  { code: "LK", name: "Sri Lanka",          dial: "+94",  flag: "🇱🇰", placeholder: "7X XXX XXXX",    maxDigits: 9  },
  { code: "NP", name: "Nepal",              dial: "+977", flag: "🇳🇵", placeholder: "98XX XXXXXX",    maxDigits: 10 },
  { code: "AF", name: "Afghanistan",        dial: "+93",  flag: "🇦🇫", placeholder: "7X XXX XXXX",    maxDigits: 9  },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", placeholder: "5X XXX XXXX", maxDigits: 9  },
  { code: "SA", name: "Saudi Arabia",       dial: "+966", flag: "🇸🇦", placeholder: "5X XXX XXXX",   maxDigits: 9  },
  { code: "QA", name: "Qatar",              dial: "+974", flag: "🇶🇦", placeholder: "XX XXX XXX",     maxDigits: 8  },
  { code: "KW", name: "Kuwait",             dial: "+965", flag: "🇰🇼", placeholder: "XXXX XXXX",      maxDigits: 8  },
  { code: "BH", name: "Bahrain",            dial: "+973", flag: "🇧🇭", placeholder: "XXXX XXXX",      maxDigits: 8  },
  { code: "OM", name: "Oman",               dial: "+968", flag: "🇴🇲", placeholder: "XXXX XXXX",      maxDigits: 8  },
  { code: "JO", name: "Jordan",             dial: "+962", flag: "🇯🇴", placeholder: "7X XXX XXXX",    maxDigits: 9  },
  { code: "IL", name: "Israel",             dial: "+972", flag: "🇮🇱", placeholder: "5X XXX XXXX",    maxDigits: 9  },
  { code: "TR", name: "Turkey",             dial: "+90",  flag: "🇹🇷", placeholder: "5XX XXX XXXX",   maxDigits: 10 },
  { code: "DE", name: "Germany",            dial: "+49",  flag: "🇩🇪", placeholder: "1XX XXXXXXXX",   maxDigits: 11 },
  { code: "FR", name: "France",             dial: "+33",  flag: "🇫🇷", placeholder: "6 XX XX XX XX",  maxDigits: 9  },
  { code: "IT", name: "Italy",              dial: "+39",  flag: "🇮🇹", placeholder: "3XX XXX XXXX",   maxDigits: 10 },
  { code: "ES", name: "Spain",              dial: "+34",  flag: "🇪🇸", placeholder: "6XX XXX XXX",    maxDigits: 9  },
  { code: "PT", name: "Portugal",           dial: "+351", flag: "🇵🇹", placeholder: "9XX XXX XXX",    maxDigits: 9  },
  { code: "NL", name: "Netherlands",        dial: "+31",  flag: "🇳🇱", placeholder: "6 XXXXXXXX",     maxDigits: 9  },
  { code: "BE", name: "Belgium",            dial: "+32",  flag: "🇧🇪", placeholder: "4XX XX XX XX",   maxDigits: 9  },
  { code: "CH", name: "Switzerland",        dial: "+41",  flag: "🇨🇭", placeholder: "7X XXX XX XX",   maxDigits: 9  },
  { code: "AT", name: "Austria",            dial: "+43",  flag: "🇦🇹", placeholder: "6XX XXXXXXX",    maxDigits: 10 },
  { code: "SE", name: "Sweden",             dial: "+46",  flag: "🇸🇪", placeholder: "7X XXX XX XX",   maxDigits: 9  },
  { code: "NO", name: "Norway",             dial: "+47",  flag: "🇳🇴", placeholder: "XXX XX XXX",     maxDigits: 8  },
  { code: "DK", name: "Denmark",            dial: "+45",  flag: "🇩🇰", placeholder: "XX XX XX XX",    maxDigits: 8  },
  { code: "FI", name: "Finland",            dial: "+358", flag: "🇫🇮", placeholder: "5X XXX XXXX",    maxDigits: 10 },
  { code: "PL", name: "Poland",             dial: "+48",  flag: "🇵🇱", placeholder: "XXX XXX XXX",    maxDigits: 9  },
  { code: "RU", name: "Russia",             dial: "+7",   flag: "🇷🇺", placeholder: "9XX XXX XX XX",  maxDigits: 10 },
  { code: "UA", name: "Ukraine",            dial: "+380", flag: "🇺🇦", placeholder: "9X XXX XX XX",   maxDigits: 9  },
  { code: "GR", name: "Greece",             dial: "+30",  flag: "🇬🇷", placeholder: "69X XXX XXXX",   maxDigits: 10 },
  { code: "RO", name: "Romania",            dial: "+40",  flag: "🇷🇴", placeholder: "7XX XXX XXX",    maxDigits: 9  },
  { code: "BR", name: "Brazil",             dial: "+55",  flag: "🇧🇷", placeholder: "11 9XXXX XXXX",  maxDigits: 11 },
  { code: "MX", name: "Mexico",             dial: "+52",  flag: "🇲🇽", placeholder: "1 XXX XXX XXXX", maxDigits: 10 },
  { code: "AR", name: "Argentina",          dial: "+54",  flag: "🇦🇷", placeholder: "9 11 XXXX XXXX", maxDigits: 10 },
  { code: "CL", name: "Chile",              dial: "+56",  flag: "🇨🇱", placeholder: "9 XXXX XXXX",    maxDigits: 9  },
  { code: "CO", name: "Colombia",           dial: "+57",  flag: "🇨🇴", placeholder: "3XX XXX XXXX",   maxDigits: 10 },
  { code: "PE", name: "Peru",               dial: "+51",  flag: "🇵🇪", placeholder: "9XX XXX XXX",    maxDigits: 9  },
  { code: "ZA", name: "South Africa",       dial: "+27",  flag: "🇿🇦", placeholder: "6X XXX XXXX",    maxDigits: 9  },
  { code: "NG", name: "Nigeria",            dial: "+234", flag: "🇳🇬", placeholder: "7XX XXX XXXX",   maxDigits: 10 },
  { code: "GH", name: "Ghana",              dial: "+233", flag: "🇬🇭", placeholder: "2X XXX XXXX",    maxDigits: 9  },
  { code: "KE", name: "Kenya",              dial: "+254", flag: "🇰🇪", placeholder: "7XX XXX XXX",    maxDigits: 9  },
  { code: "ET", name: "Ethiopia",           dial: "+251", flag: "🇪🇹", placeholder: "9X XXX XXXX",    maxDigits: 9  },
  { code: "EG", name: "Egypt",              dial: "+20",  flag: "🇪🇬", placeholder: "1X XXXX XXXX",   maxDigits: 10 },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Philippines

const ss = { fontFeatureSettings: "'ss04'" };
const pp = { fontFamily: "'Poppins', sans-serif" };

interface CountryPhoneSelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  phone: string;
  onPhoneChange: (phone: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export function CountryPhoneSelector({
  selectedCountry,
  onCountryChange,
  phone,
  onPhoneChange,
  error,
  onErrorClear,
}: CountryPhoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = useCallback((country: Country) => {
    onCountryChange(country);
    onPhoneChange("");
    setOpen(false);
    setSearch("");
  }, [onCountryChange, onPhoneChange]);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, selectedCountry.maxDigits);
    onPhoneChange(digits);
    if (onErrorClear) onErrorClear();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Country selector button */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-11 px-3 rounded-xl border border-[#f0f1f3] bg-[#f7f8f9] flex items-center gap-1.5 cursor-pointer hover:border-[#ff5222]/30 hover:bg-[#fff4ed] transition-all min-w-[90px]"
          style={pp}
        >
          <span className="text-[16px] leading-none">{selectedCountry.flag}</span>
          <span className="text-[12px] text-[#070808]" style={{ fontWeight: 500, ...ss }}>
            {selectedCountry.dial}
          </span>
          <svg className={`size-3 text-[#84888c] transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#f0f1f3] rounded-2xl shadow-xl overflow-hidden"
            style={{ width: 280, maxHeight: 320, display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
          >
            {/* Search */}
            <div className="p-2 border-b border-[#f0f1f3]">
              <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-[#f7f8f9] border border-[#f0f1f3]">
                <svg className="size-3.5 text-[#b0b3b8] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="flex-1 bg-transparent text-[12px] text-[#070808] outline-none placeholder:text-[#b0b3b8]"
                  style={{ ...pp, ...ss }}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="text-[#b0b3b8] hover:text-[#84888c] cursor-pointer">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-[12px] text-[#b0b3b8]" style={ss}>
                  No countries found
                </div>
              ) : filtered.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#fff4ed] transition-colors cursor-pointer ${selectedCountry.code === country.code ? "bg-[#fff4ed]" : ""}`}
                  style={pp}
                >
                  <span className="text-[18px] leading-none shrink-0">{country.flag}</span>
                  <span className="flex-1 text-[12px] text-[#070808] truncate" style={{ fontWeight: selectedCountry.code === country.code ? 600 : 400, ...ss }}>
                    {country.name}
                  </span>
                  <span className="text-[11px] text-[#84888c] shrink-0" style={{ fontWeight: 500, ...ss }}>
                    {country.dial}
                  </span>
                  {selectedCountry.code === country.code && (
                    <svg className="size-3.5 text-[#ff5222] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phone input */}
      <input
        value={phone}
        onChange={e => handlePhoneChange(e.target.value)}
        placeholder={selectedCountry.placeholder}
        inputMode="numeric"
        className={`flex-1 h-11 px-3.5 rounded-xl border ${error ? "border-[#dc2626]/50 bg-[#fef2f2]" : "border-[#f0f1f3] bg-[#fafafa]"} text-[13px] text-[#070808] outline-none focus:border-[#ff5222]/40 focus:bg-white transition-all`}
        style={{ ...pp, ...ss }}
      />
    </div>
  );
}
