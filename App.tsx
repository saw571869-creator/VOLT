/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  ShoppingCart,
  Search,
  Zap,
  CupSoda,
  Citrus,
  Leaf,
  Flame,
  Heart,
  UserPlus,
  UserCheck,
  Star,
  ArrowLeft,
  X,
  Share2,
  Send,
  Award,
  Bell,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  Plus,
  Trash2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Shield,
  Smartphone,
  MapPin,
  Image as ImageIcon,
  Camera,
  Radio,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from './types';
import { translations } from './translations';
import { productsData, Product } from './products';

export default function App() {
  // Screens: 'home' | 'profile' | 'settings' | 'product-detail'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'profile' | 'settings' | 'product-detail'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('energy');

  // Product Selection, Cart, Saved/Favorite lists, and Custom Dynamic toast status
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showCartModal, setShowCartModal] = useState<boolean>(false);

  // Likes & Followers states (Starts at 0, goes to 1, back to 0 as requested)
  const [liked, setLiked] = useState<boolean>(false);
  const [followed, setFollowed] = useState<boolean>(false);

  // Ratings bottom sheet state
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  // Form states for rating
  const [formName, setFormName] = useState<string>('');
  const [formComment, setFormComment] = useState<string>('');
  const [formStars, setFormStars] = useState<number>(5);

  // Floating Sidebar Number metric (Shares and Ratings count)
  const [sidebarMetric, setSidebarMetric] = useState<number>(37);

  // Drag state for floating badge
  const [isDraggingBadge, setIsDraggingBadge] = useState<boolean>(false);

  // App closed/overlay states
  const [isAppClosed, setIsAppClosed] = useState<boolean>(false);
  const [showFloatingReviewsMenu, setShowFloatingReviewsMenu] = useState<boolean>(false);
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio synthesis chime function for floating widget when closed
  const playOverlaySound = () => {
    if (isAppClosed) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch (e) {
        console.warn("Overlay chime error:", e);
      }
    }
  };

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Permissions state and modal controls
  const [showPermissionsModal, setShowPermissionsModal] = useState<boolean>(false);
  const [showSystemSettingsSim, setShowSystemSettingsSim] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<{
    notifications: boolean;
    location: boolean;
    photos: boolean;
    camera: boolean;
    nearby: boolean;
    drawOver: boolean;
  }>({
    notifications: true,
    location: false,
    photos: false,
    camera: false,
    nearby: false,
    drawOver: false
  });

  // Initial Review data
  const [reviewsList, setReviewsList] = useState<Review[]>([
    {
      id: '1',
      name: '',
      comment: '',
      stars: 5,
      date: ''
    },
    {
      id: '2',
      name: '',
      comment: '',
      stars: 5,
      date: ''
    }
  ]);

  // Audio synthesis chime function (silenced completely by user request)
  const playChime = () => {
    // Click sound effects removed entirely
  };

  // Safe translation retriever
  const t = (key: keyof (typeof translations)['ar']) => {
    return translations[language][key] || translations['ar'][key];
  };

  // Toast notifier helper
  const showToastMsg = (msg: string) => {
    setToast({ message: msg, type: 'success' });
    setTimeout(() => {
      setToast(prev => prev && prev.message === msg ? null : prev);
    }, 2800);
  };

  // Add item to cart
  const handleAddToCart = (productId: string, productName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // prevent opening product details screen
    }
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    playChime();
    showToastMsg(`${productName} -> ${t('cartToast')}`);
  };

  // Toggle Save item to wishlist
  const handleToggleSaveProduct = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    playChime();
    if (savedProductIds.includes(productId)) {
      setSavedProductIds(prev => prev.filter(id => id !== productId));
    } else {
      setSavedProductIds(prev => [...prev, productId]);
      showToastMsg(t('savedToast'));
    }
  };

  // Share link
  const handleShareProduct = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    playChime();
    const displayName = language === 'ar' ? product.nameAr : product.nameEn;
    try {
      if (navigator.share) {
        navigator.share({
          title: displayName,
          text: language === 'ar' ? product.descAr : product.descEn,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      }
    } catch (err) {}
    showToastMsg(`${displayName} -> ${t('sharedToast')}`);
  };

  // UI Theme Helpers
  const getAppStateClasses = () => {
    return darkMode 
      ? 'bg-black text-white' 
      : 'bg-orange-500 text-white';
  };

  const getCardBgClasses = () => {
    return darkMode
      ? 'bg-zinc-900/90 border border-red-600/30'
      : 'bg-white/15 backdrop-blur-xl border border-white/20';
  };

  const getSubCardBgClasses = () => {
    return darkMode
      ? 'bg-neutral-950/80 border border-red-600/20'
      : 'bg-white/5 border border-white/10';
  };

  const getIconColor = (fallbackOrangeColor: string) => {
    return darkMode ? 'text-red-600' : fallbackOrangeColor;
  };

  const getCategoryThemeClass = (cat: string, isActive: boolean) => {
    if (isActive) {
      if (darkMode) return 'bg-white border-red-600 border scale-105 shadow-xl';
      return 'bg-white border-yellow-450 scale-105 shadow-xl';
    }
    return 'bg-white/15 hover:bg-white/25 border border-white/10';
  };

  // Submit new review
  const handleAddRating = (e: React.FormEvent) => {
    e.preventDefault();
    playChime();
    if (!formName.trim() || !formComment.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      name: formName.trim(),
      comment: formComment.trim(),
      stars: formStars,
      date: t('now'),
      isCustom: true
    };

    setReviewsList([newReview, ...reviewsList]);
    setSidebarMetric(prev => prev + 1);

    // reset elements
    setFormName('');
    setFormComment('');
    setFormStars(5);
    setShowRatingModal(false);
  };

  // Metric updates
  const likesCount = liked ? 1 : 0;
  const followersCount = followed ? 1 : 0;

  // Total cart items count helper
  const totalCartItemsCount: number = Object.keys(cart).reduce((sum: number, key: string) => sum + (cart[key] || 0), 0);

  // Average stars logic
  const averageStars = (() => {
    const customCount = reviewsList.filter(r => r.isCustom).length;
    // Base reviews are static 5 stars
    const totalStars = reviewsList.reduce((acc, curr) => {
      if (curr.isCustom) return acc + curr.stars;
      return acc + 5; // static reviews have 5 stars
    }, 0);
    return (totalStars / reviewsList.length).toFixed(1);
  })();

  const layoutDir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      id="main-container"
      dir={layoutDir}
      className={`fixed inset-0 w-screen h-screen font-sans overflow-hidden select-none transition-colors duration-500 ${getAppStateClasses()}`}
    >
      {/* Dynamic Floating Side Badge */}
      <motion.div
        id="side-floating-badge"
        drag
        dragMomentum={false}
        onDragStart={() => {
          setIsDraggingBadge(true);
          playChime();
        }}
        onDragEnd={() => setIsDraggingBadge(false)}
        onClick={() => {
          playChime();
          if (isDraggingBadge) return;
          setShowRatingModal(true);
        }}
        className={`fixed z-40 bg-white/30 backdrop-blur-xl border border-white/30 shadow-2xl cursor-grab active:cursor-grabbing flex flex-col items-center justify-center transition-all duration-200 select-none ${
          language === 'ar' ? 'left-4' : 'right-4'
        } top-1/3 ${
          isDraggingBadge
            ? 'rounded-full w-16 h-16 p-0 border-red-500 bg-red-600/90 scale-110'
            : 'rounded-2xl py-5 px-3.5 gap-2.5 max-w-[55px] min-h-[155px]'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 id="side-badge-icon" className={`text-yellow-300 animate-pulse ${isDraggingBadge ? 'w-6 h-6 text-red-100' : 'w-5 h-5'}`} />
        
        {!isDraggingBadge && (
          <span 
            id="side-badge-label" 
            className="text-[11px] font-black text-white tracking-widest writing-vertical-lr text-center my-0.5 select-none"
          >
            {t('ratingBadge')}
          </span>
        )}
        
        <div
          id="side-badge-counter"
          className={`bg-yellow-400 text-orange-950 font-black text-xs px-2 py-0.5 rounded-full text-center ${
            isDraggingBadge 
              ? 'absolute -top-1 -right-1 min-w-[22px] text-[10px] shadow-lg border border-white/50 animate-bounce bg-red-600 text-white' 
              : 'min-w-[20px] mt-1'
          }`}
        >
          {sidebarMetric}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isAppClosed ? (
          /* ========================================================================= */
          /* SIMULATED MOBILE SYSTEM HOME SCREEN WALLPAPER                             */
          /* ========================================================================= */
          <motion.div
            key="simulated-system-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative overflow-hidden flex flex-col justify-between p-6 md:p-8"
            style={{
              background: 'radial-gradient(circle at top right, #1e1b4b, #09090b), radial-gradient(circle at bottom center, #4c1d95, #111827)',
              backgroundBlendMode: 'plus-lighter'
            }}
          >
            {/* Top status bar details */}
            <div className="w-full flex items-center justify-between text-[11px] font-black text-white/50 pointer-events-none select-none px-2 pt-1">
              <span>{new Date().toLocaleTimeString(language === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span>VOLT 5G</span>
                <span>📶</span>
                <span>🔋 98%</span>
              </div>
            </div>

            {/* Giant clean central OS time clock */}
            <div className="flex flex-col items-center justify-center my-auto py-10 text-center gap-2">
              <motion.h1 
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl font-black text-white tracking-widest drop-shadow-xl font-mono"
              >
                {new Date().toTimeString().slice(0, 5)}
              </motion.h1>
              <p className="text-xs font-black text-yellow-300 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-lg">
                📆 {new Date().toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>

            {/* Simulated Desktop Applications Grid */}
            <div className="w-full max-w-sm mx-auto grid grid-cols-4 gap-y-7 gap-x-4 mb-24 px-2">
              {/* Phone App */}
              <div className="flex flex-col items-center gap-2 cursor-not-allowed group opacity-70 animate-pulse">
                <div className="w-13 h-13 rounded-2xl bg-green-500 hover:bg-green-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all text-white text-xl">
                  📞
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </span>
              </div>

              {/* Messages App */}
              <div className="flex flex-col items-center gap-2 cursor-not-allowed group opacity-70 animate-pulse">
                <div className="w-13 h-13 rounded-2xl bg-sky-500 hover:bg-sky-450 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all text-white text-xl">
                  💬
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">
                  {language === 'ar' ? 'الرسائل' : 'Messages'}
                </span>
              </div>

              {/* Browser App */}
              <div className="flex flex-col items-center gap-2 cursor-not-allowed group opacity-70 animate-pulse">
                <div className="w-13 h-13 rounded-2xl bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all text-lg font-bold text-blue-600">
                  🌐
                </div>
                <span className="text-[10px] font-bold text-white shadow-sm">
                  {language === 'ar' ? 'المتصفح' : 'Browser'}
                </span>
              </div>

              {/* VOLT ENERGY OFFICIAL ACTIVE LAUNCHER SHORTCUT */}
              <motion.div
                onClick={() => {
                  setIsAppClosed(false);
                  showToastMsg(language === 'ar' ? 'تم استئناف تشغيل تطبيق VOLT بنجاح! ⚡' : 'VOLT App resumed successfully! ⚡');
                }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-600 to-yellow-500 p-0.5 shadow-2xl border border-yellow-400 flex items-center justify-center relative">
                  {/* Glowing active animation */}
                  <span className="absolute inset-0 bg-yellow-400 rounded-2xl opacity-60 blur-xs animate-ping" />
                  <img
                    src="https://i.ibb.co/cSVN8tbw/IMG-567.jpg"
                    alt="VOLT Launcher"
                    className="w-full h-full object-cover rounded-[14px] z-10"
                    referrerPolicy="no-referrer"
                  />
                  {/* Mini numeric badge representing active reviews */}
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 border border-white text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center shadow-md z-20">
                    {sidebarMetric}
                  </span>
                </div>
                <span className="text-[10px] font-black text-yellow-300 drop-shadow-md text-center max-w-[62px] truncate">
                  VOLT
                </span>
              </motion.div>
            </div>

            {/* Simulated Android Home pill button at the bottom */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/45 hover:bg-white/70 rounded-full cursor-pointer transition-colors" 
                 onClick={() => {
                   setIsAppClosed(false);
                   showToastMsg(language === 'ar' ? 'أهلاً بك مجدداً في عائلة VOLT! ⚡' : 'Welcome back to VOLT world! ⚡');
                 }}
            />
          </motion.div>
        ) : (
          /* OTHERWISE RENDER ORIGINAL CODE: */
          currentScreen === 'home' && (
          /* ========================================================================= */
          /* HOME SCREEN                                                               */
          /* ========================================================================= */
          <motion.div
            key="home-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex flex-col items-center justify-start overflow-y-auto pb-20"
          >
            {/* Header / Navbar Container */}
            <header id="navbar" className="w-full max-w-7xl px-4 py-4 md:px-8 mt-2">
              <div
                id="navbar-content"
                className={`flex items-center justify-between shadow-2xl rounded-2xl px-6 py-4 transition-all duration-300 ${
                  darkMode ? 'bg-zinc-900/80 border border-red-600/30' : 'bg-orange-600/30 backdrop-blur-xl border border-white/20'
                }`}
              >
                {/* Square Profile Photo container */}
                <div id="image-container" className="flex items-center">
                  <div
                    id="image-square"
                    onClick={() => {
                      playChime();
                      setCurrentScreen('profile');
                    }}
                    className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/40 shadow-md flex items-center justify-center bg-transparent cursor-provider cursor-pointer active:scale-95 transition-all"
                  >
                    <img
                      id="header-img"
                      src="https://i.ibb.co/cSVN8tbw/IMG-567.jpg"
                      alt="User Main Image"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Glassmorphic Interaction Actions */}
                <div id="icons-container" className="flex items-center gap-2.5">
                  
                  {/* Search Icon Wrap */}
                  <div
                    id="search-wrap"
                    onClick={() => {
                      playChime();
                      setShowSearchBar(prev => !prev);
                      if (showSearchBar) {
                        setSearchQuery('');
                      }
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                      showSearchBar 
                        ? (darkMode ? 'bg-red-650 border-red-500 text-white' : 'bg-yellow-400 border-yellow-300 text-orange-950')
                        : (darkMode ? 'bg-zinc-850 border-red-900/50 hover:bg-red-900/20' : 'bg-white/10 border-white/10 hover:bg-white/20')
                    }`}
                    title={t('search')}
                  >
                    <Search id="icon-search" className={`w-5.5 h-5.5 ${showSearchBar && !darkMode ? 'text-orange-950' : 'text-white'}`} />
                  </div>

                   {/* Shopping Cart Icon with badge */}
                  <div
                    id="cart-wrap"
                    onClick={() => {
                      playChime();
                      setShowCartModal(true);
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer relative ${
                      darkMode ? 'bg-zinc-850 border-red-900/50 hover:bg-red-900/20' : 'bg-white/10 border-white/10 hover:bg-white/20'
                    }`}
                    title={t('cart')}
                  >
                    <ShoppingCart id="icon-cart" className={`w-5.5 h-5.5 ${getIconColor('text-white')}`} />
                    {totalCartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-lg animate-bounce">
                        {totalCartItemsCount}
                      </span>
                    )}
                  </div>

                  {/* Official Branded Whatsapp Widget */}
                  <div
                    id="whatsapp-wrap"
                    onClick={() => {
                      playChime();
                      const message = "مرحبا مشروبات VOLT";
                      const phone = "9647881054569";
                      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-[#25D366] text-white hover:scale-105 active:scale-90 shadow-lg border border-white/10 transition-all duration-200 cursor-pointer"
                    title={t('whatsapp')}
                  >
                    <svg
                      id="whatsapp-brand-svg"
                      className="w-6 h-6 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.705 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>

                  {/* Settings Page Trigger */}
                  <div
                    id="settings-wrap"
                    onClick={() => {
                      playChime();
                      setCurrentScreen('settings');
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer hover:rotate-45 ${
                      darkMode ? 'bg-zinc-800 border-red-650 hover:bg-red-900/30' : 'bg-white/10 border-white/10 hover:bg-white/25'
                    }`}
                    title={t('settings')}
                  >
                    <SettingsIcon id="icon-settings" className={`w-5.5 h-5.5 ${getIconColor('text-white')}`} />
                  </div>

                  {/* Profile/User Icon -> Profile Screen */}
                  <div
                    id="profile-wrap"
                    onClick={() => {
                      playChime();
                      setCurrentScreen('profile');
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${
                      darkMode ? 'bg-zinc-805 border-red-600' : 'bg-white/20 border-yellow-400'
                    }`}
                    title={t('profile')}
                  >
                    <User id="icon-profile" className={`w-5.5 h-5.5 ${getIconColor('text-white')}`} />
                  </div>

                </div>
              </div>
            </header>

            {/* Premium Live Search Bar */}
            <AnimatePresence>
              {showSearchBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="w-full max-w-2xl px-4 md:px-8 mt-2 overflow-hidden"
                >
                  <div className={`relative flex items-center rounded-2xl p-0.5 border ${
                    darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white/10 border-white/20'
                  }`}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={language === 'ar' ? 'حدد نكهة VOLT المفضلة لديك للبحث...' : 'Search your favorite VOLT flavor...'}
                      className="w-full py-3 px-4 bg-transparent text-white text-xs md:text-sm font-bold border-none outline-none focus:ring-0 placeholder-white/40 text-center"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-2 absolute right-3 text-white/65 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium Category Navigation */}
            <div id="categories-container" className="w-full max-w-2xl px-4 md:px-8 mt-4">
              <div id="category-static-list" className="flex items-center justify-between gap-1 w-full pt-1 pb-3 px-1">
                
                {/* Energy Drinks */}
                <div
                  id="cat-energy"
                  onClick={() => {
                    playChime();
                    setActiveCategory('energy');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${getCategoryThemeClass('energy', activeCategory === 'energy')}`}>
                    <Zap className={`w-7 h-7 ${activeCategory === 'energy' ? (darkMode ? 'text-red-600' : 'text-orange-500') : 'text-amber-300'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${activeCategory === 'energy' ? 'text-white' : 'text-white/60'}`}>
                    {t('catEnergy')}
                  </span>
                </div>

                {/* Cold Drinks */}
                <div
                  id="cat-cold"
                  onClick={() => {
                    playChime();
                    setActiveCategory('cold');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${getCategoryThemeClass('cold', activeCategory === 'cold')}`}>
                    <CupSoda className={`w-7 h-7 ${activeCategory === 'cold' ? (darkMode ? 'text-red-600' : 'text-cyan-500') : 'text-white/40'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${activeCategory === 'cold' ? 'text-white' : 'text-white/60'}`}>
                    {t('catCold')}
                  </span>
                </div>

                {/* Fruit Juices */}
                <div
                  id="cat-fruit"
                  onClick={() => {
                    playChime();
                    setActiveCategory('fruit');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${getCategoryThemeClass('fruit', activeCategory === 'fruit')}`}>
                    <Citrus className={`w-7 h-7 ${activeCategory === 'fruit' ? (darkMode ? 'text-red-600' : 'text-rose-500') : 'text-white/40'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${activeCategory === 'fruit' ? 'text-white' : 'text-white/60'}`}>
                    {t('catFruit')}
                  </span>
                </div>

                {/* Natural Drinks */}
                <div
                  id="cat-natural"
                  onClick={() => {
                    playChime();
                    setActiveCategory('natural');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${getCategoryThemeClass('natural', activeCategory === 'natural')}`}>
                    <Leaf className={`w-7 h-7 ${activeCategory === 'natural' ? (darkMode ? 'text-red-600' : 'text-emerald-500') : 'text-white/40'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${activeCategory === 'natural' ? 'text-white' : 'text-white/60'}`}>
                    {t('catNatural')}
                  </span>
                </div>

                {/* VOLT Mix */}
                <div
                  id="cat-volt"
                  onClick={() => {
                    playChime();
                    setActiveCategory('volt');
                  }}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${getCategoryThemeClass('volt', activeCategory === 'volt')}`}>
                    <Flame className={`w-7 h-7 ${activeCategory === 'volt' ? (darkMode ? 'text-red-600' : 'text-purple-500') : 'text-white/40'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1.5 ${activeCategory === 'volt' ? 'text-white' : 'text-white/60'}`}>
                    {t('catVolt')}
                  </span>
                </div>

              </div>
            </div>

            {/* Beautiful products grid representation matching the requested criteria */}
            <div id="products-listing" className="w-full max-w-2xl px-4 md:px-8 mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {(() => {
                    const filteredList = productsData
                      .filter((p) => p.category === activeCategory)
                      .filter((p) => {
                        if (!searchQuery.trim()) return true;
                        const q = searchQuery.toLowerCase().trim();
                        const nameAr = (p.nameAr || '').toLowerCase();
                        const nameEn = (p.nameEn || '').toLowerCase();
                        const descAr = (p.descAr || '').toLowerCase();
                        const descEn = (p.descEn || '').toLowerCase();
                        return nameAr.includes(q) || nameEn.includes(q) || descAr.includes(q) || descEn.includes(q);
                      });

                    if (filteredList.length === 0) {
                      return (
                        <div id="search-empty-state" className="col-span-full py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                          <span className="text-2xl">⚡</span>
                          <p className="text-xs font-bold opacity-75">
                            {language === 'ar' ? 'عذراً، لم نجد مشروبات طاقة تطابق هذا البحث' : 'No VOLT drinks match this search.'}
                          </p>
                        </div>
                      );
                    }

                    return filteredList.map((product) => {
                      const isSaved = savedProductIds.includes(product.id);
                      const displayName = language === 'ar' ? product.nameAr : product.nameEn;
                      return (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => {
                            playChime();
                            setSelectedProduct(product);
                            setCurrentScreen('product-detail');
                          }}
                          className={`group rounded-3xl p-3 flex flex-col justify-between transition-all relative overflow-hidden cursor-pointer ${getCardBgClasses()} hover:scale-[1.03] shadow-lg`}
                        >
                          {/* Inner Square - "المربع داخل مربع" */}
                          <div className="w-full aspect-square rounded-2xl overflow-hidden relative mb-2.5 bg-black/10 flex items-center justify-center border border-white/5">
                            <img
                              src={product.image}
                              alt={displayName}
                              className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Floating Favorite heart */}
                            <button
                              onClick={(e) => handleToggleSaveProduct(product.id, e)}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors"
                            >
                              <Heart
                                className={`w-4 h-4 transition-colors ${
                                  isSaved ? 'text-red-500 fill-red-500' : 'text-white'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Info & Bottom Bar */}
                          <div className="flex flex-col gap-1 w-full">
                            <h3 className="text-xs font-bold text-white line-clamp-1">
                              {displayName}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-1">
                              {/* Price */}
                              <span className="text-xs font-black text-yellow-300">
                                {product.priceIqd.toLocaleString()} {t('currency')}
                              </span>

                              {/* Plus button inside square style */}
                              <button
                                onClick={(e) => handleAddToCart(product.id, displayName, e)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md active:scale-90 transition-transform ${
                                  darkMode
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-yellow-400 hover:bg-yellow-300 text-orange-950'
                                }`}
                                title={t('addToCart')}
                              >
                                <Plus className="w-4 h-4 stroke-[3px]" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  })()}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        ))}

        {currentScreen === 'profile' && !isAppClosed && (
          /* ========================================================================= */
          /* PROFILE SCREEN                                                            */
          /* ========================================================================= */
          <motion.div
            key="profile-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex flex-col items-center justify-start overflow-y-auto pb-20"
          >
            {/* Upper Navigation Bar */}
            <header id="profile-header" className="w-full max-w-xl px-4 pt-4 mt-2 mb-2">
              <div
                id="profile-navbar"
                className={`flex items-center justify-between shadow-xl rounded-2xl px-5 py-3.5 transition-all duration-300 ${
                  darkMode ? 'bg-zinc-900/80 border border-red-600/30' : 'bg-orange-600/30 backdrop-blur-xl border border-white/25'
                }`}
              >
                <div id="profile-title" className="text-lg font-black text-white flex items-center gap-2">
                  <User id="profile-badge-user-icon" className={`w-5 h-5 ${getIconColor('text-yellow-300')}`} />
                  {t('title')}
                </div>

                {/* Switch back to Main Home */}
                <button
                  id="exit-to-home"
                  onClick={() => {
                    playChime();
                    setCurrentScreen('home');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 ml-0.5" />
                  {t('exitHome')}
                </button>
              </div>
            </header>

            {/* Profile Content Details */}
            <div id="profile-card" className="w-full max-w-md px-4">
              <div className={`rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center transition-all duration-300 ${getCardBgClasses()}`}>
                
                {/* Square Profile Image */}
                <div
                  id="profile-avatar-square"
                  className={`w-36 h-36 rounded-2xl overflow-hidden border-4 shadow-xl flex items-center justify-center relative mb-4 ${
                    darkMode ? 'border-red-600 bg-zinc-950' : 'border-white bg-orange-100'
                  }`}
                >
                  <img
                    id="profile-main-img"
                    src="https://i.ibb.co/cSVN8tbw/IMG-567.jpg"
                    alt="VOLT Brand Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Name Badge */}
                <h1 id="profile-user-name" className="text-3xl font-black text-white tracking-wide uppercase">
                  {t('profileName')}
                </h1>

                <div className="w-full h-[1px] bg-white/10 my-5" />

                {/* Sub-counters for Likes, Followers, Ratings */}
                <div id="stats" className="grid grid-cols-3 gap-3 w-full">
                  
                  {/* Likes Box */}
                  <div
                    id="stat-box-likes"
                    onClick={() => {
                      setLiked(!liked);
                      playChime();
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 cursor-pointer ${
                      liked 
                        ? (darkMode ? 'bg-red-950/40 border-red-600 text-red-500 scale-102 shadow-lg' : 'bg-rose-500/25 border-rose-400 text-rose-300 scale-102 shadow-lg') 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart id="stat-like-icon" className={`w-7 h-7 transition-transform duration-300 ${
                      darkMode ? 'text-red-500 fill-red-600' : 'text-rose-400'
                    } ${liked ? 'fill-current scale-110' : ''}`} />
                    <span className="text-xs font-bold text-white opacity-85 mt-1">{t('likes')}</span>
                    <span className="text-lg font-black text-white">{likesCount}</span>
                  </div>

                  {/* Followers Box */}
                  <div
                    id="stat-box-followers"
                    onClick={() => {
                      setFollowed(!followed);
                      playChime();
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 cursor-pointer ${
                      followed 
                        ? (darkMode ? 'bg-red-950/40 border-red-500 text-red-400 scale-102 shadow-lg' : 'bg-amber-500/25 border-amber-400 text-amber-300 scale-102 shadow-lg') 
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {followed ? (
                      <UserCheck id="stat-follow-icon" className={`w-7 h-7 ${getIconColor('text-amber-400')}`} />
                    ) : (
                      <UserPlus id="stat-follow-icon" className={`w-7 h-7 ${getIconColor('text-orange-200')}`} />
                    )}
                    <span className="text-xs font-bold text-white opacity-85 mt-1">{t('followers')}</span>
                    <span className="text-lg font-black text-white">{followersCount}</span>
                  </div>

                  {/* Ratings Button and score */}
                  <div
                    id="stat-box-ratings"
                    onClick={() => {
                      playChime();
                      setShowRatingModal(true);
                    }}
                    className="p-3 rounded-2xl flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star id="stat-star-icon" className={`w-7 h-7 fill-yellow-400 ${getIconColor('text-yellow-300')}`} />
                    <span className="text-xs font-bold text-white opacity-85 mt-1">{t('ratings')}</span>
                    <span className="text-lg font-black text-white flex items-center gap-0.5">
                      {averageStars}
                      <span className="text-[10px] opacity-60">({reviewsList.length})</span>
                    </span>
                  </div>

                </div>

                {/* Feedback List Header */}
                <div id="reviews-header" className="w-full flex items-center justify-between mt-8 mb-4">
                  <h3 className={`text-md font-bold text-white border-r-4 pr-2 ${darkMode ? 'border-red-600' : 'border-yellow-400'}`}>
                    {t('reviewsFeedTitle')}
                  </h3>
                  <button
                    id="add-review-btn-pill"
                    onClick={() => {
                      playChime();
                      setShowRatingModal(true);
                    }}
                    className={`text-xs font-extrabold px-3 py-1 rounded-full shadow-md active:scale-95 transition-all text-orange-950 ${
                      darkMode ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500' : 'bg-yellow-400 hover:bg-yellow-300'
                    }`}
                  >
                    {t('addReviewBtn')}
                  </button>
                </div>

                {/* Scrollable Reviews lists */}
                <div id="reviews-feed" className="w-full max-h-[220px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/20">
                  <AnimatePresence initial={false}>
                    {reviewsList.map((rev) => {
                      // Lookup translated value for baseline reviews
                      let revName = rev.name;
                      let revComment = rev.comment;
                      let revDate = rev.date;

                      if (!rev.isCustom) {
                        if (rev.id === '1') {
                          revName = t('staticReview1Name');
                          revComment = t('staticReview1Comment');
                          revDate = t('hoursAgo');
                        } else if (rev.id === '2') {
                          revName = t('staticReview2Name');
                          revComment = t('staticReview2Comment');
                          revDate = t('dayAgo');
                        }
                      }

                      return (
                        <motion.div
                          key={rev.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-2xl text-right flex flex-col gap-1 shadow-sm ${getSubCardBgClasses()}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-yellow-300">{revName}</span>
                            <span className="text-[10px] opacity-60 font-mono">{revDate}</span>
                          </div>

                          <div className="flex items-center gap-0.5 my-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.stars ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>

                          <p className="text-xs text-white opacity-90 leading-relaxed font-medium">
                            {revComment}
                          </p>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'settings' && !isAppClosed && (
          /* ========================================================================= */
          /* SETTINGS SCREEN                                                           */
          /* ========================================================================= */
          <motion.div
            key="settings-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex flex-col items-center justify-start overflow-y-auto pb-20"
          >
            {/* Top Bar for Settings */}
            <header id="settings-header" className="w-full max-w-xl px-4 pt-4 mt-2 mb-2">
              <div
                id="settings-navbar"
                className={`flex items-center justify-between shadow-xl rounded-2xl px-5 py-3.5 transition-all duration-300 ${
                  darkMode ? 'bg-zinc-900/80 border border-red-600/30' : 'bg-orange-600/30 backdrop-blur-xl border border-white/25'
                }`}
              >
                <div id="settings-title-label" className="text-lg font-black text-white flex items-center gap-2">
                  <SettingsIcon className={`w-5 h-5 animate-spin ${getIconColor('text-yellow-300')}`} />
                  {t('settingsTitle')}
                </div>

                {/* Switch back to Main Home */}
                <button
                  id="settings-exit-btn"
                  onClick={() => {
                    playChime();
                    setCurrentScreen('home');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 ml-0.5" />
                  {t('exitHome')}
                </button>
              </div>
            </header>

            {/* Settings Options Card Container */}
            <div id="settings-body-container" className="w-full max-w-md px-4">
              <div className={`rounded-3xl p-6 shadow-2xl flex flex-col gap-6 transition-all duration-300 ${getCardBgClasses()}`}>
                
                {/* Mode description */}
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-xs opacity-60 tracking-wider uppercase font-mono">{t('chimeIntro')}</span>
                  <p className="text-xs text-yellow-300 font-medium">{t('soundHint')}</p>
                </div>

                {/* 1. Notifications Toggle */}
                <div className={`p-4 rounded-2xl flex items-center justify-between ${getSubCardBgClasses()}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-950/40 text-red-500' : 'bg-white/10 text-white'}`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t('enableNotifications')}</span>
                      <span className="text-[10.5px] opacity-60">{notificationsEnabled ? t('active') : t('disabled')}</span>
                    </div>
                  </div>
                  
                  {/* Toggle button design */}
                  <button
                    id="toggle-btn-notifications"
                    onClick={() => {
                      setNotificationsEnabled(!notificationsEnabled);
                      playChime();
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                      notificationsEnabled ? (darkMode ? 'bg-red-600' : 'bg-yellow-400') : 'bg-white/20'
                    }`}
                  >
                    <div className={`bg-orange-950 w-4 h-4 rounded-full transition-transform ${
                      notificationsEnabled ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Permissions management panel */}
                <div className={`p-4 rounded-2xl flex items-center justify-between ${getSubCardBgClasses()}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-950/40 text-red-500' : 'bg-white/10 text-white'}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t('enableSound')}</span>
                      <span className="text-[10.5px] opacity-60 font-semibold text-yellow-300">
                        {Object.values(permissions).filter(Boolean).length} / {Object.keys(permissions).length} {t('active')}
                      </span>
                    </div>
                  </div>

                  {/* Open permissions drawer/modal */}
                  <button
                    id="open-permissions-manager"
                    onClick={() => {
                      setShowPermissionsModal(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 text-orange-950 cursor-pointer flex items-center gap-1.5 ${
                      darkMode ? 'bg-red-650 text-white border border-red-500 hover:bg-red-500' : 'bg-yellow-400 hover:bg-yellow-300'
                    }`}
                  >
                    <span>{language === 'ar' ? 'إدارة التراخيص' : 'Manage'}</span>
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3. Dark Mode (وضع داكن) Toggle */}
                <div className={`p-4 rounded-2xl flex items-center justify-between ${getSubCardBgClasses()}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-950/40 text-red-500' : 'bg-white/10 text-white'}`}>
                      {darkMode ? <Moon className="w-5 h-5 text-red-600" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{t('darkMode')}</span>
                      <span className="text-[10.5px] opacity-60">{darkMode ? t('darkOn') : t('darkOff')}</span>
                    </div>
                  </div>

                  <button
                    id="toggle-btn-dark-mode"
                    onClick={() => {
                      setDarkMode(!darkMode);
                      // Custom chime plays based on newly selected state
                      setTimeout(() => playChime(), 10);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                      darkMode ? 'bg-red-600 border border-red-500' : 'bg-yellow-400'
                    }`}
                  >
                    <div className={`bg-orange-950 w-4 h-4 rounded-full transition-transform ${
                      darkMode ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. English / Arabic translation toggle */}
                <div className={`p-4 rounded-2xl flex flex-col gap-3 ${getSubCardBgClasses()}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-950/40 text-red-500' : 'bg-white/10 text-white'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col font-sans">
                      <span className="text-sm font-bold">{t('appLanguage')}</span>
                      <span className="text-[10.5px] opacity-60">
                        {language === 'ar' ? t('arabic') : t('english')}
                      </span>
                    </div>
                  </div>

                  {/* High Fidelity Translation Switcher Buttons */}
                  <div id="language-switcher-buttons" className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      id="language-arabic-btn"
                      onClick={() => {
                        setLanguage('ar');
                        setTimeout(() => playChime(), 10);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-center transition-all text-xs cursor-pointer ${
                        language === 'ar'
                          ? (darkMode ? 'bg-red-600 text-white border border-red-500 shadow-md' : 'bg-yellow-400 text-orange-950')
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {t('arabic')}
                    </button>
                    <button
                      id="language-english-btn"
                      onClick={() => {
                        setLanguage('en');
                        setTimeout(() => playChime(), 10);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold text-center transition-all text-xs cursor-pointer ${
                        language === 'en'
                          ? (darkMode ? 'bg-red-600 text-white border border-red-500 shadow-md' : 'bg-yellow-400 text-orange-950')
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {t('english')}
                    </button>
                  </div>
                </div>

                {/* Permissions Management Panel Launcher */}
                <button
                  id="sandbox-permissions-btn"
                  onClick={() => {
                    setShowPermissionsModal(true);
                  }}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black shadow-lg hover:scale-[1.02] active:scale-97 transition-all leading-none ${
                    darkMode ? 'bg-zinc-800 text-red-500 border border-red-650' : 'bg-white/15 hover:bg-white/25 border border-white/20'
                  }`}
                >
                  {t('testSoundBtn')}
                </button>

                {/* Save Note description indicator */}
                <div className="text-[11px] opacity-40 text-center font-semibold tracking-wider">
                  ✓ {t('saveChanges')}
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {currentScreen === 'product-detail' && selectedProduct && !isAppClosed && (
          /* ========================================================================= */
          /* PRODUCT DETAIL SCREEN                                                     */
          /* ========================================================================= */
          <motion.div
            key="product-detail-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full flex flex-col items-center justify-start overflow-y-auto pb-20"
          >
            {/* Header navbar / Go back */}
            <header id="detail-header" className="w-full max-w-xl px-4 pt-4 mt-2 mb-2">
              <div
                id="detail-navbar"
                className={`flex items-center justify-between shadow-xl rounded-2xl px-5 py-3.5 transition-all duration-300 ${
                  darkMode ? 'bg-zinc-900/80 border border-red-600/30' : 'bg-orange-600/30 backdrop-blur-xl border border-white/25'
                }`}
              >
                <div id="detail-title" className="text-sm font-black text-white flex items-center gap-1.5 line-clamp-1">
                  <ShoppingBag className={`w-5 h-5 ${getIconColor('text-yellow-300')}`} />
                  {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                </div>

                {/* Back to Home layout */}
                <button
                  id="detail-exit-btn"
                  onClick={() => {
                    playChime();
                    setCurrentScreen('home');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 ml-0.5" />
                  {t('exitHome')}
                </button>
              </div>
            </header>

            {/* Core Product Info card */}
            <div id="detail-body" className="w-full max-w-md px-4">
              <div className={`rounded-[2rem] p-6 shadow-2xl flex flex-col transition-all duration-300 ${getCardBgClasses()}`}>
                
                {/* Image layout (Outer square inside square concept) */}
                <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden bg-black/10 border border-white/10 relative shadow-inner p-1">
                  <div className="w-full h-full rounded-[1.2rem] overflow-hidden">
                    <img
                      src={selectedProduct.image}
                      alt={language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Bookmark floating heart */}
                  <button
                    onClick={() => handleToggleSaveProduct(selectedProduct.id)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition-all"
                    title={t('saveBtn')}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        savedProductIds.includes(selectedProduct.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Title and Pricing info */}
                <div className="flex flex-col gap-1 mt-5">
                  <div className="flex items-center justify-between gap-2">
                    <h1 className="text-xl font-black text-white truncate-2-lines">
                      {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                    </h1>
                    
                    {/* Iraqi Dinar Display Price */}
                    <div className="bg-yellow-400 text-orange-950 font-black text-xs md:text-sm px-3.5 py-1.5 rounded-2xl flex items-center gap-1 shrink-0 shadow-lg select-all">
                      <span>{selectedProduct.priceIqd.toLocaleString()}</span>
                      <span className="text-[10px] opacity-80">{t('currency')}</span>
                    </div>
                  </div>
                </div>

                {/* Main Action buttons row (Share, Save state button, Main Big Add to cart) */}
                <div className="grid grid-cols-3 gap-3 my-5">
                  {/* Share button */}
                  <button
                    id="product-share-btn"
                    onClick={() => handleShareProduct(selectedProduct)}
                    className="flex flex-col items-center justify-center py-3.5 px-2 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 text-white transition-all duration-150 active:scale-95 animate-none"
                  >
                    <Share2 className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-[10px] font-bold">{t('shareBtn')}</span>
                  </button>

                  {/* Save to wishlist Button state */}
                  <button
                    id="product-save-btn"
                    onClick={() => handleToggleSaveProduct(selectedProduct.id)}
                    className={`flex flex-col items-center justify-center py-3.5 px-2 border rounded-2xl cursor-pointer transition-all duration-150 active:scale-95 ${
                      savedProductIds.includes(selectedProduct.id)
                        ? 'bg-rose-955/20 border-rose-500 text-rose-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 mb-1 ${savedProductIds.includes(selectedProduct.id) ? 'fill-current text-rose-500' : ''}`} />
                    <span className="text-[10px] font-bold">
                      {savedProductIds.includes(selectedProduct.id) ? t('saveBtn') + " ✓" : t('saveBtn')}
                    </span>
                  </button>

                  {/* Massive add to cart */}
                  <button
                    id="product-add-cart-btn"
                    onClick={() => handleAddToCart(selectedProduct.id, language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn)}
                    className={`col-span-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl font-black shadow-lg transition-all duration-150 active:scale-95 text-orange-950 cursor-pointer ${
                      darkMode ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400' : 'bg-yellow-400 hover:bg-yellow-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 mb-1 stroke-[3px]" />
                    <span className="text-[10px]">{t('addToCart')}</span>
                  </button>
                </div>

                {/* Description space */}
                <div className={`p-4 rounded-2xl flex flex-col gap-2 ${getSubCardBgClasses()}`}>
                  <span className="text-xs font-black uppercase text-yellow-300 tracking-wider">
                    📜 {t('productDescTitle')}
                  </span>
                  <p className="text-xs text-white opacity-90 leading-relaxed font-semibold">
                    {language === 'ar' ? selectedProduct.descAr : selectedProduct.descEn}
                  </p>
                </div>

                {/* Horizontal thumbnails navigation: "يتنقل بين المنتجات" */}
                <div className="mt-6 flex flex-col gap-2.5">
                  <span className="text-xs font-black text-white/70">
                    {t('otherProducts')}
                  </span>
                  
                  {/* Scrollable grid thumbnail carousel */}
                  <div className="flex items-center gap-3 overflow-x-auto py-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {productsData
                      .filter((p) => p.category === selectedProduct.category)
                      .map((p) => {
                        const isCurrent = p.id === selectedProduct.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              playChime();
                              setSelectedProduct(p);
                            }}
                            className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 relative ${
                              isCurrent
                                ? (darkMode ? 'border-red-600 scale-110 shadow-lg' : 'border-yellow-400 scale-110 shadow-lg')
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={p.image}
                              alt={p.nameAr}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {isCurrent && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center" />
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating high contrast Toast notifier widget */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="app-notification-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3.5 rounded-xl shadow-2xl font-black text-center text-xs md:text-sm border flex items-center gap-2 max-w-sm ${
              darkMode
                ? 'bg-zinc-950 text-white border-red-650'
                : 'bg-orange-650 text-white border-white/30 backdrop-blur-xl'
            }`}
          >
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Shopping Cart Modal / Bottom Sheet Drawer */}
      <AnimatePresence>
        {showCartModal && (
          <div id="cart-modal-container" className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop backing glass cover */}
            <motion.div
              id="cart-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playChime();
                setShowCartModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />

            {/* Bottom sliding summary frame container */}
            <motion.div
              id="cart-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 230 }}
              className={`relative w-full max-w-lg rounded-t-[2rem] shadow-2xl p-6 md:p-8 z-55 flex flex-col gap-4 max-h-[80vh] overflow-y-auto ${
                darkMode ? 'bg-zinc-950 text-white border-t border-red-600/50' : 'bg-orange-600 text-white border-t border-white/20'
              }`}
            >
              {/* Central drag hook */}
              <div className="w-12 h-1 bg-white/30 rounded-full mx-auto -mt-2 opacity-50 mb-1" />

              {/* Title Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-yellow-300" />
                  {t('cartTitle')}
                </h3>
                <button
                  id="close-cart-btn"
                  onClick={() => {
                    playChime();
                    setShowCartModal(false);
                  }}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart List */}
              <div className="flex flex-col gap-3 my-2 overflow-y-auto max-h-[40vh] pr-1">
                {totalCartItemsCount === 0 ? (
                  <div className="py-12 text-center text-xs opacity-70 font-semibold leading-relaxed">
                    {t('emptyCart')}
                  </div>
                ) : (
                  productsData
                    .filter((p) => (cart[p.id] || 0) > 0)
                    .map((p) => {
                      const qty = cart[p.id];
                      const name = language === 'ar' ? p.nameAr : p.nameEn;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.image}
                              alt={name}
                              className="w-12 h-12 object-cover rounded-xl border border-white/15"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold line-clamp-1">{name}</span>
                              <span className="text-[10px] text-yellow-300 font-black font-mono mt-0.5">
                                {(p.priceIqd * qty).toLocaleString()} {t('currency')}
                              </span>
                            </div>
                          </div>

                          {/* Increments and Decrements */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                playChime();
                                setCart(prev => ({
                                  ...prev,
                                  [p.id]: Math.max(0, (prev[p.id] || 0) - 1)
                                }));
                              }}
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center font-black active:scale-90 text-sm transition-transform cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-black min-w-[15px] text-center font-mono">
                              {qty}
                            </span>
                            <button
                              onClick={() => {
                                playChime();
                                setCart(prev => ({
                                  ...prev,
                                  [p.id]: (prev[p.id] || 0) + 1
                                }));
                              }}
                              className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center font-black active:scale-90 text-sm transition-transform cursor-pointer"
                            >
                              +
                            </button>

                            <button
                              onClick={() => {
                                playChime();
                                setCart(prev => {
                                  const updated = { ...prev };
                                  delete updated[p.id];
                                  return updated;
                                });
                              }}
                              className="p-1.5 hover:bg-red-650/30 rounded-lg text-red-300 transition-colors ml-1 cursor-pointer"
                              title={t('cancel')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Real Total Price computation */}
              {totalCartItemsCount > 0 && (
                <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-85 font-black">{language === 'ar' ? 'المجموع الإجمالي:' : 'Grand Total:'}</span>
                    <span className="text-md font-black text-yellow-300 font-mono">
                      {productsData
                        .reduce((acc, curr) => acc + (cart[curr.id] || 0) * curr.priceIqd, 0)
                        .toLocaleString()}{' '}
                      {t('currency')}
                    </span>
                  </div>

                  {/* Send cart overview WhatsApp trigger */}
                  <button
                    onClick={() => {
                      playChime();
                      const itemsText = productsData
                        .filter((p) => (cart[p.id] || 0) > 0)
                        .map((p) => {
                          const name = language === 'ar' ? p.nameAr : p.nameEn;
                          return `* [${cart[p.id]}x] ${name} (${(p.priceIqd * cart[p.id]).toLocaleString()} د.ع)`;
                        })
                        .join('\n');
                      const sumTotal = productsData.reduce((acc, curr) => acc + (cart[curr.id] || 0) * curr.priceIqd, 0);
                      const fullMessage = `طلب جديد من زبون مشروبات VOLT:\n\n${itemsText}\n\n*المجموع الإجمالي:* ${sumTotal.toLocaleString()} دينار عراقي`;
                      const phone = '9647881054569';
                      const url = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-black text-center text-xs shadow-lg active:scale-98 transition-transform cursor-pointer ${
                      darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-400 hover:bg-yellow-300 text-orange-950'
                    }`}
                  >
                    💬 {language === 'ar' ? 'إرسال الطلب وحجز المشروبات عبر واتساب' : 'Send Order & Reserve Drinks on WhatsApp'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* BOTTOM SHEET RATING HANDLER (BOTTOM SHEET MODAL)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRatingModal && (
          <div id="modal-container-overlay" className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Ambient overlay backing cover */}
            <motion.div
              id="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playChime();
                setShowRatingModal(false);
              }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Drag sheet container box layout */}
            <motion.div
              id="rating-bottom-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className={`relative w-full max-w-lg rounded-t-[2.5rem] shadow-2xl p-6 md:p-8 z-55 flex flex-col gap-4 text-gray-900 overflow-visible max-h-[85vh] overflow-y-auto ${
                darkMode ? 'bg-zinc-950 text-white border-t border-red-600/50' : 'bg-[#fffdfb] text-gray-900'
              }`}
            >
              {/* Central drag indicator bar */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto -mt-2 mb-2 opacity-50" />

              {/* Back title information */}
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-black flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Award className={`w-5.5 h-5.5 ${darkMode ? 'text-red-500' : 'text-orange-500'}`} />
                  {t('ratingBottomSheetTitle')}
                </h3>
                <button
                  id="close-modal-icon-btn"
                  onClick={() => {
                    playChime();
                    setShowRatingModal(false);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Submit forms feedback */}
              <form onSubmit={handleAddRating} className="flex flex-col gap-4">
                
                {/* الاسم الكريم */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-input-name" className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('formNameLabel')}
                  </label>
                  <input
                    id="form-input-name"
                    required
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={t('formNamePlaceholder')}
                    className={`w-full outline-none rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      darkMode 
                        ? 'bg-zinc-900 text-white border border-red-900/40 focus:border-red-600' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-orange-500'
                    }`}
                  />
                </div>

                {/* Stars selector button counts */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('formStarsLabel')}
                  </label>
                  <div id="star-selector-container" className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starIdx = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFormStars(starIdx);
                            playChime();
                          }}
                          className="hover:scale-125 focus:outline-none transition-transform"
                        >
                          <Star
                            className={`w-9 h-9 ${
                              starIdx <= formStars
                                ? 'text-yellow-400 fill-yellow-400 stroke-yellow-500'
                                : (darkMode ? 'text-zinc-800 stroke-zinc-700' : 'text-gray-200 stroke-gray-300')
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment area wrapper */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="form-input-comment" className={`text-xs font-black uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('formDescLabel')}
                  </label>
                  <textarea
                    id="form-input-comment"
                    required
                    rows={3}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder={t('formDescPlaceholder')}
                    className={`w-full outline-none rounded-2xl p-4 text-sm font-semibold transition-all resize-none ${
                      darkMode 
                        ? 'bg-zinc-900 text-white border border-red-900/40 focus:border-red-600' 
                        : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-orange-500'
                    }`}
                  />
                </div>

                {/* Call to action buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    id="submit-rating-button"
                    type="submit"
                    className={`flex-1 font-extrabold py-3 px-5 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${
                      darkMode
                        ? 'bg-red-600 hover:bg-red-500 text-white border border-red-400'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-500 text-white'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    {t('submitReview')}
                  </button>
                  <button
                    id="cancel-modal"
                    type="button"
                    onClick={() => {
                      playChime();
                      setShowRatingModal(false);
                    }}
                    className={`px-5 py-3 font-bold rounded-2xl transition-all cursor-pointer text-xs border ${
                      darkMode 
                        ? 'border-zinc-800 hover:bg-zinc-900 text-gray-300' 
                        : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t('cancel')}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* SYSTEM PERMISSIONS DYNAMIC MODAL (POPUP CONSOLE)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPermissionsModal && (
          <div id="permissions-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop backing glass cover */}
            <motion.div
              id="permissions-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPermissionsModal(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Permissions Panel Modal Card */}
            <motion.div
              id="permissions-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`relative w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-55 flex flex-col gap-5 ${
                darkMode ? 'bg-zinc-950 text-white border border-red-650' : 'bg-orange-950 text-white border border-white/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${darkMode ? 'bg-red-650/15 text-red-500' : 'bg-white/10 text-white'}`}>
                    <Shield className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="text-md md:text-lg font-black">{t('permissionsTitle')}</h3>
                    <p className="text-[10px] opacity-70 tracking-wider">SECURE SYSTEM CONSOLE</p>
                  </div>
                </div>
                <button
                  id="close-permissions"
                  onClick={() => setShowPermissionsModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs opacity-90 leading-relaxed font-semibold">
                {t('permissionsDesc')}
              </p>

              {/* Permissions Checklist Grid */}
              <div className="flex flex-col gap-3 my-2 overflow-y-auto max-h-[48vh] pr-1 scrollbar-none">
                {/* 1. Notifications */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-lg bg-yellow-400/10 text-yellow-300">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{t('permNotifications')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPermissions(prev => {
                        const next = !prev.notifications;
                        return { ...prev, notifications: next };
                      });
                      showToastMsg(t('toastPermSuccess'));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      permissions.notifications ? 'bg-green-500' : 'bg-white/25'
                    }`}
                  >
                    <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                      permissions.notifications ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Geolocation */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-lg bg-cyan-400/10 text-cyan-300">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{t('permLocation')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPermissions(prev => {
                        const next = !prev.location;
                        return { ...prev, location: next };
                      });
                      showToastMsg(t('toastPermSuccess'));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      permissions.location ? 'bg-green-500' : 'bg-white/25'
                    }`}
                  >
                    <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                      permissions.location ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Photos & Videos */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-lg bg-purple-400/10 text-purple-300">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{t('permPhotos')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPermissions(prev => {
                        const next = !prev.photos;
                        return { ...prev, photos: next };
                      });
                      showToastMsg(t('toastPermSuccess'));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      permissions.photos ? 'bg-green-500' : 'bg-white/25'
                    }`}
                  >
                    <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                      permissions.photos ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. Camera */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-lg bg-red-400/10 text-red-300">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{t('permCamera')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPermissions(prev => {
                        const next = !prev.camera;
                        return { ...prev, camera: next };
                      });
                      showToastMsg(t('toastPermSuccess'));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      permissions.camera ? 'bg-green-500' : 'bg-white/25'
                    }`}
                  >
                    <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                      permissions.camera ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. Nearby Devices */}
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 px-1.5 rounded-lg bg-emerald-400/10 text-emerald-300">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{t('permNearby')}</span>
                  </div>
                  <button
                    onClick={() => {
                      setPermissions(prev => {
                        const next = !prev.nearby;
                        return { ...prev, nearby: next };
                      });
                      showToastMsg(t('toastPermSuccess'));
                    }}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                      permissions.nearby ? 'bg-green-500' : 'bg-white/25'
                    }`}
                  >
                    <div className={`bg-black w-4 h-4 rounded-full transition-transform ${
                      permissions.nearby ? 'translate-x-[20px]' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 6. Draw Over Other Apps */}
                <div className="p-3 bg-white/5 rounded-2xl border border-red-500/40 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 px-1.5 rounded-lg bg-orange-400/10 text-orange-300">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold">{t('permDrawOver')}</span>
                    </div>
                    {/* Status Badge */}
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                      permissions.drawOver ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {permissions.drawOver ? t('active') : t('disabled')}
                    </span>
                  </div>
                  
                  {/* Redirect Button */}
                  <button
                    onClick={() => {
                      // Attempt a direct system navigation context to the actual Android Overlay Settings screen!
                      try {
                        // Standard package name for volt energy drink app compilation fallback
                        const packName = window.location.hostname === 'localhost' ? 'com.volt.app' : window.location.hostname;
                        
                        // 1. Direct Intent Scheme to launch overlay settings manager in Native Android Webview
                        window.location.href = `intent:#Intent;action=android.settings.action.MANAGE_OVERLAY_PERMISSION;package=${packName};end`;
                        
                        // 2. Also try alternative android app settings panel location 
                        setTimeout(() => {
                          try {
                            window.location.href = `intent:#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;data=package:${packName};end`;
                          } catch (innerErr) {}
                        }, 120);
                      } catch (err) {
                        console.warn("Direct native Android intent deep-link was caught & handled safely inside preview frame context:", err);
                      }

                      // Still render the beautiful fallback simulated system UI inside preview so they can preview the changes smoothly
                      setShowPermissionsModal(false);
                      setShowSystemSettingsSim(true);
                      showToastMsg(t('toastSettingsOpened'));
                    }}
                    className="w-full py-2.5 bg-yellow-400 text-orange-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg hover:bg-yellow-300"
                  >
                    <Smartphone className="w-4 h-4 text-orange-950" />
                    <span>{language === 'ar' ? 'الذهاب لإعدادات النظام بالأندرويد لتفعيلها' : 'Go to Android System Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Close console Button */}
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-2xl border border-white/15 transition-all cursor-pointer"
              >
                {t('close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* HIGH FIDELITY SIMULATED OS SYSTEM SETTINGS WRAPPERS                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showSystemSettingsSim && (
          <div id="os-settings-simulation-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-zinc-950/95 overflow-y-auto">
            {/* Real Smartphone frame wrapper simulation for ultimate design fidelity */}
            <motion.div
              id="os-settings-frame"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="w-full max-w-md h-full md:h-[90vh] bg-zinc-900 border border-zinc-700/60 shadow-2xl relative md:rounded-[3rem] flex flex-col justify-between overflow-hidden text-white"
            >
              <div>
                {/* 1. Simulated Android/iOS status bar */}
                <div id="simulated-status-bar" className="w-full bg-black/45 px-6 py-2.5 flex items-center justify-between text-[11px] font-bold text-gray-300 pointer-events-none select-none">
                  <span>21:25</span>
                  <div className="flex items-center gap-1.5">
                    <span>5G</span>
                    <span>📶</span>
                    <span>🔋 94%</span>
                  </div>
                </div>

                {/* 2. System Settings Navbar Header */}
                <div id="simulated-system-navbar" className="px-5 py-4 bg-zinc-900 border-b border-zinc-850 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowSystemSettingsSim(false);
                      setShowPermissionsModal(true);
                    }}
                    className="p-1.5 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                    title={t('systemSettingsBack')}
                  >
                    <ArrowLeft className="w-5 h-5 bg-transparent border-none outline-none cursor-pointer" />
                  </button>
                  <span className="text-xs md:text-sm font-black tracking-wide truncate pr-2">
                    {t('systemSettingsSim')}
                  </span>
                  <div className="w-8 h-8" /> {/* anchor spacer */}
                </div>

                {/* 3. Simulated OS Action Area */}
                <div className="p-6 flex flex-col gap-6">
                  {/* Description Info card */}
                  <div className="bg-zinc-850 p-5 rounded-2xl border border-zinc-800 flex flex-col gap-2">
                    <h4 className="text-xs font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-yellow-300" />
                      {t('systemSettingsTitle')}
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                      {t('systemSettingsDesc')}
                    </p>
                  </div>

                  {/* Toggle Option */}
                  <div className="bg-zinc-950/60 p-5 rounded-3xl border border-zinc-850 flex items-center justify-between">
                    <div className="flex flex-col gap-1.5 max-w-[70%]">
                      <span className="text-xs font-black">{t('systemSettingsToggle')}</span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {language === 'ar' ? 'مشروبات طاقة فولت' : 'VOLT Energy Drinks App'}
                      </span>
                    </div>

                    {/* Highly interactive fluid toggle with haptic feedback representation */}
                    <button
                      onClick={() => {
                        const updated = !permissions.drawOver;
                        setPermissions(prev => ({ ...prev, drawOver: updated }));
                        if (updated) {
                          showToastMsg(t('toastPermSuccess'));
                        }
                      }}
                      className={`w-14 h-7 rounded-full p-1 transition-colors duration-250 cursor-pointer ${
                        permissions.drawOver ? 'bg-green-500' : 'bg-zinc-750'
                      }`}
                    >
                      <div className={`bg-white w-5 h-5 rounded-full transition-transform duration-200 shadow ${
                        permissions.drawOver ? 'translate-x-[28px]' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Action button footer to return */}
              <div className="p-6 border-t border-zinc-850 bg-zinc-950/40">
                <button
                  onClick={() => {
                    setShowSystemSettingsSim(false);
                    setShowPermissionsModal(true);
                    showToastMsg(language === 'ar' ? 'تم حفظ التحديث بنجاح! 🔒' : 'Settings synced successfully! 🔒');
                  }}
                  className="w-full py-3.5 bg-yellow-400 text-orange-950 font-black text-xs md:text-sm rounded-2xl shadow-xl hover:bg-yellow-300 active:scale-98 transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-orange-950" />
                  <span>{t('systemSettingsBack')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PERSISTENT FLOATING REVIEWS OVERLAY - DRAW OVER APPS FEATURE             */}
      {/* ========================================================================= */}
      {permissions.drawOver && (
        <React.Fragment>
          {/* Draggable Trigger Button */}
          <motion.div
            id="persistent-draw-over-overlay"
            drag
            dragMomentum={false}
            className="fixed z-50 select-none cursor-grab active:cursor-grabbing"
            style={{
              top: '40%',
              ...(language === 'ar' ? { right: '20px' } : { left: '20px' })
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* The Floating Review Hub Bubble */}
            <div
              id="draw-over-trigger-widget"
              onClick={() => {
                if (isAppClosed) {
                  playOverlaySound();
                  setShowFloatingReviewsMenu(prev => !prev);
                } else {
                  playChime();
                  setShowRatingModal(true);
                  showToastMsg(language === 'ar' ? 'تم فتح نافذة التقييمات مباشرة! ⭐' : 'Reviews form opened directly! ⭐');
                }
              }}
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center relative border-2 transition-all duration-300 select-none ${
                isAppClosed 
                  ? (showFloatingReviewsMenu 
                      ? 'bg-red-650 border-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-none'
                      : 'bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 border-yellow-300 shadow-[0_0_25px_rgba(249,115,22,0.85)] hover:shadow-[0_0_35px_rgba(249,115,22,1)] hover:scale-105 active:scale-95 animate-bounce')
                  : (showFloatingReviewsMenu
                      ? 'bg-zinc-800 border-zinc-700 scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                      : 'bg-gradient-to-br from-zinc-900 to-zinc-950 border-white/25 text-white hover:border-yellow-400 hover:text-yellow-400 shadow-xl')
              }`}
            >
              {/* Star review icon inside */}
              <Star className={`w-5 h-5 text-white drop-shadow-md ${isAppClosed ? 'animate-spin' : 'animate-pulse'}`} style={{ animationDuration: isAppClosed ? '12s' : '2s' }} />
              
              {/* Mini pulse signal badge */}
              {isAppClosed && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-bounce">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border border-white flex items-center justify-center text-[8px] text-orange-950 font-black">
                    ⚡
                  </span>
                </span>
              )}
              
              {/* Badge label text */}
              <span className="text-[7.5px] font-black tracking-widest text-white uppercase drop-shadow-sm mt-0.5 select-none text-center">
                {isAppClosed 
                  ? (language === 'ar' ? 'رادار VOLT' : 'VOLT Active')
                  : (language === 'ar' ? 'الرادار' : 'Overlay')
                }
              </span>
            </div>

            {/* Quick Actions Radial expanded menu / Bento panel list */}
            <AnimatePresence>
              {showFloatingReviewsMenu && (
                <motion.div
                  id="draw-over-expanded-menu"
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className={`absolute z-50 mt-3 ${
                    language === 'ar' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
                  } w-[290px] bg-zinc-950/95 backdrop-blur-2xl border-2 border-yellow-450 rounded-3xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)]`}
                >
                  {/* Menu title header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5 select-none">
                      <div className="w-5 h-5 rounded-full bg-yellow-400/15 flex items-center justify-center text-yellow-300 text-[10px] font-black">
                        ⚡
                      </div>
                      <span className="text-[10.5px] font-black text-yellow-300 tracking-wider">
                        {language === 'ar' ? 'رادار تقييمات VOLT العائم' : 'VOLT Review Radar'}
                      </span>
                    </div>
                    {/* Active Status Ring */}
                    <span className="text-[8px] font-black bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                      {language === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  </div>

                  {/* 6 Icons Action Bento Grid (as requested) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    
                    {/* 1. Profile - الملف الشخصي */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setIsAppClosed(false);
                        setCurrentScreen('profile');
                        setShowFloatingReviewsMenu(false);
                        showToastMsg(language === 'ar' ? 'أهلاً بك بصفحة الملف الشخصي! 👤' : 'Welcome to profile page! 👤');
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                      </span>
                    </button>

                    {/* 2. Settings - الإعدادات */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setIsAppClosed(false);
                        setCurrentScreen('settings');
                        setShowFloatingReviewsMenu(false);
                        showToastMsg(language === 'ar' ? 'ملمس مخصص للإعدادات! ⚙️' : 'Welcome to settings! ⚙️');
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'الإعدادات' : 'Settings'}
                      </span>
                    </button>

                    {/* 3. Search Engine - محرك البحث */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setIsAppClosed(false);
                        setCurrentScreen('home');
                        setShowSearchBar(true);
                        setShowFloatingReviewsMenu(false);
                        showToastMsg(language === 'ar' ? 'تم فتح محرك البحث للمشروبات! 🔍' : 'Search engine activated! 🔍');
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'محرك البحث' : 'Search'}
                      </span>
                    </button>

                    {/* 4. WhatsApp - واتساب */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setShowFloatingReviewsMenu(false);
                        const message = "مرحبا مشروبات VOLT";
                        const phone = "9647881054569";
                        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                      </span>
                    </button>

                    {/* 5. Products Page - صفحة المنتجات */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setIsAppClosed(false);
                        setCurrentScreen('home');
                        setShowFloatingReviewsMenu(false);
                        showToastMsg(language === 'ar' ? 'تصفح تشكيلة منتجات ومشروبات طاقة VOLT! 🍹' : 'Explore VOLT Energy products grid! 🍹');
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'صفحة المنتجات' : 'Products'}
                      </span>
                    </button>

                    {/* 6. Ratings/Reviews - التقييمات */}
                    <button
                      onClick={() => {
                        playOverlaySound();
                        setShowFloatingReviewsMenu(false);
                        setShowRatingModal(true);
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-200 active:scale-95 text-center group cursor-pointer"
                    >
                      <div className="p-2 bg-red-500/10 text-red-400 rounded-xl group-hover:scale-110 transition-transform animate-pulse">
                        <Star className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 truncate max-w-full">
                        {language === 'ar' ? 'التقييمات' : 'Reviews'}
                      </span>
                    </button>

                  </div>

                  {/* Drag assistance footer instructions */}
                  <div className="mt-3.5 text-center border-t border-white/10 pt-2 flex items-center justify-center gap-1 pointer-events-none select-none">
                    <Smartphone className="w-3 h-3 text-white/40" />
                    <span className="text-[8px] font-semibold text-white/50 lowercase">
                      {language === 'ar' ? 'اضغط واسحب لتغيير مكان الرادار بالشاشة' : 'drag anywhere to reposition bubble'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </React.Fragment>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* HIGH FIDELITY SIMULATED ANDROID SYSTEM NAVIGATION BAR                    */}
      {/* Only visible when app is active (not closed/minimized) to simulate Android keys */}
      {/* ------------------------------------------------------------------------- */}
      {!isAppClosed && (
        <div 
          id="android-virtual-navigation-bar" 
          className="absolute bottom-0 left-0 right-0 h-11 bg-black/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around z-45 text-white/40 font-bold select-none px-6"
        >
          {/* Back Action (◀) */}
          <button
            onClick={() => {
              playChime();
              if (currentScreen !== 'home') {
                setCurrentScreen('home');
                showToastMsg(language === 'ar' ? 'تم الرجوع للرئيسية ⚡' : 'Returned to Home ⚡');
              } else {
                showToastMsg(language === 'ar' ? 'أنت في الصفحة الرئيسية بالفعل!' : 'Already on Home screen!');
              }
            }}
            className="w-16 h-9 flex items-center justify-center hover:text-white transition-all text-[15px] cursor-pointer"
            title={language === 'ar' ? 'رجوع' : 'Back'}
          >
            ◀
          </button>

          {/* Home / Minimize Action (●) */}
          <button
            onClick={() => {
              playOverlaySound();
              setIsAppClosed(true);
              showToastMsg(language === 'ar' ? 'تم تصغير التطبيق للتشغيل بالخلفية! واصل التقييم عبر الرادار العائم 📱' : 'VOLT minimized to background! Keep reviewing via the floating overlay 📱');
            }}
            className="w-16 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title={language === 'ar' ? 'الرئيسية (تصغير)' : 'Home / Minimize'}
          >
            <div className="w-5 h-5 rounded-full border-2 border-white/50 group-hover:border-white transition-all flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white/50 group-hover:bg-white rounded-full transition-all" />
            </div>
          </button>

          {/* Recents Action (■) */}
          <button
            onClick={() => {
              playChime();
              showToastMsg(language === 'ar' ? 'التطبيقات النشطة: تطبيق VOLT يعمل بالخلفية ⚡' : 'Active Tasks: VOLT Energy app is running active in background ⚡');
            }}
            className="w-16 h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title={language === 'ar' ? 'التطبيقات الأخيرة' : 'Recents'}
          >
            <div className="w-3.5 h-3.5 border-2 border-white/50 group-hover:border-white rounded-[3px] transition-all" />
          </button>
        </div>
      )}
    </div>
  );
}
