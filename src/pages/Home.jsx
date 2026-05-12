/**
 * pages/Home.jsx — Página principal saga-first de no/limits.
 *
 * Estructura:
 *  1. Hero cinematográfico (texto animado + buscador)
 *  2. Sagas destacadas (grid de 8 franquicias con backdrops)
 *  3. En tendencia esta semana (películas)
 *  4. Mejor valorado
 *  5. Anime destacado
 *  6. Videojuegos (IGDB)
 *  7. Libros recomendados
 *  8. Mi biblioteca
 */

import HeroSection    from '@/components/sections/HeroSection';
import FeaturedSagas  from '@/components/sections/FeaturedSagas';
import ContentSection from '@/components/sections/ContentSection';
import MyListSection  from '@/components/sections/MyListSection';
import { useTrendingMovies, useTopRatedMovies } from '@/hooks/useTMDB';
import { useTopAnime }       from '@/hooks/useJikan';
import { useBooksBySubject } from '@/hooks/useOpenLibrary';
import { useTopGames }       from '@/hooks/useIGDB';
import { HOME_SECTIONS, BOOK_SUBJECTS } from '@/utils/constants';

function Home() {
  const { data: trending,  isLoading: lT,  error: eT  } = useTrendingMovies();
  const { data: topMovies, isLoading: lTR, error: eTR } = useTopRatedMovies();
  const { data: anime,     isLoading: lA,  error: eA  } = useTopAnime();
  const { data: books,     isLoading: lB,  error: eB  } = useBooksBySubject(BOOK_SUBJECTS.SCI_FI);
  const { data: games,     isLoading: lG,  error: eG  } = useTopGames();

  return (
    <>
      {/* Hero con backdrop de primera obra en tendencia */}
      <HeroSection
        backdropUrl={trending?.[0]?.backdrop}
        title={trending?.[0]?.title}
      />

      {/* Sagas — bloque visual principal */}
      <div className="container">
        <FeaturedSagas />
      </div>

      {/* Tendencias */}
      <ContentSection
        title={HOME_SECTIONS.TRENDING}
        obras={trending}
        isLoading={lT}
        error={eT}
        cardType="media"
        limit={10}
      />

      {/* Top rated */}
      <ContentSection
        title={HOME_SECTIONS.TOP_RATED}
        obras={topMovies}
        isLoading={lTR}
        error={eTR}
        cardType="media"
        limit={10}
      />

      {/* Anime */}
      <ContentSection
        title={HOME_SECTIONS.ANIME}
        obras={anime}
        isLoading={lA}
        error={eA}
        cardType="anime"
        limit={10}
      />

      {/* Juegos */}
      <ContentSection
        title={HOME_SECTIONS.GAMES}
        obras={games}
        isLoading={lG}
        error={eG}
        cardType="media"
        limit={10}
      />

      {/* Libros */}
      <ContentSection
        title={HOME_SECTIONS.BOOKS}
        obras={books}
        isLoading={lB}
        error={eB}
        cardType="book"
        limit={6}
      />

      {/* Biblioteca personal */}
      <MyListSection />

      <div style={{ height: 'var(--space-16)' }} />
    </>
  );
}

export default Home;
