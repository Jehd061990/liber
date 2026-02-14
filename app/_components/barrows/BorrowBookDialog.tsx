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
  FormHelperText,
} from "@mui/material";
import {
  Close,
  LibraryBooks,
  CalendarToday,
  Person,
  Warning,
} from "@mui/icons-material";
import { useEffect } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import { Controller, useForm } from "react-hook-form";

interface BorrowBookDialogProps {
  open: boolean;
  onClose: () => void;
}

interface BorrowBookFormValues {
  readerId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
}

export default function BorrowBookDialog({
  open,
  onClose,
}: BorrowBookDialogProps) {
  const { books, readers, borrowBook, borrowRecords } = useLibraryStore();
  const today = new Date().toISOString().split("T")[0];
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<BorrowBookFormValues>({
    defaultValues: {
      readerId: "",
      bookId: "",
      borrowDate: today,
      dueDate: "",
    },
  });

  const selectedReaderId = watch("readerId");
  const selectedBookId = watch("bookId");
  const borrowDate = watch("borrowDate");
  const dueDate = watch("dueDate");

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
      setValue("dueDate", due.toISOString().split("T")[0], {
        shouldDirty: true,
        shouldValidate: false,
      });
    } else {
      setValue("dueDate", "", { shouldDirty: true, shouldValidate: false });
    }
  }, [selectedReader, borrowDate, setValue]);

  // Validate borrowing rules
  const validateBorrowing = () => {
    clearErrors("root");

    if (!selectedBookId) {
      setError("bookId", { type: "manual", message: "Please select a book" });
      return false;
    }

    if (!selectedReaderId) {
      setError("readerId", {
        type: "manual",
        message: "Please select a reader",
      });
      return false;
    }

    if (!selectedReader) {
      setError("root", {
        type: "manual",
        message: "Selected reader not found",
      });
      return false;
    }

    // Check if reader has reached max books limit
    if (readerBorrowedCount >= selectedReader.maxBooks) {
      setError("root", {
        type: "manual",
        message: `Reader has reached maximum borrowing limit of ${selectedReader.maxBooks} books`,
      });
      return false;
    }

    // Check if book is available
    if (!selectedBook || selectedBook.availableCopies <= 0) {
      setError("root", {
        type: "manual",
        message: "Selected book is not available",
      });
      return false;
    }

    return true;
  };

  const handleBorrow = handleSubmit(() => {
    if (!validateBorrowing()) {
      return;
    }

    borrowBook(selectedBookId, selectedReaderId);
    handleClose();
  });

  const handleClose = () => {
    reset({
      readerId: "",
      bookId: "",
      borrowDate: today,
      dueDate: "",
    });
    clearErrors();
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
          {errors.root?.message && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error" onClose={() => clearErrors("root")}>
                {errors.root.message}
              </Alert>
            </Grid>
          )}

          {/* Select Reader */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="readerId"
              control={control}
              rules={{ required: "Please select a reader" }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.readerId}>
                  <InputLabel>Select Reader</InputLabel>
                  <Select
                    {...field}
                    label="Select Reader"
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
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {reader.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                  <FormHelperText>{errors.readerId?.message}</FormHelperText>
                </FormControl>
              )}
            />
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
            <Controller
              name="bookId"
              control={control}
              rules={{ required: "Please select a book" }}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.bookId}>
                  <InputLabel>Select Book</InputLabel>
                  <Select
                    {...field}
                    label="Select Book"
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
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {book.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                  <FormHelperText>{errors.bookId?.message}</FormHelperText>
                </FormControl>
              )}
            />
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
            <Controller
              name="borrowDate"
              control={control}
              rules={{ required: "Borrow date is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type="date"
                  label="Borrow Date"
                  error={!!errors.borrowDate}
                  helperText={errors.borrowDate?.message}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Due Date (Auto-calculated) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
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
              )}
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
