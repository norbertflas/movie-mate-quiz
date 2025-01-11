export const VOD_SERVICES = [
  "Netflix",
  "HBO Max",
  "Disney+",
  "Amazon Prime",
  "Apple TV+",
  "Canal+",
  "SkyShowtime",
  "Player",
];

export const SURVEY_STEPS = [
  {
    id: "vod",
    question: "Wybierz serwisy VOD, z których korzystasz:",
    type: "multiple",
    options: VOD_SERVICES,
  },
  {
    id: "type",
    question: "Co Cię interesuje?",
    type: "single",
    options: ["Film", "Serial"],
  },
  {
    id: "length",
    question: "Preferowana długość:",
    type: "single",
    options: [],
    getDynamicOptions: (answers: Record<string, any>) => {
      if (answers.type === "Film") {
        return ["Do 1.5h", "1.5h - 2h", "Powyżej 2h"];
      }
      return ["20-30 min", "40-50 min", "Powyżej 1h"];
    },
  },
  {
    id: "seasons",
    question: "Preferowana ilość sezonów:",
    type: "single",
    options: ["1 sezon", "2-3 sezony", "4+ sezonów"],
    shouldShow: (answers: Record<string, any>) => answers.type === "Serial",
  },
  {
    id: "genre",
    question: "Jaki gatunek Cię interesuje?",
    type: "single",
    options: [
      "Akcja",
      "Komedia",
      "Dramat",
      "Sci-Fi",
      "Horror",
      "Romans",
      "Thriller",
      "Dokument",
    ],
  },
  {
    id: "mood",
    question: "Jaki nastrój Cię interesuje?",
    type: "single",
    options: [
      "Lekki/Zabawny",
      "Poważny/Dramatyczny",
      "Trzymający w napięciu",
      "Inspirujący",
    ],
  },
];

export const MOVIE_CATEGORIES = [
  "Akcja",
  "Komedia",
  "Dramat",
  "Sci-Fi",
  "Horror",
  "Romans",
  "Thriller",
  "Dokument",
  "Animacja",
  "Fantasy",
  "Kryminał",
  "Przygodowy",
  "Biograficzny",
  "Wojenny",
  "Muzyczny",
  "Sportowy",
] as const;

export const SAMPLE_RECOMMENDATIONS = [
  {
    title: "Stranger Things",
    year: "2016",
    platform: "Netflix",
    genre: "Sci-Fi",
    imageUrl: "https://picsum.photos/seed/movie1/400/225",
    description: "Gdy chłopiec znika w małym miasteczku, jego przyjaciele, rodzina i policja zostają wciągnięci w serię tajemniczych wydarzeń.",
    trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
    rating: 8.7,
    tags: ["Trending", "Popularne", "Horror", "Młodzieżowy"]
  },
  {
    title: "The Last of Us",
    year: "2023",
    platform: "HBO Max",
    genre: "Dramat",
    imageUrl: "https://picsum.photos/seed/movie2/400/225",
    description: "W świecie spustoszonym przez pandemię, ocalały przemytnik Joel zostaje zatrudniony do wyprowadzenia 14-letniej dziewczynki ze strefy kwarantanny.",
    trailerUrl: "https://www.youtube.com/embed/uLtkt8Bonw",
    rating: 8.8,
    tags: ["Nagrodzony", "Hit", "Postapokaliptyczny", "Adaptacja gry"]
  },
  {
    title: "The Mandalorian",
    year: "2019",
    platform: "Disney+",
    genre: "Akcja",
    imageUrl: "https://picsum.photos/seed/movie3/400/225",
    description: "Samotny łowca nagród przemierza najdalsze zakątki galaktyki, z dala od władzy Nowej Republiki.",
    trailerUrl: "https://www.youtube.com/embed/aOC8E8z_ifw",
    rating: 8.7,
    tags: ["Star Wars", "Space Opera", "Przygodowy"]
  },
  {
    title: "The Boys",
    year: "2019",
    platform: "Amazon Prime",
    genre: "Akcja",
    imageUrl: "https://picsum.photos/seed/movie4/400/225",
    description: "Grupa samozwańczych mścicieli postanawia rozprawić się z superbohaterami, którzy nadużywają swoich mocy.",
    trailerUrl: "https://www.youtube.com/embed/M1bhOaLV4FU",
    rating: 8.7,
    tags: ["Superbohaterowie", "Brutalny", "Satyryczny"]
  },
  {
    title: "Ted Lasso",
    year: "2020",
    platform: "Apple TV+",
    genre: "Komedia",
    imageUrl: "https://picsum.photos/seed/movie5/400/225",
    description: "Amerykański trener futbolu zostaje zatrudniony do prowadzenia angielskiej drużyny piłkarskiej.",
    trailerUrl: "https://www.youtube.com/embed/3u7EIiohs6U",
    rating: 8.8,
    tags: ["Feel Good", "Sport", "Nagrodzony"]
  },
  {
    title: "Wednesday",
    year: "2022",
    platform: "Netflix",
    genre: "Komedia",
    imageUrl: "https://picsum.photos/seed/movie6/400/225",
    description: "Wednesday Addams trafia do Akademii Nevermore, gdzie próbuje opanować swoje zdolności psychiczne i rozwiązać zagadkę kryminalną.",
    trailerUrl: "https://www.youtube.com/embed/Di310WS8zLk",
    rating: 8.2,
    tags: ["Młodzieżowy", "Fantasy", "Mystery"]
  },
  {
    title: "House of the Dragon",
    year: "2022",
    platform: "HBO Max",
    genre: "Fantasy",
    imageUrl: "https://picsum.photos/seed/movie7/400/225",
    description: "Serial opowiada historię rodu Targaryenów i wydarzeń prowadzących do wojny domowej znanej jako Taniec Smoków.",
    trailerUrl: "https://www.youtube.com/embed/DotnJ7tTA34",
    rating: 8.5,
    tags: ["Epic", "Fantasy", "Średniowiecze"]
  },
  {
    title: "Succession",
    year: "2018",
    platform: "HBO Max",
    genre: "Dramat",
    imageUrl: "https://picsum.photos/seed/movie8/400/225",
    description: "Saga o potężnej rodzinie medialnej i ich globalnym imperium, gdy jej patriarcha postanawia ustąpić ze stanowiska.",
    trailerUrl: "https://www.youtube.com/embed/OzYxJV_rmE8",
    rating: 8.9,
    tags: ["Nagrodzony", "Biznes", "Rodzinny dramat"]
  },
  {
    title: "The Bear",
    year: "2022",
    platform: "Disney+",
    genre: "Dramat",
    imageUrl: "https://picsum.photos/seed/movie9/400/225",
    description: "Młody szef kuchni wraca do Chicago, aby prowadzić rodzinną restaurację z kanapkami.",
    trailerUrl: "https://www.youtube.com/embed/y-cqqAJIXhs",
    rating: 8.7,
    tags: ["Kulinaria", "Dramat rodzinny", "Nagrodzony"]
  },
  {
    title: "Black Mirror",
    year: "2011",
    platform: "Netflix",
    genre: "Sci-Fi",
    imageUrl: "https://picsum.photos/seed/movie10/400/225",
    description: "Antologia science fiction eksplorująca mroczną i czasami satyryczną stronę technologii i społeczeństwa.",
    trailerUrl: "https://www.youtube.com/embed/V0XOApF5nLU",
    rating: 8.8,
    tags: ["Antologia", "Technologia", "Dystopia"]
  }
];
