import BookSection from "@/app/components/BookSection";
import { Box } from "@mui/material";
import React from "react";

const recentlyAddedBooks = [
  {
    id: "1",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/81VStYnDGrL.jpg",
    rating: 4.5,
  },
  {
    id: "2",
    title: "Radical",
    author: "David Platt",
    coverImage: "https://m.media-amazon.com/images/I/71qKQ5p3IzL._SY522_.jpg",
    rating: 4.5,
  },
  {
    id: "3",
    title: "Ender's Game",
    author: "Orson Scott Card",
    coverImage: "https://m.media-amazon.com/images/I/81ot7HXZjFL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "4",
    title: "The Perks of Being a Wallflower",
    author: "Stephen Chbosky",
    coverImage: "https://m.media-amazon.com/images/I/71S94aFZVPL._SY522_.jpg",
    rating: 3,
  },
  {
    id: "5",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    coverImage: "https://m.media-amazon.com/images/I/712cDO7d73L._SY522_.jpg",
    rating: 5,
  },
  {
    id: "6",
    title: "Holbein - Masterpieces",
    author: "Various Artists",
    coverImage: "https://m.media-amazon.com/images/I/91MYdFZ6SQL._SY522_.jpg",
    rating: 3,
  },
  {
    id: "7",
    title: "The Coral Island",
    author: "R.M. Ballantyne",
    coverImage: "https://m.media-amazon.com/images/I/91xFZhFz4cL._SY522_.jpg",
    rating: 4,
  },
];

const recommendedBooks = [
  {
    id: "8",
    title: "An American Life",
    author: "Ronald Reagan",
    coverImage: "https://m.media-amazon.com/images/I/71-V8GqxlEL._SY522_.jpg",
    rating: 3.5,
  },
  {
    id: "9",
    title: "The Return of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    coverImage: "https://m.media-amazon.com/images/I/71w3AhPmFQL._SY522_.jpg",
    rating: 4.5,
  },
  {
    id: "10",
    title: "Ender's Game",
    author: "Orson Scott Card",
    coverImage: "https://m.media-amazon.com/images/I/81ot7HXZjFL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "11",
    title: "The Sound of Things Falling",
    author: "Juan Gabriel Vásquez",
    coverImage: "https://m.media-amazon.com/images/I/71pGmKPEL9L._SY522_.jpg",
    rating: 4,
  },
  {
    id: "12",
    title: "The Fault in Our Stars",
    author: "John Green",
    coverImage: "https://m.media-amazon.com/images/I/817tHNcyAgL._SY522_.jpg",
    rating: 4.5,
  },
  {
    id: "13",
    title: "Just My Type",
    author: "Simon Garfield",
    coverImage: "https://m.media-amazon.com/images/I/71p2c7c8EYL._SY522_.jpg",
    rating: 5,
  },
  {
    id: "14",
    title: "Wake",
    author: "Amanda Hocking",
    coverImage: "https://m.media-amazon.com/images/I/81Yh+FGSIVL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "15",
    title: "Fearless Cricket",
    author: "Anand Kumar",
    coverImage: "https://m.media-amazon.com/images/I/91hFQx9ZFZL._SY522_.jpg",
    rating: 3,
  },
  {
    id: "16",
    title: "Execute",
    author: "Drew Wilson & Josh Long",
    coverImage: "https://m.media-amazon.com/images/I/41xVzcG5AFL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "17",
    title: "Harry Potter and the Deathly Hallows",
    author: "J.K. Rowling",
    coverImage: "https://m.media-amazon.com/images/I/71sH3vxziLL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "18",
    title: "I Kissed Dating Goodbye",
    author: "Joshua Harris",
    coverImage: "https://m.media-amazon.com/images/I/71HEXJzRBTL._SY522_.jpg",
    rating: 3,
  },
  {
    id: "19",
    title: "White Fang",
    author: "Jack London",
    coverImage: "https://m.media-amazon.com/images/I/81CzbVV+kDL._SY522_.jpg",
    rating: 4,
  },
  {
    id: "20",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    coverImage: "https://m.media-amazon.com/images/I/71UYjv-VBSL._SY522_.jpg",
    rating: 5,
  },
  {
    id: "21",
    title: "The Harbinger",
    author: "Jonathan Cahn",
    coverImage: "https://m.media-amazon.com/images/I/81X7PQs3dyL._SY522_.jpg",
    rating: 5,
  },
];

const BooksList = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 4, bgcolor: "#fafafa", minHeight: "100vh" }}>
      <BookSection
        title="Recently Added"
        books={recentlyAddedBooks}
        variant="horizontal"
      />
      <BookSection
        title="Recommended For You"
        books={recommendedBooks}
        variant="grid"
      />
    </Box>
  );
};

export default BooksList;
