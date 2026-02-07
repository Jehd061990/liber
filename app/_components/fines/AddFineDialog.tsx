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
  Grid,
} from "@mui/material";
import { Close, AttachMoney } from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import { Fine } from "@/app/types/library";

interface AddFineDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddFineDialog({ open, onClose }: AddFineDialogProps) {
  const { addFine, readers } = useLibraryStore();

  const [formData, setFormData] = useState({
    readerId: "",
    amount: 0,
    reason: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get active readers only
  const activeReaders = readers.filter((reader) => reader.status === "Active");

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.readerId) {
      newErrors.readerId = "Please select a reader";
    }

    if (formData.amount <= 0) {
      newErrors.amount = "Fine amount must be greater than 0";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Please provide a reason for the fine";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const newFine: Fine = {
      id: Date.now().toString(),
      borrowRecordId: "", // Manual fine, no borrow record
      readerId: formData.readerId,
      amount: formData.amount,
      reason: formData.reason,
      status: "Unpaid",
      createdDate: new Date(),
    };

    addFine(newFine);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      readerId: "",
      amount: 0,
      reason: "",
    });
    setErrors({});
    onClose();
  };

  const selectedReader = readers.find((r) => r.id === formData.readerId);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
          <AttachMoney sx={{ color: "#e74c3c" }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Add Manual Fine
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Select Reader */}
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth required error={!!errors.readerId}>
              <InputLabel>Select Reader</InputLabel>
              <Select
                value={formData.readerId}
                label="Select Reader"
                onChange={(e) => handleChange("readerId", e.target.value)}
              >
                <MenuItem value="">
                  <em>Choose a reader</em>
                </MenuItem>
                {activeReaders.map((reader) => (
                  <MenuItem key={reader.id} value={reader.id}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {reader.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reader.readerId} | {reader.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.readerId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {errors.readerId}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Reader Info */}
          {selectedReader && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  bgcolor: "#f8f9fa",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #dee2e6",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Reader ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.readerId}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Membership
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.membershipType}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedReader.email} | {selectedReader.phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}

          {/* Fine Amount */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Fine Amount"
              value={formData.amount}
              onChange={(e) =>
                handleChange("amount", parseFloat(e.target.value) || 0)
              }
              error={!!errors.amount}
              helperText={errors.amount || "Enter the fine amount in dollars"}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
              inputProps={{
                min: 0,
                step: 0.01,
              }}
            />
          </Grid>

          {/* Reason */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Reason for Fine"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              error={!!errors.reason}
              helperText={
                errors.reason ||
                "Provide a detailed reason for this manual fine"
              }
              placeholder="e.g., Book damage, Lost book, Late fees, etc."
            />
          </Grid>

          {/* Info Box */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                bgcolor: "#fff3cd",
                p: 2,
                borderRadius: 1,
                border: "1px solid #ffc107",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 1, color: "#856404" }}
              >
                Note: Manual Fine Adjustment
              </Typography>
              <Typography variant="caption" sx={{ color: "#856404" }}>
                This fine will be added manually and is separate from
                auto-calculated overdue fines. The reader will need to pay this
                fine before borrowing more books.
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
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.readerId || formData.amount <= 0}
          sx={{
            bgcolor: "#e74c3c",
            "&:hover": {
              bgcolor: "#c0392b",
            },
          }}
        >
          Add Fine
        </Button>
      </DialogActions>
    </Dialog>
  );
}
