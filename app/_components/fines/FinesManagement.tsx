"use client";

import apiClient from "@/app/lib/apiClient";
import { useLibraryStore } from "@/app/store/libraryStore";
//  import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Button,
//   TextField,
//   InputAdornment,
//   IconButton,
//   Tooltip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Grid,
//   Menu,
//   MenuItem,
//   Chip,
//   Switch,
// } from "@mui/material";
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
  Menu,
  MenuItem,
  Chip,
  Switch,
} from "@mui/material";
import {
  AttachMoney,
  CheckCircle,
  Close,
  Search,
  Visibility,
  Edit,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import AddFineDialog from "./AddFineDialog";
import FineDetailsDialog from "./FineDetailsDialog";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// import { useLibraryStore } from "@/app/store/libraryStore";
// import AddFineDialog from "./AddFineDialog";
// import FineDetailsDialog from "./FineDetailsDialog";
// import {
//   AttachMoney,
//   CheckCircle,
//   Close,
//   Search,
//   Visibility,
//   Edit,
//   Delete,
//   MoreVert,
// } from "@mui/icons-material";

export default function FinesManagement() {
  // State for delete confirmation dialog
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // --- Dialog and Action Handlers ---
  const openFineDetails = (fineId: string) => {
    setSelectedFine(fineId);
    setEditFine(null);
    setOpenDetailsDialog(true);
  };

  const openEditFine = (fineId: string) => {
    const fine = enrichedFines.find(
      (f: any) => f._id === fineId || f.id === fineId,
    );
    setEditFine(fine);
    setOpenAddDialog(true);
  };

  const closeFineDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedFine(null);
  };
  const { readers, payFine, borrowRecords, books } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<string>("unpaid");
  // Only for stats, updated from apiFines
  const [fines, setFines] = useState<any[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [selectedFine, setSelectedFine] = useState<string | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [editFine, setEditFine] = useState<any | null>(null);
  const [deletingFineId, setDeletingFineId] = useState<string | null>(null);
  // For row action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuFineId, setMenuFineId] = useState<string | null>(null);
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    fineId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuFineId(fineId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuFineId(null);
  };
  // Delete fine handler
  const handleDeleteFine = async (fineId: string) => {
    setDeletingFineId(fineId);
    try {
      await apiClient.delete(`/fines/${fineId}`);
      refetch();
    } catch (err) {
      // Optionally show error
      alert("Failed to delete fine");
    } finally {
      setDeletingFineId(null);
    }
  };

  // Fetch fines using React Query
  const {
    data: apiFines,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["fines", searchQuery, status],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (status && status !== "all") params.status = status;
      const res = await apiClient.get("/fines", { params });
      return res.data?.data || res.data || [];
    },
  });

  // Keep local fines for stats
  useEffect(() => {
    if (apiFines) setFines(apiFines);
  }, [apiFines]);

  // Enrich fines with reader details (use embedded reader if present)
  const enrichedFines = (apiFines || []).map((fine: any) => {
    // Use reader from API if present, otherwise fallback to lookup
    const reader = fine.reader
      ? fine.reader
      : readers.find((r) => r.id === fine.readerId);
    const borrowRecord = fine.borrowRecordId
      ? borrowRecords.find((br) => br.id === fine.borrowRecordId)
      : null;
    const book = borrowRecord
      ? books.find((b) => b.id === borrowRecord.bookId)
      : null;
    return {
      ...fine,
      reader,
      borrowRecord,
      book,
      isAutoCalculated: !!fine.borrowRecordId,
    };
  });

  // No local filtering, API handles it
  const filteredFines = enrichedFines;

  const handlePayment = () => {
    if (selectedFine) {
      payFine(selectedFine);
      setOpenPayDialog(false);
      setSelectedFine(null);
    }
  };

  const openPaymentDialog = (fineId: string) => {
    setSelectedFine(fineId);
    setOpenPayDialog(true);
  };

  // Calculate stats
  const stats = {
    total: fines.length,
    unpaid: fines.filter((f) => f.status === "Unpaid").length,
    paid: fines.filter((f) => f.status === "Paid").length,
    totalAmount: fines
      .filter((f) => f.status === "Unpaid")
      .reduce((sum, f) => sum + f.amount, 0),
    paidAmount: fines
      .filter((f) => f.status === "Paid")
      .reduce((sum, f) => sum + f.amount, 0),
  };

  const selectedFineDetails = enrichedFines.find(
    (f: any) => f.id === selectedFine,
  );

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
            Fines & Penalties
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage overdue fines and manual penalties
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AttachMoney />}
          onClick={() => setOpenAddDialog(true)}
          sx={{
            bgcolor: "#e74c3c",
            "&:hover": {
              bgcolor: "#c0392b",
            },
          }}
        >
          Add Manual Fine
        </Button>
      </Box>

      {/* Stats Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Fines
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            {stats.total}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Unpaid Fines
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#f39c12" }}>
            {stats.unpaid}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Amount Due
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            ${stats.totalAmount.toFixed(2)}
          </Typography>
        </Paper>
        <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Paid Amount
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#27ae60" }}>
            ${stats.paidAmount.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      {/* Filter and Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Search by reason or reader..."
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
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Fines Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead sx={{ bgcolor: "#f8f9fa" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Reader</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Book/Reason</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Paid Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key="loading-row">
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading fines...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow key="error-row">
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="error">
                    {error instanceof Error
                      ? error.message
                      : "Failed to fetch fines"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredFines.length === 0 ? (
              <TableRow key="empty-row">
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No fines found matching your search"
                      : "No fines recorded yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFines.map((fine: any) => (
                <TableRow key={fine.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fine.reader?.fullName || "Unknown Reader"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fine.reader?.readerId} | {fine.reader?.membershipType}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={fine.isAutoCalculated ? "Auto" : "Manual"}
                      size="small"
                      color={fine.isAutoCalculated ? "warning" : "info"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {fine.book ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {fine.book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fine.reason}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2">{fine.reason}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#e74c3c", fontSize: 16 }}
                    >
                      ${fine.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(fine.createdDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {fine.paidDate ? (
                      <Typography variant="body2">
                        {new Date(fine.paidDate).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={fine.status === "paid"}
                      color="success"
                      onChange={async (e) => {
                        const newStatus = e.target.checked ? "paid" : "unpaid";
                        await apiClient.put(`/fines/${fine._id}`, {
                          amount: fine.amount,
                          reason: fine.reason,
                          status: newStatus,
                        });
                        refetch();
                      }}
                      inputProps={{ "aria-label": "Toggle paid status" }}
                    />
                    <Typography
                      variant="caption"
                      color={
                        fine.status === "Paid" ? "success.main" : "error.main"
                      }
                    >
                      {fine.status}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, fine._id)}
                    >
                      <span className="material-icons">
                        <MoreVert />
                      </span>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && menuFineId === fine._id}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                      <MenuItem
                        onClick={() => {
                          openFineDetails(fine._id);
                          handleMenuClose();
                        }}
                      >
                        <Visibility fontSize="small" sx={{ mr: 1 }} /> View
                        Details
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          openEditFine(fine._id);
                          handleMenuClose();
                        }}
                      >
                        <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setConfirmDeleteId(fine._id);
                          setOpenDeleteDialog(true);
                          handleMenuClose();
                        }}
                        sx={{ color: "error.main" }}
                        disabled={deletingFineId === fine._id}
                      >
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <Delete fontSize="small" style={{ marginRight: 8 }} />{" "}
                          Delete
                        </span>
                      </MenuItem>

                      {fine.status === "Unpaid" && (
                        <MenuItem
                          onClick={() => {
                            openPaymentDialog(fine.id);
                            handleMenuClose();
                          }}
                        >
                          <CheckCircle fontSize="small" sx={{ mr: 1 }} /> Mark
                          as Paid
                        </MenuItem>
                      )}
                      {fine.status === "Paid" && (
                        <MenuItem disabled>
                          <Chip
                            label="Completed"
                            size="small"
                            variant="outlined"
                          />
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog (rendered once at root, after table) */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setConfirmDeleteId(null);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this fine? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeleteDialog(false);
              setConfirmDeleteId(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (confirmDeleteId) {
                await handleDeleteFine(confirmDeleteId);
                setOpenDeleteDialog(false);
                setConfirmDeleteId(null);
              }
            }}
            color="error"
            variant="contained"
            disabled={deletingFineId === confirmDeleteId}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={openPayDialog}
        onClose={() => setOpenPayDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle sx={{ color: "#27ae60" }} />
            <Typography variant="h6">Confirm Payment</Typography>
          </Box>
          <IconButton onClick={() => setOpenPayDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedFineDetails && (
            <Box sx={{ mt: 2 }}>
              <Paper elevation={0} sx={{ bgcolor: "#f8f9fa", p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reader
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedFineDetails.reader?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedFineDetails.reader?.readerId}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fine Amount
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#e74c3c" }}
                    >
                      ${selectedFineDetails.amount.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Fine Type
                    </Typography>
                    <Typography variant="body1">
                      {selectedFineDetails.isAutoCalculated
                        ? "Auto-calculated"
                        : "Manual"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reason
                    </Typography>
                    <Typography variant="body1">
                      {selectedFineDetails.reason}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              <Box
                sx={{
                  bgcolor: "#d4edda",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #c3e6cb",
                }}
              >
                <Typography variant="body2" sx={{ color: "#155724" }}>
                  Are you sure you want to mark this fine as paid? This action
                  cannot be undone.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPayDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fine Details Dialog */}
      <FineDetailsDialog
        open={openDetailsDialog}
        onClose={closeFineDetails}
        fineId={selectedFine}
        // Optionally, you can pass a prop to force edit mode if editFineId is set
        // editMode={Boolean(editFineId)}
      />

      {/* Add Fine Dialog */}
      <AddFineDialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setEditFine(null);
        }}
        fineToEdit={editFine}
        onSave={refetch}
      />
    </Box>
  );
}
