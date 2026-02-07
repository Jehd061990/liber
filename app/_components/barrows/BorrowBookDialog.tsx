"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import {
  Close,
  LibraryBooks,
  CalendarToday,
  Person,
  Warning,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";

interface BorrowBookDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BorrowBookDialog({
  open,
  onClose,
}: BorrowBookDialogProps) {
  const { books, readers, borrowBook, borrowRecords } = useLibraryStore();
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [borrowDate, setBorrowDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  // Get available books only
  const availableBooks = books.filter((book) => book.availableCopies > 0);

  // Get active readers only
  const activeReaders = readers.filter((reader) => reader.status === "Active");

  // Get selected book and reader details
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedReader = readers.find((r) => r.id === selectedReaderId);

  // Calculate reader's current borrowed books count
  const readerBorrowedCount = borrowRecords.filter(
    (record) =>
      record.readerId === selectedReaderId && record.status === "Active",
  ).length;

  // Auto-calculate due date based on reader's membership type
  useEffect(() => {
    if (selectedReader && borrowDate) {
      const bDate = new Date(borrowDate);
      const due = new Date(bDate);
      due.setDate(due.getDate() + selectedReader.borrowDuration);
      setDueDate(due.toISOString().split("T")[0]);
    }
  }, [selectedReader, borrowDate]);

  // Validate borrowing rules
  const validateBorrowing = () => {
    setError("");

    if (!selectedBookId) {
      setError("Please select a book");
      return false;
    }

    if (!selectedReaderId) {
      setError("Please select a reader");
      return false;
    }

    if (!selectedReader) {
      setError("Selected reader not found");
      return false;
    }

    // Check if reader has reached max books limit
    if (readerBorrowedCount >= selectedReader.maxBooks) {
      setError(
        `Reader has reached maximum borrowing limit of ${selectedReader.maxBooks} books`,
      );
      return false;
    }

    // Check if book is available
    if (!selectedBook || selectedBook.availableCopies <= 0) {
      setError("Selected book is not available");
      return false;
    }

    return true;
  };

  const handleBorrow = () => {
    if (!validateBorrowing()) {
      return;
    }

    borrowBook(selectedBookId, selectedReaderId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedBookId("");
    setSelectedReaderId("");
    setBorrowDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e0e0e0",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LibraryBooks sx={{ color: "#3498db" }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Borrow Book
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Error Alert */}
          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Select Reader */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Reader</InputLabel>
              <Select
                value={selectedReaderId}
                label="Select Reader"
                onChange={(e) => setSelectedReaderId(e.target.value)}
                startAdornment={
                  <Person sx={{ mr: 1, color: "text.secondary" }} />
                }
              >
                <MenuItem value="">
                  <em>Choose a reader</em>
                </MenuItem>
                {activeReaders.map((reader) => (
                  <MenuItem key={reader.id} value={reader.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {reader.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reader.readerId} | {reader.membershipType}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${readerBorrowedCount}/${reader.maxBooks}`}
                        size="small"
                        color={
                          readerBorrowedCount >= reader.maxBooks
                            ? "error"
                            : "success"
                        }
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Reader Info Card */}
          {selectedReader && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  bgcolor: "#e8f5e9",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #81c784",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1, color: "#2e7d32" }}
                >
                  Reader Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Membership
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.membershipType}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Books Borrowed
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {readerBorrowedCount} / {selectedReader.maxBooks}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Max Books
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.maxBooks} books
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Borrow Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.borrowDuration} days
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Select Book */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Book</InputLabel>
              <Select
                value={selectedBookId}
                label="Select Book"
                onChange={(e) => setSelectedBookId(e.target.value)}
                disabled={!selectedReaderId}
                startAdornment={
                  <LibraryBooks sx={{ mr: 1, color: "text.secondary" }} />
                }
              >
                <MenuItem value="">
                  <em>Choose a book</em>
                </MenuItem>
                {availableBooks.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {book.author} | ISBN: {book.isbn}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${book.availableCopies} available`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Book Info Card */}
          {selectedBook && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  bgcolor: "#e3f2fd",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #90caf9",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1, color: "#1565c0" }}
                >
                  Book Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedBook.category}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Publisher
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedBook.publisher}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedBook.shelfLocation}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Available
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedBook.availableCopies} /{" "}
                      {selectedBook.totalCopies}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Borrow Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Borrow Date"
              value={borrowDate}
              onChange={(e) => setBorrowDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>

          {/* Due Date (Auto-calculated) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Due Date (Auto-calculated)"
              value={dueDate}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
              helperText={
                selectedReader
                  ? `Auto-calculated based on ${selectedReader.borrowDuration} days duration`
                  : "Select a reader to auto-calculate"
              }
            />
          </Grid>

          {/* Borrowing Rules Info */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                bgcolor: "#fff3e0",
                p: 2,
                borderRadius: 1,
                border: "1px solid #ffb74d",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Warning sx={{ color: "#f57c00", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#e65100" }}
                >
                  Borrowing Rules
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#e65100", mb: 0.5 }}
              >
                • <strong>Students:</strong> Maximum 3 books, 14 days duration
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#e65100", mb: 0.5 }}
              >
                • <strong>Teachers:</strong> Maximum 5 books, 30 days duration
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#e65100" }}
              >
                • <strong>Staff:</strong> Maximum 5 books, 30 days duration
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: "1px solid #e0e0e0",
          px: 3,
          py: 2,
        }}
      >
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleBorrow}
          variant="contained"
          disabled={!selectedBookId || !selectedReaderId}
          sx={{
            bgcolor: "#3498db",
            "&:hover": {
              bgcolor: "#2980b9",
            },
          }}
        >
          Borrow Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}
