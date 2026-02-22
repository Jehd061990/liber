// ("use client");

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
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLibraryStore } from "@/app/store/libraryStore";
// Updated Fine interface for fines table
export interface Fine {
  _id: string;
  reader: {
    _id: string;
    readerId: string;
    fullName: string;
  };
  type: string;
  book: any | null;
  reason: string;
  amount: number;
  status: string;
  createdAt: string;
  __v?: number;
  id: string;
  bookTitle: string | null;
}
import apiClient from "@/app/lib/apiClient";

interface AddFineDialogProps {
  open: boolean;
  onClose: () => void;
  fineToEdit?: any | null;
  onSave?: () => void;
}

export default function AddFineDialog({
  open,
  onClose,
  fineToEdit = null,
  onSave,
}: AddFineDialogProps) {
  const queryClient = useQueryClient();
  const { addFine, readers } = useLibraryStore();

  const [formData, setFormData] = useState({
    readerId: "",
    amount: 0,
    reason: "",
  });

  // Prefill form when editing
  useEffect(() => {
    if (fineToEdit && open) {
      setFormData({
        readerId: fineToEdit.readerId || fineToEdit.reader || "",
        amount: fineToEdit.amount || 0,
        reason: fineToEdit.reason || "",
      });
    } else if (open) {
      setFormData({ readerId: "", amount: 0, reason: "" });
    }
  }, [fineToEdit, open]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch active readers from backend when dialog opens
  const { data: apiReaders, isLoading: loadingReaders } = useQuery({
    queryKey: ["readers", open],
    queryFn: async () => {
      const res = await apiClient.get("/readers", {
        params: { status: "Active" },
      });
      return res.data?.data || res.data || [];
    },
    enabled: !!open,
  });

  // Normalize API response to match Reader interface
  const readersRaw = Array.isArray(apiReaders)
    ? apiReaders
    : apiReaders &&
        typeof apiReaders === "object" &&
        (apiReaders as any).readers
      ? (apiReaders as any).readers
      : [];

  const mappedReaders = (readersRaw as any[]).map((item, index) => ({
    id: item?.id ?? item?._id ?? `${Date.now()}-${index}`,
    readerId: item?.readerId ?? "",
    studentId: item?.studentId ?? "",
    name: item?.fullName ?? item?.name ?? "",
    email: item?.email ?? "",
    phone: item?.phoneNumber ?? item?.phone ?? "",
    membershipType: item?.membershipType ?? "Student",
    status: item?.status ?? "Active",
    registrationDate: item?.registrationDate
      ? new Date(item.registrationDate)
      : new Date(),
    maxBooks: item?.maxBooks ?? 5,
    borrowDuration: item?.borrowDuration ?? 14,
  }));

  // Get active readers only
  const activeReaders = mappedReaders.filter(
    (reader: any) => reader.status === "Active",
  );

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

    if (fineToEdit && fineToEdit._id) {
      // Edit mode: PUT
      const payload: any = {
        amount: formData.amount,
        reason: formData.reason,
        status: fineToEdit.status || "unpaid",
      };
      apiClient
        .put(`/fines/${fineToEdit._id}`, payload)
        .then(() => {
          if (onSave) onSave();
          handleClose();
        })
        .catch((err) => {
          setErrors({
            root: err?.response?.data?.message || "Failed to update fine",
          });
        });
    } else {
      // Add mode: POST
      const payload: any = {
        reader: formData.readerId,
        type: "manual",
        amount: formData.amount,
        reason: formData.reason,
      };
      apiClient
        .post("/fines", payload)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["fines"] });
          handleClose();
        })
        .catch((err) => {
          setErrors({
            root: err?.response?.data?.message || "Failed to add fine",
          });
        });
    }
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
            {fineToEdit ? "Edit Fine" : "Add Manual Fine"}
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
                disabled={loadingReaders}
              >
                <MenuItem value="">
                  <em>Choose a reader</em>
                </MenuItem>
                {loadingReaders ? (
                  <MenuItem disabled>
                    <em>Loading readers...</em>
                  </MenuItem>
                ) : (
                  activeReaders.map((reader: any) => (
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
                  ))
                )}
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
          disabled={(!formData.readerId && !fineToEdit) || formData.amount <= 0}
          sx={{
            bgcolor: "#e74c3c",
            "&:hover": {
              bgcolor: "#c0392b",
            },
          }}
        >
          {fineToEdit ? "Save Changes" : "Add Fine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
