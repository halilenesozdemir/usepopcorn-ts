import { useEffect, useState } from "react";
import { MovieDetail } from "../types/MovieDetail";
import { KEY } from "./useMovies";

export const useMovieDetails = (selectedId: string) => {
  const [movieDetails, setMovieDetails] = useState<MovieDetail>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    async function getMovieDetails() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
        );
        const data = await res.json();
        setMovieDetails(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
    getMovieDetails();
  }, [selectedId]);
  return { movieDetails, isLoading };
};
