// Book Management Types
export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string; // Display name (frontend)
  bookAuthor?: string; // API field name
  publisher: string;
  category: string;
  genre: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  status: "Available" | "Borrowed" | "Reserved" | "Lost";
  coverImage?: string;
  barcode?: string;
  qrCode?: string;
  rating?: number;
  description?: string;
  publishedYear?: number;
}

// Reader/Member Management Types
export type MembershipType = "Student" | "Teacher" | "Staff";
export type MemberStatus = "Active" | "Suspended";

export interface Reader {
  id: string;
  readerId: string;
  studentId?: string;
  name: string;
  email: string;
  phone: string;
  membershipType: MembershipType;
  status: MemberStatus;
  registrationDate: Date;
  maxBooks: number;
  borrowDuration: number; // in days
}

// Borrowing & Returning Types
export interface BorrowRecord {
  id: string;
  bookId: string;
  readerId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: "Active" | "Returned" | "Overdue";
  fine?: number;
}

// Fines & Penalties Types
export interface Fine {
  id: string;
  borrowRecordId: string;
  readerId: string;
  amount: number;
  reason: string;
  status: "Paid" | "Unpaid";
  createdDate: Date;
  paidDate?: Date;
}

// Reservation Types
export interface Reservation {
  id: string;
  bookId: string;
  readerId: string;
  reservationDate: Date;
  status: "Pending" | "Notified" | "Fulfilled" | "Cancelled";
  queuePosition: number;
}

// User Roles
export type UserRole = "Admin" | "Librarian" | "Reader";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

// Dashboard Stats
export interface MainDashboardStats {
  totalBooks: number;
  activeReaders: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalFines: number;
  pendingReservations: number;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  genre?: string;
  author?: string;
  availability?: "Available" | "Borrowed" | "Reserved" | "All";
  isbn?: string;
}
