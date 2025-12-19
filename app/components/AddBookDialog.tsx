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
import { useLibraryStore } from "../store/libraryStore";
import { Book } from "../types/library";

interface AddBookDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddBookDialog({ open, onClose }: AddBookDialogProps) {
  const { addBook } = useLibraryStore();

  const [formData, setFormData] = useState({
    isbn: "",
    title: "",
    author: "",
    publisher: "",
    category: "",
    genre: "",
    shelfLocation: "",
    totalCopies: 1,
    availableCopies: 1,
    status: "Available" as const,
    coverImage: "",
    barcode: "",
    qrCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);

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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }
    if (!formData.publisher.trim()) {
      newErrors.publisher = "Publisher is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.genre) {
      newErrors.genre = "Genre is required";
    }
    if (!formData.shelfLocation.trim()) {
      newErrors.shelfLocation = "Shelf location is required";
    }
    if (formData.totalCopies < 1) {
      newErrors.totalCopies = "Total copies must be at least 1";
    }
    if (formData.availableCopies < 0) {
      newErrors.availableCopies = "Available copies cannot be negative";
    }
    if (formData.availableCopies > formData.totalCopies) {
      newErrors.availableCopies = "Available copies cannot exceed total copies";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newBook: Book = {
      id: Date.now().toString(),
      isbn: formData.isbn,
      title: formData.title,
      author: formData.author,
      publisher: formData.publisher,
      category: formData.category,
      genre: formData.genre,
      shelfLocation: formData.shelfLocation,
      totalCopies: formData.totalCopies,
      availableCopies: formData.availableCopies,
      status: formData.status,
      coverImage: formData.coverImage || undefined,
      barcode: formData.barcode || undefined,
      qrCode: formData.qrCode || undefined,
    };

    addBook(newBook);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
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
    });
    setErrors({});
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
          Add New Book
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
              value={formData.isbn}
              onChange={(e) => handleChange("isbn", e.target.value)}
              error={!!errors.isbn}
              helperText={errors.isbn}
              placeholder="978-1234567890"
            />
          </Grid>

          {/* Book Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Book Status</InputLabel>
              <Select
                value={formData.status}
                label="Book Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                {bookStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Title */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="Enter book title"
            />
          </Grid>

          {/* Author */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Author"
              value={formData.author}
              onChange={(e) => handleChange("author", e.target.value)}
              error={!!errors.author}
              helperText={errors.author}
              placeholder="Author name"
            />
          </Grid>

          {/* Publisher */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Publisher"
              value={formData.publisher}
              onChange={(e) => handleChange("publisher", e.target.value)}
              error={!!errors.publisher}
              helperText={errors.publisher}
              placeholder="Publisher name"
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Genre */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!errors.genre}>
              <InputLabel>Genre</InputLabel>
              <Select
                value={formData.genre}
                label="Genre"
                onChange={(e) => handleChange("genre", e.target.value)}
              >
                {genres.map((genre) => (
                  <MenuItem key={genre} value={genre}>
                    {genre}
                  </MenuItem>
                ))}
              </Select>
              {errors.genre && <FormHelperText>{errors.genre}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Shelf Location */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Shelf Location"
              value={formData.shelfLocation}
              onChange={(e) => handleChange("shelfLocation", e.target.value)}
              error={!!errors.shelfLocation}
              helperText={errors.shelfLocation || "e.g., A-12, B-05"}
              placeholder="A-12"
            />
          </Grid>

          {/* Total Copies */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Total Copies"
              value={formData.totalCopies}
              onChange={(e) =>
                handleChange("totalCopies", parseInt(e.target.value) || 0)
              }
              error={!!errors.totalCopies}
              helperText={errors.totalCopies}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Available Copies */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Available Copies"
              value={formData.availableCopies}
              onChange={(e) =>
                handleChange("availableCopies", parseInt(e.target.value) || 0)
              }
              error={!!errors.availableCopies}
              helperText={errors.availableCopies}
              inputProps={{ min: 0 }}
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
          {formData.coverImage && (
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
                  src={formData.coverImage}
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
              value={formData.barcode}
              onChange={(e) => handleChange("barcode", e.target.value)}
              placeholder="Enter barcode number"
            />
          </Grid>

          {/* QR Code */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="QR Code"
              value={formData.qrCode}
              onChange={(e) => handleChange("qrCode", e.target.value)}
              placeholder="Enter QR code data"
              InputProps={{
                endAdornment: (
                  <IconButton size="small">
                    <QrCode />
                  </IconButton>
                ),
              }}
            />
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
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#3498db",
            "&:hover": {
              bgcolor: "#2980b9",
            },
          }}
        >
          Add Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}
