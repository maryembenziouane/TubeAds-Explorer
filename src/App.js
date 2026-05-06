import { useCallback, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import RecentListings from './components/RecentListings';
import TrustStrip from './components/TrustStrip';
import LoginModal from './components/LoginModal';
import MessagesDrawer from './components/MessagesDrawer';
import MyOrders from './components/MyOrders';
import VideoPlayerModal from './components/VideoPlayerModal';

const LOCALE_STORAGE = 'marketplace-locale';

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

function Shell() {
  const { user } = useAuth();
  const [page, setPage] = useState('listings');
  const [navId, setNavId] = useState('home');
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'fr';
    return localStorage.getItem(LOCALE_STORAGE) || 'fr';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activeAd, setActiveAd] = useState(null);

  const requireLogin = useCallback(() => setLoginOpen(true), []);

  function scrollToId(id) {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNavigate(id) {
    if (id === 'messages') {
      if (!user) {
        requireLogin();
        return;
      }
      setNavId('messages');
      setMessagesOpen(true);
      return;
    }

    if (id === 'orders') {
      if (!user) requireLogin();
      setPage('orders');
      setNavId('orders');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setPage('listings');
    if (id === 'home') {
      setNavId('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'categories') {
      setNavId('categories');
      scrollToId('categories');
    } else if (id === 'listings') {
      setNavId('listings');
      scrollToId('listings');
    } else {
      setNavId('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const isListings = page === 'listings';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header
        activeNavId={isListings ? navId : ''}
        locale={locale}
        onLocaleChange={setLocale}
        onNavigate={handleNavigate}
        onOpenMessages={() => {
          if (!user) {
            requireLogin();
            return;
          }
          setNavId('messages');
          setMessagesOpen(true);
        }}
        onLogin={() => setLoginOpen(true)}
        transparent={isListings}
      />

      {isListings && (
        <main>
          <Hero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={category}
            onCategoryChange={setCategory}
          />
          <div id="categories">
            <CategoryGrid selected={category} onSelect={setCategory} />
          </div>
          <div id="listings">
            <RecentListings
              searchQuery={searchQuery}
              category={category}
              onRequireLogin={requireLogin}
              onPlay={(ad) => setActiveAd(ad)}
            />
          </div>
          <TrustStrip />
        </main>
      )}

      {!isListings && (
        <main className="min-h-screen pt-4">
          <MyOrders onRequireLogin={requireLogin} />
        </main>
      )}

      <footer className="mx-auto max-w-[1280px] px-4 py-10 text-center text-xs text-slate-400 sm:px-6">
        © {new Date().getFullYear()} · Browse-only web experience · same Firebase project as mobile.
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <MessagesDrawer
        open={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        onRequireLogin={requireLogin}
      />
      <VideoPlayerModal open={!!activeAd} ad={activeAd} onClose={() => setActiveAd(null)} />
    </div>
  );
}
