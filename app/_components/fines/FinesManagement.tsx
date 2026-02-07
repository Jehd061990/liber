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
} from "@mui/material";
import {
  Search,
  AttachMoney,
  CheckCircle,
  Warning,
  Edit,
  Close,
} from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import AddFineDialog from "./AddFineDialog";

export default function FinesManagement() {
  const { fines, readers, payFine, borrowRecords, books } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [selectedFine, setSelectedFine] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("unpaid");

  // Enrich fines with reader details
  const enrichedFines = fines.map((fine) => {
    const reader = readers.find((r) => r.id === fine.readerId);
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

  // Filter fines
  const filteredFines = enrichedFines.filter((fine) => {
    const matchesSearch =
      fine.reader?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.reader?.readerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fine.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "paid") {
      return fine.status === "Paid" && matchesSearch;
    } else if (filter === "unpaid") {
      return fine.status === "Unpaid" && matchesSearch;
    }
    return matchesSearch;
  });

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

  const selectedFineDetails = enrichedFines.find((f) => f.id === selectedFine);

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
            placeholder="Search by reader name, reader ID, or reason..."
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
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
              size="small"
            >
              All
            </Button>
            <Button
              variant={filter === "unpaid" ? "contained" : "outlined"}
              onClick={() => setFilter("unpaid")}
              size="small"
              color="error"
            >
              Unpaid
            </Button>
            <Button
              variant={filter === "paid" ? "contained" : "outlined"}
              onClick={() => setFilter("paid")}
              size="small"
              color="success"
            >
              Paid
            </Button>
          </Box>
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
            {filteredFines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No fines found matching your search"
                      : "No fines recorded yet."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredFines.map((fine) => (
                <TableRow key={fine.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {fine.reader?.name || "Unknown Reader"}
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
                    <Chip
                      label={fine.status}
                      size="small"
                      color={fine.status === "Paid" ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {fine.status === "Unpaid" && (
                      <Tooltip title="Mark as Paid">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => openPaymentDialog(fine.id)}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {fine.status === "Paid" && (
                      <Chip label="Completed" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
                      {selectedFineDetails.reader?.name}
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

      {/* Add Fine Dialog */}
      <AddFineDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </Box>
  );
}
