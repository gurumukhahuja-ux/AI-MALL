import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutGrid,
  MessageSquare,
  ShoppingBag,
  Bot,
  Settings,
  LogOut,
  X,
  FileText,
  Bell,
  DollarSign,
  HelpCircle,
  ChevronDown,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { apis, AppRoute } from '../../types';
import { faqs } from '../../constants';
import NotificationBar from '../NotificationBar/NotificationBar.jsx';
import { useRecoilState } from 'recoil';
import { clearUser, getUserData, toggleState, userData, notificationState } from '../../userStore/userData';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import apiService from '../../services/apiService';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifiyTgl, setNotifyTgl] = useRecoilState(toggleState);
  const [currentUserData] = useRecoilState(userData);

  const user = currentUserData?.user || { name: "User", email: "user@example.com", role: "user" };
  /* const [clickedItem, setClickedItem] = useState(null); // Removed unused state */
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [notifications, setNotifications] = useRecoilState(notificationState);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [issueText, setIssueText] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  const [issueType, setIssueType] = useState("General Inquiry");

  const issueOptions = [
    "General Inquiry",
    "Payment Issue",
    "Refund Request",
    "Technical Support",
    "Account Access",
    "Other"
  ];

  const handleSupportSubmit = async () => {
    if (!issueText.trim()) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      // 1. Get or Create Support Chat Session
      const chatType = userRole === 'vendor' ? 'vendor_support' : 'user_support';
      const chat = await apiService.getMySupportChat(chatType);
      if (!chat?._id) throw new Error("Could not initialize support session");

      // 2. Format and Send the message
      const fullMessage = `[Issue: ${issueType}] ${issueText}`;
      await apiService.sendSupportChatMessage(chat._id, fullMessage);

      setSendStatus('success');
      setIssueText("");
      setTimeout(() => setSendStatus(null), 3000);
    } catch (error) {
      console.error("Support chat integration failed", error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(AppRoute.LANDING);
  };

  const token = getUserData()?.token;

  useEffect(() => {
    if (token) {
      axios.get(apis.user, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.error(err);
        if (err.response?.status == 401) {
          clearUser();
          navigate(AppRoute.LOGIN);
        }
      });
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(apis.notifications, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Notifications fetch failed", err);
      }
    };

    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30 * 1000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  if (notifiyTgl.notify) {
    setTimeout(() => {
      setNotifyTgl({ notify: false });
    }, 2000);
  }

  // Navigation items configuration
  const allNavItems = [
    { id: 'chat', icon: MessageSquare, label: t('chat'), route: '/dashboard/chat', roles: ['user', 'admin', 'vendor'] },
    { id: 'myAgents', icon: Bot, label: t('myAgents'), route: AppRoute.MY_AGENTS, roles: ['user', 'admin', 'vendor'] },
    { id: 'marketplace', icon: ShoppingBag, label: t('marketplace'), route: AppRoute.MARKETPLACE, onClick: () => setNotifyTgl(prev => ({ ...prev, marketPlaceMode: 'AIMall' })), roles: ['user', 'admin', 'vendor'] },
    { id: 'adminSupport', icon: ShieldAlert, label: t('adminSupport'), route: AppRoute.ADMIN_SUPPORT, roles: ['user', 'vendor', 'admin'] },

    { id: 'vendor', icon: LayoutGrid, label: t('vendorDashboard'), route: '/vendor/overview', roles: ['vendor', 'admin'] },
    { id: 'admin', icon: Settings, label: t('adminDashboard'), route: AppRoute.ADMIN, roles: ['admin'] },
  ];

  // Determine effective role
  const userRole = (user.role === 'admin' || user.role === 'Admin') ? 'admin' : user.role;

  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Mobile Background Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[90] md:hidden backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close Button Floating */}
          <button
            className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {notifiyTgl.notify && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className='fixed inset-x-0 z-[110] flex justify-center items-center mt-6 px-4'
          >
            <NotificationBar msg={"Successfully Owned"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thin Icon Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-[200] bg-white/40 backdrop-blur-3xl border-r border-white/60
          flex flex-col transition-all duration-500 ease-in-out 
          md:relative md:translate-x-0 shadow-2xl md:shadow-none w-[280px] md:w-20 overflow-visible
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Background Dreamy Orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#8b5cf6]/20 rounded-full blur-2xl animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-[#d946ef]/20 rounded-full blur-2xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Logo */}
        <div className="p-6 md:p-4 flex items-center justify-start md:justify-center transition-all duration-500 border-b border-white/20 md:border-none">
          <Link to="/" onClick={() => { setNotifyTgl(prev => ({ ...prev, marketPlaceMode: 'AIMall' })); onClose(); }} className="group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)] ring-2 ring-[#ec4899]/20 group-hover:rotate-12 transition-transform duration-500">
              <span className="text-2xl font-black text-[#9333ea]">
                AI
              </span>
            </div>
          </Link>
          <div className="ml-4 md:hidden">
            <h2 className="text-lg font-black text-slate-900 tracking-tighter">AI-MALL.</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation Center</p>
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 px-3 md:px-2 py-6 md:py-4 space-y-3 md:space-y-2 overflow-visible">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              onClick={() => {
                if (item.onClick) item.onClick();
                setExpandedSection(null);
                onClose();
              }}
              className={({ isActive }) =>
                `flex items-center justify-start md:justify-center p-4 md:p-4 rounded-[20px] md:rounded-2xl transition-all duration-300 group relative overflow-visible ${isActive
                  ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/50'
                  : 'text-slate-400 hover:bg-white/50 hover:text-[#3b82f6]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  <span className="ml-4 font-black text-sm md:hidden tracking-tight">{item.label}</span>

                  {/* Glassmorphic Tooltip on Hover */}
                  {!isActive && (
                    <div className="hidden md:block absolute left-full ml-3 px-4 py-2 text-slate-900 text-sm font-bold rounded-2xl shadow-xl whitespace-nowrap bg-white/60 backdrop-blur-xl border border-white/80 z-[9999] opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Notifications Icon */}
        <div className="px-3 md:px-2 py-2">
          <NavLink
            to={AppRoute.NOTIFICATIONS}
            onClick={() => {
              setExpandedSection(null);
              onClose();
            }}
            className={({ isActive }) =>
              `flex items-center justify-start md:justify-center p-4 md:p-4 rounded-[20px] md:rounded-2xl transition-all duration-300 group relative overflow-visible ${isActive
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/50'
                : 'text-slate-400 hover:bg-white/50 hover:text-[#3b82f6]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative flex-shrink-0">
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-black text-white flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </div>
                  )}
                </div>
                <span className="ml-4 font-black text-sm md:hidden tracking-tight">Notifications</span>

                {/* Glassmorphic Tooltip on Hover */}
                {!isActive && (
                  <div className="hidden md:block absolute left-full ml-3 px-4 py-2 text-slate-900 text-sm font-bold rounded-2xl shadow-xl whitespace-nowrap bg-white/60 backdrop-blur-xl border border-white/80 z-[9999] opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Notifications
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>

        {/* User Profile Icon */}
        <div className="px-3 md:px-2 py-2">
          <NavLink
            to={AppRoute.PROFILE}
            onClick={() => {
              toggleSection(null);
              onClose();
            }}
            className={({ isActive }) =>
              `flex items-center justify-start md:justify-center p-4 md:p-4 rounded-[20px] md:rounded-2xl transition-all duration-300 group relative overflow-visible ${isActive
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/50'
                : 'text-slate-400 hover:bg-white/50 hover:text-[#3b82f6]'
              } w-full`
            }
          >
            {({ isActive }) => (
              <>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20 flex-shrink-0">
                  <span className="font-black text-sm text-[#3b82f6]">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <span className="ml-4 font-black text-sm md:hidden tracking-tight text-[#3b82f6]">Account Profile</span>

                {/* Glassmorphic Tooltip on Hover */}
                {!isActive && (
                  <div className="hidden md:block absolute left-full ml-3 px-4 py-2 text-slate-900 text-sm font-bold rounded-2xl shadow-xl whitespace-nowrap bg-white/60 backdrop-blur-xl border border-white/80 z-[9999] opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
                    Profile
                  </div>
                )}
              </>
            )}
          </NavLink>
        </div>

        {/* Help Icon */}
        <div className="px-3 md:px-2 py-2 mb-8 md:mb-4">
          <button
            onClick={() => { setIsFaqOpen(true); onClose(); setExpandedSection(null); }}
            className="flex items-center justify-start md:justify-center p-4 md:p-4 rounded-[20px] md:rounded-2xl transition-all duration-300 group relative overflow-visible text-slate-400 hover:bg-white/50 hover:text-[#3b82f6] w-full"
          >
            <HelpCircle className="w-6 h-6 flex-shrink-0" />
            <span className="ml-4 font-black text-sm md:hidden tracking-tight text-[#3b82f6]">Help & FAQ</span>

            {/* Glassmorphic Tooltip on Hover */}
            <div className="hidden md:block absolute left-full ml-3 px-4 py-2 text-slate-900 text-sm font-bold rounded-2xl shadow-xl whitespace-nowrap bg-white/60 backdrop-blur-xl border border-white/80 z-[9999] opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 pointer-events-none">
              Help & FAQ
            </div>
          </button>
        </div>
      </div>

      {/* Expanded Profile Panel */}
      <AnimatePresence>
        {expandedSection === 'profile' && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 md:inset-auto md:left-20 md:top-0 md:bottom-0 w-full md:w-72 bg-white/40 backdrop-blur-3xl md:border-r border-white/60 z-[250] shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => setExpandedSection(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 flex flex-col h-full">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Profile</h2>

              <div className="flex flex-col items-center mb-6">
                <div
                  onClick={() => { navigate(AppRoute.PROFILE); setExpandedSection(null); onClose(); }}
                  className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-all mb-4"
                >
                  <span className="font-black text-3xl text-[#3b82f6]">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <p className="text-lg font-black text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500 font-medium">{user.email}</p>
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => { navigate(AppRoute.PROFILE); setExpandedSection(null); onClose(); }}
                  className="w-full px-6 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl font-bold text-sm transition-all mb-3"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFaqOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center md:p-4 bg-slate-900/30 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card md:rounded-[56px] w-full max-w-2xl h-full md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-white/80"
          >
            <div className="p-4 md:p-8 border-b border-white/40 flex justify-between items-center bg-white/20 shrink-0">
              <div className="flex gap-2 md:gap-6 bg-white/40 p-1.5 rounded-full border border-white/60">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-full transition-all ${activeTab === 'faq' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
                >
                  Knowledge
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 md:px-6 py-2.5 rounded-full transition-all ${activeTab === 'help' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-brand-dark'}`}
                >
                  Support
                </button>
              </div>
              <button
                onClick={() => setIsFaqOpen(false)}
                className="p-3 bg-white/40 hover:bg-white rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6 no-scrollbar">
              {activeTab === 'faq' ? (
                <>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-60">General Guidelines</p>
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-white/60 rounded-[32px] bg-white/20 overflow-hidden hover:bg-white/40 transition-all">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                      >
                        <span className="font-black text-slate-900 text-sm tracking-tight">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-brand-dark transition-transform duration-500 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === index && (
                          <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-8 pb-8 text-slate-500 text-sm font-medium leading-relaxed">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </>
              ) : (
                <div className="flex flex-col gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Issue Category</label>
                    <div className="relative group">
                      <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        className="w-full p-5 pr-12 rounded-[24px] bg-white/60 border border-white/80 focus:ring-4 focus:ring-brand/10 outline-none appearance-none text-slate-900 font-black text-sm transition-all"
                      >
                        {issueOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Case Details</label>
                    <textarea
                      className="w-full p-6 rounded-[32px] bg-white/60 border border-white/80 focus:ring-4 focus:ring-brand/10 outline-none resize-none text-slate-900 font-medium min-h-[180px] transition-all"
                      placeholder="Specify your request..."
                      value={issueText}
                      onChange={(e) => setIssueText(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleSupportSubmit}
                    disabled={isSending || !issueText.trim()}
                    className="btn-purple py-5 shadow-2xl disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-widest mt-4">
                    Direct Channel: <a href="mailto:support@ai-mall.in" className="text-brand-dark hover:underline">support@ai-mall.in</a>
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/40 bg-white/20 flex justify-center">
              <button
                onClick={() => setIsFaqOpen(false)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 px-10 py-3 rounded-full hover:bg-white/40 transition-all"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
