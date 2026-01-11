"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, source: 'pinterest' | 'pexels', useMocks: boolean) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<'pinterest' | 'pexels'>('pinterest');
  const [useMocks, setUseMocks] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, source, useMocks);
  };

  const toggleMocks = () => {
    const newMockState = !useMocks;
    setUseMocks(newMockState);
    if (query) {
      onSearch(query, source, newMockState);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search aesthetic assets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-6 items-center justify-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Source:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setSource('pinterest')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                source === 'pinterest'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isLoading}
            >
              Pinterest
            </button>
            <button
              type="button"
              onClick={() => setSource('pexels')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                source === 'pexels'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={isLoading}
            >
              Pexels
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Mock Mode:</span>
          <button
            type="button"
            onClick={toggleMocks}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              useMocks
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            disabled={isLoading}
          >
            {useMocks ? (
              <>
                <ToggleRight className="h-4 w-4" />
                ON
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4" />
                OFF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
