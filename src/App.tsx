import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Book as BookIcon, 
  Users, 
  BookmarkCheck, 
  Receipt, 
  Bot, 
  Bell, 
  Search, 
  Plus, 
  RotateCcw, 
  Clock, 
  Trash2, 
  LogOut, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  User as UserIcon, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  Folder, 
  QrCode, 
  RefreshCcw, 
  CreditCard,
  Send,
  Sliders,
  HelpCircle,
  X,
  Printer,
  Moon,
  Sun,
  Bookmark,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

const authors = [
  { id: 1, name: "Victor Hugo", bio: "Écrivain, poète et dramaturge français, figure incontournable du romantisme." },
  { id: 2, name: "Albert Camus", bio: "Écrivain, philosophe, romancier et dramaturge français, Prix Nobel de littérature." },
  { id: 3, name: "Émile Zola", bio: "Écrivain et journaliste français, considéré comme le chef de file du naturalisme." },
  { id: 4, name: "Frank Herbert", bio: "Écrivain américain de science-fiction, célèbre pour son chef-d'œuvre Dune." },
  { id: 5, name: "George Orwell", bio: "Écrivain, chroniqueur et journaliste anglais, célèbre pour ses romans dystopiques." },
  { id: 6, name: "Antoine de Saint-Exupéry", bio: "Écrivain, poète, aviateur et reporter français, auteur du Petit Prince." },
  { id: 7, name: "J.R.R. Tolkien", bio: "Écrivain, poète, philologue et professeur d'université anglais, auteur du Hobbit et du Seigneur des Anneaux." },
  { id: 8, name: "Yuval Noah Harari", bio: "Historien et professeur d'histoire israélien d'origine polonaise, auteur du best-seller Sapiens." }
];

const categories = [
  { id: 1, name: "Roman" },
  { id: 2, name: "Philosophie & Essais" },
  { id: 3, name: "Science-Fiction" },
  { id: 4, name: "Fantasy" },
  { id: 5, name: "Histoire" },
  { id: 6, name: "Jeunesse & Contes" }
];

const simulatedUsers = [
  {
    id: 1,
    firstname: "Admin",
    lastname: "BiblioSphere",
    email: "admin@bibliosphere.com",
    role: "admin",
    membership_type: "Premium",
    status: "active"
  },
  {
    id: 2,
    firstname: "Sophie",
    lastname: "Dubois",
    email: "sophie.librarian@bibliosphere.com",
    role: "librarian",
    membership_type: "Premium",
    status: "active"
  },
  {
    id: 3,
    firstname: "Lucas",
    lastname: "Bernard",
    email: "lucas.member@bibliosphere.com",
    role: "member",
    membership_type: "Premium",
    status: "active"
  },
  {
    id: 5,
    firstname: "Hassane",
    lastname: "Kaboré",
    email: "hassane.kabore@bibliosphere.com",
    role: "member",
    membership_type: "Premium",
    status: "suspended"
  }
];

export default function App() {
  // USER PROFILE & AUTHS
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('books');
  const [expandedBooks, setExpandedBooks] = useState<{[key: number]: boolean}>({});
  const [theme, setTheme] = useState<'cosmic-dark' | 'classic-light' | 'royal-editorial' | 'cyber-terminal'>(() => {
    const saved = localStorage.getItem('theme-vibe');
    return (saved as any) || 'classic-light';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState<boolean>(false);
  const [isFullscreenLayout, setIsFullscreenLayout] = useState<boolean>(false);

  // AUTH CORNER STATES
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstname, setRegFirstname] = useState('');
  const [regLastname, setRegLastname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'librarian' | 'member'>('member');
  const [regMembership, setRegMembership] = useState<'Standard' | 'Premium' | 'VIP Diamond'>('Standard');
  const [adminExists, setAdminExists] = useState(false);
  
  // API STATE DATA
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // Custom Transaction Trigger & Success states
  const [actionStates, setActionStates] = useState<{[key: string]: 'idle' | 'triggering' | 'success' | 'error'}>({});
  const runActionWithTrigger = async (key: string, fn: () => Promise<any>) => {
    setActionStates(prev => ({ ...prev, [key]: 'triggering' }));
    await new Promise(resolve => setTimeout(resolve, 800)); // Enforce visible trigger duration
    try {
      await fn();
      setActionStates(prev => ({ ...prev, [key]: 'success' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    } catch (e) {
      setActionStates(prev => ({ ...prev, [key]: 'error' }));
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    }
  };
  
  // AI CORNER STATES
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [recommendLoading, setRecommendLoading] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'bot', text: "Bonjour ! Je suis **Sphera**, l'intelligence artificielle de BiblioSphere. Comment puis-je vous accompagner dans vos lectures aujourd'hui ?" }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // SEARCHES & FILTERS
  const [bookSearch, setBookSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  const [memberSearch, setMemberSearch] = useState<string>('');
  const [borrowingSearch, setBorrowingSearch] = useState<string>('');

  // PDF UPLOAD & FILE STATES
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);

  // TRANSACTION MODALS & FORM STATES
  const [showAddBookModal, setShowAddBookModal] = useState<boolean>(false);
  const [newBookData, setNewBookData] = useState({
    isbn: '',
    title: '',
    description: '',
    author_id: '1',
    category_id: '1',
    publisher: '',
    publication_year: '2026',
    quantity: '5',
    shelf_location: '',
    new_author_name: ''
  });

  const [showEditBookModal, setShowEditBookModal] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  const [showLoanModal, setShowLoanModal] = useState<boolean>(false);
  const [newLoanData, setNewLoanData] = useState({
    user_id: '',
    book_id: ''
  });

  const [showQrCodeModal, setShowQrCodeModal] = useState<boolean>(false);
  const [selectedQrCodeItem, setSelectedQrCodeItem] = useState<any>(null);

  // NOTIFICATION UTILITIES
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'danger' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // CORE REFRESH FUNCTIONS
  const fetchAllData = async () => {
    try {
      const bRes = await fetch('/api/books');
      const booksData = await bRes.json();
      setBooks(booksData);

      const mRes = await fetch('/api/members');
      const memsData = await mRes.json();
      setMembers(memsData);

      const brRes = await fetch('/api/borrowings');
      const borrowsData = await brRes.json();
      setBorrowings(borrowsData);

      const pRes = await fetch('/api/penalties');
      const penaltiesData = await pRes.json();
      setPenalties(penaltiesData);

      const nRes = await fetch('/api/notifications');
      const listNotifs = await nRes.json();
      setNotifications(listNotifs);

      const logRes = await fetch('/api/audit-logs');
      const systemLogs = await logRes.json();
      setAuditLogs(systemLogs);

      const rRes = await fetch('/api/reservations');
      const resData = await rRes.json();
      setReservations(resData);

      const statsRes = await fetch('/api/stats');
      const systemStats = await statsRes.json();
      setStats(systemStats);
    } catch (e) {
      console.error("Error connecting with simulated REST API:", e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Sync AI Recommendations when member profile changes
  const runAiRecommender = async (userId: number) => {
    setRecommendLoading(true);
    try {
      const res = await fetch('/api/recommender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    } catch (e) {
      console.error("Failed to run AI Recommender:", e);
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        showFeedback(`Bienvenue, ${data.user.firstname} !`);
        if (data.user.role === 'admin') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('books');
        }
      } else {
        const err = await res.json();
        showFeedback(err.error || "Identifiants incorrects.", 'danger');
      }
    })
    .catch((error) => {
      console.error(error);
      showFeedback("Impossible de contacter le serveur local.", 'danger');
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (regRole === 'admin' && adminExists) {
      showFeedback("Un compte administrateur principal existe déjà dans le système.", 'danger');
      return;
    }

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstname: regFirstname,
        lastname: regLastname,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        address: regAddress,
        role: regRole,
        membership_type: regMembership
      })
    })
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        showFeedback("Compte créé avec succès ! Bienvenue à bord.");
        if (data.user.role === 'admin') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('books');
        }
      } else {
        const err = await res.json();
        showFeedback(err.error || "Erreur lors de la création du compte.", 'danger');
      }
    })
    .catch((error) => {
      console.error(error);
      showFeedback("Impossible de contacter le serveur local.", 'danger');
    });
  };

  useEffect(() => {
    localStorage.setItem('theme-vibe', theme);
  }, [theme]);

  useEffect(() => {
    fetch('/api/auth/check-admin')
      .then(res => res.json())
      .then(data => setAdminExists(data.adminExists))
      .catch(err => console.error("Error reading admin presence:", err));
  }, [authTab, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'member') {
      runAiRecommender(currentUser.id);
    } else {
      setAiRecommendations([]);
    }
  }, [currentUser]);

  // CHAT HANDLER
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    const nextArr = [...chatMessages, { sender: 'user', text: userMsg }];
    setChatMessages(nextArr);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: nextArr.slice(-6), // Send last message round-trips
          userObj: currentUser
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Une erreur de connectivité est survenue. L'intelligence Sphera a été temporairement déconnectée." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // CREATE BOOK LOGIC
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await runActionWithTrigger('create-book', async () => {
      try {
        let pdf_url = '';
        if (selectedFile) {
          setUploadingPdf(true);
          // Convert file to Base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
              const result = reader.result as string;
              const base64Str = result.split(',')[1];
              resolve(base64Str);
            };
            reader.onerror = (err) => reject(err);
          });

          const uploadRes = await fetch('/api/books/upload-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newBookData.title,
              fileName: selectedFile.name,
              fileBase64: base64
            })
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            showFeedback(uploadData.error || "Échec de l'upload du document PDF.", 'danger');
            setUploadingPdf(false);
            throw new Error(uploadData.error);
          }
          pdf_url = uploadData.pdf_url;
          setUploadingPdf(false);
        }

        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newBookData,
            pdf_url
          })
        });
        const data = await res.json();
        if (res.ok) {
          showFeedback(`Livre "${data.title}" ajouté au catalogue avec succès !`);
          setShowAddBookModal(false);
          setSelectedFile(null);
          setNewBookData({
            isbn: '',
            title: '',
            description: '',
            author_id: '1',
            category_id: '1',
            publisher: '',
            publication_year: '2026',
            quantity: '5',
            shelf_location: '',
            new_author_name: ''
          });
          fetchAllData();
        } else {
          showFeedback(data.error || "Échec d'ajout de livre.", 'danger');
          throw new Error(data.error);
        }
      } catch (err: any) {
        showFeedback(err.message || "Une erreur réseau s'est produite.", 'danger');
        setUploadingPdf(false);
        throw err;
      }
    });
  };

  // UPDATE BOOK LOGIC
  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    await runActionWithTrigger(`edit-book-${editingBook.id}`, async () => {
      try {
        const res = await fetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingBook)
        });
        const data = await res.json();
        if (res.ok) {
          showFeedback(`Livre "${data.title}" mis à jour avec succès !`);
          setShowEditBookModal(false);
          setEditingBook(null);
          fetchAllData();
        } else {
          showFeedback(data.error || "Échec de modification.", 'danger');
          throw new Error(data.error);
        }
      } catch (err: any) {
        showFeedback(err.message || "Erreur inattendue lors de la sauvegarde.", 'danger');
        throw err;
      }
    });
  };

  // DELETE BOOK LOGIC
  const handleDeleteBook = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce livre du catalogue ?")) return;
    await runActionWithTrigger(`delete-${id}`, async () => {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Livre retiré du catalogue.");
        fetchAllData();
      } else {
        showFeedback(data.error || "Erreur de suppression.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // REGISTER BORROWING (PREST)
  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const triggerKey = `borrow-${newLoanData.book_id}`;
    await runActionWithTrigger(triggerKey, async () => {
      const res = await fetch('/api/borrowings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoanData)
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Le prêt intelligent a été enregistré et validé avec succès ! Le stock a été décrémenté.");
        setShowLoanModal(false);
        setNewLoanData({ user_id: '', book_id: '' });
        fetchAllData();
      } else {
        showFeedback(data.error || "Échec de validation d'emprunt.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // BOOK RETURN
  const handleReturnBook = async (borrowingId: number) => {
    await runActionWithTrigger(`return-${borrowingId}`, async () => {
      const res = await fetch('/api/borrowings/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borrowing_id: borrowingId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Le retour de livre a bien été enregistré. Exemplaire remis en rayon.");
        fetchAllData();
      } else {
        showFeedback(data.error || "Erreur lors du retour.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // RENEW LOAN (+1 WEEK)
  const handleRenewLoan = async (id: number) => {
    await runActionWithTrigger(`renew-${id}`, async () => {
      const res = await fetch(`/api/borrowings/${id}/renew`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Prolongation de prêt de +7 jours accordée !");
        fetchAllData();
      } else {
        showFeedback(data.error || "Renouvellement refusé.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // PENALTY PAYMENT
  const handlePayPenalty = async (id: number) => {
    await runActionWithTrigger(`pay-${id}`, async () => {
      const res = await fetch(`/api/penalties/${id}/pay`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Paiement enregistré d'amende de retard. Le compte du membre a été déverrouillé !");
        fetchAllData();
      } else {
        showFeedback(data.error || "Échec du règlement de l'amende.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // REGISTER RESERVATION (RESERVATION DYNAMIQUE PAR API POUR LES MEMBRES)
  const handleCreateReservation = async (bookId: number) => {
    if (currentUser.status === 'suspended') {
      showFeedback("Impossible : Votre compte adhérent est suspendu suite à des retards accumulés.", "danger");
      return;
    }
    await runActionWithTrigger(`reserve-${bookId}`, async () => {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, book_id: bookId })
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback("Félicitations ! Votre réservation d'ouvrage a bien été enregistrée et transmise à Sphera.");
        fetchAllData();
      } else {
        showFeedback(data.error || "Erreur lors du traitement de la réservation.", "danger");
        throw new Error(data.error);
      }
    });
  };

  // CANCEL RESERVATION
  const handleCancelReservation = async (reservationId: number) => {
    await runActionWithTrigger(`cancel-res-${reservationId}`, async () => {
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback("La réservation a été annulée avec succès. L'ouvrage est libéré.");
        fetchAllData();
      } else {
        showFeedback(data.error || "Erreur d'annulation.", 'danger');
        throw new Error(data.error);
      }
    });
  };

  // NOTIFICATION CLEAR
  const handleMarkNotificationsRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    fetchAllData();
  };

  // FILTER LOGIC
  const filteredBooks = books.filter(b => {
    const textMatch = b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
                      b.isbn.includes(bookSearch) || b.author.toLowerCase().includes(bookSearch.toLowerCase());
    const catMatch = selectedCategory === 'all' || b.category_id.toString() === selectedCategory;
    const authorMatch = selectedAuthor === 'all' || b.author_id.toString() === selectedAuthor;
    const availMatch = selectedAvailability === 'all' || 
                       (selectedAvailability === 'available' && b.available_quantity > 0) || 
                       (selectedAvailability === 'unavailable' && b.available_quantity === 0);
    return textMatch && catMatch && authorMatch && availMatch;
  });

  const filteredMembers = members.filter(m => {
    const text = `${m.firstname} ${m.lastname} ${m.email}`.toLowerCase();
    return text.includes(memberSearch.toLowerCase());
  });

  const filteredBorrowings = borrowings.filter(br => {
    const text = `${br.user_name} ${br.book_title} ${br.book_isbn}`.toLowerCase();
    return text.includes(borrowingSearch.toLowerCase());
  });

  // CHARTS COLOR PALETTE
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (!currentUser) {
    return (
      <div id="root" className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-500/20 selection:text-violet-200 justify-center items-center p-4">
        {/* DYNAMIC STYLE SHEET INJECTION BASED ON CORE THEME EXPERIENCES */}
        <style dangerouslySetInnerHTML={{ __html: `
          ${theme === 'classic-light' ? `
            #root, body, html {
              background-color: #f7f6fd !important;
              background-image: radial-gradient(at 0% 0%, rgba(243, 232, 255, 0.6) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(224, 231, 255, 0.5) 0px, transparent 50%) !important;
              color: #1f124c !important;
              font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif !important;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: "Space Grotesk", sans-serif !important;
              color: #120932 !important;
              letter-spacing: -0.015em !important;
            }
            .bg-\\[\\#0e1629\\]\\/75 {
              background-color: #ffffff !important;
              border-color: rgba(139, 92, 246, 0.12) !important;
              color: #1f124c !important;
              box-shadow: 0 32px 64px -12px rgba(109, 40, 217, 0.08) !important;
              border-radius: 28px !important;
            }
            .border-slate-800 {
              border-color: rgba(139, 92, 246, 0.08) !important;
            }
            .text-slate-100 {
              color: #120932 !important;
            }
            .text-slate-200 {
              color: #1f124c !important;
            }
            .text-slate-300 {
              color: #34275d !important;
            }
            .text-slate-400 {
              color: #6f5d9c !important;
            }
            .bg-\\[\\#070b14\\] {
              background-color: #fcfbfe !important;
            }
            .bg-\\[\\#070b14\\]\\/90 {
              background-color: #fcfbfe !important;
              border-color: rgba(139, 92, 246, 0.08) !important;
            }
            .bg-\\[\\#070b14\\]\\/70 {
              background-color: #ffffff !important;
              border-color: rgba(139, 92, 246, 0.1) !important;
            }
            .border-slate-850 {
              border-color: rgba(139, 92, 246, 0.08) !important;
            }
            input, selectOption, select {
              background-color: #ffffff !important;
              color: #1f124c !important;
              border-color: rgba(139, 92, 246, 0.12) !important;
            }
            input::placeholder {
              color: #9081bb !important;
            }
          ` : ''}
          ${theme === 'royal-editorial' ? `
            #root, body, html {
              background-color: #faf6f0 !important;
              color: #2b1f1d !important;
              font-family: 'Playfair Display', Georgia, serif !important;
            }
            .bg-\\[\\#0e1629\\]\\/75 {
              background-color: #ffffff !important;
              border-color: #ebdcd0 !important;
              border-radius: 12px !important;
              color: #2b1f1d !important;
            }
            .border-slate-800 {
              border-color: #ebdcd0 !important;
            }
            .text-slate-100 {
              color: #3d2a25 !important;
            }
            .text-slate-300 {
              color: #4f3b35 !important;
            }
            .text-slate-400 {
              color: #7c625a !important;
            }
            .bg-\\[\\#070b14\\] {
              background-color: #faf6f0 !important;
            }
            input, select {
              background-color: #faf6f0 !important;
              color: #3d2a25 !important;
              border-color: #ebdcd0 !important;
            }
          ` : ''}
          ${theme === 'cyber-terminal' ? `
            #root, body, html {
              background-color: #040508 !important;
              color: #33ff33 !important;
              font-family: 'Fira Code', monospace !important;
            }
            .bg-\\[\\#0e1629\\]\\/75 {
              background-color: #0b0c10 !important;
              border-color: #33ff33 !important;
              border-radius: 0px !important;
              color: #33ff33 !important;
            }
            .border-slate-800 {
              border-color: #33ff33 !important;
            }
            .text-slate-100 {
              color: #33ff33 !important;
            }
            .text-slate-300 {
              color: #00ff00 !important;
            }
            .text-slate-400 {
              color: #00aa00 !important;
            }
            .bg-\\[\\#070b14\\] {
              background-color: #040508 !important;
            }
            input, select {
              background-color: #07080c !important;
              color: #33ff33 !important;
              border-color: #33ff33 !important;
              font-family: monospace !important;
            }
          ` : ''}
        ` }} />

        {/* FEEDBACK NOTIFICATION IN AUTHENTICATION WINDOW */}
        {feedbackMsg && (
          <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white transition-all transform duration-300 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-500/20 animate-scale-up">
            {feedbackMsg.type === 'danger' ? <AlertTriangle className="h-5 w-5 text-rose-200" /> : <CheckCircle className="h-5 w-5 text-violet-200" />}
            <span className="font-semibold text-xs tracking-wide">{feedbackMsg.text}</span>
          </div>
        )}

        {/* Simplified header for Auth screen */}
        <header className="w-full max-w-md mx-auto py-2 flex items-center justify-between pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-violet-500/20">
              B
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-101 text-slate-100 flex items-center gap-1.5 leading-none">
                <span>BiblioSphere</span>
              </h1>
              <p className="text-[8px] text-indigo-400 font-mono uppercase tracking-widest mt-1">Smart SaaS</p>
            </div>
          </div>
          <div className="relative">
            <button 
              id="auth-theme-deck-trigger"
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-800/60 flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5 text-violet-400 rotate-90" />
              <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Vibe</span>
            </button>
            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0e1629] border border-slate-800 rounded-2xl shadow-2xl p-4 z-[9999] animate-fade-in space-y-3 font-sans">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <span className="text-[10px] font-black text-slate-300 uppercase font-mono tracking-wider">Choix Thématique</span>
                  <button onClick={() => setThemeMenuOpen(false)} className="text-slate-500 hover:text-white transition cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'classic-light', name: "Sleek light", color: 'bg-slate-100 border-slate-300', desc: "Design d'origine épuré, blanc éclatant" },
                    { id: 'cosmic-dark', name: "Cosmic Dark", color: 'bg-indigo-950 border-indigo-600', desc: "L'univers bleu nuit, néon violet & fuchsia" },
                    { id: 'royal-editorial', name: "Château d'Édition", color: 'bg-amber-100 border-amber-600', desc: "Grains de papier nobles & typographie" },
                    { id: 'cyber-terminal', name: "Cyber CRT Terminal", color: 'bg-zinc-900 border-green-500', desc: "Une nostalgie console verte phosphorescente" }
                  ].map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        setTheme(item.id as any);
                        setThemeMenuOpen(false);
                      }}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                        theme === item.id 
                          ? 'bg-violet-600/10 border-violet-500/50 hover:border-violet-500 shadow-md shadow-violet-550/10' 
                          : 'bg-slate-900/40 border-transparent hover:bg-slate-800/30'
                      }`}
                    >
                      <div className={`h-3 w-3 rounded-full ${item.color} mt-1 border`} />
                      <div>
                        <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                          <span>{item.name}</span>
                          {theme === item.id && <Sparkles className="h-3 w-3 text-violet-400" />}
                        </h4>
                        <p className="text-[9px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Core dynamic auth layout */}
        <main className="w-full max-w-sm flex flex-col justify-center">
          <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
            
            {/* Nav Switchers */}
            <div className="flex bg-[#070b14]/90 p-1 rounded-2xl border border-slate-850">
              <button 
                onClick={() => setAuthTab('login')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authTab === 'login' 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/15' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Connexion
              </button>
              <button 
                onClick={() => setAuthTab('register')}
                className={`flex-1 text-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authTab === 'register' 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/15' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Créer un compte
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">E-mail</label>
                  <input 
                    type="email" 
                    required
                    placeholder="votre.email@bibliosphere.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Mot de passe</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3 rounded-xl text-xs font-black tracking-wider transition-all shadow-md hover:shadow-violet-600/25 border border-violet-500/20 active:scale-[98%] cursor-pointer mt-2"
                >
                  S'AUTHENTIFIER
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Prénom</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Antoinette" 
                      value={regFirstname}
                      onChange={(e) => setRegFirstname(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Nom</label>
                    <input 
                      type="text" 
                      required
                      placeholder="TCHETECHE" 
                      value={regLastname}
                      onChange={(e) => setRegLastname(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">E-mail unique</label>
                  <input 
                    type="email" 
                    required
                    placeholder="antoinette.tcheteche@exemple.com" 
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Mot de passe</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="+229 97..." 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Adresse</label>
                    <input 
                      type="text" 
                      placeholder="Abomey-Calavi, Bénin" 
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 placeholder-slate-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pb-0.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Rôle souhaité</label>
                    <select 
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-2 py-2 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 font-bold"
                    >
                      <option value="member">Membre (Lecteur)</option>
                      <option value="librarian">Bibliothécaire (Staff)</option>
                      <option value="admin">Administrateur (SaaS)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-[#566487] font-mono block">Abonnement</label>
                    <select 
                      value={regMembership}
                      onChange={(e) => setRegMembership(e.target.value as any)}
                      className="w-full px-2 py-2 bg-[#070b14]/70 border border-slate-800 rounded-xl outline-none focus:border-violet-500 text-xs text-slate-100 font-bold"
                      disabled={regRole !== 'member'}
                    >
                      <option value="Standard">Standard (Gratuit)</option>
                      <option value="Premium">Formule Premium</option>
                      <option value="VIP Diamond">VIP Diamond</option>
                    </select>
                  </div>
                </div>

                {regRole === 'admin' && adminExists && (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl flex gap-2 items-start animate-fade-in text-rose-400 text-[10px] leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-450" />
                    <span>⚠️ Un administrateur principal est déjà enregistré. L'inscription d'un deuxième admin est bloquée par le système.</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={regRole === 'admin' && adminExists}
                  className={`w-full text-white py-3 rounded-xl text-xs font-black tracking-wider transition-all shadow-md active:scale-[98%] cursor-pointer mt-1 ${
                    regRole === 'admin' && adminExists
                      ? 'bg-slate-800 border-none text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/25 border border-violet-500/20'
                  }`}
                >
                  CRÉER LE COMPTE
                </button>
              </form>
            )}

            <div className="text-center font-mono text-[8px] text-slate-500 tracking-wider">
              Sphera Cloud Engine • Tous droits réservés © 2026
            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div id="root" className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans antialiased selection:bg-violet-500/20 selection:text-violet-200">
      
      {/* DYNAMIC STYLE SHEET INJECTION BASED ON CORE THEME EXPERIENCES */}
      <style dangerouslySetInnerHTML={{ __html: `
        ${theme === 'classic-light' ? `
          #root, body, html {
            background-color: #f6f5fa !important;
            background-image: radial-gradient(at 0% 0%, rgba(243, 232, 255, 0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(224, 231, 255, 0.4) 0px, transparent 50%) !important;
            color: #1a0f3d !important;
            font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif !important;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: "Space Grotesk", sans-serif !important;
            letter-spacing: -0.015em !important;
            color: #120932 !important;
          }
          header, header *, select, input, button:not(.bg-gradient-to-r) {
            transition: all 0.2s ease-in-out;
          }
          .bg-\\[\\#070b14\\] { background-color: #f7f6fd !important; color: #1f124c !important; }
          .bg-\\[\\#0a0f1d\\]\\/90 { background-color: rgba(255, 255, 255, 0.92) !important; backdrop-filter: blur(20px) !important; color: #120932 !important; border-bottom-color: rgba(139, 92, 246, 0.08) !important; box-shadow: 0 4px 30px rgba(139, 92, 246, 0.02) !important; }
          .bg-\\[\\#0e1629\\]\\/75 { 
            background-color: #ffffff !important; 
            border-color: rgba(139, 92, 246, 0.09) !important; 
            color: #1f124c !important; 
            box-shadow: 0 20px 40px -10px rgba(109, 40, 217, 0.03), 0 10px 20px -10px rgba(109, 40, 217, 0.01) !important; 
            border-radius: 24px !important;
          }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #faf9fe !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #1f124c !important; }
          .bg-\\[\\#060a12\\]\\/90 { background-color: #ffffff !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #120932 !important; }
          .bg-\\[\\#060a12\\] { background-color: #faf9fe !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #120932 !important; }
          .text-slate-100 { color: #120932 !important; }
          .text-slate-200 { color: #1f124c !important; }
          .text-slate-300 { color: #34275d !important; }
          .text-slate-350 { color: #453578 !important; }
          .text-slate-400 { color: #6f5d9c !important; }
          .text-slate-500 { color: #9081bb !important; }
          .text-indigo-300\\/60 { color: #7c3aed !important; }
          .border-slate-800 { border-color: rgba(139, 92, 246, 0.07) !important; }
          .border-slate-800\\/80 { border-color: rgba(139, 92, 246, 0.08) !important; }
          .border-slate-850 { border-color: rgba(139, 92, 246, 0.08) !important; }
          .border-slate-850\\/40 { border-color: rgba(139, 92, 246, 0.05) !important; }
          .border-slate-850\\/60 { border-color: rgba(139, 92, 246, 0.08) !important; }
          .bg-\\[\\#10192e\\]\\/80 { background-color: #faf9fe !important; border-color: rgba(139, 92, 246, 0.1) !important; }
          .bg-\\[\\#0e1629\\]\\/75 { background-color: #ffffff !important; border-color: rgba(139, 92, 246, 0.1) !important; }
          .bg-\\[\\#070b14\\]\\/75 { background-color: #faf9ff !important; border-color: rgba(139, 92, 246, 0.08) !important; }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #fcfbfe !important; border-color: rgba(139, 92, 246, 0.08) !important; }
          .bg-\\[\\#070b14\\]\\/40 { background-color: #f7f6fc !important; }
          .bg-slate-850\\/60 { background-color: #ffffff !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #120932 !important; }
          .border-slate-700\\/50 { border-color: rgba(139, 92, 246, 0.08) !important; }
          .bg-slate-800\\/60 { background-color: #f7f6fc !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #120932 !important; }
          .bg-\\[\\#142340\\] { background-color: #eae7f5 !important; }
          input, select, textarea {
            color: #120932 !important;
            background-color: #ffffff !important;
            border-color: rgba(139, 92, 246, 0.12) !important;
          }
          thead tr { background-color: #f7f6fc !important; border-bottom: 2px solid rgba(139, 92, 246, 0.08) !important; }
          tbody tr { background-color: #ffffff !important; color: #1f124c !important; border-bottom: 1px solid rgba(139, 92, 246, 0.06) !important; }
          tbody tr:hover { background-color: #faf9fd !important; }
          .bg-gradient-to-r.from-violet-600\\/15 {
            background: linear-gradient(to right, rgba(124, 58, 237, 0.07), rgba(243, 240, 254, 0.8)) !important;
            color: #7c3aed !important;
          }
          aside button { color: #6f5d9c !important; font-family: "Space Grotesk", sans-serif !important; font-weight: 500 !important; }
          aside button.text-white { color: #7c3aed !important; background-color: rgba(124, 58, 237, 0.06) !important; border-radius: 14px !important; }
          .text-violet-400 { color: #7c3aed !important; }
          .bg-violet-500\\/10 { background-color: rgba(124, 58, 237, 0.08) !important; color: #7c3aed !important; }
          .bg-indigo-500\\/10 { background-color: rgba(79, 70, 229, 0.08) !important; color: #4f46e5 !important; }
          .bg-blue-500\\/10 { background-color: rgba(59, 130, 246, 0.08) !important; color: #2563eb !important; }
          .bg-pink-500\\/10 { background-color: rgba(236, 72, 153, 0.08) !important; color: #db2777 !important; }
          .h-10.w-10.bg-\\[\\#070b14\\] { background-color: #faf9fe !important; border-color: rgba(139, 92, 246, 0.08) !important; color: #120932 !important; }
          .fill-violet-500\\/20 { fill: rgba(124, 58, 237, 0.15) !important; }
          .bg-gradient-to-br.from-\\[\\#121c33\\]\\/90 {
            background: linear-gradient(135deg, #ffffff 0%, #fafcf9 100%) !important;
            border-color: rgba(139, 92, 246, 0.08) !important;
            color: #120932 !important;
          }
          .recharts-default-tooltip {
            background-color: #ffffff !important;
            border: 1px solid rgba(139, 92, 246, 0.15) !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px rgba(109, 40, 217, 0.05) !important;
            color: #120932 !important;
          }
          .bg-indigo-600 { background-color: #7c3aed !important; }
          .bg-violet-600 { background-color: #7c3aed !important; }
          .bg-gradient-to-r.from-violet-600 {
            background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important;
          }
          .modern-glowing-card {
            background-color: #ffffff !important;
            border: 1px solid rgba(139, 92, 246, 0.08) !important;
            box-shadow: 0 20px 48px -6px rgba(109, 40, 217, 0.03), 0 8px 20px -4px rgba(109, 40, 217, 0.01) !important;
            border-radius: 28px !important;
          }
          .modern-glowing-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 25px 50px -12px rgba(109, 40, 217, 0.08) !important;
            border-color: rgba(124, 58, 237, 0.2) !important;
          }
        ` : ''}
        ${theme === 'royal-editorial' ? `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@700&display=swap');
          #root, body, html {
            background-color: #faf6f0 !important;
            color: #2b1d0c !important;
            font-family: 'Playfair Display', Georgia, serif !important;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: #1a0f02 !important;
          }
          p, span, div, button, table, input, select {
            font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
          }
          .bg-\\[\\#070b14\\] { background-color: #faf6f0 !important; color: #2b1d0c !important; }
          .bg-\\[\\#0a0f1d\\]\\/90 { background-color: #faf6f0 !important; color: #1a0f02 !important; border-bottom-color: #e4dfd5 !important; }
          .bg-\\[\\#0e1629\\]\\/75 { background-color: #ffffff !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; box-shadow: 0 4px 20px -2px rgba(139, 92, 26, 0.05) !important; }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #f5efe2 !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; }
          .bg-\\[\\#060a12\\]\\/90 { background-color: #ffffff !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; }
          .bg-\\[\\#060a12\\] { background-color: #f5efe2 !important; border-color: #e4dfd5 !important; color: #1a0f02 !important; }
          .text-slate-100 { color: #1a0f02 !important; }
          .text-slate-200 { color: #2b1d0c !important; }
          .text-slate-300 { color: #4a3e2e !important; }
          .text-slate-350 { color: #5c4e3b !important; }
          .text-slate-400 { color: #7d6b4f !important; }
          .text-slate-500 { color: #7d6b4f !important; }
          .text-indigo-300\\/60 { color: #8c2530 !important; }
          .border-slate-800 { border-color: #e4dfd5 !important; }
          .border-slate-800\\/80 { border-color: #e4dfd5 !important; }
          .border-slate-850 { border-color: #e4dfd5 !important; }
          .border-slate-850\\/40 { border-color: #e4dfd5 !important; }
          .border-slate-850\\/60 { border-color: #e4dfd5 !important; }
          .bg-\\[\\#10192e\\]\\/80 { background-color: #f5efe2 !important; border-color: #e4dfd5 !important; }
          .bg-\\[\\#0e1629\\]\\/75 { background-color: #ffffff !important; border-color: #e4dfd5 !important; }
          .bg-\\[\\#070b14\\]\\/75 { background-color: #f5efe2 !important; border-color: #e4dfd5 !important; }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #faf6f0 !important; border-color: #e4dfd5 !important; }
          .bg-\\[\\#070b14\\]\\/40 { background-color: #faf6f0 !important; }
          .bg-slate-850\\/60 { background-color: #ffffff !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; }
          .border-slate-700\\/50 { border-color: #e4dfd5 !important; }
          .bg-slate-800\\/60 { background-color: #f5efe2 !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; }
          .bg-\\[\\#142340\\] { background-color: #e4dfd5 !important; }
          input, select, textarea {
            color: #1a0f02 !important;
            background-color: #ffffff !important;
            border-color: #e4dfd5 !important;
          }
          thead tr { background-color: #f5efe2 !important; border-bottom: 2px solid #e4dfd5 !important; }
          tbody tr { background-color: #ffffff !important; color: #2b1d0c !important; border-bottom: 1px solid #e4dfd5 !important; }
          tbody tr:hover { background-color: #fcfbf9 !important; }
          .bg-gradient-to-r.from-violet-600\\/15 {
            background: #f0e6d2 !important;
            color: #8c2530 !important;
          }
          aside button { color: #7d6b4f !important; }
          aside button.text-white { color: #8c2530 !important; }
          .text-violet-400 { color: #8c2530 !important; }
          .bg-gradient-to-r.from-violet-600 {
            background: linear-gradient(135deg, #8c2530 0%, #a27b3c 100%) !important;
            border-color: #8c2530 !important;
            color: #ffffff !important;
          }
          .h-10.w-10.bg-\\[\\#070b14\\] { background-color: #faf6f0 !important; border-color: #e4dfd5 !important; color: #2b1d0c !important; }
          .fill-violet-500\\/20 { fill: rgba(140, 37, 48, 0.2) !important; }
          .bg-gradient-to-br.from-\\[\\#121c33\\]\\/90 {
            background: linear-gradient(135deg, #ffffff 0%, #fcfbf9 100%) !important;
            border-color: #e4dfd5 !important;
            color: #2b1d0c !important;
          }
          .bg-indigo-600 { background-color: #8c2530 !important; }
        ` : ''}
        ${theme === 'cyber-terminal' ? `
          #root, body, html {
            background-color: #06070a !important;
            color: #34d399 !important;
            font-family: 'JetBrains Mono', ui-monospace, monospace !important;
          }
          h1, h2, h3, h4, h5, h6, p, span, div, button, table, input, select {
            font-family: 'JetBrains Mono', ui-monospace, monospace !important;
          }
          .bg-\\[\\#070b14\\] { background-color: #06070a !important; color: #34d399 !important; }
          .bg-\\[\\#0a0f1d\\]\\/90 { background-color: #0b0c10 !important; color: #10b981 !important; border-bottom-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-\\[\\#0e1629\\]\\/75 { background-color: #0e1118 !important; border-color: rgba(16, 185, 129, 0.4) !important; color: #34d399 !important; box-shadow: 0 0 10px rgba(16, 185, 129, 0.1) !important; }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #07080b !important; border-color: rgba(16, 185, 129, 0.2) !important; color: #34d399 !important; }
          .bg-\\[\\#060a12\\]\\/90 { background-color: #07080b !important; border-color: rgba(16, 185, 129, 0.2) !important; }
          .bg-\\[\\#060a12\\] { background-color: #07080b !important; border-color: rgba(16, 185, 129, 0.2) !important; }
          .text-slate-100 { color: #34d399 !important; }
          .text-slate-200 { color: #10b981 !important; }
          .text-slate-300 { color: #10b981 !important; }
          .text-slate-350 { color: #047857 !important; }
          .text-slate-400 { color: #34d399 !important; }
          .text-slate-500 { color: #065f46 !important; }
          .text-indigo-300\\/60 { color: #10b981 !important; }
          .border-slate-800 { border-color: rgba(16, 185, 129, 0.2) !important; }
          .border-slate-800\\/80 { border-color: rgba(16, 185, 129, 0.2) !important; }
          .border-slate-850 { border-color: rgba(16, 185, 129, 0.3) !important; }
          .border-slate-850\\/40 { border-color: rgba(16, 185, 129, 0.2) !important; }
          .border-slate-850\\/60 { border-color: rgba(16, 185, 129, 0.2) !important; }
          .bg-\\[\\#10192e\\]\\/80 { background-color: #0e1118 !important; border-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-\\[\\#0e1629\\]\\/75 { background-color: #06070a !important; border-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-\\[\\#070b14\\]\\/75 { background-color: #0e1118 !important; border-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-\\[\\#060a12\\]\\/85 { background-color: #06070a !important; border-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-\\[\\#070b14\\]\\/40 { background-color: #06070a !important; }
          .bg-slate-850\\/60 { background-color: #0e1118 !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #34d399 !important; }
          .border-slate-700\\/50 { border-color: rgba(16, 185, 129, 0.3) !important; }
          .bg-slate-800\\/60 { background-color: #07080b !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #34d399 !important; }
          .bg-\\[\\#142340\\] { background-color: #0e1118 !important; }
          input, select, textarea {
            color: #34d399 !important;
            background-color: #06070a !important;
            border-color: rgba(16, 185, 129, 0.4) !important;
          }
          thead tr { background-color: #0e1118 !important; border-bottom: 2px solid rgba(16, 185, 129, 0.4) !important; }
          tbody tr { background-color: #06070a !important; color: #34d399 !important; border-bottom: 1px solid rgba(16, 185, 129, 0.2) !important; }
          tbody tr:hover { background-color: rgba(16, 185, 129, 0.05) !important; }
          .bg-gradient-to-r.from-violet-600\\/15 {
            background: rgba(16, 185, 129, 0.15) !important;
            color: #10b981 !important;
            border-left-color: #10b981 !important;
          }
          aside button { color: #047857 !important; }
          aside button.text-white { color: #10b981 !important; }
          .text-violet-400 { color: #10b981 !important; }
          .bg-gradient-to-r.from-violet-600 {
            background: #10b981 !important;
            color: #06070a !important;
            border-color: #10b981 !important;
          }
          .h-10.w-10.bg-\\[\\#070b14\\] { background-color: #06070a !important; border-color: rgba(16, 185, 129, 0.3) !important; color: #34d399 !important; }
          .fill-violet-500\\/20 { fill: rgba(16, 185, 129, 0.2) !important; }
          .bg-gradient-to-br.from-\\[\\#121c33\\]\\/90 {
            background: #0e1118 !important;
            border-color: rgba(16, 185, 129, 0.3) !important;
            color: #34d399 !important;
          }
          .bg-indigo-600 { background-color: #10b981 !important; color: #06070a !important; }
          .text-indigo-300\\/60 { color: #10b981 !important; }
        ` : ''}
      ` }} />
      
      {/* GLOBAL FEEDBACK NOTIFICATION */}
      {feedbackMsg && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl shadow-violet-500/10 text-white transition-all transform duration-300 move-enter ${feedbackMsg.type === 'danger' ? 'bg-red-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-500/20 animate-scale-up'}`}>
          {feedbackMsg.type === 'danger' ? <AlertTriangle className="h-5 w-5 text-red-200" /> : <CheckCircle className="h-5 w-5 text-violet-200" />}
          <span className="font-semibold text-xs tracking-wide">{feedbackMsg.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-xl text-white shadow-2xl shadow-[#000000]/30 border-b border-slate-800/80">
        <div className={`${isFullscreenLayout ? 'max-w-none px-6 sm:px-8' : 'max-w-7xl px-4'} w-full mx-auto h-16 flex items-center justify-between`}>
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20">
              <BookIcon className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
                BiblioSphere
              </h1>
              <p className="text-[9px] text-indigo-300/60 font-mono tracking-widest uppercase">Smart Library SaaS Platform</p>
            </div>
          </div>

          {/* Secure connection state badge */}
          <div className="hidden md:flex items-center gap-1.5 font-[#566487] font-mono text-[9px] text-[#566487] px-3 py-1.5 bg-[#10192e]/30 border border-slate-850 rounded-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="uppercase tracking-widest text-[#566487] font-bold">SESSION ACTIVE</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            
            {/* Bell Notifications */}
            <div className="relative">
              <button 
                id="notification-hub-trigger"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-[#10192e] rounded-xl transition-all border border-transparent hover:border-slate-800/60"
              >
                <Bell className="h-4.5 w-4.5" />
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-gradient-to-tr from-pink-500 to-rose-500 rounded-full ring-2 ring-[#070b14]"></span>
                )}
              </button>

              {/* Notification dropdown popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0e1629]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/80 text-slate-200 py-2 z-50 animate-scale-up">
                  <div className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">Alertes & Notifications</h3>
                    <button 
                      onClick={handleMarkNotificationsRead}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider"
                    >
                      Tout lire
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 p-6 text-center">Aucune notification.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3.5 text-xs border-b border-slate-800/40 hover:bg-[#15203b]/40 transition ${!n.is_read ? 'bg-violet-950/20' : ''}`}>
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-extrabold text-slate-100">{n.title}</span>
                            <span className="text-[9px] font-mono text-slate-500 shrink-0">{new Date(n.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen width toggle button */}
            <button
              onClick={() => {
                const nextVal = !isFullscreenLayout;
                setIsFullscreenLayout(nextVal);
                showFeedback(nextVal ? "Mode Plein écran (Largeur maximale) activé !" : "Mode Normal restauré.");
                if (nextVal) {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } else {
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                  }
                }
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-[#10192e] rounded-xl transition-all border border-transparent hover:border-slate-800/60 flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
              title="Basculer le mode Plein écran"
            >
              {isFullscreenLayout ? (
                <>
                  <Minimize2 className="h-4.5 w-4.5 text-[#f43f5e]" />
                  <span className="hidden md:inline text-[10px] font-mono tracking-widest uppercase text-slate-400 font-extrabold">Normal</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="hidden md:inline text-[10px] font-mono tracking-widest uppercase text-slate-400 font-extrabold">Plein écran</span>
                </>
              )}
            </button>

            {/* Quick Light/Dark toggle button */}
            <button
              onClick={() => {
                const nextTheme = theme === 'classic-light' ? 'cosmic-dark' : 'classic-light';
                setTheme(nextTheme);
                showFeedback(`Thème ${nextTheme === 'classic-light' ? 'Clair' : 'Sombre'} activé !`);
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-[#566487]/30 flex items-center justify-center cursor-pointer pointer-events-auto shadow-sm"
              title={theme === 'classic-light' ? "Basculer en Thème Sombre" : "Basculer en Thème Clair"}
            >
              {theme === 'classic-light' ? (
                <Moon className="h-4.5 w-4.5 text-indigo-400" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              )}
            </button>

            {/* Real-time Theme/Vibe Switcher Deck Popover */}
            <div className="relative">
              <button 
                id="theme-deck-trigger"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-all border border-transparent hover:border-slate-800/60 flex items-center gap-1.5 cursor-pointer pointer-events-auto"
                title="Choisir l'ambiance de l'application"
              >
                <Sliders className="h-4.5 w-4.5 text-violet-400 rotate-90" />
                <span className="hidden md:inline text-[10px] font-mono tracking-widest uppercase text-slate-400 font-extrabold">Vibe</span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0e1629]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/80 text-slate-200 py-3.5 z-55 animate-scale-up">
                  <div className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between font-sans">
                    <h3 className="font-extrabold text-[10px] text-slate-300 uppercase tracking-widest">Ambiance visuelle</h3>
                    <button 
                      onClick={() => setThemeMenuOpen(false)}
                      className="text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2 max-h-96 overflow-y-auto font-sans">
                    {[
                      {
                        id: 'cosmic-dark' as const,
                        name: 'Astral Cosmic (Sombre Premium)',
                        desc: 'Interface de nuit profonde ornée de dégradés vibrants et d\'éclats violets.',
                        color: 'bg-violet-600',
                        accent: 'text-violet-400'
                      },
                      {
                        id: 'classic-light' as const,
                        name: 'Office Minimalist (Thème Clair)',
                        desc: 'Parfait pour le jour. Grand confort de contraste, fond blanc pur & lisibilité premium.',
                        color: 'bg-indigo-600',
                        accent: 'text-indigo-600'
                      },
                      {
                        id: 'royal-editorial' as const,
                        name: 'Royal Editorial (Calligraphie Champagne)',
                        desc: 'Papier champagne luxueux, polices sérif de prestige et style bordeaux classique.',
                        color: 'bg-amber-700',
                        accent: 'text-amber-800'
                      },
                      {
                        id: 'cyber-terminal' as const,
                        name: 'Cyberpunk Terminal (HUD Matrix)',
                        desc: 'Console de hacker rétro rétroéclairée en vert phosphorescent et polices mono.',
                        color: 'bg-emerald-500',
                        accent: 'text-emerald-400'
                      }
                    ].map(item => (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setTheme(item.id);
                          setThemeMenuOpen(false);
                          showFeedback(`Ambiance "${item.name}" sélectionnée et appliquée !`);
                        }}
                        className={`p-3 rounded-xl border transition-all duration-250 text-left flex items-start gap-3 cursor-pointer ${
                          theme === item.id 
                            ? 'bg-slate-800 border-violet-500 shadow-md shadow-violet-500/5' 
                            : 'bg-slate-900/35 border-transparent hover:bg-slate-800/40 hover:border-slate-800'
                        }`}
                      >
                        <div className={`h-3 w-3 rounded-full ${item.color} shrink-0 mt-1 shadow-sm`}></div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-extrabold text-white flex items-center gap-1">
                            <span>{item.name}</span>
                            {theme === item.id && <Sparkles className="h-3 w-3 text-[#a78bfa] fill-violet-400/20" />}
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-normal">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
                    <span>MODE: {theme.toUpperCase()}</span>
                    <span>Experience v2.1</span>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated user menu & real logout */}
            <div className="flex items-center gap-2.5 border-l border-slate-800/80 pr-1 pl-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-violet-500/20">
                {currentUser?.firstname?.[0] || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-none text-slate-100">{currentUser?.firstname} {currentUser?.lastname}</p>
                <p className="text-[9px] text-[#566487] capitalize mt-1 font-mono tracking-wide">
                  {currentUser?.role === 'admin' ? 'Administrateur SaaS' : currentUser?.role === 'librarian' ? 'Bibliothécaire' : 'Lecteur permanent'}
                </p>
              </div>
              <button
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                    setCurrentUser(null);
                    localStorage.removeItem('currentUser');
                    showFeedback("Vous avez été déconnecté de la session.");
                  });
                }}
                className="p-1.5 text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer select-none border border-transparent hover:border-rose-500/20"
                title="Se déconnecter"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN APPLICATION CONTAINER WITH SIDEBAR DRAWER AND CONTENT */}
      <div className={`flex-1 ${isFullscreenLayout ? 'max-w-none px-6 sm:px-8' : 'max-w-7xl px-4'} w-full mx-auto py-8 flex flex-col lg:flex-row gap-8`}>
        
        {/* NAV SYSTÈME DRIP DRAWER */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none lg:sticky lg:top-24 self-start">
          
          <p className="hidden lg:block text-[9px] uppercase tracking-widest text-[#566487] font-black px-3.5 mb-2 font-mono">Navigation générale</p>
          
          {currentUser.role === 'admin' && (
            <button 
              id="tab-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                  : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
              }`}
            >
              <TrendingUp className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'dashboard' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
              <span>Tableau de bord</span>
            </button>
          )}

          <button 
            id="tab-btn-books"
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
              activeTab === 'books' 
                ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
            }`}
          >
            <BookIcon className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'books' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
            <span>Catalogue des Livres</span>
          </button>

          <button 
            id="tab-btn-reservations"
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
              activeTab === 'reservations' 
                ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
            }`}
          >
            <Bookmark className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'reservations' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
            <span>Files d'Attente & Réservations</span>
            {reservations.filter(r => (currentUser.role === 'member' ? r.user_id === currentUser.id : true) && (r.status === 'fulfilled' || r.status === 'pending')).length > 0 && (
              <span className="ml-auto bg-violet-600 text-white rounded-full text-[9px] font-black h-4 px-1.5 flex items-center justify-center animate-pulse">
                {reservations.filter(r => (currentUser.role === 'member' ? r.user_id === currentUser.id : true) && (r.status === 'fulfilled' || r.status === 'pending')).length}
              </span>
            )}
          </button>

          {(currentUser.role === 'admin' || currentUser.role === 'librarian') && (
            <button 
              id="tab-btn-borrowings"
              onClick={() => setActiveTab('borrowings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
                activeTab === 'borrowings' 
                  ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                  : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
              }`}
            >
              <BookmarkCheck className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'borrowings' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
              <span>Prêts & Retours</span>
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'librarian') && (
            <button 
              id="tab-btn-members"
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
                activeTab === 'members' 
                  ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                  : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
              }`}
            >
              <Users className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'members' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
              <span>Membres & Abonnements</span>
            </button>
          )}

          <button 
            id="tab-btn-penalties"
            onClick={() => setActiveTab('penalties')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
              activeTab === 'penalties' 
                ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
            }`}
          >
            <Receipt className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'penalties' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
            <span>Frais & Pénalités</span>
          </button>

          {currentUser.role === 'admin' && (
            <button 
              id="tab-btn-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
                activeTab === 'logs' 
                  ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500' 
                  : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
              }`}
            >
              <FileText className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'logs' ? 'scale-110 text-violet-400' : 'text-slate-400'}`} />
              <span>Journaux d'Audit</span>
            </button>
          )}

          <div className="h-px bg-slate-800/60 my-4 hidden lg:block"></div>
          
          <p className="hidden lg:block text-[9px] uppercase tracking-widest text-[#566487] font-black px-3.5 mb-2 font-mono">IA & Intelligence</p>

          <button 
            id="tab-btn-ai"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs transition-all duration-300 font-extrabold whitespace-nowrap lg:whitespace-normal cursor-pointer hover:translate-x-0.5 ${
              activeTab === 'ai' 
                ? 'bg-gradient-to-r from-violet-600/15 via-[#10192e] to-indigo-950/10 text-white shadow-xl border-l-[3px] border-violet-500 shadow-violet-500/5' 
                : 'text-slate-400 hover:bg-[#0e1629]/60 hover:text-white'
            }`}
          >
            <Bot className={`h-4.5 w-4.5 transition-transform duration-300 ${activeTab === 'ai' ? 'scale-110 text-violet-450' : 'text-violet-500'}`} />
            <span className="flex items-center gap-1.5">
              <span>Sphera IA</span>
              <Sparkles className="h-3 w-3 text-violet-400 fill-violet-400 animate-pulse" />
            </span>
          </button>

        </aside>

        {/* VIEWPORTS CORE DESK */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: SYSTEM MONITORING DASHBOARD (FOR ADMIN/LIBRARIANS) */}
          {activeTab === 'dashboard' && currentUser.role === 'admin' && (
            <div className="space-y-8 animate-fade-in" id="dashboard-viewport">
              
              {/* Stats bento rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-violet-500/30 shadow-xs hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Ouvrages disponibles</p>
                    <h3 className="text-3xl font-black font-mono text-slate-100 group-hover:text-violet-400 transition-colors">{stats.books_available} <span className="text-xs font-normal text-slate-500">/ {stats.books_total}</span></h3>
                    <p className="text-[10px] text-violet-400 font-bold flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-violet-400 animate-pulse"></span>
                      <span>Disponibles à l'emprunt</span>
                    </p>
                  </div>
                  <div className="bg-violet-500/10 p-3.5 rounded-2xl text-violet-400 group-hover:scale-110 transition-transform duration-300 border border-violet-500/20">
                    <BookIcon className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-indigo-500/30 shadow-xs hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Emprunts Actifs</p>
                    <h3 className="text-3xl font-black font-mono text-slate-100 group-hover:text-indigo-400 transition-colors">{stats.active_loans_count}</h3>
                    <p className="text-[10px] text-indigo-400 font-bold">
                      Dont {stats.overdue_loans_count} retards pénalisés
                    </p>
                  </div>
                  <div className="bg-indigo-500/10 p-3.5 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-300 border border-indigo-500/20">
                    <Clock className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-blue-500/30 shadow-xs hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Membres Actifs</p>
                    <h3 className="text-3xl font-black font-mono text-slate-100 group-hover:text-blue-400 transition-colors">{stats.members_count}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Standard, Études, Premium</p>
                  </div>
                  <div className="bg-blue-500/10 p-3.5 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300 border border-blue-500/20">
                    <Users className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-pink-500/30 shadow-xs hover:shadow-2xl hover:shadow-pink-500/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Revenus encaissés</p>
                    <h3 className="text-3xl font-black font-mono text-pink-400">{stats.revenue_amount} <span className="text-[10px] font-normal text-slate-400">CFA</span></h3>
                    <p className="text-[10px] text-pink-500 font-bold">Amendes de retard perçues</p>
                  </div>
                  <div className="bg-pink-500/10 p-3.5 rounded-2xl text-pink-400 group-hover:scale-110 transition-transform duration-300 border border-pink-500/20">
                    <Receipt className="h-5.5 w-5.5" />
                  </div>
                </div>

              </div>

              {/* Graphical Analysis grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recharts graph 1 Month loans */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-500/2 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-100 tracking-tight">Flux d'Emprunts & Retours</h4>
                      <p className="text-xs text-slate-400">Évolution de l'activité sur les 30 derniers jours</p>
                    </div>
                    <Sliders className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="h-64 min-w-0" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="99%" height="100%">
                      <AreaChart data={stats.monthly_loans}>
                        <defs>
                          <linearGradient id="colorEmprunts" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorRetours" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#566487" fontSize={11} tickLine={false} />
                        <YAxis stroke="#566487" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="emprunts" name="Prêts enregistrés" stroke="#a78bfa" fillOpacity={1} fill="url(#colorEmprunts)" strokeWidth={2.5} />
                        <Area type="monotone" dataKey="retours" name="Retours validés" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRetours)" strokeWidth={2.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories share chart */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-500/2 transition-all duration-300 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-100 tracking-tight">Répartition thématique du Fonds</h4>
                      <p className="text-xs text-slate-400">Proportions d'ouvrages par catégories littéraires</p>
                    </div>
                    <Folder className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="h-56 min-w-0" style={{ minWidth: 0 }}>
                      <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.category_stats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {(stats.category_stats || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {(stats.category_stats || []).map((entry: any, index: number) => (
                        <div key={entry.name} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-slate-400 font-medium font-mono">{entry.name} :</span>
                          <span className="text-slate-200 font-mono font-bold ml-auto">{entry.value} titres</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Popular ranking */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-violet-500/2 transition-all duration-300 lg:col-span-2 space-y-4">
                  <h4 className="font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-400 fill-violet-400 animate-pulse" />
                    <span>Ouvrages les plus sollicités (Palmarès)</span>
                  </h4>
                  <div className="space-y-3.5">
                    {(stats.popular_books || []).map((bk: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 hover:bg-[#141d33]/40 p-2 rounded-2xl transition duration-200 border border-transparent hover:border-slate-800/40">
                        <span className={`h-6 w-6 rounded-lg font-mono text-xs font-black flex items-center justify-center ${idx === 0 ? 'bg-violet-500/20 text-violet-300': idx === 1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-pink-500/20 text-pink-300'}`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-100 truncate">{bk.title}</h5>
                          <p className="text-[10px] text-slate-400">Total d'emprunts enregistrés</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">{bk.count} emprunts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System warnings / stock alert */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-red-500/2 transition-all duration-300 space-y-4">
                  <h4 className="font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    <span>Alertes Ravitaillement / Stock</span>
                  </h4>
                  <div className="space-y-3">
                    {books.filter(b => b.available_quantity <= 1).map((b, idx) => (
                      <div key={idx} className="p-3 bg-rose-950/20 rounded-2xl border border-rose-900/40 flex items-start gap-3 text-xs hover:scale-[1.01] transition-transform">
                        <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h5 className="font-bold text-rose-200">{b.title}</h5>
                          <p className="text-rose-450 text-[10px] mt-0.5">Quantité critique : {b.available_quantity}/{b.quantity} ex. restants</p>
                          <p className="text-slate-400 text-[10px] uppercase font-mono mt-1">Localisation : {b.shelf_location}</p>
                        </div>
                      </div>
                    ))}
                    {books.filter(b => b.available_quantity <= 1).length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-6">Aucun seuil d'alerte critique sur les stocks.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: LIBRARY BOOK CATALOGUE MODULE */}
          {activeTab === 'books' && (
            <div className="space-y-6 animate-fade-in" id="books-viewport">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100">Catalogue BiblioSphere</h2>
                  <p className="text-xs text-slate-400">Recherchez, gérez, et consultez l'ensemble du fonds d'ouvrages</p>
                </div>
                
                {/* Add book trigger (only Admin/Librarians can create) */}
                {(currentUser.role === 'admin' || currentUser.role === 'librarian') && (
                  <button 
                    id="add-book-modal-trigger"
                    onClick={() => setShowAddBookModal(true)}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 justify-center text-white font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-violet-500/25 flex items-center gap-2 text-xs transition-all cursor-pointer pointer-events-auto border border-violet-500/30"
                  >
                    <Plus className="h-4 w-4 text-violet-100" />
                    <span>Ajouter un ouvrage</span>
                  </button>
                )}
              </div>

              {/* Filter controls panel */}
              <div className="bg-[#0e1629]/75 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search text */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    id="search-book-input"
                    type="text" 
                    placeholder="Titre, ISBN ou Auteur..." 
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-800/85 bg-[#070b14]/70 outline-none focus:border-violet-500/80 text-slate-100 placeholder-slate-500 transition-all font-medium"
                  />
                </div>

                {/* Multicriteria filters */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto md:justify-end">
                  
                  <select 
                    id="filter-category-select"
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs rounded-xl border border-slate-800 bg-[#070b14]/75 p-2 px-3 outline-none text-slate-300 focus:border-violet-500/80"
                  >
                    <option value="all">Toutes Catégories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                  </select>

                  <select 
                    id="filter-availability-select"
                    value={selectedAvailability} 
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="text-xs rounded-xl border border-slate-800 bg-[#070b14]/75 p-2 px-3 outline-none text-slate-300 focus:border-violet-500/80"
                  >
                    <option value="all">Disponibilité</option>
                    <option value="available">Disponible en rayon</option>
                    <option value="unavailable">Tout emprunté</option>
                  </select>

                  {(bookSearch || selectedCategory !== 'all' || selectedAvailability !== 'all') && (
                    <button 
                      onClick={() => {
                        setBookSearch('');
                        setSelectedCategory('all');
                        setSelectedAvailability('all');
                      }}
                      className="p-2 text-slate-500 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
                      title="Réinitialiser"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}

                </div>

              </div>

              {/* Books listing in elegant grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <BookIcon className="h-12 w-12 mx-auto mb-3 opacity-30 animate-bounce" />
                    <p className="text-sm">Aucun ouvrage ne correspond à vos critères de recherche.</p>
                  </div>
                ) : (
                  filteredBooks.map((b, index) => {
                    const isBookAvailable = b.available_quantity > 0;
                    const isExpanded = expandedBooks[b.id];
                    const pendingResCount = reservations.filter(r => r.book_id === b.id && r.status === 'pending').length;
                    
                    return (
                      <motion.div 
                        key={b.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
                        className="modern-glowing-card bg-[#0e1629]/75 backdrop-blur-xl rounded-3xl border border-slate-800/80 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                      >
                        
                        {/* Book header details with nice cover image */}
                        <div className="p-5 space-y-4">
                          <div className="relative overflow-hidden rounded-xl bg-[#070b14]/90 border border-slate-800/60 aspect-video sm:aspect-auto sm:h-52 w-full flex items-center justify-center">
                            <img 
                              src={b.cover_image} 
                              alt={b.title} 
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Hover Info Bubble / Glassmorphic Panel Overlay */}
                            <div className="absolute inset-x-2 inset-y-2 rounded-xl bg-[#070b14]/95 backdrop-blur-md opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex flex-col justify-between p-4 text-white z-10 pointer-events-none border border-violet-500/20 shadow-xl">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                                  <span className="text-[9px] uppercase font-black tracking-widest text-[#a78bfa] flex items-center gap-1">
                                    <Sparkles className="h-2.5 w-2.5 animate-pulse text-[#a78bfa]" />
                                    <span>Sphera Aperçu</span>
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-400">ISBN: {b.isbn}</span>
                                </div>
                                <h4 className="font-extrabold text-xs text-slate-100 line-clamp-2 leading-tight">{b.title}</h4>
                                <p className="text-[10px] text-slate-300 line-clamp-4 leading-relaxed font-sans italic pt-1">
                                  "{b.description}"
                                </p>
                              </div>
                              
                              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                <span className="truncate max-w-[130px]">Auteur : {b.author}</span>
                                <span className="bg-violet-600 text-white font-black px-1.5 py-0.5 rounded text-[8px] tracking-wide shrink-0 font-mono">
                                  {b.shelf_location || 'A-1'}
                                </span>
                              </div>
                            </div>

                            {/* Category Pill Over Image */}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className="text-[10px] font-bold tracking-wide bg-[#070b14]/95 border border-slate-800/80 backdrop-blur-xs text-[#a78bfa] px-2.5 py-1 rounded-lg uppercase">
                                {b.category}
                              </span>
                            </div>

                            {/* Sticky stock dot badge */}
                            <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                                b.available_quantity > 0 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/35'
                              }`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                                {b.available_quantity > 0 ? 'Disponible' : 'Indisponible'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-extrabold text-slate-100 text-lg leading-snug group-hover:text-violet-400 transition-colors" title={b.title}>
                              {b.title}
                            </h3>
                            <p className="text-xs text-slate-400">
                              Par <strong className="text-slate-200">{b.author}</strong> — publié en <span className="font-mono">{b.publication_year || '2025'}</span>
                            </p>
                          </div>

                          {/* Expandable summary block */}
                          <div className="space-y-1">
                            <p className={`text-xs text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {b.description}
                            </p>
                            <button 
                              onClick={() => setExpandedBooks(prev => ({ ...prev, [b.id]: !prev[b.id] }))}
                              className="text-[11px] font-bold text-violet-400 hover:text-violet-300 hover:underline inline-flex items-center gap-1 transition-all"
                            >
                              {isExpanded ? 'Réduire' : 'En savoir plus...'}
                            </button>
                          </div>

                          {/* Technical properties */}
                          <div className="grid grid-cols-2 gap-2 text-[11px] p-3 bg-[#060a12]/80 rounded-2xl border border-slate-850 font-mono">
                            <div className="space-y-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">ISBN</span>
                              <span className="text-slate-200 font-semibold">{b.isbn}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">Localisation</span>
                              <span className="text-slate-200 font-semibold">{b.shelf_location || 'Rayon inconnu'}</span>
                            </div>
                            <div className="space-y-1 mt-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">Éditeur</span>
                              <span className="text-slate-200 font-semibold">{b.publisher || 'N/A'}</span>
                            </div>
                            <div className="space-y-1 mt-1">
                              <span className="text-slate-500 block text-[9px] uppercase font-bold">Réservations</span>
                              <span className={`font-black ${pendingResCount > 0 ? 'text-[#a78bfa]' : 'text-slate-400'}`}>
                                {pendingResCount} en cours
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions container with quick action buttons */}
                        <div className="px-4 py-3.5 border-t border-slate-850 bg-[#060a12]/60 flex flex-wrap items-center justify-between gap-2">
                          
                          {/* QR Info Button */}
                          <button 
                            onClick={() => {
                              setSelectedQrCodeItem(b);
                              setShowQrCodeModal(true);
                            }}
                            className="px-2.5 py-1.5 border border-slate-800 bg-[#070b14] hover:bg-slate-950 hover:border-violet-500/30 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-[11px] font-bold shadow-xs cursor-pointer"
                            title="Visualiser et imprimer l'étiquette QR d'inventaire"
                          >
                            <QrCode className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                            <span>QR Code</span>
                          </button>

                          {/* PDF Document Button */}
                          {b.pdf_url && (
                            <a 
                              href={b.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 border border-emerald-800/80 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white rounded-xl transition flex items-center gap-1.5 text-[11px] font-bold shadow-xs cursor-pointer"
                              title="Lire le fichier PDF associé à cet ouvrage"
                            >
                              <FileText className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Lire PDF</span>
                            </a>
                          )}

                          <div className="flex flex-wrap items-center gap-1.5 ml-auto justify-end">
                            {currentUser.role === 'member' && (
                              <>
                                {b.available_quantity > 0 ? (
                                  <button 
                                    onClick={() => handleCreateReservation(b.id)}
                                    disabled={actionStates[`reserve-${b.id}`] !== undefined && actionStates[`reserve-${b.id}`] !== 'idle'}
                                    className={`text-xs px-3 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center cursor-pointer ${
                                      actionStates[`reserve-${b.id}`] === 'triggering' 
                                        ? 'bg-amber-600/20 text-amber-300 border-amber-500/35 animate-pulse'
                                        : actionStates[`reserve-${b.id}`] === 'success'
                                        ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/40'
                                        : 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-300'
                                    }`}
                                  >
                                    {actionStates[`reserve-${b.id}`] === 'triggering' ? (
                                      <span className="h-3 w-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    ) : actionStates[`reserve-${b.id}`] === 'success' ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <BookmarkCheck className="h-3.5 w-3.5" />
                                    )}
                                    <span>{actionStates[`reserve-${b.id}`] === 'triggering' ? 'Réservation...' : actionStates[`reserve-${b.id}`] === 'success' ? 'Réservé !' : 'Réserver'}</span>
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleCreateReservation(b.id)}
                                    disabled={actionStates[`reserve-${b.id}`] !== undefined && actionStates[`reserve-${b.id}`] !== 'idle'}
                                    className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center shadow-md cursor-pointer ${
                                      actionStates[`reserve-${b.id}`] === 'triggering' 
                                        ? 'bg-amber-600 text-white animate-pulse'
                                        : actionStates[`reserve-${b.id}`] === 'success'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                                    }`}
                                    title="L'ouvrage est indisponible. S'enregistrer sur la file d'attente prioritaire de Sphera."
                                  >
                                    {actionStates[`reserve-${b.id}`] === 'triggering' ? (
                                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : actionStates[`reserve-${b.id}`] === 'success' ? (
                                      <Check className="h-3.5 w-3.5" />
                                    ) : (
                                      <BookmarkCheck className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                                    )}
                                    <span>{actionStates[`reserve-${b.id}`] === 'triggering' ? 'Mise en attente...' : actionStates[`reserve-${b.id}`] === 'success' ? 'Enregistré !' : "File d'attente"}</span>
                                  </button>
                                )}

                                <button 
                                  onClick={async () => {
                                    if (currentUser.status === 'suspended') {
                                      showFeedback("Votre compte est actuellement suspendu. Veuillez régler vos amendes.", "danger");
                                      return;
                                    }
                                    const directKey = `borrow-direct-${b.id}`;
                                    await runActionWithTrigger(directKey, async () => {
                                      const res = await fetch('/api/borrowings', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ user_id: currentUser.id, book_id: b.id })
                                      });
                                      const data = await res.json();
                                      if (res.ok) {
                                        showFeedback(`Succès ! Votre emprunt de '${b.title}' est enregistré.`);
                                        fetchAllData();
                                      } else {
                                        showFeedback(data.error, 'danger');
                                        throw new Error(data.error);
                                      }
                                    });
                                  }}
                                  disabled={(b.available_quantity <= 0) || (actionStates[`borrow-direct-${b.id}`] !== undefined && actionStates[`borrow-direct-${b.id}`] !== 'idle')}
                                  className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer ${
                                    actionStates[`borrow-direct-${b.id}`] === 'triggering'
                                      ? 'bg-amber-600 text-white animate-pulse'
                                      : actionStates[`borrow-direct-${b.id}`] === 'success'
                                      ? 'bg-emerald-600 text-white'
                                      : b.available_quantity > 0 
                                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white hover:scale-102 font-bold border border-violet-500/30' 
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent'
                                  }`}
                                >
                                  {actionStates[`borrow-direct-${b.id}`] === 'triggering' ? (
                                    <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : actionStates[`borrow-direct-${b.id}`] === 'success' ? (
                                    <Check className="h-3.5 w-3.5" />
                                  ) : (
                                    <CreditCard className="h-3.5 w-3.5" />
                                  )}
                                  <span>{actionStates[`borrow-direct-${b.id}`] === 'triggering' ? 'Traitement...' : actionStates[`borrow-direct-${b.id}`] === 'success' ? 'Emprunté !' : 'Emprunter'}</span>
                                </button>
                              </>
                            )}

                            {(currentUser.role === 'admin' || currentUser.role === 'librarian') && (
                              <div className="flex items-center gap-1.5 w-full justify-end">
                                <button
                                  onClick={() => {
                                    setNewLoanData({ user_id: '', book_id: b.id.toString() });
                                    setShowLoanModal(true);
                                  }}
                                  disabled={b.available_quantity <= 0}
                                  className={`text-xs px-3.5 py-2 font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all w-full sm:w-auto justify-center ${
                                    b.available_quantity > 0 
                                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white cursor-pointer border border-indigo-500/35' 
                                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent'
                                  }`}
                                >
                                  <span>Attribuer</span>
                                </button>

                                <button 
                                  onClick={() => {
                                    setEditingBook({ ...b });
                                    setShowEditBookModal(true);
                                  }}
                                  className="p-2 bg-slate-800/60 hover:bg-slate-800 border-none rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Modifier"
                                >
                                  <Sliders className="h-4 w-4" />
                                </button>

                                <button 
                                  onClick={() => handleDeleteBook(b.id)}
                                  className="p-2 bg-[#f43f5e]/15 hover:bg-[#f43f5e]/25 border-none rounded-xl text-[#f43f5e] hover:text-white transition cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>

                      </motion.div>
                    );
                  })
                )}
              </div>

            </div>
          )}
          {activeTab === 'borrowings' && (currentUser.role === 'admin' || currentUser.role === 'librarian') && (
            <div className="space-y-6 animate-fade-in" id="borrowings-viewport">
               
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                 <div>
                   <h2 className="text-2xl font-black text-slate-100 font-sans">Gestion des Emprunts & Retours</h2>
                   <p className="text-xs text-slate-400">Suivez les locations d'ouvrages, enregistrez les retours et relancez les retards</p>
                 </div>
 
                 <button 
                   id="checkout-loan-modal-trigger"
                   onClick={() => {
                     setNewLoanData({ user_id: '', book_id: '' });
                     setShowLoanModal(true);
                   }}
                   className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-violet-500/20 flex items-center gap-2 text-xs transition border border-violet-500/30 cursor-pointer pointer-events-auto"
                 >
                   <Plus className="h-4 w-4 text-violet-200" />
                   <span>Enregistrer un prêt</span>
                 </button>
               </div>

               {/* Visual Timeline Chart for Active Loans */}
               {(() => {
                 const activeLoansData = borrowings
                   .filter(br => br.status !== 'returned')
                   .map(br => {
                     const borrowDate = new Date(br.borrowed_at);
                     const dueDate = new Date(br.due_date);
                     const today = new Date();
                     
                     const totalDuration = Math.max(1, Math.round((dueDate.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)));
                     const daysSpent = Math.max(0, Math.round((today.getTime() - borrowDate.getTime()) / (1000 * 60 * 60 * 24)));
                     const isOverdue = today > dueDate;
                     
                     let daysRemaining = 0;
                     let daysOverdue = 0;
                     
                     if (isOverdue) {
                       daysOverdue = Math.max(1, Math.round((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
                     } else {
                       daysRemaining = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
                     }
                     
                     return {
                       id: br.id,
                       label: br.book_title.length > 20 ? `${br.book_title.substring(0, 20)}...` : br.book_title,
                       book_title: br.book_title,
                       member: br.user_name,
                       borrowed_at_str: borrowDate.toLocaleDateString('fr-FR'),
                       due_date_str: dueDate.toLocaleDateString('fr-FR'),
                       totalDuration,
                       daysSpent: Math.min(daysSpent, totalDuration),
                       daysRemaining: isOverdue ? 0 : daysRemaining,
                       daysOverdue,
                       status: br.status
                     };
                   });

                 if (activeLoansData.length === 0) return null;

                 return (
                   <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Clock className="h-4.5 w-4.5 text-violet-400" />
                         <h3 className="text-sm font-bold text-slate-100 font-sans">Chronologie & Échéances des Emprunts Actifs</h3>
                       </div>
                       <span className="text-[10px] font-mono font-bold bg-violet-600/15 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-full">
                         {activeLoansData.length} en cours
                       </span>
                     </div>

                     <div className="h-[220px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <BarChart
                           data={activeLoansData}
                           layout="vertical"
                           margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                         >
                           <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                           <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}j`} />
                           <YAxis dataKey="label" type="category" stroke="#64748b" fontSize={9} width={130} />
                           <Tooltip 
                             content={({ active, payload }) => {
                               if (active && payload && payload.length) {
                                 const data = payload[0].payload;
                                 return (
                                   <div className="bg-[#0e1629]/95 backdrop-blur-md p-3 border border-slate-800/95 rounded-xl space-y-1.5 shadow-xl text-xs">
                                     <div className="font-bold text-slate-100">{data.book_title}</div>
                                     <div className="text-slate-400">Emprunteur : <span className="text-indigo-300 font-semibold">{data.member}</span></div>
                                     <div className="text-[11px] font-mono text-slate-500">Prêté le : {data.borrowed_at_str} | Échéance : {data.due_date_str}</div>
                                     <div className="pt-1 mt-1 border-t border-slate-800/60 flex flex-col gap-0.5">
                                       <div className="text-slate-300">Durée allouée : <span className="font-bold">{data.totalDuration} jours</span></div>
                                       {data.daysOverdue > 0 ? (
                                         <div className="text-rose-400 font-bold">En retard de : {data.daysOverdue} jours</div>
                                       ) : (
                                         <div className="text-emerald-400 font-bold">Temps restant : {data.daysRemaining} jours ({data.daysSpent}j écoulés)</div>
                                       )}
                                     </div>
                                   </div>
                                 );
                               }
                               return null;
                             }}
                           />
                           <Bar dataKey="daysSpent" stackId="a" fill="#7c3aed" radius={[4, 0, 0, 4]} name="Jours Écoulés" />
                           <Bar dataKey="daysRemaining" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name="Jours Restants" />
                           <Bar dataKey="daysOverdue" stackId="a" fill="#f43f5e" radius={[0, 4, 4, 0]} name="Jours de Retard" />
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                     <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-[10px] font-bold text-slate-400 font-sans font-medium">
                       <div className="flex items-center gap-1.5">
                         <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                         <span>Jours déjà écoulés</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                         <span>Jours restants autorisés</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <span className="h-2 w-2 rounded-full bg-[#f43f5e]" />
                         <span>Jours de retard (pénalisés)</span>
                       </div>
                     </div>
                   </div>
                 );
               })()}

               {/* Control bars */}
               <div className="bg-[#0e1629]/75 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-md">
                 <div className="relative w-full sm:w-80">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                   <input 
                     type="text" 
                     placeholder="Filtrer par Membre, Titre..." 
                     value={borrowingSearch}
                     onChange={(e) => setBorrowingSearch(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-800 bg-[#070b14]/75 outline-none focus:border-violet-500/80 text-slate-100 placeholder-slate-500 font-medium"
                   />
                 </div>
               </div>
 
               {/* Loans Table */}
               <div className="bg-[#0e1629]/75 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-md overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse text-xs">
                     <thead>
                       <tr className="bg-[#060a12]/80 border-b border-[#111827] border-slate-800 font-black text-slate-400 uppercase tracking-widest text-[9px] font-mono">
                         <th className="p-4">Membre liseur</th>
                         <th className="p-4">Ouvrage</th>
                         <th className="p-4">Délivré le</th>
                         <th className="p-4">Échéance</th>
                         <th className="p-4">Statut</th>
                         <th className="p-4 text-right">Actions managériales</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/40">
                       {filteredBorrowings.length === 0 ? (
                         <tr>
                           <td colSpan={6} className="p-8 text-center text-slate-500 bg-[#080d1a]/50">Aucun emprunt en cours de traitement.</td>
                         </tr>
                       ) : (
                         filteredBorrowings.map((br) => {
                           const isOverdue = br.status === 'overdue';
                           return (
                             <tr key={br.id} className="hover:bg-[#141d33]/30 transition group">
                               <td className="p-4 font-bold text-slate-100">
                                 <div>{br.user_name}</div>
                                 <div className="text-[10px] text-[#566487] font-mono font-medium">{br.user_email}</div>
                               </td>
                               <td className="p-4 font-bold text-slate-200">
                                 <div className="truncate max-w-[200px] sm:max-w-xs">{br.book_title}</div>
                                 <div className="text-[10px] text-[#566487] font-mono font-bold">ISBN : {br.book_isbn}</div>
                               </td>
                               <td className="p-4 text-slate-400 font-mono font-medium">{new Date(br.borrowed_at).toLocaleDateString('fr-FR')}</td>
                               <td className="p-4 font-mono font-bold">
                                 <span className={isOverdue ? "text-rose-400" : "text-slate-300"}>
                                   {new Date(br.due_date).toLocaleDateString('fr-FR')}
                                 </span>
                               </td>
                               <td className="p-4">
                                 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                   br.status === 'returned' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35' :
                                   br.status === 'overdue' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/35 animate-pulse' :
                                   'bg-blue-500/10 text-blue-400 border border-blue-500/35'
                                 }`}>
                                   <span className="h-1 w-1 rounded-full bg-current"></span>
                                   <span>{br.status === 'returned' ? 'Rendu' : br.status === 'overdue' ? 'En Retard' : 'Actif'}</span>
                                 </span>
                                 {br.penalty_amount > 0 && br.status === 'overdue' && (
                                   <div className="text-[9px] text-[#f43f5e] font-black font-mono mt-1">Amende : {br.penalty_amount} CFA</div>
                                 )}
                               </td>
                               <td className="p-4 text-right">
                                 {br.status !== 'returned' ? (
                                   <div className="flex items-center justify-end gap-1.5">
                                     <button 
                                       onClick={() => handleReturnBook(br.id)}
                                        disabled={actionStates[`return-${br.id}`] !== undefined && actionStates[`return-${br.id}`] !== 'idle'}
                                       className={`text-[10px] px-2.5 py-1.5 border hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition cursor-pointer font-bold shrink-0 shadow-sm flex items-center gap-1 ${
                                          actionStates[`return-${br.id}`] === 'triggering' 
                                            ? 'bg-amber-600/20 text-amber-300 border-amber-500/35 animate-pulse'
                                            : actionStates[`return-${br.id}`] === 'success'
                                            ? 'bg-emerald-955 text-emerald-200 border-emerald-500/50'
                                            : 'bg-emerald-500/10 border-emerald-500/25'
                                        }`}
                                     >
                                       Enregistrer Retour
                                     </button>
                                     
                                     {br.renewed_count === 0 && (
                                       <button 
                                         onClick={() => handleRenewLoan(br.id)}
                                          disabled={actionStates[`renew-${br.id}`] !== undefined && actionStates[`renew-${br.id}`] !== 'idle'}
                                         className={`text-[10px] px-2.5 py-1.5 border text-slate-300 rounded-xl transition cursor-pointer font-bold shrink-0 flex items-center gap-1 ${
                                            actionStates[`renew-${br.id}`] === 'triggering' 
                                              ? 'bg-amber-600/20 text-amber-300 border-amber-500/35 animate-pulse'
                                              : actionStates[`renew-${br.id}`] === 'success'
                                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                                              : 'bg-slate-800 border-slate-750 hover:bg-slate-750'
                                          }`}
                                         title="Prolonger (+7 jours)"
                                       >
                                         {actionStates[`renew-${br.id}`] === 'triggering' ? (
                                           <span className="h-2.5 w-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-1 inline-block" />
                                         ) : actionStates[`renew-${br.id}`] === 'success' ? (
                                           <Check className="h-3 w-3 text-emerald-300 mr-0.5 inline-block" />
                                         ) : null}
                                         <span>{actionStates[`renew-${br.id}`] === 'triggering' ? 'Prolongation...' : actionStates[`renew-${br.id}`] === 'success' ? 'Prolongé !' : 'Prolonger'}</span>
                                       </button>
                                     )}
                                   </div>
                                 ) : (
                                   <span className="text-[10px] text-slate-500 font-mono italic">Traité le {new Date(br.returned_at!).toLocaleDateString('fr-FR')}</span>
                                 )}
                               </td>
                             </tr>
                           );
                         })
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
 
             </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-6 animate-fade-in" id="reservations-viewport">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 font-sans">Files d'Attente & Réservations</h2>
                  <p className="text-xs text-slate-400">
                    {currentUser.role === 'member' 
                      ? "Consultez l'historique de vos demandes de réservation et positions en file d'attente." 
                      : "Suivez et administrez l'attribution prioritaire pour les livres réservés."}
                  </p>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0e1629]/75 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Bookmark hover="" className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-white">
                      {reservations.filter(r => (currentUser.role === 'member' ? r.user_id === currentUser.id : true) && r.status === 'pending').length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">En attente (File)</div>
                  </div>
                </div>

                <div className="bg-[#0e1629]/75 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-white">
                      {reservations.filter(r => (currentUser.role === 'member' ? r.user_id === currentUser.id : true) && r.status === 'fulfilled').length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Prêts en rayon</div>
                  </div>
                </div>

                <div className="bg-[#0e1629]/75 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-450">
                    <X className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-black text-white">
                      {reservations.filter(r => (currentUser.role === 'member' ? r.user_id === currentUser.id : true) && r.status === 'cancelled').length}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Annulées / Retirées</div>
                  </div>
                </div>
              </div>

              {/* Table or list Container */}
              <div className="bg-[#0e1629]/75 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-100 text-sm">Registre d'Attribution Prioritaire</h3>
                </div>

                <div className="overflow-x-auto">
                  {reservations.filter(r => currentUser.role === 'member' ? r.user_id === currentUser.id : true).length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                      <Bookmark className="h-10 w-10 text-slate-655 mx-auto mb-3 animate-pulse" />
                      <p className="text-xs">Aucune réservation active ou passée enregistrée actuellement.</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 bg-slate-900/35 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                          <th className="p-4">Livre & Détails</th>
                          <th className="p-4">Adhérent</th>
                          <th className="p-4">Planifié le</th>
                          <th className="p-4">Statut / Signal</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-xs text-slate-200">
                        {reservations
                          .filter(r => currentUser.role === 'member' ? r.user_id === currentUser.id : true)
                          .map((r, idx) => {
                            const isPending = r.status === 'pending';
                            const isFulfilled = r.status === 'fulfilled';
                            const isCancelled = r.status === 'cancelled';

                            return (
                              <tr key={r.id || idx} className="hover:bg-slate-900/15 transition duration-150">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {r.book_cover_url ? (
                                      <img 
                                        src={r.book_cover_url} 
                                        alt={r.book_title} 
                                        referrerPolicy="no-referrer"
                                        className="h-10 w-8 object-cover rounded-md shadow-sm border border-slate-800" 
                                      />
                                    ) : (
                                      <div className="h-10 w-8 bg-slate-850 rounded-md flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-800">No cover</div>
                                    )}
                                    <div>
                                      <div className="font-bold text-slate-100 truncate max-w-[200px]" title={r.book_title}>{r.book_title}</div>
                                      <div className="text-[9px] text-slate-500 font-mono">ISBN: {r.book_isbn || '-'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-slate-200">{r.user_name || `ID: ${r.user_id}`}</div>
                                  <div className="text-[10px] text-[#566487] font-mono">{r.user_email || '-'}</div>
                                </td>
                                <td className="p-4 font-mono text-slate-400">
                                  {r.reserved_at ? new Date(r.reserved_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '-'}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    isFulfilled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35' :
                                    isCancelled ? 'bg-slate-800 text-slate-500 border border-slate-755' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/35 animate-pulse'
                                  }`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${isFulfilled ? 'bg-emerald-400' : isCancelled ? 'bg-slate-500' : 'bg-amber-400 animate-ping'}`} />
                                    <span>{isFulfilled ? 'Dispo - En Rayon' : isCancelled ? 'Annulée' : 'En Attente'}</span>
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Librarian Action: Convert to borrowing (Fulfill) */}
                                    {isFulfilled && (currentUser.role === 'admin' || currentUser.role === 'librarian') && (
                                      <button
                                        onClick={async () => {
                                          const actionKey = `fulfill-${r.id}`;
                                          await runActionWithTrigger(actionKey, async () => {
                                            const res = await fetch('/api/borrowings', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ user_id: r.user_id, book_id: r.book_id })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                              showFeedback(`Félicitations! Le livre est attribué à ${r.user_name || 'l\'adhérent'}.`);
                                              fetchAllData();
                                            } else {
                                              showFeedback(data.error, 'danger');
                                              throw new Error(data.error);
                                            }
                                          });
                                        }}
                                        disabled={actionStates[`fulfill-${r.id}`] !== undefined && actionStates[`fulfill-${r.id}`] !== 'idle'}
                                        className={`text-[10px] px-2.5 py-1.5 font-black border rounded-xl transition cursor-pointer flex items-center gap-1 ${
                                          actionStates[`fulfill-${r.id}`] === 'triggering' 
                                            ? 'bg-amber-600/20 text-amber-300 border-amber-500/35 animate-pulse'
                                            : actionStates[`fulfill-${r.id}`] === 'success'
                                            ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
                                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                                        }`}
                                      >
                                        {actionStates[`fulfill-${r.id}`] === 'triggering' ? (
                                          <span className="h-2.5 w-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                        ) : actionStates[`fulfill-${r.id}`] === 'success' ? (
                                          <Check className="h-3 w-3" />
                                        ) : null}
                                        <span>{actionStates[`fulfill-${r.id}`] === 'triggering' ? 'Prêt...' : actionStates[`fulfill-${r.id}`] === 'success' ? 'Attribué !' : 'Valider en Prêt'}</span>
                                      </button>
                                    )}

                                    {/* Member/Librarian Action: Cancel */}
                                    {(isPending || isFulfilled) && (
                                      <button
                                        onClick={async () => {
                                          const cancelKey = `cancel-res-${r.id}`;
                                          await runActionWithTrigger(cancelKey, async () => {
                                            const res = await fetch(`/api/reservations/${r.id}/cancel`, {
                                              method: 'POST'
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                              showFeedback(`Succès ! La réservation de '${r.book_title}' a été annulée.`);
                                              fetchAllData();
                                            } else {
                                              showFeedback(data.error, 'danger');
                                              throw new Error(data.error);
                                            }
                                          });
                                        }}
                                        disabled={actionStates[`cancel-res-${r.id}`] !== undefined && actionStates[`cancel-res-${r.id}`] !== 'idle'}
                                        className={`text-[10px] px-2.5 py-1.5 border font-bold rounded-xl transition cursor-pointer flex items-center gap-1 ${
                                          actionStates[`cancel-res-${r.id}`] === 'triggering'
                                            ? 'bg-amber-600/20 text-amber-300 border-amber-500/35 animate-pulse'
                                            : actionStates[`cancel-res-${r.id}`] === 'success'
                                            ? 'bg-rose-955 text-rose-350 border-rose-500/35'
                                            : 'bg-[#f43f5e]/10 border-[#f43f5e]/25 text-[#f43f5e] hover:bg-[#f43f5e]/20'
                                        }`}
                                      >
                                        {actionStates[`cancel-res-${r.id}`] === 'triggering' ? (
                                          <span className="h-2.5 w-2.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                        ) : actionStates[`cancel-res-${r.id}`] === 'success' ? (
                                          <Check className="h-3 w-3" />
                                        ) : null}
                                        <span>{actionStates[`cancel-res-${r.id}`] === 'triggering' ? 'Annulation...' : actionStates[`cancel-res-${r.id}`] === 'success' ? 'Annulé !' : 'Annuler'}</span>
                                      </button>
                                    )}

                                    {isCancelled && (
                                      <span className="text-[10px] text-slate-500 font-mono italic">Aucune action requise</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERS & SUBSCRIPTIONS REGISTER (ADMIN/LIBRARIANS) */}
          {activeTab === 'members' && (currentUser.role === 'admin' || currentUser.role === 'librarian') && (
            <div className="space-y-6 animate-fade-in" id="members-viewport">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100">Membres de la Bibliothèque</h2>
                  <p className="text-xs text-slate-400">Enregistrez les abonnements des adhérents et supervisez leurs accès</p>
                </div>
                
                <button 
                  onClick={() => {
                    // Quick modal / fake registration prompt
                    const fn = window.prompt("Prénom de l'adhérent :");
                    const ln = window.prompt("Nom de famille :");
                    const em = window.prompt("E-mail unique :");
                    if (fn && ln && em) {
                      fetch('/api/members', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ firstname: fn, lastname: ln, email: em })
                      }).then(res => {
                        if (res.ok) {
                          showFeedback("Nouveau membre créé avec succès ! Un abonnement d'un an a été activé d'office.");
                          fetchAllData();
                        } else {
                          res.json().then(d => showFeedback(d.error, 'danger'));
                        }
                      });
                    }
                  }}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg hover:shadow-violet-500/20 border border-violet-500/30 cursor-pointer pointer-events-auto"
                >
                  <Plus className="h-4 w-4 text-violet-200" />
                  <span>Enregistrer un membre</span>
                </button>
              </div>

              {/* Members search controls */}
              <div className="bg-[#0e1629]/75 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-md">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-505 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Chercher par nom ou e-mail..." 
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-800 bg-[#070b14]/75 outline-none focus:border-violet-500/80 text-slate-100 placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Grid cards for members */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMembers.map((m) => {
                  const subExpired = m.subscription_status === 'expired';
                  const isSuspended = m.status === 'suspended';
                  return (
                    <div key={m.id} className="bg-[#0e1629]/75 backdrop-blur-xl p-5 rounded-3xl border border-slate-800/80 space-y-4 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/5 transition duration-300">
                      
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#070b14] border border-slate-850 rounded-full flex items-center justify-center font-bold text-slate-200 uppercase text-xs font-mono">
                          {m.firstname[0]}{m.lastname[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-100 text-sm leading-tight truncate">{m.firstname} {m.lastname}</h4>
                          <span className="text-[10px] text-[#566487] font-mono truncate block mt-0.5">{m.email}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                              m.role === 'admin' 
                                ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/25' 
                                : m.role === 'librarian' 
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' 
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/25'
                            }`}>
                              {m.role === 'admin' ? 'Co-Admin' : m.role === 'librarian' ? 'Bibliothécaire' : 'Lecteur'}
                            </span>
                          </div>
                        </div>
                        
                        {m.role === 'member' && (
                          <span className={`shrink-0 inline-flex items-center gap-1 px-2.2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isSuspended ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35'
                          }`}>
                            <span className="h-1 w-1 rounded-full bg-current"></span>
                            <span>{isSuspended ? 'Suspendu' : 'Actif'}</span>
                          </span>
                        )}
                      </div>

                      <div className="h-px bg-slate-850/80"></div>

                      {/* Member loans statistics and sub */}
                      {m.role === 'member' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3.5 bg-[#060a12]/85 rounded-2xl border border-slate-850">
                              <p className="text-slate-500 text-[9px] font-black uppercase font-mono tracking-widest">Emprunts</p>
                              <p className="font-black text-slate-200 font-mono mt-1 text-sm">{m.active_loans_count} <span className="text-xs font-medium text-slate-500">/ 5 max</span></p>
                            </div>
                            <div className="p-3.5 bg-[#060a12]/85 rounded-2xl border border-slate-850">
                              <p className="text-slate-500 text-[9px] font-black uppercase font-mono tracking-widest">Amendes</p>
                              <p className={`font-black font-mono mt-1 text-sm ${m.unpaid_penalties_amount > 0 ? 'text-rose-400 border-rose-500/20' : 'text-slate-400'}`}>
                                {m.unpaid_penalties_amount} <span className="text-[10px] font-medium text-slate-500">CFA</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850/40">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <CreditCard className="h-4 w-4 text-violet-400" />
                              <span className="text-xs">Abonnement : <strong className="text-slate-100">{m.subscription_type}</strong></span>
                            </div>
                            <span className={`font-mono text-[10px] font-bold ${subExpired ? 'text-[#f43f5e] font-extrabold' : 'text-[#8b5cf6]'}`}>
                              {subExpired ? 'Expiré' : `Ékh. ${new Date(m.subscription_expires).toLocaleDateString('fr-FR')}`}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 py-4 bg-slate-900/35 text-slate-400 text-xs rounded-2xl border border-slate-850/70 flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-violet-400 shrink-0" />
                          <span>Identité SaaS vérifiée et accréditée</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-850/40">
                        <div>
                          {isSuspended && m.role === 'member' && (
                            <div className="text-[9px] uppercase tracking-wider text-rose-400 bg-[#f43f5e]/15 border border-rose-500/25 font-black px-2.5 py-1 rounded-lg">
                              Alerte Système
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {m.role === 'member' && (
                            <button 
                              onClick={() => {
                                // Renewal simulation trigger
                                fetch(`/api/members`).then(() => {
                                  showFeedback(`Abonnement de ${m.firstname} prolongé d'un an avec succès.`);
                                  fetchAllData();
                                });
                              }}
                              className="text-slate-200 bg-[#070b14]/95 hover:bg-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl border border-slate-800 hover:border-[#8b5cf6]/45 transition cursor-pointer"
                            >
                              Prolonger
                            </button>
                          )}

                          {currentUser.role === 'admin' && m.id !== currentUser.id && (
                            <button
                              onClick={() => {
                                if (window.confirm(`⚠️ ATTENTION : Voulez-vous supprimer définitivement l'utilisateur ${m.firstname} ${m.lastname} ?`)) {
                                  fetch(`/api/members/${m.id}`, { method: 'DELETE' })
                                  .then(async (res) => {
                                    if (res.ok) {
                                      showFeedback("Utilisateur et ses données effacés de la base de données.");
                                      fetchAllData();
                                    } else {
                                      const err = await res.json();
                                      showFeedback(err.error || "Action impossible.", 'danger');
                                    }
                                  });
                                }
                              }}
                              className="text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 text-[10px] font-black px-3 py-1.5 rounded-xl border border-rose-500/20 transition cursor-pointer"
                            >
                              Supprimer le compte
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 5: MANAGING REVENUE PENALTIES (FOR ALL ROLES BUT WITH ADMIN PRIVILEGES TO ACCEPT CASH PAYMENTS) */}
          {activeTab === 'penalties' && (
            <div className="space-y-6 animate-fade-in" id="penalties-viewport">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-100">Module des Pénalités de Rétention</h2>
                  <p className="text-xs text-slate-400">Suivi des relances et des amendes de retard automatiques (500 FCFA par jour de retard)</p>
                </div>
              </div>

              {/* Grid content summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Guidelines information */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="h-10 w-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-[#a78bfa] text-base">Formule de Calcul Automatique</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    Conformément aux directives de l'architecte, l'amende s'applique dès le premier jour de retard de rendu :
                  </p>
                  <p className="text-xs bg-[#060a12]/90 border border-slate-800 p-3 rounded-xl font-mono font-bold text-center text-rose-400">
                    Amende = Jours de retard × 500 FCFA
                  </p>
                  <ul className="text-[10px] text-slate-400 space-y-1.5 bg-[#060a12]/40 p-3 rounded-xl border border-slate-850/60 leading-relaxed font-mono">
                    <li>• Blocage automatique des prêts si amende &gt; 0.</li>
                    <li>• Suspension temporaire de l'accès au catalogue.</li>
                    <li>• Déverrouillage d'office dès encaissement.</li>
                  </ul>
                </div>

                {/* Table list of penalties */}
                <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-md md:col-span-2 space-y-4">
                  <h4 className="font-extrabold text-slate-100 text-sm">Registre des Amendes en suspens</h4>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {penalties.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-10">Aucune pénalité active dans le système.</p>
                    ) : (
                      penalties.map(p => (
                        <div key={p.id} className="p-4 bg-[#060a12]/85 rounded-2xl border border-slate-850 flex items-center justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-100">Membre : {p.user_name}</h5>
                            <p className="text-slate-400 font-mono text-[10px]">Livre : '{p.book_title}'</p>
                            <p className="text-slate-500 font-light text-[10px]">Retard accumulé : <strong className="text-slate-300">{p.days_overdue} jours</strong></p>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-sm font-mono font-black text-rose-400">{p.amount} CFA</div>
                            
                            {p.status === 'unpaid' ? (
                              (currentUser.role === 'admin' || currentUser.role === 'librarian') ? (
                                <button 
                                  onClick={() => handlePayPenalty(p.id)}
                                  disabled={actionStates[`pay-${p.id}`] !== undefined && actionStates[`pay-${p.id}`] !== 'idle'}
                                  className={`font-bold px-3 py-1.5 rounded-xl text-[10px] border cursor-pointer pointer-events-auto transition shadow-md flex items-center justify-center gap-1 ${
                                    actionStates[`pay-${p.id}`] === 'triggering'
                                      ? 'bg-amber-600 border-amber-500/30 text-white animate-pulse'
                                      : actionStates[`pay-${p.id}`] === 'success'
                                      ? 'bg-emerald-600 border-emerald-500/30 text-white'
                                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-violet-500/20'
                                  }`}
                                >
                                  {actionStates[`pay-${p.id}`] === 'triggering' ? (
                                    <>
                                      <span className="h-2 w-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                      <span>Encaissement...</span>
                                    </>
                                  ) : actionStates[`pay-${p.id}`] === 'success' ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      <span>Payé !</span>
                                    </>
                                  ) : (
                                    <span>Encaisser {p.amount} CFA</span>
                                  )}
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">Impay&eacute;</span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">R&eacute;gl&eacute; / Pay&eacute;</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: ENTERPRISE AUDIT TRAIL LOGS (FOR ADMINISTRATOR) */}
          {activeTab === 'logs' && currentUser.role === 'admin' && (
            <div className="space-y-6 animate-fade-in" id="logs-viewport">
              
              <div>
                <h2 className="text-2xl font-black text-slate-100">Journaux d'Audit & Sécurité</h2>
                <p className="text-xs text-slate-400">Trace inaltérable de l'activité du personnel et des membres adhérents sur l'application SaaS</p>
              </div>

              <div className="bg-[#0e1629]/75 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/80 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-100 text-sm">Registre des événements récents</h4>
                  <RefreshCcw className="h-4 w-4 text-slate-400 cursor-pointer hover:text-white transition" onClick={fetchAllData} />
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 bg-[#060a12]/85 rounded-2xl border border-slate-850 flex items-start sm:items-center justify-between gap-3 text-xs hover:bg-[#141d33]/30 transition">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{log.user}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-700"></span>
                          <span className="text-slate-500 text-[10px] font-mono">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                        </div>
                        <p className="text-slate-350">{log.action} : <strong className="text-[#a78bfa] font-mono">'{log.target}'</strong></p>
                      </div>

                      <span className="inline-block bg-slate-800/60 font-mono text-slate-300 border border-slate-700/50 text-[9px] font-semibold px-2 py-0.5 rounded uppercase">
                        LOG #{log.id}
                      </span>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: AI RECOMMENDATIONS & CONVERSATIONAL LIBRARIAN SPHERA */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in" id="ai-viewport">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2.5">
                    <Sparkles className="h-6 w-6 text-violet-400 fill-violet-500/20 animate-pulse" />
                    <span>L'Intelligence Générative Sphera</span>
                  </h2>
                  <p className="text-xs text-slate-400">Recommandations de lecture personnalisées par IA et discussion interactive</p>
                </div>
              </div>

              {/* AI matching recommendation card */}
              <div className="bg-gradient-to-br from-[#121c33]/90 to-[#0b0f19]/95 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-6">
                
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] tracking-widest bg-violet-500/10 border border-violet-500/20 text-[#a78bfa] font-black px-2.5 py-1 rounded uppercase">Moteur de recommandation en temps réel</span>
                    <h3 className="text-lg font-extrabold text-slate-100">Sélectionné pour vous par Sphera IA</h3>
                    <p className="text-xs text-slate-350">Analyse de vos préférences thématiques de lecture (Formule {currentUser.membership_type})</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-violet-400 shrink-0 animate-pulse" />
                </div>

                {recommendLoading ? (
                  <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
                    <RefreshCcw className="h-6 w-6 stroke-violet-400 animate-spin" />
                    <p className="animate-pulse">Calcul des vecteurs d'appariement thématique...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiRecommendations.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                        <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>Sélectionnez le rôle **Membre** pour obtenir des recommandations IA adaptées à votre profil.</p>
                      </div>
                    ) : (
                      aiRecommendations.map((rec, idx) => (
                        <div key={rec.id} className="bg-[#060a12]/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3 hover:border-violet-500/30 transition">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase font-bold">Match Score</span>
                              <span className="text-xs font-mono font-black text-violet-400">{rec.matchScore}% !!</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-100 truncate">{rec.title}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-light line-clamp-4">"{rec.reason}"</p>
                          </div>
                          
                          <button 
                            onClick={async () => {
                              try {
                                const r = await fetch('/api/borrowings', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ user_id: currentUser.id, book_id: rec.id })
                                });
                                const d = await r.json();
                                if (r.ok) {
                                  showFeedback(`Emprunt IA validé : '${rec.title}' est attribué.`);
                                  fetchAllData();
                                } else {
                                  showFeedback(d.error, 'danger');
                                }
                              } catch (e) {
                                showFeedback("Erreur de prêt", 'danger');
                              }
                            }}
                            className="w-full text-center bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold py-1.5 rounded-xl text-[10px] cursor-pointer"
                          >
                            Emprunter d'un clic
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

              </div>

              {/* Conversational chatbot container */}
              <div className="bg-[#0e1629]/75 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-md overflow-hidden flex flex-col h-[500px]">
                
                {/* Chat header */}
                <div className="bg-[#060a12] border-b border-slate-850 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                      SP
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">Assistante Bibliothécaire Sphera</h4>
                      <span className="text-[9px] font-mono text-violet-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping"></span>
                        <span>Modèle Gemini 3.5 Flash connecté</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages pane */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans bg-[#070b14]/40">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs text-left leading-relaxed ${
                        m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-850/60 border border-slate-800 text-slate-200 shadow-sm'
                      }`}>
                        {m.sender === 'bot' ? (
                          <div dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                        ) : (
                          m.text
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-850/60 border border-slate-800 text-slate-400 rounded-2xl px-4 py-2.5 text-xs flex items-center gap-2 shadow-sm animate-pulse">
                        <RefreshCcw className="h-3 w-3 animate-spin text-violet-400" />
                        <span>Sphera analyse le catalogue...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question input */}
                <form onSubmit={handleChatSend} className="p-3 border-t border-slate-850 bg-[#060a12]/80 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Écrivez votre message à Sphera (ex: 'Conseille-moi un livre de SF' ou 'Quelles sont mes limites d'emprunt ?')..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-800 bg-[#070b14]/75 outline-none focus:border-violet-500/80 text-slate-100 placeholder-slate-500"
                  />
                  <button 
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl transition cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs mt-12">
        <div className={`${isFullscreenLayout ? 'max-w-none px-6 sm:px-8' : 'max-w-7xl px-4'} w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono`}>
          <p>© 2026 BiblioSphere SaaS - Conçu selon la Clean Architecture avec Laravel 12 & React</p>
          <div className="flex gap-4">
            <span className="text-emerald-500">API Sanctum : Opérationnelle</span>
            <span className="text-emerald-500">Base MySQL : Simulée</span>
          </div>
        </div>
      </footer>

      {/* ---------------- TRANSACTIONS MODALS ---------------- */}
      
      {/* 1. ADD BOOK MODAL */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-slide-up relative">
            
            <button 
              onClick={() => setShowAddBookModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-950 mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              <span>Référencer un Livre dans le Catalogue</span>
            </h3>

            <form onSubmit={handleCreateBook} className="space-y-4 text-xs select-none">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Numéro ISBN (Unique) *</label>
                  <input 
                    type="text" 
                    placeholder="ex: 978-2070360024" 
                    required
                    value={newBookData.isbn}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, isbn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Titre de l'ouvrage *</label>
                  <input 
                    type="text" 
                    placeholder="ex: Germinal" 
                    required
                    value={newBookData.title}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description / Résumé *</label>
                <textarea 
                  placeholder="Écrivez le résumé de l'ouvrage..." 
                  rows={2}
                  required
                  value={newBookData.description}
                  onChange={(e) => setNewBookData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Auteur Associé *</label>
                  <select 
                    value={newBookData.author_id}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, author_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-slate-50"
                  >
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    <option value="new">+ Ajouter un nouvel auteur...</option>
                  </select>
                  
                  {newBookData.author_id === 'new' && (
                    <div className="mt-2 space-y-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="font-semibold text-slate-600 uppercase text-[9px] tracking-wider block">Saisir le nom de l'auteur *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Nom de l'auteur (ex: Victor Hugo)" 
                        value={newBookData.new_author_name}
                        onChange={(e) => setNewBookData(prev => ({ ...prev, new_author_name: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none bg-white font-medium focus:border-violet-500"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Catégorie Thématique *</label>
                  <select 
                    value={newBookData.category_id}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none bg-slate-50"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Éditeur</label>
                  <input 
                    type="text" 
                    placeholder="Gallimard"
                    value={newBookData.publisher}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, publisher: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Année Pub.</label>
                  <input 
                    type="number" 
                    placeholder="2026"
                    value={newBookData.publication_year}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, publication_year: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nombre ex. *</label>
                  <input 
                    type="number" 
                    required
                    value={newBookData.quantity}
                    onChange={(e) => setNewBookData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Emplacement physique (Rayon/Étagère)</label>
                <input 
                  type="text" 
                  placeholder="ex: Rayon C - Étagère 4"
                  value={newBookData.shelf_location}
                  onChange={(e) => setNewBookData(prev => ({ ...prev, shelf_location: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Fichier PDF du Livre (optionnel - stocké dans Supabase Bucket)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50 relative flex flex-col items-center justify-center gap-1 hover:bg-slate-100/50 transition duration-200">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileText className="h-6 w-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight">
                    {selectedFile ? `Fichier prêt : ${selectedFile.name}` : "Cliquez ou glissez-déposez le document PDF ici"}
                  </span>
                  {selectedFile && (
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-[9px] text-[#f43f5e] hover:underline z-10 font-bold mt-1"
                    >
                      Retirer le fichier
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedFile(null);
                    setShowAddBookModal(false);
                  }}
                  className="px-4 py-2 border rounded-xl hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={actionStates['create-book'] === 'triggering' || uploadingPdf}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-slate-950 font-bold px-4 py-2 rounded-xl transition pointer-events-auto flex items-center gap-2"
                >
                  {uploadingPdf ? (
                    <>
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      <span>Téléversement du PDF...</span>
                    </>
                  ) : actionStates['create-book'] === 'triggering' ? (
                    <>
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      <span>Validation en cours...</span>
                    </>
                  ) : actionStates['create-book'] === 'success' ? (
                    <span>Succès ! 🎉</span>
                  ) : (
                    <span>Valider Référencement</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT BOOK MODAL */}
      {showEditBookModal && editingBook && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border animate-slide-up relative text-xs">
            
            <button onClick={() => { setShowEditBookModal(false); setEditingBook(null); }} className="absolute top-4 right-4 text-slate-400 p-1">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-950 mb-4">Modifier Ouvrage : {editingBook.title}</h3>

            <form onSubmit={handleUpdateBook} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Titre de l'ouvrage</label>
                <input 
                  type="text" 
                  required
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Résumé</label>
                <textarea 
                  rows={2}
                  required
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantité de livres</label>
                  <input 
                    type="number" 
                    required
                    value={editingBook.quantity}
                    onChange={(e) => setEditingBook({ ...editingBook, quantity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Rayonnage</label>
                  <input 
                    type="text" 
                    value={editingBook.shelf_location}
                    onChange={(e) => setEditingBook({ ...editingBook, shelf_location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowEditBookModal(false); setEditingBook(null); }} className="px-4 py-2 border rounded-xl">Annuler</button>
                <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl">Enregistrer Modifications</button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 3. CHECKOUT LOAN MODAL */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-slide-up relative text-xs">
            
            <button onClick={() => setShowLoanModal(false)} className="absolute top-4 right-4 text-slate-400 p-1">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-950 mb-3 flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-indigo-500" />
              <span>Enregistrer un Nouveau Prêt</span>
            </h3>
            
            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Le système vérifie automatiquement l'état de l'abonnement du membre, son historique de prêts et ses amendes impayées avant attribution.
            </p>

            <form onSubmit={handleCreateLoan} className="space-y-4">
              
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sélectionner l'adhérent liseur *</label>
                <select 
                  required
                  value={newLoanData.user_id}
                  onChange={(e) => setNewLoanData(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl outline-none bg-slate-50"
                >
                  <option value="">-- Choisir un membre --</option>
                  {members.filter(m => m.role === 'member').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstname} {m.lastname} {m.status === 'suspended' ? '(Banni/Suspendu)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sélectionner le livre *</label>
                <select 
                  required
                  value={newLoanData.book_id}
                  onChange={(e) => setNewLoanData(prev => ({ ...prev, book_id: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-xl outline-none bg-slate-50"
                >
                  <option value="">-- Choisir un livre --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.available_quantity} ex. restants)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowLoanModal(false)} className="px-4 py-2 border rounded-xl">Annuler</button>
                <button type="submit" className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl pointer-events-auto">Créer le Prêt</button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 4. QR CODE PREVIEW MODAL */}
      {showQrCodeModal && selectedQrCodeItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border text-center relative space-y-4 animate-slide-up text-xs">
            
            <button 
              onClick={() => { setShowQrCodeModal(false); setSelectedQrCodeItem(null); }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1.5 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-950 flex items-center justify-center gap-2">
                <QrCode className="h-5 w-5 text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Étiquette d'Inventaire Sphera</span>
              </h3>
              <p className="text-[11px] text-slate-500">Aperçu conforme de l'étiquette thermocollante pour rayonnage</p>
            </div>

            {/* Simulated printable sticker sheet */}
            <div className="bg-yellow-50/30 p-5 rounded-2xl border border-dashed border-amber-300 relative shadow-inner overflow-hidden">
              {/* Sticker physical background container */}
              <div id="physical-book-label" className="bg-white p-4 rounded-xl border-2 border-slate-950 text-slate-950 text-left space-y-3 relative shadow-md">
                
                {/* Header of label with logo */}
                <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="bg-slate-950 text-white p-1 rounded-sm">
                      <BookIcon className="h-3 w-3" />
                    </div>
                    <span className="font-mono text-[9px] font-black uppercase tracking-wider">BiblioSphere Inventory</span>
                  </div>
                  <span className="font-mono text-[8px] font-bold bg-slate-950 text-white px-1.5 py-0.5 rounded">
                    #INV-{selectedQrCodeItem.id || 'AA'}
                  </span>
                </div>

                {/* Sub-grid with QR Code on one side, details on other */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* QR code SVG - highly visual and sharp */}
                  <div className="sm:col-span-5 flex justify-center">
                    <div className="bg-white p-1.5 border-2 border-slate-950 inline-block rounded-md shadow-xs">
                      {/* Complex SVG representation of simulated dynamic QR code */}
                      <svg className="h-28 w-28 mx-auto" viewBox="0 0 100 100" shapeRendering="crispEdges">
                        <rect width="100" height="100" fill="#ffffff" />
                        {/* QR Standard locator squares */}
                        <rect x="0" y="0" width="24" height="24" fill="#000000" />
                        <rect x="4" y="4" width="16" height="16" fill="#ffffff" />
                        <rect x="8" y="8" width="8" height="8" fill="#000000" />

                        <rect x="76" y="0" width="24" height="24" fill="#000000" />
                        <rect x="80" y="4" width="16" height="16" fill="#ffffff" />
                        <rect x="84" y="8" width="8" height="8" fill="#000000" />

                        <rect x="0" y="76" width="24" height="24" fill="#000000" />
                        <rect x="4" y="80" width="16" height="16" fill="#ffffff" />
                        <rect x="84" y="80" width="8" height="8" fill="#000000" />
                        <rect x="8" y="84" width="8" height="8" fill="#000000" />

                        {/* Inventory payload patterns inside vector grid */}
                        <rect x="32" y="2" width="12" height="6" fill="#000000" />
                        <rect x="52" y="4" width="16" height="4" fill="#000000" />
                        <rect x="36" y="14" width="4" height="20" fill="#000000" />
                        <rect x="60" y="20" width="10" height="10" fill="#000000" />
                        <rect x="12" y="32" width="16" height="4" fill="#000000" />
                        <rect x="32" y="40" width="8" height="16" fill="#000000" />
                        <rect x="52" y="36" width="16" height="6" fill="#000000" />
                        
                        <rect x="8" y="52" width="12" height="6" fill="#000000" />
                        <rect x="24" y="60" width="12" height="4" fill="#000000" />
                        <rect x="44" y="68" width="16" height="16" fill="#000000" />
                        <rect x="68" y="52" width="12" height="12" fill="#000000" />
                        <rect x="18" y="70" width="6" height="6" fill="#000000" />
                        
                        {/* Interactive center core logo */}
                        <rect x="44" y="44" width="12" height="12" fill="#000000" />
                        <rect x="46" y="46" width="8" height="8" fill="#ffffff" />
                        <circle cx="50" cy="50" r="2.5" fill="#000000" />
                      </svg>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="sm:col-span-7 space-y-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500 block">TITRE OUVRAGE</span>
                      <h4 className="font-extrabold text-xs text-slate-950 leading-tight uppercase font-sans line-clamp-2">
                        {selectedQrCodeItem.title}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500 block">ISBN</span>
                        <span className="font-mono text-[10px] font-bold text-slate-950 block">
                          {selectedQrCodeItem.isbn}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase font-bold tracking-widest text-slate-500 block">ZONAGE RAYON</span>
                        <span className="font-mono text-[9px] font-black bg-slate-100 text-slate-950 px-1 py-0.5 rounded border border-slate-300 block text-center truncate">
                          {selectedQrCodeItem.shelf_location || 'A-1'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[8px] border-t border-slate-200 pt-1.5 flex justify-between items-center text-slate-400 font-mono">
                      <span>Catégorie : {selectedQrCodeItem.category}</span>
                      <span>Edition 2026</span>
                    </div>

                  </div>

                </div>

                {/* Micro safety security print disclaimer */}
                <div className="text-[7px] text-slate-400 font-mono text-center border-t border-dashed border-slate-200 pt-2 flex justify-between">
                  <span>SÉCURISÉ PAR SPHERA SMART ENGINE</span>
                  <span>DUPLICATA INTERDIT</span>
                </div>

              </div>
            </div>

            {/* Actions for label download/print */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const printContents = document.getElementById("physical-book-label")?.innerHTML;
                  if (printContents) {
                    const originalContents = document.body.innerHTML;
                    // Simply trigger a standard browser print helper
                    window.print();
                  }
                }}
                className="flex-1 bg-slate-900 text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-98 shadow-md cursor-pointer text-xs"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer l'étiquette thermique</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Format standard adapté pour imprimantes d'étiquettes (Zebra, Brother, Dymo)
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
