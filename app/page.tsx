"use client";

import { Box } from "@mui/material";
import Sidebar from "./_components/Sidebar";
import Dashboard from "./components/Dashboard";
import BooksManagement from "./components/BooksManagement";
import ReadersManagement from "./components/ReadersManagement";
import BorrowingManagement from "./components/BorrowingManagement";
import FinesManagement from "./components/FinesManagement";
import { useLibraryStore } from "./store/libraryStore";
import { useEffect } from "react";

export default function Home() {
  const { currentView, addBook } = useLibraryStore();

  // Initialize with sample books
  useEffect(() => {
    // Add sample books to the store
    const sampleBooks = [
      {
        id: "1",
        isbn: "978-1451648539",
        title: "Steve Jobs",
        author: "Walter Isaacson",
        publisher: "Simon & Schuster",
        category: "Biography",
        genre: "Non-Fiction",
        shelfLocation: "A-12",
        totalCopies: 3,
        availableCopies: 2,
        status: "Available" as const,
        coverImage:
          "https://images-na.ssl-images-amazon.com/images/I/81VStYnDGrL.jpg",
        rating: 4.5,
      },
      {
        id: "2",
        isbn: "978-1601424310",
        title: "Radical",
        author: "David Platt",
        publisher: "Multnomah Books",
        category: "Religion",
        genre: "Christian Living",
        shelfLocation: "R-05",
        totalCopies: 2,
        availableCopies: 1,
        status: "Available" as const,
        coverImage:
          "https://m.media-amazon.com/images/I/71qKQ5p3IzL._SY522_.jpg",
        rating: 4.5,
      },
      {
        id: "3",
        isbn: "978-0765378484",
        title: "Ender's Game",
        author: "Orson Scott Card",
        publisher: "Tor Books",
        category: "Fiction",
        genre: "Science Fiction",
        shelfLocation: "F-23",
        totalCopies: 5,
        availableCopies: 3,
        status: "Available" as const,
        coverImage:
          "https://m.media-amazon.com/images/I/81ot7HXZjFL._SY522_.jpg",
        rating: 4,
      },
      {
        id: "4",
        isbn: "978-1451673319",
        title: "The Perks of Being a Wallflower",
        author: "Stephen Chbosky",
        publisher: "MTV Books",
        category: "Fiction",
        genre: "Young Adult",
        shelfLocation: "F-45",
        totalCopies: 4,
        availableCopies: 2,
        status: "Available" as const,
        coverImage:
          "https://m.media-amazon.com/images/I/71S94aFZVPL._SY522_.jpg",
        rating: 3,
      },
      {
        id: "5",
        isbn: "978-0547928227",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        publisher: "Houghton Mifflin Harcourt",
        category: "Fiction",
        genre: "Fantasy",
        shelfLocation: "F-12",
        totalCopies: 6,
        availableCopies: 4,
        status: "Available" as const,
        coverImage:
          "https://m.media-amazon.com/images/I/712cDO7d73L._SY522_.jpg",
        rating: 5,
      },
    ];

    // Only add if store is empty
    const checkAndAdd = () => {
      const state = useLibraryStore.getState();
      if (state.books.length === 0) {
        sampleBooks.forEach((book) => addBook(book));
      }
    };

    checkAndAdd();
  }, [addBook]);

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "books-list":
        return <BooksManagement />;
      case "books-add":
        return <BooksManagement />;
      case "readers-list":
        return <ReadersManagement />;
      case "readers-add":
        return <ReadersManagement />;
      case "borrow-book":
        return <BorrowingManagement />;
      case "return-book":
        return <BorrowingManagement />;
      case "borrow-history":
        return <BorrowingManagement />;
      case "fines":
        return <FinesManagement />;
      case "reservations":
        return (
          <Box>
            <h2>Reservations</h2>
            <p>Coming soon...</p>
          </Box>
        );
      case "search":
        return (
          <Box>
            <h2>Search Books</h2>
            <p>Coming soon...</p>
          </Box>
        );
      case "reports":
        return (
          <Box>
            <h2>Reports</h2>
            <p>Coming soon...</p>
          </Box>
        );
      case "settings":
        return (
          <Box>
            <h2>Settings</h2>
            <p>Coming soon...</p>
          </Box>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          bgcolor: "#f8f9fa",
          overflowY: "auto",
          height: "100vh",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
}
