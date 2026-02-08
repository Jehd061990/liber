"use client";

import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  FilterList,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import AddBookDialog from "./AddBookDialog";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";
import { Book } from "@/app/types/library";

export default function BooksManagement() {
  const { books, deleteBook, setBooks, authToken } = useLibraryStore();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", authToken],
    queryFn: async () => {
      const response = await apiClient.get("/books");
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(authToken),
  });

  useEffect(() => {
    if (!data) return;

    const list = Array.isArray(data) ? data : (data?.books ?? []);
    const mapped = (list as any[]).map((item, index) => {
      const totalCopies = Number(item?.totalCopies ?? 1);
      const availableCopies = Number(
        item?.availableCopies ?? item?.available ?? totalCopies,
      );

      return {
        id: item?.id ?? item?._id ?? item?.isbn ?? `${Date.now()}-${index}`,
        isbn: item?.isbn ?? "",
        title: item?.title ?? "",
        author: item?.author ?? "",
        publisher: item?.publisher ?? "",
        category: item?.category ?? "Other",
        genre: item?.genre ?? "Other",
        shelfLocation: item?.shelfLocation ?? "",
        totalCopies: Number.isFinite(totalCopies) ? totalCopies : 1,
        availableCopies: Number.isFinite(availableCopies) ? availableCopies : 1,
        status: item?.status ?? "Available",
        coverImage: item?.coverImage ?? undefined,
        barcode: item?.barcode ?? undefined,
        qrCode: item?.qrCode ?? undefined,
        rating: item?.rating ?? undefined,
      } as Book;
    });

    setBooks(mapped);
  }, [data, setBooks]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    bookId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedBook(bookId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBook(null);
  };

  const handleDelete = () => {
    if (selectedBook) {
      deleteBook(selectedBook);
      handleMenuClose();
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Borrowed":
        return "warning";
      case "Reserved":
        return "info";
      case "Lost":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Books Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your library collection
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: "#3498db",
            "&:hover": {
              bgcolor: "#2980b9",
            },
          }}
        >
          Add New Book
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ minWidth: 120 }}
          >
            Filters
          </Button>
        </Box>
      </Paper>

      {/* Stats Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Books
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#3498db" }}>
            {books.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Available
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#27ae60" }}>
            {books.filter((b) => b.status === "Available").length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Borrowed
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#f39c12" }}>
            {books.filter((b) => b.status === "Borrowed").length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Lost
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            {books.filter((b) => b.status === "Lost").length}
          </Typography>
        </Paper>
      </Box>

      {/* Books Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>ISBN</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Copies
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!authToken ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Please log in to load books.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading books...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="error">
                    Failed to load books. Please try again.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No books found matching your search"
                      : 'No books added yet. Click "Add New Book" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id} hover>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {book.coverImage && (
                        <Box
                          component="img"
                          src={book.coverImage}
                          alt={book.title}
                          sx={{
                            width: 40,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {book.publisher}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={book.category}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{book.shelfLocation}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {book.availableCopies} / {book.totalCopies}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={book.status}
                      size="small"
                      color={getStatusColor(book.status) as any}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, book.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Book Dialog */}
      <AddBookDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </Box>
  );
}
