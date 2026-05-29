import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
let supabase: any = null;

if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    console.log("Supabase Client successfully initialized & ready to roll.");
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
} else {
  console.warn("WARNING: Supabase URL or Service Role Key is missing. Database operations will fail unless configured.");
}

function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not initialized. Please verify your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }
  return supabase;
}

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini Client initialized successfully on Server.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
}

// Database execution mode state: 'supabase' (real database schema) or 'memory' (in-memory offline/fallback)
let dbMode: 'supabase' | 'memory' = 'memory';
let lastSupabaseProbe: number = 0; // timestamp of last successful probe

// Asynchronously probe Supabase database endpoint — called on startup AND lazily on each request if not yet connected.
async function verifyDatabaseConnectivity(): Promise<boolean> {
  if (!supabase) {
    console.warn("No Supabase configuration. Database mode defaults to 'memory'.");
    dbMode = 'memory';
    return false;
  }
  try {
    console.log("Probing Supabase database connectivity...");
    const probePromise = supabase.from('users').select('id').limit(1);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Supabase connection probe timed out (5s)")), 5000)
    );
    const res: any = await Promise.race([probePromise, timeoutPromise]);
    if (res && res.error) {
      throw new Error(`Supabase query failed: ${res.error.message}`);
    }
    console.log("✅ Supabase connection validated. DB mode = 'supabase'.");
    dbMode = 'supabase';
    lastSupabaseProbe = Date.now();
    return true;
  } catch (err: any) {
    console.error("❌ SUPABASE PROBE FAILED:", err.message);
    dbMode = 'memory';
    return false;
  }
}

// Ensure Supabase is connected — lazy reconnect on serverless cold-start
async function ensureSupabaseConnected(): Promise<boolean> {
  if (dbMode === 'supabase') return true;
  // If we have credentials but are in memory mode, try to reconnect (max once every 10s)
  if (supabase && (Date.now() - lastSupabaseProbe > 10000)) {
    console.log("[Reconnect] Attempting lazy Supabase reconnection...");
    return await verifyDatabaseConnectivity();
  }
  return false;
}

verifyDatabaseConnectivity().catch(err => {
  console.error("Database connectivity check error:", err);
});

// SIMULATED DATABASE STATE
interface Author {
  id: number;
  name: string;
  bio: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Book {
  id: number;
  isbn: string;
  title: string;
  slug: string;
  description: string;
  author_id: number;
  category_id: number;
  publisher: string;
  publication_year: number;
  quantity: number;
  available_quantity: number;
  cover_image: string;
  shelf_location: string;
  status: 'available' | 'borrowed' | 'reserved' | 'damaged' | 'lost';
  pdf_url?: string | null;
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  photo?: string;
  address?: string;
  membership_type: 'Standard' | 'Premium' | 'VIP Diamond';
  status: 'active' | 'suspended' | 'pending';
  role: 'admin' | 'librarian' | 'member';
  password_hash: string;
}

interface Borrowing {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  renewed_count: number;
  status: 'active' | 'returned' | 'overdue' | 'cancelled';
}

interface Penalty {
  id: number;
  borrowing_id: number;
  user_id: number;
  amount: number;
  days_overdue: number;
  status: 'unpaid' | 'paid';
  created_at: string;
}

interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  reserved_at: string;
  expires_at: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  queue_position?: number;
  held_on_shelf?: boolean;
}

interface Subscription {
  id: number;
  user_id: number;
  type: 'Standard' | 'Premium' | 'VIP Diamond';
  starts_at: string;
  expires_at: string;
  status: 'active' | 'expired';
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  is_read: boolean;
  created_at: string;
}

interface AuditLog {
  id: number;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

// SEED DATA FOR STABLE fallback / in-memory modes
const authors: Author[] = [
  { id: 1, name: "Victor Hugo", bio: "Écrivain, poète et dramaturge français, figure incontournable du romantisme." },
  { id: 2, name: "Albert Camus", bio: "Écrivain, philosophe, romancier et dramaturge français, Prix Nobel de littérature." },
  { id: 3, name: "Émile Zola", bio: "Écrivain et journaliste français, considéré comme le chef de file du naturalisme." },
  { id: 4, name: "Frank Herbert", bio: "Écrivain américain de science-fiction, célèbre pour son chef-d'œuvre Dune." },
  { id: 5, name: "George Orwell", bio: "Écrivain, chroniqueur et journaliste anglais, célèbre pour ses romans dystopiques." },
  { id: 6, name: "Antoine de Saint-Exupéry", bio: "Écrivain, poète, aviateur et reporter français, auteur du Petit Prince." },
  { id: 7, name: "J.R.R. Tolkien", bio: "Écrivain, poète, philologue et professeur d'université anglais, auteur du Hobbit et du Seigneur des Anneaux." },
  { id: 8, name: "Yuval Noah Harari", bio: "Historien et professeur d'histoire israélien d'origine polonaise, auteur du best-seller Sapiens." }
];

const categories: Category[] = [
  { id: 1, name: "Roman", slug: "roman" },
  { id: 2, name: "Philosophie & Essais", slug: "philosophie-essais" },
  { id: 3, name: "Science-Fiction", slug: "science-fiction" },
  { id: 4, name: "Fantasy", slug: "fantasy" },
  { id: 5, name: "Histoire", slug: "histoire" },
  { id: 6, name: "Jeunesse & Contes", slug: "jeunesse-contes" }
];

let books: Book[] = [
  {
    id: 1,
    isbn: "978-2070409228",
    title: "Les Misérables",
    slug: "les-miserables",
    description: "Dans cette fresque monumentale, Victor Hugo peint la misère sociale du XIXe siècle à travers le destin tragique de Jean Valjean, forçat repenti, poursuivi par l'implacable inspecteur Javert.",
    author_id: 1,
    category_id: 1,
    publisher: "Gallimard",
    publication_year: 1862,
    quantity: 8,
    available_quantity: 6,
    cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon A - R1",
    status: "available",
    pdf_url: null
  },
  {
    id: 2,
    isbn: "978-2070360024",
    title: "L'Étranger",
    slug: "l-etranger",
    description: "À travers l'histoire de Meursault qui commet un meurtre sans motif réel, l'auteur explore la notion d'absurde et l'indifférence face à la société ou à la mort.",
    author_id: 2,
    category_id: 2,
    publisher: "Gallimard NRF",
    publication_year: 1942,
    quantity: 6,
    available_quantity: 4,
    cover_image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon B - P3",
    status: "available",
    pdf_url: null
  },
  {
    id: 3,
    isbn: "978-2253004226",
    title: "Germinal",
    slug: "germinal",
    description: "Treizième volet de la série des Rougon-Macquart, ce roman dépeint la révolte des mineurs dans le Nord de la France face à la baisse des salaires et à l'exploitation capitaliste.",
    author_id: 3,
    category_id: 1,
    publisher: "Le Livre de Poche",
    publication_year: 1885,
    quantity: 5,
    available_quantity: 5,
    cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon A - R2",
    status: "available",
    pdf_url: null
  },
  {
    id: 4,
    isbn: "978-2266155489",
    title: "Dune (Tome 1)",
    slug: "dune-1",
    description: "Sur la planète désertique d'Arrakis, source de l'Épice de prescience, s'engage une lutte acharnée pour le pouvoir impérial impliquant la jeune maison des Atréides.",
    author_id: 4,
    category_id: 3,
    publisher: "Pocket",
    publication_year: 1965,
    quantity: 12,
    available_quantity: 11,
    cover_image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon C - SF1",
    status: "available",
    pdf_url: null
  },
  {
    id: 5,
    isbn: "978-2070368228",
    title: "1984",
    slug: "1984",
    description: "Une dystopie glaçante décrivant la vie de Winston Smith sous l'œil vigilant de Big Brother dans une société régie par la surveillance de masse, la désinformation et la novlangue.",
    author_id: 5,
    category_id: 3,
    publisher: "Gallimard Folio",
    publication_year: 1949,
    quantity: 10,
    available_quantity: 7,
    cover_image: "https://images.unsplash.com/photo-1610116306796-6ebd3051c330?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon C - SF2",
    status: "available",
    pdf_url: null
  },
  {
    id: 6,
    isbn: "978-2070625901",
    title: "Le Petit Prince",
    slug: "le-petit-prince",
    description: "Ce conte poétique et philosophique invite à retrouver l'enfant en soi. Le Petit Prince y partage ses enseignements sur l'amour, l'amitié et l'essentiel de la vie invisible pour les yeux.",
    author_id: 6,
    category_id: 6,
    publisher: "Gallimard Jeunesse",
    publication_year: 1943,
    quantity: 15,
    available_quantity: 14,
    cover_image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon J - C1",
    status: "available",
    pdf_url: null
  },
  {
    id: 7,
    isbn: "978-2266158510",
    title: "Le Silmarillion",
    slug: "le-silmarillion",
    description: "Œuvre de haute fantasy décrivant la genèse politique et légendaire de la Terre du Milieu, le soulèvement de Melkor et la tragédie des Silmarils.",
    author_id: 7,
    category_id: 4,
    publisher: "Pocket",
    publication_year: 1977,
    quantity: 4,
    available_quantity: 4,
    cover_image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon F - FY1",
    status: "available",
    pdf_url: null
  },
  {
    id: 8,
    isbn: "978-2226257017",
    title: "Sapiens : Une brève histoire de l'humanité",
    slug: "sapiens",
    description: "Yuval Noah Harari retrace l'histoire extraordinaire de l'Homo Sapiens, depuis l'âge de pierre jusqu'à la révolution industrielle et numérique actuelle, explorant l'impact de nos croyances fictives collectives.",
    author_id: 8,
    category_id: 5,
    publisher: "Albin Michel",
    publication_year: 2011,
    quantity: 6,
    available_quantity: 5,
    cover_image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop",
    shelf_location: "Rayon H - H1",
    status: "available",
    pdf_url: null
  }
];

let users: User[] = [];

let borrowings: Borrowing[] = [];
let penalties: Penalty[] = [];
let reservations: Reservation[] = [];
let subscriptions: Subscription[] = [];
let notifications: Notification[] = [];
let auditLogs: AuditLog[] = [
  { id: 1, user: "Système", action: "Initialisation", target: "Base de données BiblioSphere active", timestamp: new Date().toISOString() }
];

// UTILITIES FOR DURATION CALCULATIONS ON PENALTIES
async function recalculatePenalties() {
  const dailyRate = 500; // 500 FCFA per day
  const now = new Date();
  
  if (dbMode === 'supabase' && supabase) {
    try {
      // Find all active or overdue borrowings
      const { data: borrowingsData, error } = await supabase
        .from('borrowings')
        .select('*')
        .in('status', ['active', 'overdue'])
        .is('returned_at', null);
        
      if (error) {
        console.error("Supabase Error fetching borrowings for recalculatePenalties:", error);
        return;
      }
      
      for (const b of (borrowingsData || [])) {
        const dueDate = new Date(b.due_date);
        if (now > dueDate) {
          const diffTime = Math.abs(now.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Update borrowing status to overdue
          await supabase.from('borrowings').update({ status: 'overdue' }).eq('id', b.id);
          
          // Check if penalty exists
          const { data: penaltyData, error: penaltyQueryError } = await supabase
            .from('penalties')
            .select('id')
            .eq('borrowing_id', b.id)
            .maybeSingle();
            
          if (penaltyQueryError) {
            console.error("Supabase Error fetching penalty for recalculatePenalties:", penaltyQueryError);
            continue;
          }
          
          const amount = diffDays * dailyRate;
          if (penaltyData) {
            await supabase
              .from('penalties')
              .update({ days_overdue: diffDays, amount: amount })
              .eq('borrowing_id', b.id);
          } else {
            await supabase
              .from('penalties')
              .insert([{
                borrowing_id: b.id,
                user_id: b.user_id,
                amount: amount,
                days_overdue: diffDays,
                status: 'unpaid'
              }]);
          }
        }
      }
    } catch (err) {
      console.error("Error recalculating database penalties on Supabase. Switching to memory recalculation:", err);
    }
  } else {
    // Memory mode recalculation
    for (const b of borrowings) {
      if (b.status === 'active' || b.status === 'overdue') {
        const dueDate = new Date(b.due_date);
        if (now > dueDate) {
          const diffTime = Math.abs(now.getTime() - dueDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          b.status = 'overdue';
          
          let penalty = penalties.find(p => p.borrowing_id === b.id);
          const amount = diffDays * dailyRate;
          if (penalty) {
            penalty.days_overdue = diffDays;
            penalty.amount = amount;
          } else {
            penalties.push({
              id: penalties.length + 1,
              borrowing_id: b.id,
              user_id: b.user_id,
              amount: amount,
              days_overdue: diffDays,
              status: 'unpaid',
              created_at: now.toISOString()
            });
          }
        }
      }
    }
  }
}

// ---------------- DATABASE MANAGER CLIENT DELEGATE (SUPABASE-ONLY) ----------------
const rawDb = {
  // --- AUTHORS ---
  async getAuthors(): Promise<Author[]> {
    const { data, error } = await getSupabase().from('authors').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getAuthors:", error);
      throw error;
    }
    return data || [];
  },

  async addAuthor(name: string, bio?: string): Promise<Author> {
    const fallbackBio = bio || "Auteur ajouté manuellement";
    const { data, error } = await getSupabase().from('authors').insert([{ name, bio: fallbackBio }]).select().single();
    if (error) {
      console.error("Supabase Error addAuthor:", error);
      throw error;
    }
    return data;
  },
  
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const { data, error } = await getSupabase().from('categories').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getCategories:", error);
      throw error;
    }
    return data || [];
  },

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    const { data, error } = await getSupabase().from('users').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getUsers:", error);
      throw error;
    }
    return (data || []).map((u: any) => ({
      ...u,
      membership_type: u.membership_type === 'Classic' ? 'Standard' : u.membership_type,
      password_hash: u.password
    }));
  },
  
  async getUserById(id: number): Promise<User | null> {
    const { data, error } = await getSupabase().from('users').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error("Supabase Error getUserById:", error);
      throw error;
    }
    return data ? {
      ...data,
      membership_type: data.membership_type === 'Classic' ? 'Standard' : data.membership_type,
      password_hash: data.password
    } : null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await getSupabase().from('users').select('*').ilike('email', email.trim()).maybeSingle();
    if (error) {
      console.error("Supabase Error getUserByEmail:", error);
      throw error;
    }
    return data ? {
      ...data,
      membership_type: data.membership_type === 'Classic' ? 'Standard' : data.membership_type,
      password_hash: data.password
    } : null;
  },

  async addUser(u: Omit<User, 'id'>): Promise<User> {
    const dbMembership = u.membership_type === 'Standard' ? 'Classic' : (u.membership_type || 'Classic');
    const { data, error } = await getSupabase().from('users').insert([{
      firstname: u.firstname,
      lastname: u.lastname,
      email: u.email,
      password: u.password_hash,
      role: u.role,
      status: u.status,
      membership_type: dbMembership
    }]).select().single();
    if (error) {
      console.error("Supabase Error addUser:", error);
      throw error;
    }
    return {
      ...data,
      membership_type: data.membership_type === 'Classic' ? 'Standard' : data.membership_type,
      password_hash: data.password
    };
  },

  async updateUserStatus(id: number, status: 'active' | 'suspended' | 'pending'): Promise<void> {
    const dbStatus = status === 'pending' ? 'pending' : status === 'suspended' ? 'suspended' : 'active';
    const { error } = await getSupabase().from('users').update({ status: dbStatus }).eq('id', id);
    if (error) {
      console.error("Supabase Error updateUserStatus:", error);
      throw error;
    }
  },

  async deleteUser(id: number): Promise<boolean> {
    const { error } = await getSupabase().from('users').delete().eq('id', id);
    if (error) {
      console.error("Supabase Error deleteUser:", error);
      throw error;
    }
    return true;
  },

  // --- BOOKS ---
  async getBooks(): Promise<Book[]> {
    const { data, error } = await getSupabase().from('books').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getBooks:", error);
      throw error;
    }
    return data || [];
  },

  async getBookById(id: number): Promise<Book | null> {
    const { data, error } = await getSupabase().from('books').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error("Supabase Error getBookById:", error);
      throw error;
    }
    return data || null;
  },

  async addBook(b: Omit<Book, 'id'>): Promise<Book> {
    const { data, error } = await getSupabase().from('books').insert([{
      isbn: b.isbn,
      title: b.title,
      description: b.description,
      author_id: b.author_id,
      category_id: b.category_id,
      publisher: b.publisher,
      publication_year: b.publication_year,
      cover_image: b.cover_image,
      pdf_url: (b as any).pdf_url || null,
      quantity: b.quantity,
      available_quantity: b.available_quantity,
      shelf_location: b.shelf_location
    }]).select().single();
    if (error) {
      console.error("Supabase Error addBook:", error);
      throw error;
    }
    return data;
  },

  async updateBook(id: number, b: Partial<Book>): Promise<Book | null> {
    const { id: _, ...payload } = b as any;
    const { data, error } = await getSupabase().from('books').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      console.error("Supabase Error updateBook:", error);
      throw error;
    }
    return data;
  },

  async deleteBook(id: number): Promise<boolean> {
    const { error } = await getSupabase().from('books').delete().eq('id', id);
    if (error) {
      console.error("Supabase Error deleteBook:", error);
      throw error;
    }
    return true;
  },

  // --- BORROWINGS ---
  async getBorrowings(): Promise<Borrowing[]> {
    const { data, error } = await getSupabase().from('borrowings').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getBorrowings:", error);
      throw error;
    }
    return (data || []).map((r: any) => ({
      ...r,
      borrowed_at: new Date(r.borrowed_at).toISOString(),
      due_date: new Date(r.due_date).toISOString(),
      returned_at: r.returned_at ? new Date(r.returned_at).toISOString() : null,
    }));
  },

  async addBorrowing(b: Omit<Borrowing, 'id'>): Promise<Borrowing> {
    const { data, error } = await getSupabase().from('borrowings').insert([{
      user_id: b.user_id,
      book_id: b.book_id,
      borrowed_at: b.borrowed_at,
      due_date: b.due_date,
      returned_at: b.returned_at,
      renewed_count: b.renewed_count,
      status: b.status
    }]).select().single();
    if (error) {
      console.error("Supabase Error addBorrowing:", error);
      throw error;
    }
    return data;
  },

  async updateBorrowing(id: number, b: Partial<Borrowing>): Promise<Borrowing | null> {
    const { id: _, ...payload } = b as any;
    const { data, error } = await getSupabase().from('borrowings').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      console.error("Supabase Error updateBorrowing:", error);
      throw error;
    }
    return data;
  },

  // --- PENALTIES ---
  async getPenalties(): Promise<Penalty[]> {
    const { data, error } = await getSupabase().from('penalties').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getPenalties:", error);
      throw error;
    }
    return data || [];
  },

  async addPenalty(p: Omit<Penalty, 'id'>): Promise<Penalty> {
    const { data, error } = await getSupabase().from('penalties').insert([{
      borrowing_id: p.borrowing_id,
      user_id: p.user_id,
      amount: p.amount,
      days_overdue: p.days_overdue,
      status: p.status
    }]).select().single();
    if (error) {
      console.error("Supabase Error addPenalty:", error);
      throw error;
    }
    return data;
  },

  async updatePenalty(id: number, p: Partial<Penalty>): Promise<Penalty | null> {
    const { id: _, created_at: __, ...payload } = p as any;
    const { data, error } = await getSupabase().from('penalties').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      console.error("Supabase Error updatePenalty:", error);
      throw error;
    }
    return data;
  },

  // --- RESERVATIONS ---
  async getReservations(): Promise<Reservation[]> {
    const { data, error } = await getSupabase().from('reservations').select('*').order('id', { ascending: true });
    if (error) {
      console.error("Supabase Error getReservations:", error);
      throw error;
    }
    return (data || []).map((r: any) => ({
      ...r,
      status: r.status === 'completed' ? 'fulfilled' : r.status === 'canceled' ? 'cancelled' : r.status
    }));
  },

  async addReservation(r: Omit<Reservation, 'id'>): Promise<Reservation> {
    const dbStatus = r.status === 'fulfilled' ? 'completed' : r.status === 'cancelled' ? 'canceled' : r.status;
    const { data, error } = await getSupabase().from('reservations').insert([{
      user_id: r.user_id,
      book_id: r.book_id,
      reserved_at: r.reserved_at,
      expires_at: r.expires_at,
      status: dbStatus
    }]).select().single();
    if (error) {
      console.error("Supabase Error addReservation:", error);
      throw error;
    }
    return {
      ...data,
      status: data.status === 'completed' ? 'fulfilled' : data.status === 'canceled' ? 'cancelled' : data.status
    };
  },

  async updateReservation(id: number, r: Partial<Reservation>): Promise<Reservation | null> {
    const payload: any = {};
    if (r.status !== undefined) {
      payload.status = r.status === 'fulfilled' ? 'completed' : r.status === 'cancelled' ? 'canceled' : r.status;
    }
    if (r.expires_at !== undefined) {
      payload.expires_at = r.expires_at;
    }
    const { data, error } = await getSupabase().from('reservations').update(payload).eq('id', id).select().maybeSingle();
    if (error) {
      console.error("Supabase Error updateReservation:", error);
      throw error;
    }
    return data ? {
      ...data,
      status: data.status === 'completed' ? 'fulfilled' : data.status === 'canceled' ? 'cancelled' : data.status
    } : null;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await getSupabase().from('audit_logs').select('*').order('id', { ascending: false });
    if (error) {
      console.error("Supabase Error getAuditLogs:", error);
      throw error;
    }
    return (data || []).map((l: any) => ({
      ...l,
      timestamp: new Date(l.timestamp).toISOString()
    }));
  },

  async addAuditLog(log: Omit<AuditLog, 'id'>): Promise<AuditLog> {
    const { data, error } = await getSupabase().from('audit_logs').insert([{
      user: log.user,
      action: log.action,
      target: log.target
    }]).select().single();
    if (error) {
      console.error("Supabase Error addAuditLog:", error);
      throw error;
    }
    return data;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await getSupabase().from('notifications').select('*').order('id', { ascending: false });
    if (error) {
      console.error("Supabase Error getNotifications:", error);
      throw error;
    }
    const notificationsData = data || [];
    return notificationsData.map((n: any) => ({
      ...n,
      type: n.type === 'warning' ? 'alert' : n.type === 'danger' ? 'alert' : 'info',
      is_read: !!n.is_read,
      created_at: new Date(n.created_at).toISOString()
    }));
  },

  async addNotification(n: Omit<Notification, 'id'>): Promise<Notification> {
    const { data, error } = await getSupabase().from('notifications').insert([{
      user_id: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type === 'alert' ? 'warning' : n.type
    }]).select().single();
    if (error) {
      console.error("Supabase Error addNotification:", error);
      throw error;
    }
    return {
      ...data,
      type: data.type === 'warning' ? 'alert' : data.type === 'danger' ? 'alert' : 'info',
      is_read: !!data.is_read,
      created_at: new Date(data.created_at).toISOString()
    };
  },

  async readAllNotifications(): Promise<void> {
    const { error } = await getSupabase().from('notifications').update({ is_read: true }).eq('is_read', false);
    if (error) {
      console.error("Supabase Error readAllNotifications:", error);
      throw error;
    }
  }
};

// --- IN-MEMORY DATABASE ENGINE FALLBACK IMPLEMENTATIONS ---
async function callMemoryImplementation(prop: string, args: any[]): Promise<any> {
  const nowStr = () => new Date().toISOString();
  switch (prop) {
    case 'getAuthors':
      return authors;

    case 'addAuthor': {
      const [name, bio] = args;
      const fallbackBio = bio || "Auteur ajouté manuellement";
      const newAuthor = { id: authors.length + 1, name, bio: fallbackBio };
      authors.push(newAuthor);
      return newAuthor;
    }

    case 'getCategories':
      return categories;

    case 'getUsers':
      return users.map(u => ({
        ...u,
        membership_type: (u.membership_type as any) === 'Classic' ? 'Standard' : u.membership_type,
        password_hash: u.password_hash || (u as any).password
      }));

    case 'getUserById': {
      const [id] = args;
      const u = users.find(usr => usr.id === Number(id)) || null;
      if (!u) return null;
      return {
        ...u,
        membership_type: (u.membership_type as any) === 'Classic' ? 'Standard' : u.membership_type,
        password_hash: u.password_hash || (u as any).password
      };
    }

    case 'getUserByEmail': {
      const [email] = args;
      if (!email) return null;
      const u = users.find(usr => usr.email.toLowerCase() === email.toLowerCase()) || null;
      if (!u) return null;
      return {
        ...u,
        membership_type: (u.membership_type as any) === 'Classic' ? 'Standard' : u.membership_type,
        password_hash: u.password_hash || (u as any).password
      };
    }

    case 'addUser': {
      const [u] = args;
      const dbMembership = u.membership_type === 'Standard' ? 'Classic' : (u.membership_type || 'Classic');
      const newUser = {
        id: users.length + 1,
        ...u,
        membership_type: (dbMembership as any) === 'Classic' ? 'Standard' : dbMembership,
        password_hash: u.password_hash
      };
      users.push(newUser);
      return newUser;
    }

    case 'updateUserStatus': {
      const [id, status] = args;
      const usr = users.find(u => u.id === Number(id));
      if (usr) usr.status = status;
      return;
    }

    case 'deleteUser': {
      const [id] = args;
      const idx = users.findIndex(u => u.id === Number(id));
      if (idx !== -1) {
        users.splice(idx, 1);
        return true;
      }
      return false;
    }

    case 'getBooks':
      return books;

    case 'getBookById': {
      const [id] = args;
      return books.find(b => b.id === Number(id)) || null;
    }

    case 'addBook': {
      const [b] = args;
      const newBook = {
        id: books.length + 1,
        ...b,
        pdf_url: b.pdf_url || null
      };
      books.push(newBook);
      return newBook;
    }

    case 'updateBook': {
      const [id, b] = args;
      const idx = books.findIndex(bk => bk.id === Number(id));
      if (idx === -1) return null;
      books[idx] = { ...books[idx], ...b };
      return books[idx];
    }

    case 'deleteBook': {
      const [id] = args;
      const idx = books.findIndex(bk => bk.id === Number(id));
      if (idx !== -1) {
        books.splice(idx, 1);
        return true;
      }
      return false;
    }

    case 'getBorrowings':
      return borrowings.map(r => ({
        ...r,
        borrowed_at: new Date(r.borrowed_at).toISOString(),
        due_date: new Date(r.due_date).toISOString(),
        returned_at: r.returned_at ? new Date(r.returned_at).toISOString() : null,
      }));

    case 'addBorrowing': {
      const [b] = args;
      const newB = { id: borrowings.length + 1, ...b };
      borrowings.push(newB);
      return newB;
    }

    case 'updateBorrowing': {
      const [id, b] = args;
      const idx = borrowings.findIndex(br => br.id === Number(id));
      if (idx === -1) return null;
      borrowings[idx] = { ...borrowings[idx], ...b };
      return borrowings[idx];
    }

    case 'getPenalties':
      return penalties;

    case 'addPenalty': {
      const [p] = args;
      const newP = { id: penalties.length + 1, ...p, created_at: nowStr() };
      penalties.push(newP);
      return newP;
    }

    case 'updatePenalty': {
      const [id, p] = args;
      const idx = penalties.findIndex(pen => pen.id === Number(id));
      if (idx === -1) return null;
      penalties[idx] = { ...penalties[idx], ...p };
      return penalties[idx];
    }

    case 'getReservations':
      return reservations.map(r => ({
        ...r,
        status: (r.status as any) === 'completed' ? 'fulfilled' : (r.status as any) === 'canceled' ? 'cancelled' : r.status
      }));

    case 'addReservation': {
      const [r] = args;
      const dbStatus = r.status === 'fulfilled' ? 'completed' : r.status === 'cancelled' ? 'canceled' : r.status;
      const newRes = {
        id: reservations.length + 1,
        ...r,
        status: (dbStatus as any) === 'completed' ? 'fulfilled' : (dbStatus as any) === 'canceled' ? 'cancelled' : dbStatus
      };
      reservations.push(newRes);
      return newRes;
    }

    case 'updateReservation': {
      const [id, r] = args;
      const idx = reservations.findIndex(resItem => resItem.id === Number(id));
      if (idx === -1) return null;
      const dbStatus = r.status !== undefined ? (r.status === 'fulfilled' ? 'completed' : r.status === 'cancelled' ? 'canceled' : r.status) : undefined;
      const updatePayload: any = { ...r };
      if (dbStatus !== undefined) updatePayload.status = dbStatus === 'completed' ? 'fulfilled' : dbStatus === 'canceled' ? 'cancelled' : dbStatus;
      reservations[idx] = { ...reservations[idx], ...updatePayload };
      return reservations[idx];
    }

    case 'getAuditLogs':
      return auditLogs.map(l => ({
        ...l,
        timestamp: new Date(l.timestamp).toISOString()
      }));

    case 'addAuditLog': {
      const [log] = args;
      const newLog = { id: auditLogs.length + 1, ...log, timestamp: nowStr() };
      auditLogs.push(newLog);
      return newLog;
    }

    case 'getNotifications':
      return notifications.map(n => ({
        ...n,
        type: (n.type as any) === 'warning' ? 'alert' : (n.type as any) === 'danger' ? 'alert' : 'info',
        is_read: !!n.is_read,
        created_at: new Date(n.created_at).toISOString()
      }));

    case 'addNotification': {
      const [n] = args;
      const newNotif = {
        id: notifications.length + 1,
        ...n,
        type: n.type === 'alert' ? 'warning' : n.type,
        is_read: false,
        created_at: nowStr()
      };
      notifications.push(newNotif);
      return newNotif;
    }

    case 'readAllNotifications':
      notifications.forEach(n => n.is_read = true);
      return;

    default:
      throw new Error(`Method ${prop} is not implemented in memory mode.`);
  }
}

// Resilient database engine client router — tries Supabase first, falls back to memory PER-CALL (never permanently)
const db = new Proxy(rawDb, {
  get(target: any, prop: string) {
    return async function (...args: any[]) {
      // Lazy reconnect: if we're in memory mode but have Supabase credentials, try reconnecting
      await ensureSupabaseConnected();

      if (dbMode === 'supabase') {
        try {
          // Attempt using real Supabase client
          const result = await target[prop].apply(target, args);
          return result;
        } catch (err: any) {
          // Log the error but DO NOT permanently switch to memory mode
          console.error(`[DB] Supabase error on 'db.${prop}':`, err.message || err);
          if (supabase) {
            // If Supabase is explicitly configured, throw error to avoid silent data loss
            throw new Error(`Erreur critique de base de données Supabase sur '${prop}': ${err.message || err}`);
          }
          console.warn(`[DB] Falling back to memory for THIS call only. Supabase will be retried on next call.`);
          // Do NOT set dbMode = 'memory' here — let the next call retry Supabase
          return await callMemoryImplementation(prop, args);
        }
      } else {
        if (supabase) {
          // If Supabase is configured but we are in memory mode, it means connection/probe is failing
          throw new Error(`La base de données Supabase est configurée mais actuellement inaccessible. Impossible d'exécuter '${prop}'.`);
        }
        // Run in local memory simulation mode
        return await callMemoryImplementation(prop, args);
      }
    };
  }
}) as typeof rawDb;

// Higher-order function to handle exceptions in async Express routes and return clean JSON
const asyncHandler = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// REST API ROUTER
const api = express.Router();

// ---------------- AUTHENTIFICATION ----------------
api.get('/auth/check-admin', asyncHandler(async (req, res) => {
  // Always allow unconstrained custom user registration with any role and never show front-end restriction alerts
  return res.json({ adminExists: false });
}));

api.post('/auth/register', asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, phone, address, membership_type, role } = req.body;
  
  console.log(`[REGISTER] Attempt: email=${email}, dbMode=${dbMode}, supabaseReady=${!!supabase}`);
  
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
  }

  const userRole = role || 'member';

  // Ensure Supabase is connected before critical write operation
  await ensureSupabaseConnected();
  console.log(`[REGISTER] DB mode after reconnect check: ${dbMode}`);

  // Check for unique email
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: "Cet e-mail est déjà associé à un compte." });
  }

  // Normalize membership_type to match DB CHECK constraint: ('Classic', 'Premium', 'VIP Diamond')
  const validMemberships = ['Classic', 'Premium', 'VIP Diamond'];
  let safeMembership = membership_type || 'Standard';
  if (safeMembership === 'Standard') safeMembership = 'Classic';
  if (!validMemberships.includes(safeMembership)) safeMembership = 'Classic';
  // Note: rawDb.addUser also does this mapping, but we secure it here too for defense-in-depth

  const newUser: User = {
    id: users.length + 1,
    firstname,
    lastname,
    email,
    phone: phone || '',
    address: address || '',
    membership_type: safeMembership === 'Classic' ? 'Standard' : safeMembership as any,
    status: 'active',
    role: userRole,
    password_hash: password
  };

  // Register in DB companion
  const savedUser = await db.addUser(newUser);
  console.log(`[REGISTER] User saved: id=${savedUser.id}, dbMode=${dbMode}`);

  // Auto Create subscription (for local memory, DB seeding covers real scenarios)
  const start = new Date();
  const expire = new Date();
  expire.setFullYear(start.getFullYear() + 1);

  subscriptions.push({
    id: subscriptions.length + 1,
    user_id: savedUser.id,
    type: savedUser.membership_type,
    starts_at: start.toISOString(),
    expires_at: expire.toISOString(),
    status: 'active'
  });

  // Log action (non-blocking — don't let audit failure break registration)
  try {
    await db.addAuditLog({
      user: "Système",
      action: "Inscription de compte",
      target: `${savedUser.firstname} ${savedUser.lastname} (${savedUser.role.toUpperCase()})`,
      timestamp: new Date().toISOString()
    });
  } catch (auditErr) {
    console.error("[REGISTER] Audit log failed (non-blocking):", auditErr);
  }

  // Welcome Notification (non-blocking — don't let notification failure break registration)
  try {
    await db.addNotification({
      user_id: savedUser.id,
      title: "Compte créé avec succès !",
      message: `Votre compte (${savedUser.role === 'admin' ? 'Administrateur' : savedUser.role === 'librarian' ? 'Bibliothécaire' : 'Membre'}) est officiellement actif.`,
      type: "success",
      is_read: false,
      created_at: new Date().toISOString()
    });
  } catch (notifErr) {
    console.error("[REGISTER] Welcome notification failed (non-blocking):", notifErr);
  }

  console.log(`[REGISTER] ✅ Success: ${savedUser.email} (id=${savedUser.id})`);
  return res.json({ token: "sanctum_mock_token_" + savedUser.id, user: savedUser });
}));

api.post('/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUserByEmail(email);
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: "Identifiants invalides ou mot de passe incorrect." });
  }
  if (user.status === 'suspended') {
    return res.status(403).json({ error: "Votre compte est suspendu. Veuillez régler vos pénalités ou renouveler votre abonnement." });
  }
  return res.json({ token: "sanctum_mock_token_" + user.id, user });
}));

api.post('/auth/logout', (req, res) => {
  return res.json({ message: "Déconnexion réussie avec succès." });
});

// ---------------- GESTION DES LIVRES ----------------
api.get('/books', async (req, res) => {
  try {
    await recalculatePenalties();
    
    const allBooks = await db.getBooks();
    const allAuthors = await db.getAuthors();
    const allCategories = await db.getCategories();
    const allReservations = await db.getReservations();

    // enrich books with author and category details
    const enriched = allBooks.map(b => {
      const author = allAuthors.find(a => a.id === b.author_id);
      const category = allCategories.find(c => c.id === b.category_id);
      const reservations_count = allReservations.filter(r => r.book_id === b.id && r.status === 'pending').length;
      return {
        ...b,
        author: author ? author.name : "Auteur inconnu",
        author_bio: author ? author.bio : "",
        category: category ? category.name : "Général",
        reservations_count
      };
    });
    return res.json(enriched);
  } catch (error: any) {
    console.error("Error in GET /books route:", error.message);
    return res.status(500).json({ error: "Impossible de récupérer la liste des livres de la base de données." });
  }
});

api.post('/books/upload-pdf', async (req, res) => {
  try {
    const { title, fileName, fileBase64 } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: "Aucun fichier ou nom de fichier reçu." });
    }

    const cleanTitle = (title || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const extension = fileName.split('.').pop() || 'pdf';
    const storagePath = `${cleanTitle}_${Date.now()}.${extension}`;

    if (supabase) {
      console.log(`Uploading ${fileName} to Supabase Storage bucket 'book-pdfs'...`);
      const bucketName = 'book-pdfs';
      
      const fileBuffer = Buffer.from(fileBase64, 'base64');
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return res.status(500).json({ error: `Erreur d'upload storage Supabase : ${error.message}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);

      return res.json({ pdf_url: publicUrlData.publicUrl });
    } else {
      // Local fallback
      console.log(`Saving ${fileName} to local uploads folder...`);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localPath = path.join(uploadsDir, storagePath);
      fs.writeFileSync(localPath, Buffer.from(fileBase64, 'base64'));
      return res.json({ pdf_url: `/uploads/${storagePath}` });
    }
  } catch (err: any) {
    console.error("Critical error inside /books/upload-pdf:", err);
    return res.status(500).json({ error: err.message || "Erreur critique d'upload." });
  }
});

api.post('/books', asyncHandler(async (req, res) => {
  const { isbn, title, description, author_id, category_id, publisher, publication_year, quantity, shelf_location, new_author_name, pdf_url } = req.body;
  if (!isbn || !title || !author_id || !category_id || !quantity) {
    return res.status(422).json({ error: "Veuillez fournir tous les champs obligatoires (ISBN, Titre, Auteur, Catégorie, Quantité)." });
  }

  let resolvedAuthorId = author_id;
  if (author_id === 'new') {
    if (!new_author_name || !new_author_name.trim()) {
      return res.status(422).json({ error: "Veuillez saisir le nom de l'auteur si vous choisissez 'Nouvel auteur'." });
    }
    // Avoid double inserts
    const allAuthors = await db.getAuthors();
    const existing = allAuthors.find(a => a.name.toLowerCase() === new_author_name.trim().toLowerCase());
    if (existing) {
      resolvedAuthorId = existing.id;
    } else {
      const createdAuth = await db.addAuthor(new_author_name.trim());
      resolvedAuthorId = createdAuth.id;
    }
  }

  // Cover placeholder based on category
  const defaultCovers: { [key: number]: string } = {
    1: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    2: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    3: "https://images.unsplash.com/photo-1610116306796-6ebd3051c330?q=80&w=600&auto=format&fit=crop",
    4: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
    5: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop",
    6: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600&auto=format&fit=crop"
  };

  const newBook = await db.addBook({
    isbn,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || "Aucune description",
    author_id: parseInt(resolvedAuthorId),
    category_id: parseInt(category_id),
    publisher: publisher || "Édition libre",
    publication_year: parseInt(publication_year) || new Date().getFullYear(),
    quantity: parseInt(quantity),
    available_quantity: parseInt(quantity),
    cover_image: defaultCovers[parseInt(category_id)] || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop",
    shelf_location: shelf_location || "Rayon Général",
    status: 'available',
    pdf_url: pdf_url || null
  } as any);

  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Ajout de livre",
    target: newBook.title,
    timestamp: new Date().toISOString()
  });

  return res.json(newBook);
}));

api.put('/books/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const current = await db.getBookById(id);
  if (!current) return res.status(404).json({ error: "Livre non trouvé." });

  const { title, description, quantity, shelf_location, status } = req.body;

  const currentBorrowed = current.quantity - current.available_quantity;
  const newQuantity = quantity !== undefined ? parseInt(quantity) : current.quantity;
  const newAvailable = newQuantity - currentBorrowed;

  if (newAvailable < 0) {
    return res.status(400).json({ error: "Impossible de réduire la quantité sous le nombre d'emprunts en cours." });
  }

  const updatedBook = await db.updateBook(id, {
    title: title || current.title,
    slug: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : current.slug,
    description: description || current.description,
    quantity: newQuantity,
    available_quantity: newAvailable,
    shelf_location: shelf_location || current.shelf_location,
    status: status || current.status
  });

  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Modification livre",
    target: current.title,
    timestamp: new Date().toISOString()
  });

  return res.json(updatedBook);
}));

api.delete('/books/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const current = await db.getBookById(id);
  if (!current) return res.status(404).json({ error: "Livre non trouvé." });

  const allBorrowings = await db.getBorrowings();
  const activeLoans = allBorrowings.filter(b => b.book_id === id && b.status === 'active');
  if (activeLoans.length > 0) {
    return res.status(400).json({ error: "Impossible de supprimer ce livre car des exemplaires sont actuellement empruntés." });
  }

  await db.deleteBook(id);

  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Suppression de livre",
    target: current.title,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, message: "Livre supprimé avec succès." });
}));

// ---------------- GESTION DES MEMBRES ----------------
api.get('/members', asyncHandler(async (req, res) => {
  await recalculatePenalties();
  const allUsers = await db.getUsers();
  const allBorrowings = await db.getBorrowings();
  const allPenalties = await db.getPenalties();

  const enriched = allUsers.map(u => {
    const userBorrowings = allBorrowings.filter(b => b.user_id === u.id);
    const activeLoans = userBorrowings.filter(b => b.status === 'active' || b.status === 'overdue').length;
    const unpaidPenalties = allPenalties.filter(p => p.user_id === u.id && p.status === 'unpaid')
      .reduce((sum, p) => sum + p.amount, 0);

    const expire = new Date();
    expire.setFullYear(expire.getFullYear() + 1);

    return {
      ...u,
      active_loans_count: activeLoans,
      total_loans_count: userBorrowings.length,
      unpaid_penalties_amount: unpaidPenalties,
      subscription_type: u.membership_type || 'Standard',
      subscription_expires: expire.toISOString(),
      subscription_status: 'active'
    };
  });
  return res.json(enriched);
}));

api.post('/members', async (req, res) => {
  try {
    const { firstname, lastname, email, phone, address, membership_type, status } = req.body;
    if (!firstname || !lastname || !email) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis." });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "Cet e-mail est déjà associé à un compte." });
    }

    const savedUser = await db.addUser({
      firstname,
      lastname,
      email,
      phone: phone || '',
      address: address || '',
      membership_type: membership_type || 'Standard',
      status: status || 'active',
      role: 'member',
      password_hash: "secretpwd"
    });

    await db.addAuditLog({
      user: "Sophie Dubois",
      action: "Création de membre",
      target: `${savedUser.firstname} ${savedUser.lastname}`,
      timestamp: new Date().toISOString()
    });

    return res.json(savedUser);
  } catch (err: any) {
    console.error("Critical error in /members post:", err);
    return res.status(500).json({ error: err.message || "Erreur interne lors de la création du membre." });
  }
});

api.delete('/members/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await db.getUserById(id);
  if (!user) {
    return res.status(404).json({ error: "Compte non trouvé." });
  }

  const deleted = await db.deleteUser(id);
  if (!deleted) {
    return res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
  }

  await db.addAuditLog({
    user: "Système",
    action: "Suppression de compte",
    target: `${user.firstname} ${user.lastname} (${user.role.toUpperCase()})`,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, message: "Compte supprimé avec succès." });
}));

// ---------------- GESTION DES EMPRUNTS ----------------
api.get('/borrowings', asyncHandler(async (req, res) => {
  await recalculatePenalties();
  const allBorrowings = await db.getBorrowings();
  const allUsers = await db.getUsers();
  const allBooks = await db.getBooks();
  const allPenalties = await db.getPenalties();

  const enriched = allBorrowings.map(b => {
    const userObj = allUsers.find(u => u.id === b.user_id);
    const bookObj = allBooks.find(bk => bk.id === b.book_id);
    const penaltyObj = allPenalties.find(p => p.borrowing_id === b.id);
    return {
      ...b,
      user_name: userObj ? `${userObj.firstname} ${userObj.lastname}` : "Membre inconnu",
      user_email: userObj ? userObj.email : "N/A",
      book_title: bookObj ? bookObj.title : "Livre inconnu",
      book_isbn: bookObj ? bookObj.isbn : "",
      penalty_amount: penaltyObj ? penaltyObj.amount : 0,
      penalty_status: penaltyObj ? penaltyObj.status : null
    };
  });
  return res.json(enriched);
}));

api.post('/borrowings', asyncHandler(async (req, res) => {
  const { user_id, book_id } = req.body;
  if (!user_id || !book_id) {
    return res.status(422).json({ error: "Veuillez spécifier le membre et le livre." });
  }

  const userObj = await db.getUserById(parseInt(user_id));
  const bookObj = await db.getBookById(parseInt(book_id));

  if (!userObj) return res.status(404).json({ error: "Membre non trouvé." });
  if (!bookObj) return res.status(404).json({ error: "Livre non trouvé." });

  // BUSINESS RULES VALIDATION
  // 1. Suspension
  if (userObj.status === 'suspended') {
    return res.status(400).json({ error: "Impossible de prêter à un membre suspendu. Veuillez d'abord régler ses amendes ou renouveler." });
  }

  // 2. Active loan counts
  const allBorrowings = await db.getBorrowings();
  const activeCount = allBorrowings.filter(b => b.user_id === userObj.id && (b.status === 'active' || b.status === 'overdue')).length;
  if (activeCount >= 5) {
    return res.status(400).json({ error: "Limite d'emprunt atteinte ! Un membre de la bibliothèque ne peut emprunter que 5 livres au maximum." });
  }

  // 3. Unpaid penalties
  const allPenalties = await db.getPenalties();
  const unpaidPenalty = allPenalties.find(p => p.user_id === userObj.id && p.status === 'unpaid');
  if (unpaidPenalty) {
    return res.status(400).json({ error: "Le membre a des pénalités de retard impayées. Veuillez régulariser sa situation." });
  }

  // Check if there is an active reservation for this book by this user
  const allReservations = await db.getReservations();

  // 3b. Duplicate check: cannot reserve or borrow twice
  const existingBorrow = allBorrowings.find(b => b.book_id === bookObj.id && b.user_id === userObj.id && (b.status === 'active' || b.status === 'overdue'));
  const existingRes = allReservations.find(r => r.book_id === bookObj.id && r.user_id === userObj.id && (r.status === 'pending' || r.status === 'fulfilled'));
  if (existingBorrow || existingRes) {
    return res.status(400).json({ error: "Vous en avez déjà emprunté ou réservé ce livre." });
  }

  const userReservation = allReservations.find(r => r.book_id === bookObj.id && r.user_id === userObj.id && (r.status === 'fulfilled' || r.status === 'pending'));

  const isFulfilledReservation = userReservation && userReservation.status === 'fulfilled';

  // 4. Stock availability
  if (!isFulfilledReservation && bookObj.available_quantity <= 0) {
    return res.status(400).json({ error: "Stock épuisé ! Aucun exemplaire n'est disponible au prêt pour ce livre." });
  }

  // Create borrowing
  const borrowedAt = new Date();
  const dueDate = new Date();
  dueDate.setDate(borrowedAt.getDate() + 14); // 2 semaines de prêt standard

  const newBorrow = await db.addBorrowing({
    user_id: userObj.id,
    book_id: bookObj.id,
    borrowed_at: borrowedAt.toISOString(),
    due_date: dueDate.toISOString(),
    returned_at: null,
    renewed_count: 0,
    status: 'active'
  });

  // Decrement book stock (only if copy wasn't already held for them by reservation)
  if (!isFulfilledReservation) {
    await db.updateBook(bookObj.id, {
      available_quantity: bookObj.available_quantity - 1
    });
  }

  // Mark reservation as redeemed/completed (cancelled so it doesn't show as active)
  if (userReservation) {
    await db.updateReservation(userReservation.id, { status: 'cancelled' });
  }

  // Add notification
  await db.addNotification({
    user_id: userObj.id,
    title: "Nouveau prêt enregistré",
    message: `Le prêt professionnel de '${bookObj.title}' est enregistré. Date de retour attendue : ${dueDate.toLocaleDateString('fr-FR')}.`,
    type: "info",
    is_read: false,
    created_at: new Date().toISOString()
  });

  // Log action
  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Enregistrement d'emprunt",
    target: `Livre: ${bookObj.title} - Membre: ${userObj.firstname} ${userObj.lastname}`,
    timestamp: new Date().toISOString()
  });

  return res.json(newBorrow);
}));
api.post('/borrowings/return', asyncHandler(async (req, res) => {
  const { borrowing_id } = req.body;
  const allBorrowings = await db.getBorrowings();
  const borrowIndex = allBorrowings.findIndex(b => b.id === parseInt(borrowing_id));
  if (borrowIndex === -1) return res.status(404).json({ error: "Emprunt non trouvé." });

  const borrow = allBorrowings[borrowIndex];
  if (borrow.status === 'returned') {
    return res.status(400).json({ error: "Cet emprunt a déjà été retourné." });
  }

  const bookObj = await db.getBookById(borrow.book_id);
  const userObj = await db.getUserById(borrow.user_id);

  const now = new Date();
  const updatedBorrow = await db.updateBorrowing(borrow.id, {
    returned_at: now.toISOString(),
    status: 'returned'
  });

  // Increment stock
  if (bookObj) {
    await db.updateBook(bookObj.id, {
      available_quantity: Math.min(bookObj.quantity, bookObj.available_quantity + 1)
    });
  }

  // Handle fine tracking (mark as paid, or if returned overdue keep penalty status unpaid but save state)
  const allPenalties = await db.getPenalties();
  const penalty = allPenalties.find(p => p.borrowing_id === borrow.id);
  
  await db.addNotification({
    user_id: borrow.user_id,
    title: "Retour de livre enregistré",
    message: `Merci d'avoir retourné '${bookObj ? bookObj.title : 'Livre'}'. Votre compte a été mis à jour.`,
    type: "success",
    is_read: false,
    created_at: now.toISOString()
  });

  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Retour de livre",
    target: `${bookObj ? bookObj.title : 'Livre'} (Membre: ${userObj ? userObj.firstname : 'N/A'})`,
    timestamp: now.toISOString()
  });

  return res.json({ success: true, borrowing: updatedBorrow, penalty });
}));

api.post('/borrowings/:id/renew', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const allBorrowings = await db.getBorrowings();
  const borrow = allBorrowings.find(b => b.id === id);
  if (!borrow) return res.status(404).json({ error: "Emprunt non trouvé." });

  if (borrow.status !== 'active') {
    return res.status(400).json({ error: "Seuls les emprunts actifs peuvent être renouvelés." });
  }

  if (borrow.renewed_count >= 1) {
    return res.status(400).json({ error: "Ce prêt a déjà été renouvelé. La limite de renouvellement est de 1 fois." });
  }

  const dueDate = new Date(borrow.due_date);
  dueDate.setDate(dueDate.getDate() + 7); // 1 semaine de prolongation

  const updatedBorrow = await db.updateBorrowing(borrow.id, {
    due_date: dueDate.toISOString(),
    renewed_count: borrow.renewed_count + 1
  });

  await db.addAuditLog({
    user: "Système",
    action: "Prolongation d'emprunt",
    target: `Prêt #${borrow.id}`,
    timestamp: new Date().toISOString()
  });

  return res.json(updatedBorrow);
}));

// ---------------- GESTION DES PÉNALITÉS ----------------
api.get('/penalties', asyncHandler(async (req, res) => {
  await recalculatePenalties();
  const allPenalties = await db.getPenalties();
  const allUsers = await db.getUsers();
  const allBorrowings = await db.getBorrowings();
  const allBooks = await db.getBooks();

  const enriched = allPenalties.map(p => {
    const userObj = allUsers.find(u => u.id === p.user_id);
    const borrowObj = allBorrowings.find(b => b.id === p.borrowing_id);
    const bookObj = borrowObj ? allBooks.find(bk => bk.id === borrowObj.book_id) : null;
    return {
      ...p,
      user_name: userObj ? `${userObj.firstname} ${userObj.lastname}` : "Membre inconnu",
      user_email: userObj ? userObj.email : "N/A",
      book_title: bookObj ? bookObj.title : "Livre inconnu"
    };
  });
  return res.json(enriched);
}));

api.post('/penalties/:id/pay', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const allPenalties = await db.getPenalties();
  const penalty = allPenalties.find(p => p.id === id);
  if (!penalty) return res.status(404).json({ error: "Pénalité non trouvée." });

  const updatedPenalty = await db.updatePenalty(id, { status: 'paid' });
  
  // Unsuspend member if no other unpaid penalties exist
  const unpaid = allPenalties.filter(p => p.user_id === penalty.user_id && p.status === 'unpaid' && p.id !== id);
  if (unpaid.length === 0) {
    const user = await db.getUserById(penalty.user_id);
    if (user && user.status === 'suspended') {
      await db.updateUserStatus(user.id, 'active');
    }
  }

  await db.addAuditLog({
    user: "Sophie Dubois",
    action: "Règlement amende",
    target: `Pénalité #${penalty.id} (Montant: ${penalty.amount} CFA)`,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, penalty: updatedPenalty });
}));

// ---------------- RESERVATIONS & NOTIFS & STATS ----------------
api.get('/reservations', asyncHandler(async (req, res) => {
  const allReservations = await db.getReservations();
  const allUsers = await db.getUsers();
  const allBooks = await db.getBooks();

  const enriched = allReservations.map(r => {
    const userObj = allUsers.find(u => u.id === r.user_id);
    const bookObj = allBooks.find(b => b.id === r.book_id);
    return {
      ...r,
      user_name: userObj ? `${userObj.firstname} ${userObj.lastname}` : "Membre inconnu",
      user_email: userObj ? userObj.email : "N/A",
      book_title: bookObj ? bookObj.title : "Livre inconnu",
      book_isbn: bookObj ? bookObj.isbn : "",
      book_cover: bookObj ? bookObj.cover_image : ""
    };
  });
  return res.json(enriched);
}));

api.post('/reservations', asyncHandler(async (req, res) => {
  const { user_id, book_id } = req.body;
  if (!user_id || !book_id) {
    return res.status(400).json({ error: "Champs d'identification requis." });
  }

  const userObj = await db.getUserById(parseInt(user_id));
  const bookObj = await db.getBookById(parseInt(book_id));

  if (!userObj) return res.status(404).json({ error: "Adhérent non trouvé." });
  if (!bookObj) return res.status(404).json({ error: "Ouvrage non trouvé." });

  if (userObj.status === 'suspended') {
    return res.status(400).json({ error: "Votre compte est suspendu. Impossible d'enregistrer la réservation." });
  }

  // Already reserved or borrowed?
  const allReservations = await db.getReservations();
  const allBorrowings = await db.getBorrowings();
  const alreadyReserved = allReservations.some(r => r.book_id === bookObj.id && r.user_id === userObj.id && (r.status === 'pending' || r.status === 'fulfilled'));
  const alreadyBorrowed = allBorrowings.some(b => b.book_id === bookObj.id && b.user_id === userObj.id && (b.status === 'active' || b.status === 'overdue'));
  if (alreadyReserved || alreadyBorrowed) {
    return res.status(400).json({ error: "Vous en avez déjà emprunté ou réservé ce livre." });
  }

  const now = new Date();
  const expires = new Date();
  expires.setDate(now.getDate() + 3); // 3 jours de rétention pour récupération

  let queuePosition = 0;
  let isHeldOnShelf = false;

  if (bookObj.available_quantity > 0) {
    // Hold a copy on shelf for this reservation
    await db.updateBook(bookObj.id, {
      available_quantity: bookObj.available_quantity - 1
    });
    isHeldOnShelf = true;
  } else {
    // Enqueue on waiting list
    const existingQueueCount = allReservations.filter(r => r.book_id === bookObj.id && r.status === 'pending').length;
    queuePosition = existingQueueCount + 1;
  }

  const newRes = await db.addReservation({
    user_id: userObj.id,
    book_id: bookObj.id,
    reserved_at: now.toISOString(),
    expires_at: expires.toISOString(),
    status: isHeldOnShelf ? 'fulfilled' : 'pending'
  });

  const message = isHeldOnShelf 
    ? `Votre réservation pour '${bookObj.title}' est active. Un exemplaire vous est réservé en rayon. Veuillez le récupérer avant le ${expires.toLocaleDateString('fr-FR')}.`
    : `L'ouvrage n'est pas disponible actuellement. Votre réservation pour '${bookObj.title}' a été placée en file d'attente (Position #${queuePosition}). Vous serez notifié dès son retour en rayon !`;

  await db.addNotification({
    user_id: userObj.id,
    title: isHeldOnShelf ? "Réservation en rayon — Sphera" : "Ajouté à la file d'attente — Sphera",
    message: message,
    type: isHeldOnShelf ? "success" : "alert",
    is_read: false,
    created_at: now.toISOString()
  });

  await db.addAuditLog({
    user: `${userObj.firstname} ${userObj.lastname}`,
    action: isHeldOnShelf ? "Réservation en rayon" : "File d'attente",
    target: bookObj.title,
    timestamp: now.toISOString()
  });

  return res.json({ success: true, reservation: newRes });
}));

api.post('/reservations/:id/cancel', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const allReservations = await db.getReservations();
  const r = allReservations.find(resItem => resItem.id === id);
  if (!r) return res.status(404).json({ error: "Réservation non trouvée." });

  if (r.status === 'cancelled') {
    return res.status(400).json({ error: "Cette réservation est déjà annulée." });
  }

  // If the book was held on shelf, release it
  if (r.status === 'fulfilled') {
    const bookObj = await db.getBookById(r.book_id);
    if (bookObj) {
      await db.updateBook(bookObj.id, {
        available_quantity: Math.min(bookObj.quantity, bookObj.available_quantity + 1)
      });
    }
  }

  const updated = await db.updateReservation(id, { status: 'cancelled' });

  // Add audit log
  const userObj = await db.getUserById(r.user_id);
  const bookObj = await db.getBookById(r.book_id);
  await db.addAuditLog({
    user: userObj ? `${userObj.firstname} ${userObj.lastname}` : "Système",
    action: "Annulation de réservation",
    target: bookObj ? bookObj.title : `Livre #${r.book_id}`,
    timestamp: new Date().toISOString()
  });

  return res.json({ success: true, reservation: updated });
}));

api.get('/notifications', asyncHandler(async (req, res) => {
  const allNotifications = await db.getNotifications();
  return res.json(allNotifications);
}));

api.post('/notifications/mark-all-read', asyncHandler(async (req, res) => {
  await db.readAllNotifications();
  return res.json({ success: true });
}));

api.get('/audit-logs', asyncHandler(async (req, res) => {
  const logs = await db.getAuditLogs();
  return res.json(logs);
}));

api.get('/stats', asyncHandler(async (req, res) => {
  await recalculatePenalties();
  const allUsers = await db.getUsers();
  const allBooks = await db.getBooks();
  const allBorrowings = await db.getBorrowings();
  const allPenalties = await db.getPenalties();
  const allCategories = await db.getCategories();

  const activeLoans = allBorrowings.filter(b => b.status === 'active' || b.status === 'overdue').length;
  const overdueCount = allBorrowings.filter(b => b.status === 'overdue').length;
  const totalSubscribers = allUsers.filter(u => u.role === 'member').length;
  const totalRevenue = allPenalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  // Dynamic calculation of borrowings and returns per month (last 6 months)
  const monthlyLoans: any[] = [];
  const monthNamesList = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const shortLabel = monthNamesList[monthIndex];

    const empruntsCount = allBorrowings.filter(b => {
      if (!b.borrowed_at) return false;
      const bDate = new Date(b.borrowed_at);
      return bDate.getMonth() === monthIndex && bDate.getFullYear() === year;
    }).length;

    const retoursCount = allBorrowings.filter(b => {
      if (!b.returned_at) return false;
      const rDate = new Date(b.returned_at);
      return rDate.getMonth() === monthIndex && rDate.getFullYear() === year;
    }).length;

    monthlyLoans.push({
      name: shortLabel,
      emprunts: empruntsCount || 0,
      retours: retoursCount || 0
    });
  }

  // Category distributions
  const categoryStats = allCategories.map(c => {
    const count = allBooks.filter(b => b.category_id === c.id).length;
    return { name: c.name, value: count };
  });

  // Most popular books ranking
  const popularBooks = allBooks.map(b => {
    const count = allBorrowings.filter(bk => bk.book_id === b.id).length;
    return { title: b.title, count };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  return res.json({
    books_available: allBooks.reduce((sum, b) => sum + b.available_quantity, 0),
    books_total: allBooks.reduce((sum, b) => sum + b.quantity, 0),
    active_loans_count: activeLoans,
    overdue_loans_count: overdueCount,
    members_count: totalSubscribers,
    revenue_amount: totalRevenue,
    monthly_loans: monthlyLoans,
    category_stats: categoryStats,
    popular_books: popularBooks
  });
}));

// ---------------- INTELLIGENT RECOMMENDATION SYSTEM & CHAT (GEMINI POWERED) ----------------
api.post('/recommender', asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  const userObj = await db.getUserById(parseInt(user_id));
  if (!userObj) {
    return res.status(404).json({ error: "Utilisateur non trouvé" });
  }

  const allBorrowings = await db.getBorrowings();
  const allBooks = await db.getBooks();
  const allAuthors = await db.getAuthors();
  const allCategories = await db.getCategories();

  // Find user borrowing history or category interests
  const userBorrowIds = allBorrowings.filter(b => b.user_id === userObj.id).map(b => b.book_id);
  const userBorrowTitles = allBooks.filter(b => userBorrowIds.includes(b.id)).map(b => b.title).join(", ");
  const favCategory = userObj.membership_type === 'Premium' ? "Philosophie & Essais, Science-Fiction" : "Roman, Contes";

  if (!ai) {
    // Elegant fallback if no key is configured
    const fallbackRecs = allBooks
      .filter(b => b.status === 'available')
      .slice(0, 3)
      .map(b => ({
        id: b.id,
        title: b.title,
        reason: "Populaire dans la catégorie " + allCategories.find(c => c.id === b.category_id)?.name,
        matchScore: 92
      }));
    return res.json({ recommendations: fallbackRecs });
  }

  try {
    const catalogString = allBooks.map(b => `[ID: ${b.id}, Titre: "${b.title}", Auteur: "${allAuthors.find(a => a.id === b.author_id)?.name}", Catégorie: "${allCategories.find(c => c.id === b.category_id)?.name}", Description: "${b.description}"]`).join("\n");

    const prompt = `Voici le profil de notre membre de bibliothèque :
Nom complet : ${userObj.firstname} ${userObj.lastname}
Formule : ${userObj.membership_type} (Intérêts privilégiés : ${favCategory})
Historique des livres déjà lus/empruntés : ${userBorrowTitles || 'Aucun pour le moment.'}

Voici le catalogue de livres disponibles chez BiblioSphere :
${catalogString}

Veuillez sélectionner exactement 3 livres dans le catalogue ci-dessus qui correspondent le mieux à ce profil pour lui faire des recommandations ultra-généreuses et personnalisées.
Retournez UNIQUE un JSON structuré valide correspondant exactement à cette structure :
{
  "recommendations": [
    {
      "id": 1,
      "title": "Nom du livre sélectionné",
      "reason": "Explication conviviale et engageante à la première personne ou style architecte, expliquant pourquoi ce livre plaira au membre en s'appuyant sur ses intérêts.",
      "matchScore": 95
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Tu es le moteur de recommandation IA sophistiqué de la bibliothèque intelligente BiblioSphere. Tu t'exprimes en français d'une manière incroyablement professionnelle et engageante. Tu retournes exclusivement un format JSON conforme."
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.warn("AI Recommendation API currently unavailable (or rate-limited / high demand). Message:", error?.message || error);
    const fallbackRecs = allBooks.slice(0, 3).map(b => ({
      id: b.id,
      title: b.title,
      reason: "Sélection premium de la semaine par notre comité de lecture",
      matchScore: 88
    }));
    return res.json({ recommendations: fallbackRecs });
  }
}));

// Offline resilience helper for chatbot when Gemini is unavailable or rate-limited
function getOfflineResponse(message: string, userObj: any, allBooks: Book[], allAuthors: Author[], allCategories: Category[]): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("bonjour") || msg.includes("salut") || msg.includes("hello") || msg.includes("coucou") || msg.includes("hey")) {
    return `**Sphera Intel (Mode Résilience)** 👋
Bonjour ${userObj.firstname} ! Je suis Sphera, l'intelligence de BiblioSphere. 

Actuellement, je fonctionne en **mode hors-ligne sécurisé** en raison d'un pic d'activité réseau ou d'une limitation temporaire de mon modèle de neurone principal. 

Mais pas d'inquiétude ! Je reste à votre entière disposition pour répondre à toutes vos questions concernant le fonctionnement de notre bibliothèque, les règles de prêt ou les pénalités. Comment puis-je vous aider aujourd'hui ?`;
  }
  
  if (msg.includes("pret") || msg.includes("prêt") || msg.includes("emprunt") || msg.includes("regle") || msg.includes("règle") || msg.includes("duree") || msg.includes("durée")) {
    return `**Sphera Intel (Mode Résilience)** 📚
Voici les règles d'emprunt au sein de BiblioSphere de manière claire :

1. **Nombre d'emprunts** : Vous pouvez emprunter jusqu'à **5 livres** simultanément en tant que membre actif.
2. **Durée initiale** : La durée par défaut de chaque prêt est de **14 jours**.
3. **Restitution** : Veillez à ramener les ouvrages à temps pour ne pas pénaliser les autres membres inscrits sur nos listes d'attente prioritaires.

Avez-vous d'autres questions sur ces modalités ?`;
  }

  if (msg.includes("prolong") || msg.includes("extension") || msg.includes("retard") || msg.includes("rendre") || msg.includes("delai") || msg.includes("délai")) {
    return `**Sphera Intel (Mode Résilience)** ⏳
Concernant la gestion du temps et les retards chez BiblioSphere :

- **Prolongation** : Vous pouvez demander une prolongation d'emprunt de **+7 jours**. Celle-ci est autorisée **1 seule fois par prêt**, uniquement si le livre n'a pas déjà été réservé par un autre membre du catalogue.
- **Retour** : Vous pouvez retourner un livre à tout moment via notre onglet "Prêts & Retours" ou en le rapportant auprès d'un de nos bibliothécaires.

Souhaitez-vous des précisions sur le calcul des retards ?`;
  }

  if (msg.includes("frais") || msg.includes("penalit") || msg.includes("pénalit") || msg.includes("amend") || msg.includes("argent") || msg.includes("tarif") || msg.includes("fcfa")) {
    return `**Sphera Intel (Mode Résilience)** 💸
En cas de dépassement de la durée de prêt, le règlement de BiblioSphere s'applique afin d'assurer la bonne rotation de nos ressources :

- **Taux de pénalité** : **500 FCFA par jour de retard** et par livre.
- **Perte ou détérioration** : En cas d'endommagement, des frais équivalents au prix du livre neuf s'appliquent.
- **Paiements** : Vous pouvez consulter et acquitter vos frais directement depuis l'onglet **"Frais & Pénalités"**.

N'hésitez pas à régulariser votre solde au plus tôt pour réactiver pleinement vos droits d'emprunt !`;
  }

  if (msg.includes("livre") || msg.includes("catalog") || msg.includes("recommand") || msg.includes("conseil") || msg.includes("choix") || msg.includes("lire")) {
    const randomBooks = allBooks.slice(0, 3);
    const booksList = randomBooks.map(b => {
      const authorName = allAuthors.find(a => a.id === b.author_id)?.name || "Auteur Sphera";
      const catName = allCategories.find(c => c.id === b.category_id)?.name || "Général";
      return `- **${b.title}** de *${authorName}* (Catégorie: ${catName}, Emplacement: ${b.shelf_location || 'A-1'})`;
    }).join("\n");

    return `**Sphera Intel (Mode Résilience)** 📖
Puisque le service de recommandation sémantique par IA se repose momentanément, je vous suggère ces trois excellents choix issus directement du catalogue de la bibliothèque :

${booksList}

Vous pouvez naviguer vers l'onglet **"Catalogue des Livres"** pour rechercher vos domaines favoris (Philosophie, Informatique, Romans) et valider votre réservation !`;
  }

  return `**Sphera Intel (Mode Résilience)** ✨
Je prends bien note de votre question concernant : *"${message}"*.

En raison d'une forte demande passagère sur mon API de réseau de neurones principal (Régulation de charge temporaire ou quotas d'IA atteints), je ne peux pas formuler de réponse sur-mesure pour ce sujet spécifique.

Cependant, en tant que guide intelligent autonome de BiblioSphere, je peux vous confirmer ceci :
- **Règles des prêts** : Max 5 livres simultanés pour une durée de 14 jours.
- **Pénalités** : 500 FCFA par jour de retard.
- **Prolongation** : +7 jours supplémentaires, une seule fois.
- **Livres phares dispos** : ${allBooks.slice(0, 3).map(b => b.title).join(', ')}.

N'hésitez pas à explorer notre interface riche en fonctionnalités ou à retenter dans quelques instants pour réactiver mon cerveau principal !`;
}

// Chat assistant with AI librarian Sphera
api.post('/chat', asyncHandler(async (req, res) => {
  const { message, history, userObj } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant" });

  const currentUser = userObj || { firstname: "Visiteur", lastname: "BiblioSphere", role: "member" };

  const allBooks = await db.getBooks();
  const allAuthors = await db.getAuthors();
  const allCategories = await db.getCategories();
  const allBorrowings = await db.getBorrowings();

  if (!ai) {
    const offlineText = getOfflineResponse(message, currentUser, allBooks, allAuthors, allCategories);
    return res.json({ reply: offlineText });
  }

  try {
    const catalogString = allBooks.map(b => `- ${b.title} par ${allAuthors.find(a => a.id === b.author_id)?.name} (ISBN: ${b.isbn}, Dispo: ${b.available_quantity}/${b.quantity}, Emplacement: ${b.shelf_location})`).join("\n");
    const activeUserLoans = allBorrowings.filter(b => b.user_id === currentUser.id && b.status === 'active');
    const systemInstruction = `Tu es Sphera, l'assistante bibliothécaire IA de BiblioSphere, une plateforme SaaS moderne de gestion intelligente de bibliothèque.
Tu t'adresses de manière chaleureuse, polpolie et extrêmement compétente à ${currentUser.firstname} ${currentUser.lastname} (Rôle: ${currentUser.role}).
Tu disposes des informations de catalogue en temps réel suivantes :
${catalogString}

Règles de fonctionnement de la bibliothèque :
- Prêts : max 5 livres par membre. Durée par défaut de 14 jours.
- Prolongation : 1 fois seulement par prêt (+7 jours).
- Pénalité : 500 FCFA par jour de retard.

Aide le membre à trouver un livre, conseille-le, réponds à ses questions sur ses droits ou l'utilisation du logiciel. Structure tes réponses avec un markdown clair, des listes à puces et des emojis appropriés.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...(history || []).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    return res.json({ reply: response.text });

  } catch (error: any) {
    console.warn("Librarian Chat API currently unavailable (or rate-limited / high demand). Message:", error?.message || error);
    const offlineText = getOfflineResponse(message, currentUser, allBooks, allAuthors, allCategories);
    return res.json({ reply: offlineText });
  }
}));

// ---------------- HEALTH & CONNECTIVITY DIAGNOSTICS ----------------
api.get('/health', asyncHandler(async (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      mode: dbMode,
      connected: dbMode === 'supabase'
    }
  };
  return res.json(status);
}));

app.use('/api', api);
app.use('/', api);

// Global Express Error Handler Middleware (returns JSON errors, never HTML)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error Handler caught:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Une erreur interne s'est produite sur le serveur.";
  res.status(status).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ---------------- SERVER AND VITE MIDDLEWARE CONFIG ----------------
const port = 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production' || (typeof __filename !== 'undefined' && (__filename.endsWith('.cjs') || __filename.includes('dist')));

  if (!isProduction) {
    console.log("Starting Full-stack Server in DEVELOPMENT Mode with Live Watch...");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("Starting Full-stack Server in PRODUCTION Mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(port, () => {
      console.log(`BiblioSphere running flawlessly on http://localhost:${port}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error("Critical error starting server:", err);
  });
}

export default app;
