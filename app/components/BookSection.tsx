"use client";

import { Box, Typography } from "@mui/material";
import BookCard from "./BookCard";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
}

interface BookSectionProps {
  title: string;
  books: Book[];
  variant?: "horizontal" | "grid";
}

export default function BookSection({
  title,
  books,
  variant = "horizontal",
}: BookSectionProps) {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          mb: 2,
          color: "#333",
          fontSize: 18,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={
          variant === "horizontal"
            ? {
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 2,
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "#f0f0f0",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "#ccc",
                  borderRadius: 4,
                  "&:hover": {
                    bgcolor: "#999",
                  },
                },
              }
            : {
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 2,
              }
        }
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            id={book.id}
            title={book.title}
            author={book.author}
            coverImage={book.coverImage}
            rating={book.rating}
          />
        ))}
      </Box>
    </Box>
  );
}
