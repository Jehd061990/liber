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
import { Close, Person } from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import { Reader, MembershipType, MemberStatus } from "@/app/types/library";

interface AddReaderDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddReaderDialog({
  open,
  onClose,
}: AddReaderDialogProps) {
  const { addReader } = useLibraryStore();

  const [formData, setFormData] = useState({
    readerId: "",
    studentId: "",
    name: "",
    email: "",
    phone: "",
    membershipType: "" as MembershipType | "",
    status: "Active" as MemberStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const membershipTypes: MembershipType[] = ["Student", "Teacher", "Staff"];
  const statuses: MemberStatus[] = ["Active", "Suspended"];

  // Borrowing rules based on membership type
  const getBorrowingRules = (type: MembershipType) => {
    switch (type) {
      case "Student":
        return { maxBooks: 3, borrowDuration: 14 };
      case "Teacher":
        return { maxBooks: 5, borrowDuration: 30 };
      case "Staff":
        return { maxBooks: 5, borrowDuration: 30 };
      default:
        return { maxBooks: 3, borrowDuration: 14 };
    }
  };

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

    if (!formData.readerId.trim()) {
      newErrors.readerId = "Reader ID is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!formData.membershipType) {
      newErrors.membershipType = "Membership type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const borrowingRules = getBorrowingRules(
      formData.membershipType as MembershipType,
    );

    const newReader: Reader = {
      id: Date.now().toString(),
      readerId: formData.readerId,
      studentId: formData.studentId || undefined,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      membershipType: formData.membershipType as MembershipType,
      status: formData.status,
      registrationDate: new Date(),
      maxBooks: borrowingRules.maxBooks,
      borrowDuration: borrowingRules.borrowDuration,
    };

    addReader(newReader);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      readerId: "",
      studentId: "",
      name: "",
      email: "",
      phone: "",
      membershipType: "",
      status: "Active",
    });
    setErrors({});
    onClose();
  };

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
          <Person sx={{ color: "#3498db" }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Register New Reader
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Reader ID */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Reader ID"
              value={formData.readerId}
              onChange={(e) => handleChange("readerId", e.target.value)}
              error={!!errors.readerId}
              helperText={errors.readerId || "Unique identifier for the reader"}
              placeholder="R001"
            />
          </Grid>

          {/* Student ID (Optional) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Student ID"
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              helperText="Optional - For students only"
              placeholder="S12345"
            />
          </Grid>

          {/* Full Name */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              placeholder="John Doe"
            />
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="john.doe@example.com"
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={!!errors.phone}
              helperText={errors.phone}
              placeholder="+1 234 567 8900"
            />
          </Grid>

          {/* Membership Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required error={!!errors.membershipType}>
              <InputLabel>Membership Type</InputLabel>
              <Select
                value={formData.membershipType}
                label="Membership Type"
                onChange={(e) => handleChange("membershipType", e.target.value)}
              >
                {membershipTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.membershipType && (
                <FormHelperText>{errors.membershipType}</FormHelperText>
              )}
              {formData.membershipType && (
                <FormHelperText>
                  Max books:{" "}
                  {getBorrowingRules(formData.membershipType).maxBooks} |
                  Duration:{" "}
                  {getBorrowingRules(formData.membershipType).borrowDuration}{" "}
                  days
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  handleChange("status", e.target.value as MemberStatus)
                }
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Information Box */}
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
                sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}
              >
                Borrowing Rules by Membership Type:
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#1565c0" }}
              >
                • <strong>Student:</strong> Max 3 books, 14 days duration
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#1565c0" }}
              >
                • <strong>Teacher:</strong> Max 5 books, 30 days duration
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "#1565c0" }}
              >
                • <strong>Staff:</strong> Max 5 books, 30 days duration
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
          sx={{
            bgcolor: "#27ae60",
            "&:hover": {
              bgcolor: "#229954",
            },
          }}
        >
          Register Reader
        </Button>
      </DialogActions>
    </Dialog>
  );
}
