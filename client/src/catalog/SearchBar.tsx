import { useState } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import "../styles/SearchBar.css";

export default function SearchBar() {
  const [term, setTerm] = useState("");
  const nav = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    nav({ pathname: "/search",
          search: createSearchParams({ q }).toString() });
    setTerm("");
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        value={term}
        onChange={e => setTerm(e.target.value)}
        placeholder="Search posts…"
        aria-label="Search posts"
      />
    </form>
  );
}
