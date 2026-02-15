"use client";

import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Warning,
  History,
  LibraryBooks,
  FilterList,
  Delete,
  Visibility,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import BorrowBookDialog from "./BorrowBookDialog";
import BorrowDetailsDialog from "./BorrowDetailsDialog";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";

interface BorrowFilters {
  reader?: string;
  book?: string;
  status?: string;
  borrowDateFrom?: string;
  borrowDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export default function BorrowingManagement() {
  const { authToken } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openBorrowDialog, setOpenBorrowDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedBorrowId, setSelectedBorrowId] = useState<string | null>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState<BorrowFilters>({});
  const [filter, setFilter] = useState<
    "all" | "active" | "overdue" | "returned"
  >("active");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["borrows", authToken, searchQuery, filters, filter],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (filters.reader) {
        params.reader = filters.reader;
      }
      if (filters.book) {
        params.book = filters.book;
      }

      // Map the quick filter to status
      if (filter === "active") {
        params.status = "Borrowed";
      } else if (filter === "returned") {
        params.status = "Returned";
      } else if (filter === "overdue") {
        params.status = "Overdue";
      } else if (filters.status) {
        params.status = filters.status;
      }

      if (filters.borrowDateFrom) {
        params.borrowDateFrom = filters.borrowDateFrom;
      }
      if (filters.borrowDateTo) {
        params.borrowDateTo = filters.borrowDateTo;
      }
      if (filters.dueDateFrom) {
        params.dueDateFrom = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        params.dueDateTo = filters.dueDateTo;
      }

      const response = await apiClient.get("/borrows", { params });
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(authToken),
  });

  const borrowRecords = Array.isArray(data) ? data : (data?.borrows ?? []);

  // Get book and reader details for each record - they should come from API
  const enrichedRecords = borrowRecords.map((record: any) => {
    const isOverdue =
      (record.status === "Borrowed" || record.status === "Active") &&
      new Date() > new Date(record.dueDate);

    return {
      ...record,
      book: record.book || { title: "Unknown Book", author: "Unknown" },
      reader: record.reader || {
        name: "Unknown Reader",
        readerId: "N/A",
        membershipType: "N/A",
      },
      isOverdue,
      // Normalize status
      status: record.status === "Borrowed" ? "Active" : record.status,
    };
  });

  const filteredRecords = enrichedRecords;

  const returnBookMutation = useMutation({
    mutationFn: async (record: any) => {
      const payload = {
        reader: record.reader?.id || record.reader?._id || record.readerId,
        book: record.book?.id || record.book?._id || record.bookId,
        borrowDate: new Date(record.borrowDate).toISOString(),
        dueDate: new Date(record.dueDate).toISOString(),
        returnDate: new Date().toISOString(),
        status: "Returned",
        notes: record.notes || "Book returned in good condition",
      };
      const response = await apiClient.put(
        `/borrows/${record.id || record._id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      alert("Book returned successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to return book:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to return book. Please try again.",
      );
    },
  });

  const handleReturn = (recordId: string) => {
    const record = enrichedRecords.find(
      (r: any) => r.id === recordId || r._id === recordId,
    );
    if (!record) {
      alert("Record not found");
      return;
    }

    if (
      confirm(
        `Confirm return of "${record.book?.title}" by ${record.reader?.name}?`,
      )
    ) {
      returnBookMutation.mutate(record);
    }
  };

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const response = await apiClient.delete(`/borrows/${recordId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
      alert("Borrow record deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to delete record:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete record. Please try again.",
      );
    },
  });

  const handleDelete = (recordId: string) => {
    const record = enrichedRecords.find(
      (r: any) => r.id === recordId || r._id === recordId,
    );
    if (!record) {
      alert("Record not found");
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete the borrow record for "${record.book?.title}" by ${record.reader?.name}? This action cannot be undone.`,
      )
    ) {
      deleteRecordMutation.mutate(recordId);
    }
  };

  const handleViewDetails = (recordId: string) => {
    console.log("Opening borrow details for ID:", recordId);
    setSelectedBorrowId(recordId);
    setOpenDetailsDialog(true);
  };

  const getStatusChip = (record: any) => {
    if (record.status === "Returned") {
      return <Chip label="Returned" size="small" color="default" />;
    }
    if (record.isOverdue) {
      return (
        <Chip label="Overdue" size="small" color="error" icon={<Warning />} />
      );
    }
    return <Chip label="Active" size="small" color="success" />;
  };

  const getDaysInfo = (record: any) => {
    const dueDate = new Date(record.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (record.status === "Returned") {
      return {
        text: "Completed",
        color: "text.secondary",
      };
    }

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        color: "error.main",
      };
    } else if (diffDays === 0) {
      return {
        text: "Due today",
        color: "warning.main",
      };
    } else if (diffDays <= 3) {
      return {
        text: `${diffDays} days left`,
        color: "warning.main",
      };
    } else {
      return {
        text: `${diffDays} days left`,
        color: "success.main",
      };
    }
  };

  // Calculate stats
  const stats = {
    active: borrowRecords.filter(
      (r: any) => r.status === "Borrowed" || r.status === "Active",
    ).length,
    overdue: enrichedRecords.filter((r: any) => r.isOverdue).length,
    returned: borrowRecords.filter((r: any) => r.status === "Returned").length,
    total: borrowRecords.length,
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Borrowing & Returns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage book borrowing and returns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<LibraryBooks />}
          onClick={() => setOpenBorrowDialog(true)}
          sx={{
            bgcolor: "#3498db",
            "&:hover": {
              bgcolor: "#2980b9",
            },
          }}
        >
          Borrow Book
        </Button>
      </Box>

      {/* Stats Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Transactions
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#3498db" }}>
            {stats.total}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active Borrows
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#27ae60" }}>
            {stats.active}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overdue
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            {stats.overdue}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Returned
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#95a5a6" }}>
            {stats.returned}
          </Typography>
        </Paper>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Search by book title, reader name, or reader ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setOpenFilterDialog(true)}
            sx={{ minWidth: 120 }}
          >
            Filters
            {Object.keys(filters).length > 0 && (
              <Chip
                label={Object.keys(filters).length}
                size="small"
                sx={{ ml: 1, height: 20, minWidth: 20 }}
                color="primary"
              />
            )}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button
            variant={filter === "all" ? "contained" : "outlined"}
            onClick={() => setFilter("all")}
            size="small"
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "contained" : "outlined"}
            onClick={() => setFilter("active")}
            size="small"
            color="success"
          >
            Active
          </Button>
          <Button
            variant={filter === "overdue" ? "contained" : "outlined"}
            onClick={() => setFilter("overdue")}
            size="small"
            color="error"
          >
            Overdue
          </Button>
          <Button
            variant={filter === "returned" ? "contained" : "outlined"}
            onClick={() => setFilter("returned")}
            size="small"
          >
            Returned
          </Button>
        </Box>
      </Paper>

      {/* Borrowing Records Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reader</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Borrow Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!authToken ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Please log in to load borrowing records.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading borrowing records...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="error">
                    Failed to load borrowing records. Please try again.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || Object.keys(filters).length > 0
                      ? "No records found matching your search"
                      : 'No borrowing records yet. Click "Borrow Book" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record: any) => {
                const daysInfo = getDaysInfo(record);
                return (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.book?.title || "Unknown Book"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.book?.author}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.reader?.name || "Unknown Reader"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.reader?.readerId} |{" "}
                          {record.reader?.membershipType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(record.borrowDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(record.dueDate).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: daysInfo.color }}
                      >
                        {daysInfo.text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {record.returnDate ? (
                        <Typography variant="body2">
                          {new Date(record.returnDate).toLocaleDateString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{getStatusChip(record)}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() =>
                              handleViewDetails(record.id || record._id)
                            }
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {record.status === "Active" && (
                          <Tooltip title="Return Book">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleReturn(record.id || record._id)
                              }
                              disabled={returnBookMutation.isPending}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        {record.status === "Returned" && (
                          <Chip
                            label="Completed"
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Tooltip title="Delete Record">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDelete(record.id || record._id)
                            }
                            disabled={deleteRecordMutation.isPending}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Borrow Details Dialog */}
      <BorrowDetailsDialog
        open={openDetailsDialog}
        onClose={() => {
          setOpenDetailsDialog(false);
          setSelectedBorrowId(null);
        }}
        borrowId={selectedBorrowId}
      />

      {/* Borrow Book Dialog */}
      <BorrowBookDialog
        open={openBorrowDialog}
        onClose={() => setOpenBorrowDialog(false)}
      />

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Borrowing Records</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Reader ID"
                value={filters.reader || ""}
                onChange={(e) =>
                  setFilters({ ...filters, reader: e.target.value })
                }
                placeholder="Filter by reader ID"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Book ID"
                value={filters.book || ""}
                onChange={(e) =>
                  setFilters({ ...filters, book: e.target.value })
                }
                placeholder="Filter by book ID"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ""}
                  label="Status"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Borrowed">Borrowed</MenuItem>
                  <MenuItem value="Returned">Returned</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Borrow Date From"
                type="date"
                value={filters.borrowDateFrom || ""}
                onChange={(e) =>
                  setFilters({ ...filters, borrowDateFrom: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Borrow Date To"
                type="date"
                value={filters.borrowDateTo || ""}
                onChange={(e) =>
                  setFilters({ ...filters, borrowDateTo: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Due Date From"
                type="date"
                value={filters.dueDateFrom || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dueDateFrom: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Due Date To"
                type="date"
                value={filters.dueDateTo || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dueDateTo: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setFilters({});
              setOpenFilterDialog(false);
            }}
            color="inherit"
          >
            Clear All
          </Button>
          <Button onClick={() => setOpenFilterDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => setOpenFilterDialog(false)}
            variant="contained"
            sx={{
              bgcolor: "#3498db",
              "&:hover": {
                bgcolor: "#2980b9",
              },
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
