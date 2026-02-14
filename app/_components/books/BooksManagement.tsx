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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";
import { Book } from "@/app/types/library";

interface BookFilters {
  category?: string;
  genre?: string;
  status?: string;
  author?: string;
  publisher?: string;
  shelfLocation?: string;
}

export default function BooksManagement() {
  const { books, deleteBook, setBooks, authToken } = useLibraryStore();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState<BookFilters>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", authToken, searchQuery, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (filters.category) {
        params.category = filters.category;
      }
      if (filters.genre) {
        params.genre = filters.genre;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.author) {
        params.bookAuthor = filters.author;
      }
      if (filters.publisher) {
        params.publisher = filters.publisher;
      }
      if (filters.shelfLocation) {
        params.shelfLocation = filters.shelfLocation;
      }

      const response = await apiClient.get("/books", { params });
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Book> }) => {
      const response = await apiClient.put(`/books/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch books
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: any) => {
      console.error("Failed to update book:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update book. Please try again.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (bookId: string) => {
      const response = await apiClient.delete(`/books/${bookId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch books
      queryClient.invalidateQueries({ queryKey: ["books"] });
      handleMenuClose();
    },
    onError: (error: any) => {
      console.error("Failed to delete book:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete book. Please try again.",
      );
    },
  });

  const handleEdit = () => {
    if (selectedBook) {
      const book = books.find((b) => b.id === selectedBook);
      if (book) {
        setBookToEdit(book);
        setOpenAddDialog(true);
        handleMenuClose();
      }
    }
  };

  const handleDelete = () => {
    if (selectedBook) {
      if (confirm("Are you sure you want to delete this book?")) {
        deleteMutation.mutate(selectedBook);
      }
    }
  };

  // Books are already filtered by the API
  const filteredBooks = books;

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
            onClick={() => setOpenFilterDialog(true)}
            sx={{ minWidth: 120 }}
          >
            Filters
            {Object.keys(filters).length > 0 && (
              <Chip
                label={Object.keys(filters).length}
                size="small"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
                color="primary"
              />
            )}
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
        <MenuItem onClick={handleEdit}>
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
        onClose={() => {
          setOpenAddDialog(false);
          setBookToEdit(null);
        }}
        bookToEdit={bookToEdit}
      />

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Books</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Author"
                value={filters.author || ""}
                onChange={(e) =>
                  setFilters({ ...filters, author: e.target.value })
                }
                placeholder="Filter by author name"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Publisher"
                value={filters.publisher || ""}
                onChange={(e) =>
                  setFilters({ ...filters, publisher: e.target.value })
                }
                placeholder="Filter by publisher"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Shelf Location"
                value={filters.shelfLocation || ""}
                onChange={(e) =>
                  setFilters({ ...filters, shelfLocation: e.target.value })
                }
                placeholder="e.g., A-12"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ""}
                  label="Category"
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  native
                >
                  <option value=""></option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Biography">Biography</option>
                  <option value="Science">Science</option>
                  <option value="Technology">Technology</option>
                  <option value="History">History</option>
                  <option value="Religion">Religion</option>
                  <option value="Self-Help">Self-Help</option>
                  <option value="Children">Children</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Drama">Drama</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Genre</InputLabel>
                <Select
                  value={filters.genre || ""}
                  label="Genre"
                  onChange={(e) =>
                    setFilters({ ...filters, genre: e.target.value })
                  }
                  native
                >
                  <option value=""></option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Horror">Horror</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Classic">Classic</option>
                  <option value="Crime">Crime</option>
                  <option value="Dystopian">Dystopian</option>
                  <option value="Other">Other</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ""}
                  label="Status"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  native
                >
                  <option value=""></option>
                  <option value="Available">Available</option>
                  <option value="Borrowed">Borrowed</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Lost">Lost</option>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFilters({});
              setOpenFilterDialog(false);
            }}
            color="inherit"
          >
            Clear All
          </Button>
          <Button onClick={() => setOpenFilterDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => setOpenFilterDialog(false)}
            variant="contained"
            sx={{
              bgcolor: "#3498db",
              "&:hover": {
                bgcolor: "#2980b9",
              },
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
