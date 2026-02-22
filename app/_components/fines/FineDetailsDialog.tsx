"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Close, Edit } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/app/lib/apiClient";
import { useState, useEffect } from "react";

interface Fine {
  _id: string;
  fineIdString?: string;
  type?: string;
  status?: string;
  reason?: string;
  amount?: number;
  createdAt?: string;
  paidAt?: string;
  reader?: { fullName?: string };
  bookTitle?: string;
}

interface FineDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  fineId: string | null;
}

async function fetchFineById(id: string) {
  const res = await apiClient.get(`/fines/${id}`);
  return res.data?.fine ?? res.data;
}

export default function FineDetailsDialog({
  open,
  onClose,
  fineId,
}: FineDetailsDialogProps) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ amount: 0, reason: "", status: "unpaid" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: fine,
    isLoading,
    isError,
    refetch,
  } = useQuery<Fine | null>({
    queryKey: ["fine", fineId],
    queryFn: () => (fineId ? fetchFineById(fineId) : null),
    enabled: !!fineId && open,
  });

  useEffect(() => {
    if (fine)
      setForm({
        amount: fine.amount ?? 0,
        reason: fine.reason ?? "",
        status: fine.status ?? "unpaid",
      });
  }, [fine]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Fine Details</Typography>
        <Box>
          {fine && !editMode && (
            <IconButton
              onClick={() => setEditMode(true)}
              size="small"
              color="primary"
            >
              <Edit />
            </IconButton>
          )}
          <IconButton onClick={onClose} size="small" color="inherit">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error">Failed to load fine details.</Typography>
        ) : fine ? (
          <Paper elevation={0} sx={{ bgcolor: "#f8f9fa", p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Fine ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fine.fineIdString}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">{fine.type}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                {editMode ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    sx={{ mt: 0.5 }}
                  >
                    <MenuItem value="unpaid">Unpaid</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                  </TextField>
                ) : (
                  <Typography variant="body1">{fine.status}</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Reason
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={form.reason}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, reason: e.target.value }))
                    }
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">{fine.reason}</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    sx={{ mt: 0.5 }}
                  />
                ) : (
                  <Typography variant="body1">${fine.amount}</Typography>
                )}
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {fine.createdAt
                    ? new Date(fine.createdAt).toLocaleString()
                    : "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Paid At
                </Typography>
                <Typography variant="body1">
                  {fine.paidAt ? new Date(fine.paidAt).toLocaleString() : "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Reader Name
                </Typography>
                <Typography variant="body1">
                  {fine.reader?.fullName || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Book ID
                </Typography>
                <Typography variant="body1">{fine.bookTitle}</Typography>
              </Grid>
            </Grid>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Paper>
        ) : (
          <Typography>No fine details found.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <>
            <Button
              onClick={() => {
                setEditMode(false);
                setError(null);
                if (fine)
                  setForm({
                    amount: fine.amount ?? 0,
                    reason: fine.reason ?? "",
                    status: fine.status ?? "unpaid",
                  });
              }}
              color="inherit"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  await apiClient.put(`/fines/${fineId}`, {
                    amount: form.amount,
                    reason: form.reason,
                    status: form.status,
                  });
                  setEditMode(false);
                  refetch();
                } catch (e: any) {
                  setError(
                    e?.response?.data?.message || "Failed to update fine",
                  );
                } finally {
                  setSaving(false);
                }
              }}
              variant="contained"
              disabled={saving}
            >
              Save
            </Button>
          </>
        ) : (
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
