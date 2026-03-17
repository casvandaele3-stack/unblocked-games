import { useState, useMemo, useEffect } from 'react';
import { Search, Gamepad2, X, Maximize2, ExternalLink, Loader2, Heart, Share2, Twitter, Facebook, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import rawGamesData from './games.json';

const gamesData = Array.isArray(rawGamesData) ? rawGamesData : (rawGamesData.default || []);

const HighlightedText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-500/30 text-emerald-400 rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('unblocked-hub-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ratings, setRatings] = useState(() => {
    const saved = localStorage.getItem('unblocked-hub-ratings');
    return saved ? JSON.parse(saved) : {};
  });

  const categories = useMemo(() => {
    const cats = new Set(gamesData.map(game => game.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, []);

  useEffect(() => {
    localStorage.setItem('unblocked-hub-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('unblocked-hub-ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    if (selectedGame) {
      setIsGameLoading(true);
    }
  }, [selectedGame]);

  const toggleFavorite = (e, gameId) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId) 
        : [...prev, gameId]
    );
  };

  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = showOnlyFavorites ? favorites.includes(game.id) : true;
      const matchesCategory = selectedCategory === 'All' ? true : game.category === selectedCategory;
      return matchesSearch && matchesFavorite && matchesCategory;
    });
  }, [searchQuery, showOnlyFavorites, favorites, selectedCategory]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRate = (gameId, rating) => {
    setRatings(prev => ({
      ...prev,
      [gameId]: rating
    }));
  };

  const getRating = (gameId) => ratings[gameId] || 0;

  const shareGame = (platform) => {
    const url = window.location.href;
    const text = `Check out ${selectedGame.title} on Unblocked Hub!`;
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
      return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              setSelectedGame(null);
              setSearchQuery('');
              setSelectedCategory('All');
              setShowOnlyFavorites(false);
            }}
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Unblocked Hub</h1>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
                showOnlyFavorites 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                  : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Favorites</span>
            </button>
            <div className="relative flex-grow md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800 border border-white/5 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!selectedGame ? (
            <div className="flex flex-col gap-8">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      selectedCategory === category
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <motion.div
                key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  layoutId={game.id}
                  onClick={() => setSelectedGame(game)}
                  className="group bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                      <span className="text-sm font-medium text-white flex items-center gap-1">
                        Play Now <ExternalLink className="w-3 h-3" />
                      </span>
                      <button
                        onClick={(e) => toggleFavorite(e, game.id)}
                        className="p-2 bg-zinc-900/50 backdrop-blur-md rounded-lg hover:bg-emerald-500/20 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-emerald-500 text-emerald-500' : 'text-white'}`} />
                      </button>
                    </div>
                  </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">
                          <HighlightedText text={game.title} highlight={searchQuery} />
                        </h3>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className={`w-3 h-3 ${getRating(game.id) > 0 ? 'fill-amber-400' : ''}`} />
                          <span className="text-xs font-bold">{getRating(game.id) || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        {game.category && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">
                            {game.category}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm line-clamp-2">
                        <HighlightedText text={game.description} highlight={searchQuery} />
                      </p>
                    </div>
                </motion.div>
              ))}
              {filteredGames.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-zinc-500 text-lg">No games found matching your search.</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex flex-col gap-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-zinc-950 p-0' : ''}`}
            >
              <div className={`flex items-center justify-between ${isFullscreen ? 'p-4 bg-zinc-900/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold">{selectedGame.title}</h2>
                    {!isFullscreen && (
                      <p className="text-zinc-400 text-sm">{selectedGame.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 mr-2 border-r border-white/10 pr-2">
                    <button
                      onClick={() => shareGame('twitter')}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-sky-400"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => shareGame('facebook')}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-blue-500"
                      title="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(e, selectedGame.id)}
                    className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                      favorites.includes(selectedGame.id)
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedGame.id) ? 'fill-emerald-400' : ''}`} />
                    <span className="hidden sm:inline">Favorite</span>
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Maximize2 className="w-5 h-5" />
                    <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                  </button>
                </div>
              </div>

              <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'flex-grow rounded-none' : 'aspect-video w-full'}`}>
                {isGameLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-emerald-500" />
                    </motion.div>
                    <p className="mt-4 text-zinc-400 font-medium animate-pulse">Loading Game...</p>
                  </div>
                )}
                <iframe
                  src={selectedGame.url}
                  className="w-full h-full border-none"
                  allow="autoplay; fullscreen; keyboard"
                  title={selectedGame.title}
                  onLoad={() => setIsGameLoading(false)}
                />
              </div>
              
              {!isFullscreen && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-semibold mb-2">About {selectedGame.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">
                      {selectedGame.description} This is an unblocked version of {selectedGame.title}, 
                      playable directly in your browser without any downloads or installations.
                    </p>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold">Rate this game</h3>
                    <div className="flex items-center justify-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(selectedGame.id, star)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= getRating(selectedGame.id)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-700 hover:text-amber-400/50'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-zinc-500">
                      {getRating(selectedGame.id) > 0 
                        ? `You rated this ${getRating(selectedGame.id)} stars` 
                        : 'Click a star to rate'}
                    </p>
                    
                    <div className="h-px bg-white/5 my-2" />
                    
                    <h3 className="text-lg font-semibold">Share this game</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => shareGame('twitter')}
                        className="flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/50 rounded-xl transition-all text-sm font-medium group"
                      >
                        <Twitter className="w-4 h-4 group-hover:text-sky-400" />
                        Twitter
                      </button>
                      <button
                        onClick={() => shareGame('facebook')}
                        className="flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/50 rounded-xl transition-all text-sm font-medium group"
                      >
                        <Facebook className="w-4 h-4 group-hover:text-blue-500" />
                        Facebook
                      </button>
                    </div>
                    <button
                      onClick={() => shareGame('copy')}
                      className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl transition-all text-sm font-medium text-emerald-400"
                    >
                      <Share2 className="w-4 h-4" />
                      Copy Game Link
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 px-4 text-center text-zinc-500 text-sm">
        <p>© 2026 Unblocked Hub. All games are property of their respective owners.</p>
      </footer>
    </div>
  );
}
