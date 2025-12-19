"use client";

import { Box, Paper, Typography, LinearProgress, Grid } from "@mui/material";
import {
  MenuBook,
  People,
  SwapHoriz,
  Warning,
  TrendingUp,
  AttachMoney,
} from "@mui/icons-material";
import { useLibraryStore } from "../store/libraryStore";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${color}20`,
            p: 1.5,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const { getDashboardStats, books, borrowRecords } = useLibraryStore();
  const stats = getDashboardStats();

  // Calculate additional metrics
  const borrowRate =
    stats.totalBooks > 0
      ? Math.round((stats.borrowedBooks / stats.totalBooks) * 100)
      : 0;

  // Get most popular books (mock data for now)
  const popularBooks = [
    { title: "The Hobbit", borrows: 45 },
    { title: "Steve Jobs", borrows: 38 },
    { title: "1984", borrows: 32 },
    { title: "Harry Potter", borrows: 29 },
    { title: "The Fault in Our Stars", borrows: 25 },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Library management system overview
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon={<MenuBook sx={{ fontSize: 32, color: "#3498db" }} />}
            color="#3498db"
            subtitle="in collection"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Readers"
            value={stats.activeReaders}
            icon={<People sx={{ fontSize: 32, color: "#27ae60" }} />}
            color="#27ae60"
            subtitle="registered members"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Books Borrowed"
            value={stats.borrowedBooks}
            icon={<SwapHoriz sx={{ fontSize: 32, color: "#f39c12" }} />}
            color="#f39c12"
            subtitle="currently out"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overdue Books"
            value={stats.overdueBooks}
            icon={<Warning sx={{ fontSize: 32, color: "#e74c3c" }} />}
            color="#e74c3c"
            subtitle="need attention"
          />
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Library Utilization
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Books in Circulation
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {borrowRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={borrowRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#ecf0f1",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#3498db",
                  },
                }}
              />
            </Box>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "#ecf0f1",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#27ae60" }}
                  >
                    {stats.totalBooks - stats.borrowedBooks}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    bgcolor: "#ecf0f1",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Reserved
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#f39c12" }}
                  >
                    {stats.pendingReservations}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: "#3498db" }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Most Popular Books
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {popularBooks.map((book, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 2,
                    borderBottom:
                      index < popularBooks.length - 1
                        ? "1px solid #ecf0f1"
                        : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: index < 3 ? "#3498db" : "#95a5a6",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {book.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {book.borrows} borrows
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Overview */}
      {stats.totalFines > 0 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AttachMoney sx={{ mr: 1, color: "#e74c3c" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Unpaid Fines
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#e74c3c" }}>
            ${stats.totalFines.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total outstanding fines and penalties
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
