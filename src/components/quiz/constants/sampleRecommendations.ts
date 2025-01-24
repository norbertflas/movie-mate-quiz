import type { MovieRecommendation } from "../QuizTypes";

export const SAMPLE_RECOMMENDATIONS: MovieRecommendation[] = [
  {
    id: 603,
    title: "The Matrix",
    overview: "A computer programmer discovers a mysterious world beneath reality.",
    poster_path: "/placeholder.svg",
    release_date: "1999-03-31",
    vote_average: 8.7,
    genre: "Sci-Fi",
    trailer_url: "https://www.youtube.com/watch?v=m8e-FF8MsqU",
    explanations: [
      "Matches your preferred genres",
      "High user rating",
      "Popular in your region"
    ]
  },
  {
    id: 27205,
    title: "Inception",
    overview: "A thief who steals corporate secrets through dream-sharing technology.",
    poster_path: "/placeholder.svg",
    release_date: "2010-07-16",
    vote_average: 8.8,
    genre: "Sci-Fi",
    trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    explanations: [
      "Similar to movies you like",
      "Matches your preferences",
      "Highly rated"
    ]
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview: "Two imprisoned men bond over a number of years.",
    poster_path: "/placeholder.svg",
    release_date: "1994-09-23",
    vote_average: 9.3,
    genre: "Drama",
    trailer_url: "https://www.youtube.com/watch?v=6hB3S9bIaco",
    explanations: [
      "Top rated movie",
      "Matches your genre preferences",
      "Universal appeal"
    ]
  }
];