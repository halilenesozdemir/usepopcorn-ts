import { useRef } from "react";
import { useKey } from "../hooks/useKey";

type SearchInputProps = {
  query: string;
  setQuery: (value: string) => void;
  onCloseMovie: () => void;
};

export function SearchInput({
  query,
  setQuery,
  onCloseMovie,
}: SearchInputProps) {
  const inputElement = useRef<HTMLInputElement>(null);
  useKey("Enter", () => {
    if (document.activeElement === inputElement.current) return;
    inputElement.current?.focus();
    setQuery("");
    onCloseMovie();
  });

  return (
    <input
      ref={inputElement}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
      }}
    />
  );
}
