# TODO: Persist Home Page Data

- [ ] Define localStorage keys for state persistence
- [ ] Add function to load state from localStorage on component mount
- [ ] Add function to save state to localStorage on changes
- [ ] Modify useEffect to load persisted data and check timestamps (refetch if older than 5 minutes)
- [ ] Save fetched data with timestamp after successful API calls
- [ ] Save user input states (searchTerm, categoryFilter, sortBy) on changes
- [ ] Test navigation to another page and back to verify persistence
