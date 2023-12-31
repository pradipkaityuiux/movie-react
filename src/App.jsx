import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useLocalStorageState } from "./useLocalStorageState";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState(tempMovieData);
  const [query, setQuery] = useState("");
  const [updateQuery, setUpdateQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  const [selectedMovie, setSelectedMovie] = useState(null)
  const key = 'b93b2c4c';
  // const [watched, setWatched] = useState(function(){
  //   const storedData = localStorage.getItem("Watched");
  //   return JSON.parse(storedData);
  // });

  const [watched, setWatched] = useLocalStorageState([], "Watched")

  useEffect(function(){
    async function fetchMovies(){
      try{
        setLoading(true);
        setError("");
        const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${query}`)
        if(!res.ok){
          throw new Error("Something went wrong with fetching data.")
        }
        const data = await res.json()
        if(data.Response === 'False'){
          throw new Error("No Movie Found.")
        }
        setMovies(data.Search)
      }catch(err){
        setError(err.message)
      }finally{
        setLoading(false)
      }
    }

    if(query.length < 3){
      setMovies([]);
      setError("");
      return;
    }
    fetchMovies();
    closeMovieDetail()
    document.title = `UsePopcorn | ${query}`;
  },[updateQuery])

  // useEffect(function(){
  //   localStorage.setItem("Watched", JSON.stringify(watched))
  // }, [watched])

  const handleAddWatched = (movie) =>{
    setWatched(watched => [...watched, movie])
    // localStorage.setItem('Watched', JSON.stringify([...watched, movie]))
  }

  const handleQuery = (e) =>{
    if(e.keyCode === 13){
      setUpdateQuery(query)
    }
  } 

  function handleSelectedMovie(movie){
    setSelectedMovie(selectedId => selectedId === movie ? null : movie)
  }
  
  function closeMovieDetail(){
    setSelectedMovie(null)
  }

  function handleDeleteWatched(id){
    setWatched(watched => watched.filter(movie => movie.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} handleQuery={handleQuery}/>
        <NumResults  movies={movies}/>
      </Navbar>
      <Main>
        <Box>
          {loading && <Loader />}
          {error && <ErrorMessage message={error}/>}
          {!loading && !error && <MovieList movies={movies} handleSelectedMovie={handleSelectedMovie}/>}
        </Box>
        {/* {loading ? <p>Loading</p> : <Box element={<MovieList movies={movies} />} />} */}

        <Box>
          { selectedMovie ?
            <>
              <MovieDetail selectedMovie={selectedMovie} onCloseMovie={closeMovieDetail} onAddWatched={handleAddWatched} watched={watched}/>
            </> :
            <>
              <WatchedSummary watched={watched}/>
              <WatchedMoviesList watched={watched} onDelete={handleDeleteWatched}/>
            </>}
        </Box>
        {/* <Box element={
          <>
            <WatchedSummary watched={watched}/>
            <WatchedMoviesList watched={watched}/>
          </>
        }/> */}
      </Main>
      
    </>
  );
}

function Loader(){
  return(
    <p className="loader">Loading...</p>
  )
}

function ErrorMessage({message}){
  return (
    <p className="error"><span>❌</span>{message}</p>
  )
}

function Navbar({children}){
  
  return (
  <nav className="nav-bar">
    <Logo/>
    {children}
  </nav>
  )
}

function Search({ query, setQuery, handleQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    inputEl.current.focus();
  }, []);

  useEffect(() => {
    function callBack(e) {
      if (e.keyCode === 9) {
        e.preventDefault(); // Prevent the default tab behavior
        inputEl.current.focus();
      }
    }
    document.addEventListener('keydown', callBack);
    return function(){
      document.removeEventListener('keydown', callBack);
    }
  }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleQuery}
      ref={inputEl}
    />
  );
}

function Logo(){
  return(
    <div className="logo">
      <span role="img">🎥</span>
      <h1>MovieLand</h1>
    </div>
  )
}

function NumResults({movies}){
  return(
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Main({children}){
  return(
    <main className="main">
        {children}
      </main>
  )
}

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);
  return(
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}

function MovieList({movies, handleSelectedMovie}){
  return(
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} setMovieId={handleSelectedMovie}/>    
      ))}
    </ul>
  )
}

function Movie({movie, setMovieId}){
  return(
    <li onClick={()=>setMovieId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

// function WatchBox({movies}){
//   const [isOpen2, setIsOpen2] = useState(true);

//   return(
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched}/>

//           <WatchedMoviesList watched={watched}/>
//         </>
//       )}
//     </div>
//   )
// }

function MovieDetail({selectedMovie, onCloseMovie, onAddWatched, watched}){
  const key = 'b93b2c4c';
  const [movieLoading, setMovieLoading] = useState(false);
  const [currentMovie, setCurrentMovie] = useState({});
  const {Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released, Actors: actors, Director: director, Genre: genre} = currentMovie;
  const [userRating, setUserRating] = useState(0);

  useEffect(function(){
    setCurrentMovie('')
    setMovieLoading(true);
    
    async function getMovieDetails(){
      const res = await fetch(`https://www.omdbapi.com/?apikey=${key}&i=${selectedMovie}`)
      const data = await res.json();
      setCurrentMovie(data)
      setMovieLoading(false);
    }
    getMovieDetails();
  }, [selectedMovie])

  useEffect(function(){
    if(!title) return;
    document.title = `Movie | ${title}`;

    // This Condition is for Unmounting the MovieDetail component.
    return function(){
      document.title = "UsePopcorn";
    }
  }, [title])

  useEffect(function(){
    function callBack(e){
      if(e.keyCode == 27){
        onCloseMovie();
      }
    }
    document.addEventListener('keydown', callBack)
    return function(){
      document.removeEventListener('keydown', callBack);
    }
  }, [onCloseMovie])

  const handleAdd = () =>{
    const newWatchedMovie = {
      imdbID: selectedMovie,
      title,
      poster,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating
    }
    onAddWatched(newWatchedMovie);
    onCloseMovie()
  }
  
  const presentWatchedMovie = Boolean(watched.find(movie => movie.imdbID == selectedMovie))
  // const presentWatchedMovie = watched.map(movie => movie.imdbID).includes(selectedMovie)

  const selectedMovieRatingPresent = watched.find(movie => movie.imdbID == selectedMovie)?.userRating

  return (
    <div className="details">
      {movieLoading ? <Loader/> : 
      <>
        <header>
          <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
          <img src={poster} alt={`Poster of ${title}`} />
          <div className="details-overview">
            <h2>{title}</h2>
            <p>{released} &bull; {runtime}</p>
            <p>{genre}</p>
            <p><span>⭐</span>{imdbRating} IMDB Rating</p>
          </div>
        </header>
        <section>
          {!presentWatchedMovie && <div className="rating">
            <StarRating maxRange={10} size={24} onSetRating={setUserRating}/>
            <button className={`btn-add ${userRating==0 ? "addDisabled" : ""}`} onClick={handleAdd} disabled={userRating==0}>+ Add to list</button>
          </div>}
          {presentWatchedMovie && <div className="rating">You rated this movie with {selectedMovieRatingPresent}</div>}
          <p><em>{plot}</em></p>
          <p>Starring {actors}</p>
          <p>Directed by {director}</p>
        </section>
      </>}
    </div>
  )
}

function WatchedSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return(
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
        <span>{avgRuntime.toFixed(0)} min</span>
      </p>
    </div>
  </div>
  )
}

function WatchedMoviesList({watched, onDelete}){
  return(
    <ul className="list">
      {watched.map((movie) => (
          <WatchedMovie key={movie.imdbID} movie={movie} onDeleteWatched={onDelete}/>
      ))}
    </ul>
  ) 
}

function WatchedMovie({movie, onDeleteWatched}){
  return(
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
        <button className="btn-delete" onClick={()=>onDeleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}