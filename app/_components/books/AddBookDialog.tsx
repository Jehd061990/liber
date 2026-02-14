"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  IconButton,
  FormHelperText,
  Grid,
} from "@mui/material";
import { Close, CloudUpload, QrCode } from "@mui/icons-material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import apiClient from "@/app/lib/apiClient";
// import { useLibraryStore } from "../store/libraryStore";
// import { Book } from "../types/library";
import { useLibraryStore } from "@/app/store/libraryStore";
import { Book } from "@/app/types/library";
import { useEffect } from "react";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
  bookToEdit?: Book | null;
}

type BookFormValues = Omit<Book, "id">;

export default function AddBookDialog({
  open,
  onClose,
  bookToEdit,
}: AddBookDialogProps) {
  const { addBook, updateBook } = useLibraryStore();
  const editMode = Boolean(bookToEdit);

  const [apiError, setApiError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    defaultValues: {
      isbn: "",
      title: "",
      author: "",
      publisher: "",
      category: "",
      genre: "",
      shelfLocation: "",
      totalCopies: 1,
      availableCopies: 1,
      status: "Available",
      coverImage: "",
      barcode: "",
      qrCode: "",
    },
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Biography",
    "Science",
    "Technology",
    "History",
    "Religion",
    "Self-Help",
    "Children",
    "Young Adult",
    "Poetry",
    "Drama",
    "Other",
  ];

  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Horror",
    "Adventure",
    "Historical Fiction",
    "Contemporary",
    "Classic",
    "Crime",
    "Dystopian",
    "Memoir",
    "Business",
    "Philosophy",
    "Psychology",
    "Other",
  ];

  const bookStatuses = ["Available", "Borrowed", "Reserved", "Lost"];

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("coverImage", reader.result as string, {
          shouldDirty: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (bookToEdit && open) {
      // Populate form with existing book data
      reset({
        isbn: bookToEdit.isbn,
        title: bookToEdit.title,
        author: bookToEdit.author,
        publisher: bookToEdit.publisher,
        category: bookToEdit.category,
        genre: bookToEdit.genre,
        shelfLocation: bookToEdit.shelfLocation,
        totalCopies: bookToEdit.totalCopies,
        availableCopies: bookToEdit.availableCopies,
        status: bookToEdit.status,
        coverImage: bookToEdit.coverImage || "",
        barcode: bookToEdit.barcode || "",
        qrCode: bookToEdit.qrCode || "",
      });
    }
  }, [bookToEdit, open, reset]);

  const onSubmit = async (data: BookFormValues) => {
    setApiError(null);
    try {
      if (editMode && bookToEdit) {
        // Update existing book
        const response = await apiClient.put(`/books/${bookToEdit.id}`, data);
        const updated = response.data?.data ?? response.data;

        const updatedBook: Book = {
          id: bookToEdit.id,
          isbn: updated?.isbn ?? data.isbn,
          title: updated?.title ?? data.title,
          author: updated?.author ?? data.author,
          publisher: updated?.publisher ?? data.publisher,
          category: updated?.category ?? data.category,
          genre: updated?.genre ?? data.genre,
          shelfLocation: updated?.shelfLocation ?? data.shelfLocation,
          totalCopies: updated?.totalCopies ?? data.totalCopies,
          availableCopies: updated?.availableCopies ?? data.availableCopies,
          status: updated?.status ?? data.status,
          coverImage: updated?.coverImage ?? data.coverImage ?? undefined,
          barcode: updated?.barcode ?? data.barcode ?? undefined,
          qrCode: updated?.qrCode ?? data.qrCode ?? undefined,
        };

        updateBook(updatedBook.id, updatedBook);
      } else {
        // Create new book
        const response = await apiClient.post("/books", data);
        const created = response.data?.data ?? response.data;

        const newBook: Book = {
          id: created?.id ?? created?._id ?? Date.now().toString(),
          isbn: created?.isbn ?? data.isbn,
          title: created?.title ?? data.title,
          author: created?.author ?? data.author,
          publisher: created?.publisher ?? data.publisher,
          category: created?.category ?? data.category,
          genre: created?.genre ?? data.genre,
          shelfLocation: created?.shelfLocation ?? data.shelfLocation,
          totalCopies: created?.totalCopies ?? data.totalCopies,
          availableCopies: created?.availableCopies ?? data.availableCopies,
          status: created?.status ?? data.status,
          coverImage: created?.coverImage ?? data.coverImage ?? undefined,
          barcode: created?.barcode ?? data.barcode ?? undefined,
          qrCode: created?.qrCode ?? data.qrCode ?? undefined,
        };

        addBook(newBook);
      }
      handleClose();
    } catch (error) {
      setApiError(
        editMode
          ? "Failed to update book. Please try again."
          : "Failed to add book. Please try again.",
      );
    }
  };

  const handleClose = () => {
    // Reset form
    reset();
    setApiError(null);
    setCoverFile(null);
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
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {editMode ? "Edit Book" : "Add New Book"}
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* ISBN */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="ISBN"
              placeholder="978-1234567890"
              error={!!errors.isbn}
              helperText={errors.isbn?.message}
              {...register("isbn", { required: "ISBN is required" })}
            />
          </Grid>

          {/* Book Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Book Status</InputLabel>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Book Status">
                    {bookStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>

          {/* Title */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Title"
              placeholder="Enter book title"
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register("title", { required: "Title is required" })}
            />
          </Grid>

          {/* Author */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Author"
              placeholder="Author name"
              error={!!errors.author}
              helperText={errors.author?.message}
              {...register("author", { required: "Author is required" })}
            />
          </Grid>

          {/* Publisher */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Publisher"
              placeholder="Publisher name"
              error={!!errors.publisher}
              helperText={errors.publisher?.message}
              {...register("publisher", { required: "Publisher is required" })}
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select {...field} label="Category">
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.category && (
                <FormHelperText>{errors.category.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Genre */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!errors.genre}>
              <InputLabel>Genre</InputLabel>
              <Controller
                name="genre"
                control={control}
                rules={{ required: "Genre is required" }}
                render={({ field }) => (
                  <Select {...field} label="Genre">
                    {genres.map((genre) => (
                      <MenuItem key={genre} value={genre}>
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.genre && (
                <FormHelperText>{errors.genre.message}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Shelf Location */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Shelf Location"
              placeholder="A-12"
              error={!!errors.shelfLocation}
              helperText={errors.shelfLocation?.message || "e.g., A-12, B-05"}
              {...register("shelfLocation", {
                required: "Shelf location is required",
              })}
            />
          </Grid>

          {/* Total Copies */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Total Copies"
              error={!!errors.totalCopies}
              helperText={errors.totalCopies?.message}
              inputProps={{ min: 1 }}
              {...register("totalCopies", {
                required: "Total copies must be at least 1",
                min: { value: 1, message: "Total copies must be at least 1" },
                valueAsNumber: true,
              })}
            />
          </Grid>

          {/* Available Copies */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Available Copies"
              error={!!errors.availableCopies}
              helperText={errors.availableCopies?.message}
              inputProps={{ min: 0 }}
              {...register("availableCopies", {
                required: "Available copies cannot be negative",
                min: {
                  value: 0,
                  message: "Available copies cannot be negative",
                },
                validate: (value) => {
                  const total = watch("totalCopies") ?? 0;
                  return (
                    value <= total ||
                    "Available copies cannot exceed total copies"
                  );
                },
                valueAsNumber: true,
              })}
            />
          </Grid>

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", mt: 1, mb: 1 }}
            >
              Optional Information
            </Typography>
          </Grid>

          {/* Book Cover Upload */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ height: 56 }}
              >
                Upload Book Cover
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleCoverUpload}
                />
              </Button>
              {coverFile && (
                <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                  {coverFile.name}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Cover Preview */}
          {watch("coverImage") && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  height: 150,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={watch("coverImage") as string}
                  alt="Cover preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Grid>
          )}

          {/* Barcode */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Barcode"
              placeholder="Enter barcode number"
              {...register("barcode")}
            />
          </Grid>

          {/* QR Code */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="QR Code"
              placeholder="Enter QR code data"
              InputProps={{
                endAdornment: (
                  <IconButton size="small">
                    <QrCode />
                  </IconButton>
                ),
              }}
              {...register("qrCode")}
            />
          </Grid>
        </Grid>
        {apiError && (
          <Typography sx={{ mt: 2 }} color="error">
            {apiError}
          </Typography>
        )}
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
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: "#3498db",
            "&:hover": {
              bgcolor: "#2980b9",
            },
          }}
        >
          {isSubmitting
            ? editMode
              ? "Updating..."
              : "Adding..."
            : editMode
              ? "Update Book"
              : "Add Book"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
