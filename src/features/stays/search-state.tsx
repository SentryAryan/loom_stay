import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { parseQuery, type ParsedQuery, type SortId } from "./search-stays";

interface SearchState {
  /** What is typed in the Search field. */
  text: string;
  setText: (text: string) => void;
  filters: ParsedQuery;
  setFilters: (filters: ParsedQuery) => void;
  sort: SortId;
  setSort: (sort: SortId) => void;
  /** Changes with every search started from Home; use it as a `key` to remount the text field. */
  searchId: number;
  /** A fresh search from Home: new text, filters read from it, default sort. */
  startSearch: (text: string) => void;
  /** Re-reads the filters from the typed text (keeps the chosen sort). */
  commitText: () => void;
}

const SearchStateContext = createContext<SearchState | null>(null);

// Search text, filters and sort live above the tabs because the filter and sort sheets are
// separate routes that must read and change the same state as the Search screen.
export function SearchStateProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState("");
  const [filters, setFilters] = useState<ParsedQuery>(() => parseQuery(""));
  const [sort, setSort] = useState<SortId>("best");
  const [searchId, setSearchId] = useState(0);

  const startSearch = useCallback((next: string) => {
    setText(next);
    setFilters(parseQuery(next));
    setSort("best");
    setSearchId((id) => id + 1);
  }, []);

  const commitText = useCallback(() => setFilters(parseQuery(text)), [text]);

  const value = useMemo(
    () => ({ text, setText, filters, setFilters, sort, setSort, searchId, startSearch, commitText }),
    [text, filters, sort, searchId, startSearch, commitText],
  );

  return <SearchStateContext.Provider value={value}>{children}</SearchStateContext.Provider>;
}

export function useSearchState(): SearchState {
  const state = useContext(SearchStateContext);
  if (!state) throw new Error("useSearchState must be used inside SearchStateProvider");
  return state;
}
