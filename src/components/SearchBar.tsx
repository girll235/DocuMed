import { CiSearch } from "react-icons/ci"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
}

export const SearchBar = ({ 
  searchTerm, 
  onSearchChange,
  className
}: { 
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search doctors by name or specialty..."
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                   transition-all duration-200 bg-white shadow-sm
                   hover:border-blue-400"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}