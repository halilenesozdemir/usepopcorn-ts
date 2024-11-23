import { Fragment, useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { Movie } from "./types/Movie";
import { WatchedMovie } from "./types/WatchedMovie";
import { useMovies } from "./hooks/useMovies";
import { ErrorMessage } from "./components/ErrorMessage";
import { Loader } from "./components/Loader";
import { Navbar } from "./components/Navbar";
import { SearchInput } from "./components/SearchInput";
import { NumResults } from "./components/NumResults";
import { ListBox } from "./components/ListBox";
import { Main } from "./components/Main.1";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useKey } from "./hooks/useKey";
import { useMovieDetails } from "./hooks/useMovieDetails";

function average(arr: number[]) {
  if (arr.length === 0) return 0;
  const total = arr.reduce((sum, value) => sum + value, 0);
  return total / arr.length;
}

type MovieListProps = {
  movies: Movie[];
  onSelectedId: (id: string) => void;
};

type MovieItemProps = {
  movie: Movie;
  onSelectedId: (id: string) => void;
};

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [watched, setWatched] = useLocalStorageState([], "watched");

  const { movies, isLoading, errorMessage } = useMovies(
    query,
    handleCloseMovie,
  );

  useKey("Escape", handleCloseMovie);
  function handleAddWatched(movie: WatchedMovie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatch(id: string) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  function handleSelectedId(id: string) {
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  return (
    <Fragment>
      <Navbar>
        <SearchInput
          query={query}
          setQuery={setQuery}
          onCloseMovie={handleCloseMovie}
        />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <ListBox>
          {isLoading && <Loader />}
          {!isLoading && !errorMessage && (
            <MovieList movies={movies} onSelectedId={handleSelectedId} />
          )}
          {errorMessage && <ErrorMessage error={errorMessage} />}
        </ListBox>
        <ListBox>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatch}
              />
            </>
          )}
        </ListBox>
      </Main>
    </Fragment>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
}: {
  selectedId: string;
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovie) => void;
  watched: WatchedMovie[];
}) {
  const [userRating, setUserRating] = useState<number>(0);
  const { movieDetails, isLoading } = useMovieDetails(selectedId);

  const countRef = useRef(0);

  useEffect(() => {
    if (!userRating) return;
    countRef.current++;
  }, [userRating]);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetails;

  const newWatchedMovie = {
    imdbID: selectedId,
    title,
    poster,
    userRating,
    imdbRating: Number(imdbRating),
    runtime: Number(runtime?.split(" ").at(0)),
    countRatingDecisions: countRef.current,
  };

  function renderMovieDetail() {
    if (isLoading) {
      return <Loader />;
    }
    return (
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>
            &larr;
          </button>
          <img src={poster} alt={`Poster of ${title} movie`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>
              {released} &bull; {runtime}
            </p>
            <p>{genre}</p>
            <p>
              <span>⭐</span>
              {imdbRating} IMDb rating
            </p>
          </div>
        </header>
        <section>
          <div className="rating">
            {!isWatched ? (
              <>
                <StarRating maxRating={10} onSetRating={setUserRating} />
                {userRating > 0 && (
                  <button
                    className="btn-add"
                    onClick={handleAdd}
                    disabled={isWatched}
                  >
                    + Add to List
                  </button>
                )}
              </>
            ) : (
              <p>
                You rated with movie {watchedUserRating} <span>⭐</span>
              </p>
            )}
          </div>
          <p>
            <em>{plot}</em>
          </p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section>
      </>
    );
  }

  function handleAdd() {
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(() => {
    if (!title) return;
    document.title = `MOVIE: ${title}`;
    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return <div className="details">{renderMovieDetail()}</div>;
}

function MovieList({ movies, onSelectedId }: MovieListProps) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <MovieItem
          movie={movie}
          key={movie.imdbID}
          onSelectedId={onSelectedId}
        />
      ))}
    </ul>
  );
}

function MovieItem({ movie, onSelectedId }: MovieItemProps) {
  const { Title: title, Poster: poster, Year: year } = movie;
  return (
    <li onClick={() => onSelectedId(movie.imdbID)}>
      <img src={poster} alt={`${title} poster`} />
      <h3>{title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedMoviesList({
  watched,
  onDeleteWatched,
}: {
  watched: WatchedMovie[];
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <ul className="list">
      {watched?.map((movie) => (
        <WatchedMovieItem
          key={movie.title} // Burada neden imdbId key'inde key error'u veriyor anlamalıyız.
          movie={movie}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function Summary({ watched }: { watched: WatchedMovie[] }) {
  const avgImdbRating = average(watched?.map((movie) => movie.imdbRating ?? 0));
  const avgUserRating = average(watched?.map((movie) => movie.userRating ?? 0));
  const avgRuntime = average(watched?.map((movie) => movie.runtime ?? 0));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovieItem({
  movie,
  onDeleteWatched,
}: {
  movie: WatchedMovie;
  onDeleteWatched: (id: string) => void;
}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>

      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID!)}
        >
          X
        </button>
      </div>
    </li>
  );
}
