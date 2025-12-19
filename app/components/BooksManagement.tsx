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
import { useState } from "react";
import { useLibraryStore } from "../store/libraryStore";
import AddBookDialog from "./AddBookDialog";

export default function BooksManagement() {
  const { books, deleteBook } = useLibraryStore();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    bookId: string
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
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase())
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
            {filteredBooks.length === 0 ? (
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
