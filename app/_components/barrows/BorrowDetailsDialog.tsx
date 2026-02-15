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
  LibraryBooks,
  Person,
  CalendarToday,
  EventAvailable,
  AssignmentTurnedIn,
  Notes,
  CheckCircle,
  Warning,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";

interface BorrowDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  borrowId: string | null;
}

export default function BorrowDetailsDialog({
  open,
  onClose,
  borrowId,
}: BorrowDetailsDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["borrow", borrowId],
    queryFn: async () => {
      if (!borrowId) return null;
      console.log("Fetching borrow details for ID:", borrowId);
      const response = await apiClient.get(`/borrows/${borrowId}`);
      console.log("Borrow details response:", response.data);
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(borrowId) && open,
  });

  const borrow = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Returned":
        return "default";
      case "Borrowed":
      case "Active":
        return "success";
      case "Overdue":
        return "error";
      default:
        return "default";
    }
  };

  const calculateDaysInfo = (
    borrowDate: string,
    dueDate: string,
    returnDate?: string,
  ) => {
    const due = new Date(dueDate);
    const today = new Date();

    if (returnDate) {
      return {
        text: "Completed",
        color: "text.secondary",
        icon: <CheckCircle />,
      };
    }

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        color: "error.main",
        icon: <Warning />,
      };
    } else if (diffDays === 0) {
      return {
        text: "Due today",
        color: "warning.main",
        icon: <Warning />,
      };
    } else if (diffDays <= 3) {
      return {
        text: `${diffDays} days remaining`,
        color: "warning.main",
        icon: <Warning />,
      };
    } else {
      return {
        text: `${diffDays} days remaining`,
        color: "success.main",
        icon: <CheckCircle />,
      };
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <LibraryBooks sx={{ fontSize: 32, color: "#3498db" }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Borrowing Record Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete information about the borrowing transaction
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
        ) : isError || !borrow ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="error">
              Failed to load borrowing details. Please try again.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Status Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#3498db" }}
                >
                  Status Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={borrow.status || "Active"}
                          color={
                            getStatusColor(borrow.status || "Active") as any
                          }
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {
                        calculateDaysInfo(
                          borrow.borrowDate,
                          borrow.dueDate,
                          borrow.returnDate,
                        ).icon
                      }
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Time Status
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: calculateDaysInfo(
                              borrow.borrowDate,
                              borrow.dueDate,
                              borrow.returnDate,
                            ).color,
                          }}
                        >
                          {
                            calculateDaysInfo(
                              borrow.borrowDate,
                              borrow.dueDate,
                              borrow.returnDate,
                            ).text
                          }
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Book Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#27ae60" }}
                >
                  Book Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LibraryBooks sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Book Title
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {borrow.book?.title || "Unknown Book"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {borrow.book?.author && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Author
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {borrow.book.author}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {borrow.book?.isbn && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          ISBN
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, fontFamily: "monospace" }}
                        >
                          {borrow.book.isbn}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Reader Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#9b59b6" }}
                >
                  Reader Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reader Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {borrow.reader?.name ||
                            borrow.reader?.fullName ||
                            "Unknown Reader"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  {borrow.reader?.readerId && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reader ID
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500, fontFamily: "monospace" }}
                        >
                          {borrow.reader.readerId}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {borrow.reader?.membershipType && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Membership Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {borrow.reader.membershipType}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* Date Information */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 2, color: "#e67e22" }}
                >
                  Date Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Borrow Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(borrow.borrowDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EventAvailable sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {new Date(borrow.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AssignmentTurnedIn sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Return Date
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {borrow.returnDate
                            ? new Date(borrow.returnDate).toLocaleDateString()
                            : "Not returned yet"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Notes */}
            {borrow.notes && (
              <Grid size={{ xs: 12 }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Notes sx={{ color: "text.secondary" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notes
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {borrow.notes}
                  </Typography>
                </Paper>
              </Grid>
            )}
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
