import React, { createContext, useState, useContext, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

const SearchContextProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('All'); // Optional: if you want to filter by category
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null); // Added for error handling

  // Placeholder for a search function - to be implemented based on API or local filtering
  const performSearch = useCallback(async (term, category) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]); // Clear previous results immediately or show a loading state in results

    // console.log(`Searching for "${term}" in category "${category}"...`);
    
    // Simulate API call or filter logic here
    try {
      // Example: API call or filter logic here
      // Simulating a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set results (dummy data for now, actual implementation will fetch from API)
      // This part should be replaced by actual search logic.
      // For demonstration, if a term is provided, one might simulate finding results:
      // if (term && term.trim()) {
      //   setSearchResults([
      //     { id: 'dummy1', name: `Result for '${term}' in '${category}' #1` },
      //     { id: 'dummy2', name: `Result for '${term}' in '${category}' #2` },
      //   ]);
      // } else {
      //   setSearchResults([]); // No term, no results (already done above)
      // }
      // For now, keeping it as a placeholder that doesn't actively set new results post-simulation,
      // relying on setSearchResults([]) at the beginning of the function.
      
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Failed to fetch search results. Please try again.");
      // setSearchResults([]); // Results are already cleared or would be empty.
    } finally {
      setIsSearching(false);
    }
  }, []); // No dependencies as it operates on passed 'term' and 'category'

  const contextValue = {
    searchTerm,
    setSearchTerm,
    searchCategory,
    setSearchCategory,
    searchResults,
    setSearchResults, // Exposing this allows components to update results directly if needed
    isSearching,
    searchError,    // Expose search error state
    performSearch
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContextProvider;
