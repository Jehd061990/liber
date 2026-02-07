"use client";

import { Box, Typography } from "@mui/material";
import React from "react";
import Sidebar from "./Sidebar/Sidebar";
import Dashboard from "@/app/(modules)/dashboard/page";
import Books from "../(modules)/books/page";
import Readers from "../(modules)/readers/page";
import Barrowers from "../(modules)/barrowers/page";
import Fines from "../(modules)/fines/page";
import { useLibraryStore } from "@/app/store/libraryStore";

const MainPage = () => {
  const { currentView } = useLibraryStore();

  const viewConfig: Record<
    string,
    { title: string; element: React.ReactNode }
  > = {
    dashboard: { title: "Dashboard", element: <Dashboard /> },
    "books-list": { title: "Books Management", element: <Books /> },
    "books-add": { title: "Books Management", element: <Books /> },
    "readers-list": {
      title: "Readers Management",
      element: <Readers />,
    },
    "readers-add": {
      title: "Readers Management",
      element: <Readers />,
    },
    "borrow-book": {
      title: "Borrowing & Returns",
      element: <Barrowers />,
    },
    "return-book": {
      title: "Borrowing & Returns",
      element: <Barrowers />,
    },
    "borrow-history": {
      title: "Borrowing & Returns",
      element: <Barrowers />,
    },
    fines: { title: "Fines & Penalties", element: <Fines /> },
  };

  const activeView = viewConfig[currentView] || viewConfig.dashboard;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ p: 3, flex: 1, minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {activeView.title}
        </Typography>
        {activeView.element}
      </Box>
    </Box>
  );
};

export default MainPage;
