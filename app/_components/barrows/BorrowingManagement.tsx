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
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Warning,
  History,
  LibraryBooks,
} from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import BorrowBookDialog from "./BorrowBookDialog";

export default function BorrowingManagement() {
  const { borrowRecords, books, readers, returnBook } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openBorrowDialog, setOpenBorrowDialog] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "active" | "overdue" | "returned"
  >("active");

  // Get book and reader details for each record
  const enrichedRecords = borrowRecords.map((record) => {
    const book = books.find((b) => b.id === record.bookId);
    const reader = readers.find((r) => r.id === record.readerId);
    const isOverdue =
      record.status === "Active" && new Date() > new Date(record.dueDate);

    return {
      ...record,
      book,
      reader,
      isOverdue,
    };
  });

  // Filter records
  const filteredRecords = enrichedRecords.filter((record) => {
    const matchesSearch =
      record.book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reader?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.reader?.readerId.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "active") {
      return record.status === "Active" && matchesSearch;
    } else if (filter === "overdue") {
      return record.isOverdue && matchesSearch;
    } else if (filter === "returned") {
      return record.status === "Returned" && matchesSearch;
    }
    return matchesSearch;
  });

  const handleReturn = (recordId: string) => {
    returnBook(recordId);
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
    active: borrowRecords.filter((r) => r.status === "Active").length,
    overdue: enrichedRecords.filter((r) => r.isOverdue).length,
    returned: borrowRecords.filter((r) => r.status === "Returned").length,
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
          <Box sx={{ display: "flex", gap: 1 }}>
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
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
                      ? "No records found matching your search"
                      : 'No borrowing records yet. Click "Borrow Book" to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => {
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
                      {record.status === "Active" && (
                        <Tooltip title="Return Book">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleReturn(record.id)}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Borrow Book Dialog */}
      <BorrowBookDialog
        open={openBorrowDialog}
        onClose={() => setOpenBorrowDialog(false)}
      />
    </Box>
  );
}
