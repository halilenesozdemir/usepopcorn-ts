import { useEffect, useState } from "react";

export const KEY = "4854c6ea";

export function useMovies(query: string, callback?: () => void) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal },
        );
        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error(data.Error);
        }

        setMovies(data.Search);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErrorMessage(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (query.length < 3) {
      setMovies([]);
      setErrorMessage("");
      return;
    }
    callback?.();
    fetchMovies();

    return () => {
      controller.abort();
    };
  }, [query]);

  return {
    movies,
    isLoading,
    errorMessage,
    query,
  };
}
