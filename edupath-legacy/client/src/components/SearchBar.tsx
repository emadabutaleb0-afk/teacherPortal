import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { mockTests, mockAllUsers } from '@/lib/mockData';

interface SearchResult {
  id: string;
  title: string;
  type: 'test' | 'user' | 'subject';
  description?: string;
  path: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Listen to Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search tests
    mockTests.forEach(test => {
      if (
        test.title.toLowerCase().includes(lowerQuery) ||
        test.subject.toLowerCase().includes(lowerQuery)
      ) {
        searchResults.push({
          id: test.id,
          title: test.title,
          type: 'test',
          description: `${test.subject} - Grade ${test.gradeLevel}`,
          path: `/test/${test.id}`,
        });
      }
    });

    // Search users (admin/teacher search)
    mockAllUsers.forEach(user => {
      if (user.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          id: user.id,
          title: user.name,
          type: 'user',
          description: `${user.role.toUpperCase()} - Grade ${user.gradeLevel || 'N/A'}`,
          path: `/admin/users`, // Real path would navigate to details, but we direct to users list for now
        });
      }
    });

    setResults(searchResults.slice(0, 8));
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'test':
        return '📝';
      case 'user':
        return '👤';
      case 'subject':
        return '📚';
      default:
        return '🔍';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'test':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
      case 'user':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300';
      default:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input Container */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tests, users..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-16 py-2 bg-muted/60 dark:bg-muted/30 border border-border/80 focus:border-primary/50 rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
        />
        
        {/* Right action inside input: X button or Kbd Shortcut badge */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
              }}
              className="text-muted-foreground hover:text-foreground p-0.5 hover:bg-muted dark:hover:bg-muted/50 rounded transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Search Results Dropdown (Glassmorphism) */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 dark:bg-card/90 backdrop-blur-md border border-border/80 rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Matches Found
              </div>
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result.path)}
                  className="w-full px-3 py-2 text-left hover:bg-muted dark:hover:bg-muted/40 rounded-lg transition-all flex items-center justify-between gap-3 group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base flex-shrink-0 bg-background dark:bg-muted p-1.5 rounded-lg shadow-sm border border-border/40">
                      {getIcon(result.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Type Badge */}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getTypeBadgeColor(result.type)}`}>
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found for <span className="font-semibold text-foreground">"{query}"</span></p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
