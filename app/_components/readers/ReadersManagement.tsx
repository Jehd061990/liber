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
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  FilterList,
  PersonAdd,
} from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";
import AddReaderDialog from "./AddReaderDialog";

export default function ReadersManagement() {
  const { readers, deleteReader } = useLibraryStore();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReader, setSelectedReader] = useState<string | null>(null);

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

  const handleDelete = () => {
    if (selectedReader) {
      deleteReader(selectedReader);
      handleMenuClose();
    }
  };

  const filteredReaders = readers.filter(
    (reader) =>
      reader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.readerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.studentId?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
            sx={{ minWidth: 120 }}
          >
            Filters
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
            {filteredReaders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery
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
        <MenuItem onClick={handleMenuClose}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Reader Dialog */}
      <AddReaderDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </Box>
  );
}
