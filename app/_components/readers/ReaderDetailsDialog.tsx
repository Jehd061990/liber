"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Badge,
  CalendarToday,
  LibraryBooks,
  Schedule,
  Home,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";

interface ReaderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  readerId: string | null;
}

export default function ReaderDetailsDialog({
  open,
  onClose,
  readerId,
}: ReaderDetailsDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reader", readerId],
    queryFn: async () => {
      if (!readerId) return null;
      console.log("Fetching reader details for ID:", readerId);
      const response = await apiClient.get(`/readers/${readerId}`);
      console.log("Reader details response:", response.data);
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(readerId) && open,
  });

  const reader = data;

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "error";
  };

  const getMembershipColor = (type: string) => {
    switch (type) {
      case "Student":
        return "primary";
      case "Teacher":
        return "secondary";
      case "Staff":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Person sx={{ fontSize: 32, color: "#3498db" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Reader Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete information about the reader
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ mt: 2 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : isError || !reader ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error">
              Failed to load reader details. Please try again.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#3498db" }}
                >
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {reader.fullName || reader.name || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Badge sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reader ID
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, fontFamily: "monospace" }}
                        >
                          {reader.readerId || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Badge sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Student ID
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, fontFamily: "monospace" }}
                        >
                          {reader.studentId || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Registration Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(
                            reader.registrationDate || reader.createdAt,
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Contact Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#27ae60" }}
                >
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Email sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {reader.email || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Phone sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {reader.phoneNumber || reader.phone || "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {reader.address && (
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Home sx={{ color: "text.secondary" }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {reader.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Membership & Status */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#9b59b6" }}
                >
                  Membership & Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Membership Type
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={reader.membershipType || "Student"}
                          color={
                            getMembershipColor(
                              reader.membershipType || "Student",
                            ) as any
                          }
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={reader.status || "Active"}
                          color={
                            getStatusColor(reader.status || "Active") as any
                          }
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Borrowing Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#e67e22" }}
                >
                  Borrowing Privileges
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LibraryBooks sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Maximum Books
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {reader.maxBooks || 3}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Schedule sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Borrow Duration
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {reader.borrowDuration || 14} days
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
