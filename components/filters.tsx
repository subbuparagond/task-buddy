"use client";
import { ChevronDown, Search } from "lucide-react";

type FilterDropdownProps = {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function FilterDropdown({
  options,
  selectedValue,
  onChange,
  placeholder = "Select...",
}: FilterDropdownProps) {
  return (
    <div className="relative">
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border p-2 rounded-lg pl-3 pr-8 text-sm bg-white cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-3 text-gray-500 pointer-events-none"
      />
    </div>
  );
}

type SearchFilterProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export function SearchFilter({ searchQuery, setSearchQuery }: SearchFilterProps) {
  return (
    <div className="relative w-full sm:w-64">
      <input
        type="text"
        className="border p-2 rounded-lg pl-10 text-sm placeholder-gray-400 w-full"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Search
        size={16}
        className="absolute left-3 top-3 text-gray-500"
      />
    </div>
  );
}