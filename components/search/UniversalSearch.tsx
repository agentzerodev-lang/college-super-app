"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { SearchResults } from "./SearchResults";

interface SearchResult {
  id: string;
  type: "event" | "resource" | "book" | "ticket";
  title: string;
  description?: string;
  subtitle?: string;
  metadata?: Record<string, unknown>;
}

interface EventResult {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: number;
  type: string;
}

interface ResourceResult {
  _id: string;
  title: string;
  description?: string;
  type: string;
  downloadCount?: number;
}

interface BookResult {
  _id: string;
  title: string;
  description?: string;
  author: string;
  availableCopies: number;
  totalCopies: number;
}

interface TicketResult {
  _id: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  priority: string;
}

interface UniversalSearchProps {
  collegeId?: string;
  clerkUserId?: string;
  onClose?: () => void;
}

export function UniversalSearch({ collegeId, clerkUserId, onClose }: UniversalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(async () => {
    if (!collegeId || !clerkUserId) return;

    setIsLoading(true);
    setShowResults(true);

    try {
      const searchResults: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      if (!selectedCategory || selectedCategory === "events") {
        const eventsRes = await fetch("/api/search/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, clerkUserId, searchTerm: query }),
        });
        if (eventsRes.ok) {
          const events: EventResult[] = await eventsRes.json();
          events.forEach((event) => {
            if (event.title.toLowerCase().includes(lowerQuery) || 
                event.description?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                id: event._id,
                type: "event",
                title: event.title,
                description: event.description,
                subtitle: event.location,
                metadata: { startTime: event.startTime, type: event.type },
              });
            }
          });
        }
      }

      if (!selectedCategory || selectedCategory === "resources") {
        const resourcesRes = await fetch("/api/search/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, clerkUserId, searchTerm: query }),
        });
        if (resourcesRes.ok) {
          const resources: ResourceResult[] = await resourcesRes.json();
          resources.forEach((resource) => {
            if (resource.title.toLowerCase().includes(lowerQuery) ||
                resource.description?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                id: resource._id,
                type: "resource",
                title: resource.title,
                description: resource.description,
                subtitle: resource.type,
                metadata: { downloadCount: resource.downloadCount },
              });
            }
          });
        }
      }

      if (!selectedCategory || selectedCategory === "books") {
        const booksRes = await fetch("/api/search/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, clerkUserId, searchTerm: query }),
        });
        if (booksRes.ok) {
          const books: BookResult[] = await booksRes.json();
          books.forEach((book) => {
            if (book.title.toLowerCase().includes(lowerQuery) ||
                book.author?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                id: book._id,
                type: "book",
                title: book.title,
                description: book.description,
                subtitle: `by ${book.author}`,
                metadata: { availableCopies: book.availableCopies, totalCopies: book.totalCopies },
              });
            }
          });
        }
      }

      if (!selectedCategory || selectedCategory === "tickets") {
        const ticketsRes = await fetch("/api/search/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId, clerkUserId, searchTerm: query }),
        });
        if (ticketsRes.ok) {
          const tickets: TicketResult[] = await ticketsRes.json();
          tickets.forEach((ticket) => {
            if (ticket.title.toLowerCase().includes(lowerQuery) ||
                ticket.description?.toLowerCase().includes(lowerQuery)) {
              searchResults.push({
                id: ticket._id,
                type: "ticket",
                title: ticket.title,
                description: ticket.description,
                subtitle: ticket.category,
                metadata: { status: ticket.status, priority: ticket.priority },
              });
            }
          });
        }
      }

      setResults(searchResults.slice(0, 20));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [collegeId, clerkUserId, query, selectedCategory]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query, selectedCategory, performSearch]);



  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery("");
    
    switch (result.type) {
      case "event":
        router.push(`/events/${result.id}`);
        break;
      case "resource":
        router.push(`/resources?id=${result.id}`);
        break;
      case "book":
        router.push(`/library?id=${result.id}`);
        break;
      case "ticket":
        router.push(`/tickets?id=${result.id}`);
        break;
    }
    
    onClose?.();
  };

  const categories = [
    { id: null, label: "All" },
    { id: "events", label: "Events" },
    { id: "resources", label: "Resources" },
    { id: "books", label: "Books" },
    { id: "tickets", label: "Tickets" },
  ];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, resources, books, tickets..."
          className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex gap-1 p-3 border-b border-slate-200 dark:border-slate-700">
            {categories.map((cat) => (
              <button
                key={cat.id ?? "all"}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : results.length > 0 ? (
              <SearchResults results={results} onResultClick={handleResultClick} />
            ) : query.length >= 2 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
