import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home, { HOME_LISTINGS_PREVIEW } from './components/Home';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import MessagesDrawer from './components/MessagesDrawer';
import MyOrders from './components/MyOrders';
import VideoPlayerModal from './components/VideoPlayerModal';
import EditAdModal from './components/EditAdModal';
import AdminDashboard from './components/AdminDashboard';
import ShopPage from './components/ShopPage';
import { isAdminDashboardPath, matchShopPath, normalizePathname, pushPath, shopPathForUser, subscribePathname, ADMIN_DASHBOARD_PATH, LISTINGS_PAGE_PATH, isListingsPagePath } from './utils/routing';

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
  const [pathname, setPathname] = useState(() => normalizePathname(window.location.pathname));
  const [page, setPage] = useState('listings');
  const [navId, setNavId] = useState(() => {
    if (typeof window === 'undefined') return 'home';
    return isListingsPagePath(normalizePathname(window.location.pathname))
      ? 'listings'
      : 'home';
  });
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'fr';
    return localStorage.getItem(LOCALE_STORAGE) || 'fr';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [cityFilter, setCityFilter] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [activeAd, setActiveAd] = useState(null);
  const [editingAd, setEditingAd] = useState(null);

  const requireLogin = useCallback(() => setLoginOpen(true), []);

  const resetPathToHome = useCallback(() => {
    pushPath('/');
    setPathname(normalizePathname('/'));
  }, []);

  const goShop = useCallback((uid) => {
    if (!uid) return;
    const path = shopPathForUser(uid);
    pushPath(path);
    setPathname(normalizePathname(path));
  }, []);

  const goListingsPage = useCallback(() => {
    pushPath(LISTINGS_PAGE_PATH);
    setPathname(normalizePathname(LISTINGS_PAGE_PATH));
    setNavId('listings');
    setPage('listings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goAdminDashboard = useCallback(() => {
    pushPath(ADMIN_DASHBOARD_PATH);
    setPathname(normalizePathname(ADMIN_DASHBOARD_PATH));
  }, []);

  const goHome = useCallback(() => {
    resetPathToHome();
    setPage('listings');
    setNavId('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetPathToHome]);

  useEffect(() => {
    return subscribePathname(() =>
      setPathname(normalizePathname(window.location.pathname)),
    );
  }, []);

  function scrollToId(id) {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handleNavigate(id) {
    if (isAdminDashboardPath(pathname) || matchShopPath(pathname)) resetPathToHome();

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
      if (normalizePathname(pathname) !== '/') {
        pushPath('/');
        setPathname(normalizePathname('/'));
      }
      setNavId('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (id === 'categories') {
      if (normalizePathname(pathname) !== '/') {
        pushPath('/');
        setPathname(normalizePathname('/'));
      }
      setNavId('categories');
      scrollToId('categories');
    } else if (id === 'listings') {
      setNavId('listings');
      pushPath(LISTINGS_PAGE_PATH);
      setPathname(normalizePathname(LISTINGS_PAGE_PATH));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setNavId('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const adminRoute = isAdminDashboardPath(pathname);
  const shopMatch = matchShopPath(pathname);
  const shopRoute = !!shopMatch?.userId;
  const isListings = page === 'listings';
  const pathNorm = normalizePathname(pathname);
  const isHomeMarketplace = !shopRoute && !adminRoute && isListings && pathNorm === '/';
  const isListingsStandalone = !shopRoute && !adminRoute && isListings && isListingsPagePath(pathname);
  const headerNavId =
    !isListings || adminRoute || shopRoute
      ? ''
      : isListingsStandalone
        ? 'listings'
        : navId;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header
        activeNavId={headerNavId}
        locale={locale}
        onLocaleChange={setLocale}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => scrollToId('listings')}
        onOpenMessages={() => {
          if (!user) {
            requireLogin();
            return;
          }
          setNavId('messages');
          setMessagesOpen(true);
        }}
        onLogin={() => setLoginOpen(true)}
        onAdminDashboard={goAdminDashboard}
        transparent={isHomeMarketplace}
      />

      {shopRoute && (
        <ShopPage
          sellerId={shopMatch.userId}
          onRequireLogin={requireLogin}
          onPlay={(ad) => setActiveAd(ad)}
          onEdit={(ad) => {
            if (!user) {
              requireLogin();
              return;
            }
            setEditingAd(ad);
          }}
          onNavigateHome={resetPathToHome}
          onVisitShop={goShop}
        />
      )}

      {!shopRoute && adminRoute && (
        <main className="min-h-screen">
          <AdminDashboard onRequireLogin={requireLogin} onNavigateHome={resetPathToHome} />
        </main>
      )}

      {!shopRoute && !adminRoute && isListings && (
        <main>
          <Home
            isHomeMarketplace={isHomeMarketplace}
            isListingsStandalone={isListingsStandalone}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            category={category}
            onCategoryChange={setCategory}
            cityFilter={cityFilter}
            onCityChange={setCityFilter}
            onHeroSearchSubmit={() => scrollToId('listings')}
            onRequireLogin={requireLogin}
            onPlay={(ad) => setActiveAd(ad)}
            onEditAd={(ad) => {
              if (!user) {
                requireLogin();
                return;
              }
              setEditingAd(ad);
            }}
            onVisitShop={goShop}
            previewLimitHome={isHomeMarketplace ? HOME_LISTINGS_PREVIEW : undefined}
            onViewAllHome={isHomeMarketplace ? goListingsPage : undefined}
          />
        </main>
      )}

      {!shopRoute && !adminRoute && !isListings && (
        <main className="min-h-screen pt-4">
          <MyOrders onRequireLogin={requireLogin} />
        </main>
      )}

      {!adminRoute && (
        <Footer onHome={goHome} />
      )}

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <MessagesDrawer
        open={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        onRequireLogin={requireLogin}
      />
      <VideoPlayerModal open={!!activeAd} ad={activeAd} onClose={() => setActiveAd(null)} />
      <EditAdModal
        open={!!editingAd}
        ad={editingAd}
        onClose={() => setEditingAd(null)}
        onSaved={() => {}}
      />
    </div>
  );
}
