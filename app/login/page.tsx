"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibraryStore } from "@/app/store/libraryStore";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, setAuthToken } = useLibraryStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      router.replace("/");
    }
  }, [currentUser, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "https://liber-be.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );

      const payload = response.data?.data ?? response.data;
      const user = payload?.user ?? payload;
      const token =
        payload?.token ??
        payload?.accessToken ??
        payload?.jwt ??
        user?.token ??
        user?.accessToken ??
        null;

      setCurrentUser({
        id: user?.id ?? user?._id ?? Date.now().toString(),
        name: user?.name ?? user?.fullName ?? email.split("@")[0] ?? "User",
        role: user?.role ?? "Admin",
      });
      setAuthToken(token);

      router.replace("/");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgba(52,152,219,0.15), rgba(155,89,182,0.15))",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Login to access your library dashboard
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              type="email"
              margin="normal"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              margin="normal"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{
                mt: 3,
                py: 1.2,
                bgcolor: "#3498db",
                "&:hover": {
                  bgcolor: "#2980b9",
                },
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
