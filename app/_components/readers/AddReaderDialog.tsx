"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";
import { Reader } from "@/app/types/library";

interface AddReaderDialogProps {
  open: boolean;
  onClose: () => void;
  reader?: Reader | null;
}

interface ReaderFormData {
  readerId: string;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  membershipType: string;
  status: string;
  address: string;
}

export default function AddReaderDialog({
  open,
  onClose,
  reader,
}: AddReaderDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(reader);
  const [formData, setFormData] = useState<ReaderFormData>({
    readerId: "",
    studentId: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    membershipType: "Student",
    status: "Active",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<ReaderFormData>>({});

  // Populate form when editing
  useEffect(() => {
    if (reader) {
      setFormData({
        readerId: reader.readerId || "",
        studentId: reader.studentId || "",
        fullName: reader.name || "",
        email: reader.email || "",
        phoneNumber: reader.phone || "",
        membershipType: reader.membershipType || "Student",
        status: reader.status || "Active",
        address: "",
      });
    } else {
      setFormData({
        readerId: "",
        studentId: "",
        fullName: "",
        email: "",
        phoneNumber: "",
        membershipType: "Student",
        status: "Active",
        address: "",
      });
    }
  }, [reader, open]);

  const createReaderMutation = useMutation({
    mutationFn: async (data: ReaderFormData) => {
      const response = await apiClient.post("/readers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readers"] });
      handleClose();
      alert("Reader registered successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to create reader:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to register reader. Please try again.",
      );
    },
  });

  const updateReaderMutation = useMutation({
    mutationFn: async (data: { id: string; formData: ReaderFormData }) => {
      const response = await apiClient.put(
        `/readers/${data.id}`,
        data.formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readers"] });
      handleClose();
      alert("Reader updated successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to update reader:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to update reader. Please try again.",
      );
    },
  });

  const handleClose = () => {
    setFormData({
      readerId: "",
      studentId: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      membershipType: "Student",
      status: "Active",
      address: "",
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReaderFormData> = {};

    if (!formData.readerId.trim()) {
      newErrors.readerId = "Reader ID is required";
    }
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isEditMode && reader) {
        updateReaderMutation.mutate({ id: reader.id, formData });
      } else {
        createReaderMutation.mutate(formData);
      }
    }
  };

  const handleChange = (field: keyof ReaderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isPending =
    createReaderMutation.isPending || updateReaderMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit Reader" : "Register New Reader"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Reader ID"
              required
              value={formData.readerId}
              onChange={(e) => handleChange("readerId", e.target.value)}
              error={Boolean(errors.readerId)}
              helperText={errors.readerId}
              placeholder="R12345"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Student ID"
              required
              value={formData.studentId}
              onChange={(e) => handleChange("studentId", e.target.value)}
              error={Boolean(errors.studentId)}
              helperText={errors.studentId}
              placeholder="S67890"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              error={Boolean(errors.fullName)}
              helperText={errors.fullName}
              placeholder="John Doe"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              placeholder="john.doe@example.com"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber}
              placeholder="+1234567890"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Membership Type</InputLabel>
              <Select
                value={formData.membershipType}
                label="Membership Type"
                onChange={(e) => handleChange("membershipType", e.target.value)}
              >
                <MenuItem value="Student">Student</MenuItem>
                <MenuItem value="Teacher">Teacher</MenuItem>
                <MenuItem value="Staff">Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Address"
              required
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              error={Boolean(errors.address)}
              helperText={errors.address}
              placeholder="123 Main St, City, Country"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isPending}
          sx={{
            bgcolor: "#27ae60",
            "&:hover": {
              bgcolor: "#229954",
            },
          }}
        >
          {isPending
            ? isEditMode
              ? "Updating..."
              : "Registering..."
            : isEditMode
              ? "Update Reader"
              : "Register Reader"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
