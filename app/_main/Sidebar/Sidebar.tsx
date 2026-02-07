"use client";

import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Dashboard,
  MenuBook,
  People,
  SwapHoriz,
  Payment,
  BookmarkAdded,
  Search,
  Assessment,
  Settings,
  ExpandLess,
  ExpandMore,
  Add,
  List as ListIcon,
  PersonAdd,
  History,
  AttachMoney,
} from "@mui/icons-material";
import { useState } from "react";
import { useLibraryStore } from "@/app/store/libraryStore";

export default function Sidebar() {
  const { currentView, setCurrentView, currentUser, getMainDashboardStats } =
    useLibraryStore();
  const [booksOpen, setBooksOpen] = useState(false);
  const [readersOpen, setReadersOpen] = useState(false);
  const [borrowingOpen, setBorrowingOpen] = useState(false);

  const stats = getMainDashboardStats();
  const userRole = currentUser?.role || "Reader";

  const handleNavigation = (view: string) => {
    setCurrentView(view);
  };

  return (
    <Box
      sx={{
        width: 280,
        height: "100vh",
        bgcolor: "#2c3e50",
        color: "white",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo/Title */}
      <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#3498db",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MenuBook /> Liber
        </Typography>
        <Chip
          label={userRole}
          size="small"
          sx={{
            mt: 1,
            bgcolor:
              userRole === "Admin"
                ? "#e74c3c"
                : userRole === "Librarian"
                  ? "#3498db"
                  : "#95a5a6",
            color: "white",
            fontSize: 11,
          }}
        />
      </Box>

      <List sx={{ flex: 1, py: 2 }}>
        {/* Dashboard */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("dashboard")}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor:
                currentView === "dashboard"
                  ? "rgba(52, 152, 219, 0.2)"
                  : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
              <Dashboard />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        {/* Book Management */}
        {(userRole === "Admin" || userRole === "Librarian") && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setBooksOpen(!booksOpen)}
                sx={{
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                  <MenuBook />
                </ListItemIcon>
                <ListItemText
                  primary="Book Management"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
                {booksOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={booksOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("books-list")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "books-list"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="All Books"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleNavigation("books-add")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "books-add"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <Add fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Add Book"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Reader Management */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setReadersOpen(!readersOpen)}
                sx={{
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                  <People />
                </ListItemIcon>
                <ListItemText
                  primary="Reader Management"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
                {readersOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={readersOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("readers-list")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "readers-list"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="All Readers"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleNavigation("readers-add")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "readers-add"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <PersonAdd fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Register Reader"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Borrowing & Returning */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setBorrowingOpen(!borrowingOpen)}
                sx={{
                  px: 3,
                  py: 1.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                  <SwapHoriz />
                </ListItemIcon>
                <ListItemText
                  primary="Borrowing"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
                <Chip
                  label={stats.borrowedBooks}
                  size="small"
                  sx={{
                    bgcolor: "#27ae60",
                    color: "white",
                    height: 20,
                    fontSize: 11,
                  }}
                />
                {borrowingOpen ? (
                  <ExpandLess sx={{ ml: 1 }} />
                ) : (
                  <ExpandMore sx={{ ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
            <Collapse in={borrowingOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation("borrow-book")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "borrow-book"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <Add fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Borrow Book"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleNavigation("return-book")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "return-book"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <History fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Return Book"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                </ListItemButton>
                <ListItemButton
                  onClick={() => handleNavigation("borrow-history")}
                  sx={{
                    pl: 7,
                    py: 1,
                    bgcolor:
                      currentView === "borrow-history"
                        ? "rgba(52, 152, 219, 0.2)"
                        : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 30, color: "rgba(255,255,255,0.7)" }}
                  >
                    <History fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Borrow History"
                    primaryTypographyProps={{ fontSize: 13 }}
                  />
                  {stats.overdueBooks > 0 && (
                    <Chip
                      label={stats.overdueBooks}
                      size="small"
                      sx={{
                        bgcolor: "#e74c3c",
                        color: "white",
                        height: 18,
                        fontSize: 10,
                      }}
                    />
                  )}
                </ListItemButton>
              </List>
            </Collapse>

            {/* Fines & Penalties */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation("fines")}
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor:
                    currentView === "fines"
                      ? "rgba(52, 152, 219, 0.2)"
                      : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                  <AttachMoney />
                </ListItemIcon>
                <ListItemText
                  primary="Fines & Penalties"
                  primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                />
                {stats.totalFines > 0 && (
                  <Chip
                    label={`$${stats.totalFines}`}
                    size="small"
                    sx={{
                      bgcolor: "#e74c3c",
                      color: "white",
                      height: 20,
                      fontSize: 11,
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          </>
        )}

        {/* Reservations */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("reservations")}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor:
                currentView === "reservations"
                  ? "rgba(52, 152, 219, 0.2)"
                  : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
              <BookmarkAdded />
            </ListItemIcon>
            <ListItemText
              primary="Reservations"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
            {stats.pendingReservations > 0 && (
              <Chip
                label={stats.pendingReservations}
                size="small"
                sx={{
                  bgcolor: "#f39c12",
                  color: "white",
                  height: 20,
                  fontSize: 11,
                }}
              />
            )}
          </ListItemButton>
        </ListItem>

        {/* Search & Filters */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleNavigation("search")}
            sx={{
              px: 3,
              py: 1.5,
              bgcolor:
                currentView === "search"
                  ? "rgba(52, 152, 219, 0.2)"
                  : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
              <Search />
            </ListItemIcon>
            <ListItemText
              primary="Search Books"
              primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>

        {/* Reports (Admin/Librarian only) */}
        {(userRole === "Admin" || userRole === "Librarian") && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation("reports")}
              sx={{
                px: 3,
                py: 1.5,
                bgcolor:
                  currentView === "reports"
                    ? "rgba(52, 152, 219, 0.2)"
                    : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                <Assessment />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {/* Settings (Admin only) */}
        {userRole === "Admin" && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation("settings")}
              sx={{
                px: 3,
                py: 1.5,
                bgcolor:
                  currentView === "settings"
                    ? "rgba(52, 152, 219, 0.2)"
                    : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "white" }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      {/* Footer Stats */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.6)", display: "block", mb: 0.5 }}
        >
          Quick Stats
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}
            >
              Books
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {stats.totalBooks}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}
            >
              Active
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {stats.activeReaders}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)", fontSize: 10 }}
            >
              Borrowed
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {stats.borrowedBooks}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
