import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useIsDesktopLegacy } from '../hooks/useMediaQuery';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchBarWithInlineFilterProps {
  query: string;
  selectedFilter: string;
  filterOptions: FilterOption[];
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
}

export function SearchBarWithInlineFilter({
  query,
  selectedFilter,
  filterOptions,
  onQueryChange,
  onFilterChange,
  onSearch,
  onClear,
  isSearching = false,
  placeholder = "Buscar por título, autor ou gênero..."
}: SearchBarWithInlineFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const isDesktop = useIsDesktopLegacy();
  
  const selectedFilterOption = filterOptions.find(opt => opt.value === selectedFilter);

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <form onSubmit={onSearch} className="relative">
        <div className="relative flex items-center">
          {/* Desktop: Integrated Filter + Search */}
          {isDesktop ? (
            <div className="flex items-center w-full glass border-white/20 rounded-lg overflow-hidden">
              {/* Filter Selector */}
              <div className="flex-shrink-0 border-r border-white/20">
                <Select value={selectedFilter} onValueChange={onFilterChange}>
                  <SelectTrigger 
                    className="border-0 bg-transparent text-white/70 hover:text-white focus:ring-0 pl-4 pr-2 py-4 h-auto min-w-[160px]"
                  >
                    <SelectValue placeholder="Todos os Gêneros" />
                  </SelectTrigger>
                  <SelectContent 
                    className="bg-black/90 backdrop-blur-sm border-white/20 text-white"
                    sideOffset={5}
                  >
                    {filterOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="text-white hover:bg-purple-600/20 focus:bg-purple-600/20 cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search Section with Icon */}
              <div className="relative flex-1">
                <Search className="absolute left-4 text-white/50 z-10" size={20} />
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  className="border-0 bg-transparent pl-12 pr-12 py-4 text-lg text-white placeholder:text-white/50 focus-visible:ring-0 w-full"
                />
              
                {/* Clear Button */}
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClear}
                    className="absolute right-2 text-white/50 hover:text-white p-2 z-10"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Mobile: Original Layout
            <>
              <Search className="absolute left-4 text-white/50 z-10" size={20} />
              <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                className="pl-12 pr-24 py-4 text-lg glass border-white/20 text-white placeholder:text-white/50"
              />
              
              {/* Mobile: Filter Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-12 text-white/70 hover:text-white p-2 ${
                  selectedFilter !== 'all' ? 'text-purple-400' : ''
                }`}
              >
                <Filter size={20} />
              </Button>
              
              {/* Clear Button */}
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClear}
                  className="absolute right-2 text-white/50 hover:text-white p-2"
                >
                  <X size={20} />
                </Button>
              )}
            </>
          )}
        </div>
      </form>

      {/* Mobile: Inline Filter Options */}
      {!isDesktop && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: showFilters ? 1 : 0, 
            height: showFilters ? 'auto' : 0 
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-purple-400" />
              <span className="text-white/80 text-sm font-medium">Filtrar por gênero:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedFilter === option.value ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedFilter === option.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-white/30 text-white/70 hover:border-purple-400 hover:text-purple-400'
                  }`}
                  onClick={() => onFilterChange(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Active Filter Display - Mobile Only */}
      {!isDesktop && selectedFilter !== 'all' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-white/60 text-sm">Filtrando por:</span>
          <Badge 
            variant="outline" 
            className="border-purple-400 text-purple-400 cursor-pointer hover:bg-purple-600 hover:text-white"
            onClick={() => onFilterChange('all')}
          >
            {selectedFilterOption?.label}
            <X size={14} className="ml-1" />
          </Badge>
        </motion.div>
      )}
    </div>
  );
}