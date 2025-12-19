"use client";

import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Rating,
} from "@mui/material";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
}

export default function BookCard({
  title,
  author,
  coverImage,
  rating,
}: BookCardProps) {
  return (
    <Card
      sx={{
        width: 140,
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        },
      }}
    >
      <CardMedia
        component="img"
        image={coverImage}
        alt={title}
        sx={{
          height: 200,
          objectFit: "cover",
        }}
      />
      <CardContent sx={{ p: 1.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: 13,
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: 36,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#666",
            fontSize: 11,
            display: "block",
            mb: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {author}
        </Typography>
        <Rating
          value={rating}
          readOnly
          size="small"
          precision={0.5}
          sx={{ fontSize: 14 }}
        />
      </CardContent>
    </Card>
  );
}
