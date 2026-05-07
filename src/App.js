import { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryGrid from './components/CategoryGrid';
import RecentListings from './components/RecentListings';
import TrustStrip from './components/TrustStrip';
import SiteFooter from './components/SiteFooter';
import LoginModal from './components/LoginModal';
import MessagesDrawer from './components/MessagesDrawer';
import MyOrders from './components/MyOrders';
import VideoPlayerModal from './components/VideoPlayerModal';
import EditAdModal from './components/EditAdModal';
import AdminDashboard from './components/AdminDashboard';
import ShopPage from './components/ShopPage';
import { isAdminDashboardPath, matchShopPath, normalizePathname, pushPath, shopPathForUser, subscribePathname, ADMIN_DASHBOARD_PATH } from './utils/routing';

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

  const adminRoute = isAdminDashboardPath(pathname);
  const shopMatch = matchShopPath(pathname);
  const shopRoute = !!shopMatch?.userId;
  const isListings = page === 'listings';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header
        activeNavId={isListings && !adminRoute && !shopRoute ? navId : ''}
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
        onAdminDashboard={goAdminDashboard}
        transparent={isListings && !adminRoute && !shopRoute}
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
              onEdit={(ad) => {
                if (!user) {
                  requireLogin();
                  return;
                }
                setEditingAd(ad);
              }}
              onVisitShop={goShop}
            />
          </div>
          <TrustStrip />
        </main>
      )}

      {!shopRoute && !adminRoute && !isListings && (
        <main className="min-h-screen pt-4">
          <MyOrders onRequireLogin={requireLogin} />
        </main>
      )}

      {!adminRoute && (
        <SiteFooter onHome={goHome} onAdminDashboard={goAdminDashboard} />
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
