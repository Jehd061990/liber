import { create } from "zustand";
import {
  Book,
  Reader,
  BorrowRecord,
  Fine,
  Reservation,
  UserRole,
  DashboardStats,
} from "../types/library";

interface LibraryState {
  // Current user
  currentUser: {
    id: string;
    name: string;
    role: UserRole;
  } | null;

  // Data
  books: Book[];
  readers: Reader[];
  borrowRecords: BorrowRecord[];
  fines: Fine[];
  reservations: Reservation[];

  // UI State
  currentView: string;
  searchQuery: string;
  selectedCategory: string | null;

  // Actions
  setCurrentUser: (
    user: { id: string; name: string; role: UserRole } | null
  ) => void;
  setCurrentView: (view: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;

  // Book Management
  addBook: (book: Book) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // Reader Management
  addReader: (reader: Reader) => void;
  updateReader: (id: string, reader: Partial<Reader>) => void;
  deleteReader: (id: string) => void;

  // Borrowing
  borrowBook: (bookId: string, readerId: string) => void;
  returnBook: (borrowRecordId: string) => void;

  // Reservations
  reserveBook: (bookId: string, readerId: string) => void;
  cancelReservation: (reservationId: string) => void;

  // Fines
  addFine: (fine: Fine) => void;
  payFine: (fineId: string) => void;

  // Dashboard
  getDashboardStats: () => DashboardStats;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  // Initial state
  currentUser: {
    id: "1",
    name: "Admin User",
    role: "Admin",
  },
  books: [],
  readers: [],
  borrowRecords: [],
  fines: [],
  reservations: [],
  currentView: "dashboard",
  searchQuery: "",
  selectedCategory: null,

  // Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  // Book Management
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  updateBook: (id, updatedBook) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === id ? { ...book, ...updatedBook } : book
      ),
    })),
  deleteBook: (id) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== id),
    })),

  // Reader Management
  addReader: (reader) =>
    set((state) => ({ readers: [...state.readers, reader] })),
  updateReader: (id, updatedReader) =>
    set((state) => ({
      readers: state.readers.map((reader) =>
        reader.id === id ? { ...reader, ...updatedReader } : reader
      ),
    })),
  deleteReader: (id) =>
    set((state) => ({
      readers: state.readers.filter((reader) => reader.id !== id),
    })),

  // Borrowing
  borrowBook: (bookId, readerId) => {
    const state = get();
    const book = state.books.find((b) => b.id === bookId);
    const reader = state.readers.find((r) => r.id === readerId);

    if (!book || !reader || book.availableCopies <= 0) return;

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + reader.borrowDuration);

    const borrowRecord: BorrowRecord = {
      id: Date.now().toString(),
      bookId,
      readerId,
      borrowDate,
      dueDate,
      status: "Active",
    };

    set((state) => ({
      borrowRecords: [...state.borrowRecords, borrowRecord],
      books: state.books.map((b) =>
        b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b
      ),
    }));
  },

  returnBook: (borrowRecordId) => {
    const state = get();
    const record = state.borrowRecords.find((r) => r.id === borrowRecordId);

    if (!record) return;

    const returnDate = new Date();
    const isOverdue = returnDate > record.dueDate;

    // Calculate fine if overdue
    if (isOverdue) {
      const daysOverdue = Math.floor(
        (returnDate.getTime() - record.dueDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const fineAmount = daysOverdue * 1; // $1 per day

      const fine: Fine = {
        id: Date.now().toString(),
        borrowRecordId: record.id,
        readerId: record.readerId,
        amount: fineAmount,
        reason: `Overdue by ${daysOverdue} days`,
        status: "Unpaid",
        createdDate: returnDate,
      };

      set((state) => ({
        fines: [...state.fines, fine],
      }));
    }

    set((state) => ({
      borrowRecords: state.borrowRecords.map((r) =>
        r.id === borrowRecordId
          ? { ...r, returnDate, status: "Returned" as const }
          : r
      ),
      books: state.books.map((b) =>
        b.id === record.bookId
          ? { ...b, availableCopies: b.availableCopies + 1 }
          : b
      ),
    }));
  },

  // Reservations
  reserveBook: (bookId, readerId) => {
    const state = get();
    const existingReservations = state.reservations.filter(
      (r) => r.bookId === bookId && r.status === "Pending"
    );

    const reservation: Reservation = {
      id: Date.now().toString(),
      bookId,
      readerId,
      reservationDate: new Date(),
      status: "Pending",
      queuePosition: existingReservations.length + 1,
    };

    set((state) => ({
      reservations: [...state.reservations, reservation],
    }));
  },

  cancelReservation: (reservationId) =>
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === reservationId ? { ...r, status: "Cancelled" as const } : r
      ),
    })),

  // Fines
  addFine: (fine) => set((state) => ({ fines: [...state.fines, fine] })),
  payFine: (fineId) =>
    set((state) => ({
      fines: state.fines.map((f) =>
        f.id === fineId
          ? { ...f, status: "Paid" as const, paidDate: new Date() }
          : f
      ),
    })),

  // Dashboard Stats
  getDashboardStats: () => {
    const state = get();
    return {
      totalBooks: state.books.length,
      activeReaders: state.readers.filter((r) => r.status === "Active").length,
      borrowedBooks: state.borrowRecords.filter((r) => r.status === "Active")
        .length,
      overdueBooks: state.borrowRecords.filter(
        (r) => r.status === "Active" && new Date() > r.dueDate
      ).length,
      totalFines: state.fines
        .filter((f) => f.status === "Unpaid")
        .reduce((sum, f) => sum + f.amount, 0),
      pendingReservations: state.reservations.filter(
        (r) => r.status === "Pending"
      ).length,
    };
  },
}));
