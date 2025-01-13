import type { MovieRecommendation } from "../QuizTypes";

export const SAMPLE_RECOMMENDATIONS: MovieRecommendation[] = [
  {
    id: 1,
    tmdbId: 603,
    title: "The Matrix",
    year: "1999",
    platform: "Netflix",
    genre: "Sci-Fi",
    imageUrl: "/placeholder.svg",
    description: "A computer programmer discovers a mysterious world beneath reality.",
    trailerUrl: "https://www.youtube.com/watch?v=m8e-FF8MsqU",
    rating: 87,
    tags: ["action", "sci-fi", "cyberpunk"]
  },
  {
    id: 2,
    tmdbId: 27205,
    title: "Inception",
    year: "2010",
    platform: "HBO Max",
    genre: "Sci-Fi",
    imageUrl: "/placeholder.svg",
    description: "A thief who steals corporate secrets through dream-sharing technology.",
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    rating: 88,
    tags: ["action", "sci-fi", "thriller"]
  },
  {
    id: 3,
    tmdbId: 278,
    title: "The Shawshank Redemption",
    year: "1994",
    platform: "Prime Video",
    genre: "Drama",
    imageUrl: "/placeholder.svg",
    description: "Two imprisoned men bond over a number of years.",
    trailerUrl: "https://www.youtube.com/watch?v=6hB3S9bIaco",
    rating: 93,
    tags: ["drama", "prison", "friendship"]
  }
];