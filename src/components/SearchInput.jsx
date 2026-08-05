function SearchInput({ aramaMetni, setAramaMetni }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="CVE ID, paket veya kelime ara..."
        value={aramaMetni}
        onChange={(e) => setAramaMetni(e.target.value)}
      />
    </div>
  );
}

export default SearchInput;