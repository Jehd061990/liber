"use client";

import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  FilterList,
  PersonAdd,
  Visibility,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import AddReaderDialog from "./AddReaderDialog";
import ReaderDetailsDialog from "./ReaderDetailsDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";
import { Reader } from "@/app/types/library";

interface ReaderFilters {
  readerId?: string;
  studentId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  membershipType?: string;
  status?: string;
}

export default function ReadersManagement() {
  const { readers, deleteReader, setReaders, authToken } = useLibraryStore();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingReader, setEditingReader] = useState<Reader | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReader, setSelectedReader] = useState<string | null>(null);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filters, setFilters] = useState<ReaderFilters>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["readers", authToken, searchQuery, filters],
    queryFn: async () => {
      const params: Record<string, string> = {};

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (filters.readerId) {
        params.readerId = filters.readerId;
      }
      if (filters.studentId) {
        params.studentId = filters.studentId;
      }
      if (filters.fullName) {
        params.fullName = filters.fullName;
      }
      if (filters.email) {
        params.email = filters.email;
      }
      if (filters.phoneNumber) {
        params.phoneNumber = filters.phoneNumber;
      }
      if (filters.membershipType) {
        params.membershipType = filters.membershipType;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      const response = await apiClient.get("/readers", { params });
      return response.data?.data ?? response.data;
    },
    enabled: Boolean(authToken),
  });

  useEffect(() => {
    if (!data) return;

    const list = Array.isArray(data) ? data : (data?.readers ?? []);
    const mapped = (list as any[]).map(
      (item, index) =>
        ({
          id: item?.id ?? item?._id ?? `${Date.now()}-${index}`,
          readerId: item?.readerId ?? "",
          studentId: item?.studentId ?? "",
          name: item?.fullName ?? item?.name ?? "",
          email: item?.email ?? "",
          phone: item?.phoneNumber ?? item?.phone ?? "",
          membershipType: item?.membershipType ?? "Student",
          status: item?.status ?? "Active",
          registrationDate:
            item?.registrationDate ?? item?.createdAt ?? new Date(),
          maxBooks: item?.maxBooks ?? 3,
          borrowDuration: item?.borrowDuration ?? 14,
        }) as Reader,
    );

    setReaders(mapped);
  }, [data, setReaders]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    readerId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedReader(readerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReader(null);
  };

  const handleEdit = () => {
    const reader = readers.find((r) => r.id === selectedReader);
    if (reader) {
      setEditingReader(reader);
      setOpenAddDialog(true);
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setEditingReader(null);
  };

  const handleViewDetails = () => {
    console.log("Opening reader details for ID:", selectedReader);
    setOpenDetailsDialog(true);
    setAnchorEl(null);
  };

  const deleteMutation = useMutation({
    mutationFn: async (readerId: string) => {
      const response = await apiClient.delete(`/readers/${readerId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readers"] });
      handleMenuClose();
    },
    onError: (error: any) => {
      console.error("Failed to delete reader:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to delete reader. Please try again.",
      );
    },
  });

  const handleDelete = () => {
    if (selectedReader) {
      if (confirm("Are you sure you want to delete this reader?")) {
        deleteMutation.mutate(selectedReader);
      }
    }
  };

  // Readers are already filtered by the API
  const filteredReaders = readers;

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
            Readers Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage library members and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: "#27ae60",
            "&:hover": {
              bgcolor: "#229954",
            },
          }}
        >
          Register Reader
        </Button>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, reader ID, or student ID..."
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
      </Paper>

      {/* Stats Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Readers
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#3498db" }}>
            {readers.length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#27ae60" }}>
            {readers.filter((r) => r.status === "Active").length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Suspended
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            {readers.filter((r) => r.status === "Suspended").length}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Students
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#9b59b6" }}>
            {readers.filter((r) => r.membershipType === "Student").length}
          </Typography>
        </Paper>
      </Box>

      {/* Readers Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Reader</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reader ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Student ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Membership</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Borrowing Limit
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!authToken ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Please log in to load readers.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading readers...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="error">
                    Failed to load readers. Please try again.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredReaders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || Object.keys(filters).length > 0
                      ? "No readers found matching your search"
                      : 'No readers registered yet. Click "Register Reader" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReaders.map((reader) => (
                <TableRow key={reader.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "#3498db", width: 40, height: 40 }}
                      >
                        {getInitials(reader.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {reader.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registered:{" "}
                          {new Date(
                            reader.registrationDate,
                          ).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {reader.readerId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace" }}
                    >
                      {reader.studentId || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: 13 }}>
                      {reader.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reader.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={reader.membershipType}
                      size="small"
                      color={getMembershipColor(reader.membershipType) as any}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {reader.maxBooks} books
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {reader.borrowDuration} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={reader.status}
                      size="small"
                      color={getStatusColor(reader.status) as any}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, reader.id)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Reader Dialog */}
      <AddReaderDialog
        open={openAddDialog}
        onClose={handleCloseDialog}
        reader={editingReader}
      />

      {/* Reader Details Dialog */}
      <ReaderDetailsDialog
        open={openDetailsDialog}
        onClose={() => {
          setOpenDetailsDialog(false);
          setSelectedReader(null);
        }}
        readerId={selectedReader}
      />

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Readers</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Reader ID"
                value={filters.readerId || ""}
                onChange={(e) =>
                  setFilters({ ...filters, readerId: e.target.value })
                }
                placeholder="Filter by reader ID"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Student ID"
                value={filters.studentId || ""}
                onChange={(e) =>
                  setFilters({ ...filters, studentId: e.target.value })
                }
                placeholder="Filter by student ID"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={filters.fullName || ""}
                onChange={(e) =>
                  setFilters({ ...filters, fullName: e.target.value })
                }
                placeholder="Filter by full name"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                value={filters.email || ""}
                onChange={(e) =>
                  setFilters({ ...filters, email: e.target.value })
                }
                placeholder="Filter by email"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={filters.phoneNumber || ""}
                onChange={(e) =>
                  setFilters({ ...filters, phoneNumber: e.target.value })
                }
                placeholder="Filter by phone number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Membership Type</InputLabel>
                <Select
                  value={filters.membershipType || ""}
                  label="Membership Type"
                  onChange={(e) =>
                    setFilters({ ...filters, membershipType: e.target.value })
                  }
                  native
                >
                  <option value=""></option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Staff">Staff</option>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ""}
                  label="Status"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  native
                >
                  <option value=""></option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </Select>
              </FormControl>
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
              bgcolor: "#27ae60",
              "&:hover": {
                bgcolor: "#229954",
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
