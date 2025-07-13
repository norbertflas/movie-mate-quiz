
import { Movie } from "@/types/movie";

// =============================================================================
// 1. SOCIAL FEATURES TYPES
// =============================================================================

export interface WatchParty {
  id: string;
  hostId: string;
  hostName: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  scheduledTime: Date;
  currentTime: number; // seconds
  isPlaying: boolean;
  participants: WatchPartyParticipant[];
  chatMessages: ChatMessage[];
  settings: {
    allowChatSpoilers: boolean;
    requireSync: boolean;
    maxParticipants: number;
    isPublic: boolean;
  };
  status: 'scheduled' | 'live' | 'ended';
  createdAt: Date;
}

export interface WatchPartyParticipant {
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: Date;
  currentTime: number;
  isHost: boolean;
  permissions: {
    canControl: boolean;
    canChat: boolean;
    canInvite: boolean;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'reaction' | 'spoiler';
  replyToId?: string;
  reactions?: { emoji: string; userIds: string[] }[];
  isSpoiler?: boolean;
}

export interface MovieClub {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  creatorName: string;
  memberCount: number;
  isPublic: boolean;
  theme: 'general' | 'genre' | 'decade' | 'director' | 'custom';
  themeDetails?: {
    genre?: string;
    decade?: string;
    director?: string;
    customCriteria?: string;
  };
  rules: string[];
  tags: string[];
  currentDiscussion?: ClubDiscussion;
  upcomingMovies: {
    movieId: number;
    title: string;
    poster: string;
    scheduledDate: Date;
    votes: number;
  }[];
  stats: {
    totalMoviesWatched: number;
    averageRating: number;
    mostActiveMembers: string[];
  };
  createdAt: Date;
  lastActivity: Date;
}

export interface ClubMember {
  userId: string;
  userName: string;
  userAvatar: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  contributionScore: number;
  badges: string[];
  stats: {
    moviesWatched: number;
    discussionsStarted: number;
    repliesPosted: number;
    averageRating: number;
  };
}

export interface ClubDiscussion {
  id: string;
  clubId: string;
  movieId: number;
  movieTitle: string;
  moviePoster: string;
  title: string;
  description: string;
  startedBy: string;
  starterName: string;
  startedAt: Date;
  expiresAt?: Date;
  posts: DiscussionPost[];
  polls: DiscussionPoll[];
  participantCount: number;
  tags: string[];
  isActive: boolean;
  isPinned: boolean;
}

export interface DiscussionPost {
  id: string;
  discussionId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  rating?: number; // 1-5 stars for the movie
  timestamp: Date;
  likes: string[]; // userIds who liked
  replies: DiscussionReply[];
  isSpoiler: boolean;
  tags: string[];
  type: 'review' | 'discussion' | 'question' | 'recommendation';
}

export interface DiscussionReply {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  likes: string[];
  replyToId?: string; // nested replies
}

export interface DiscussionPoll {
  id: string;
  discussionId: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: string[]; // userIds
  }[];
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  allowMultiple: boolean;
  isActive: boolean;
}

export interface CollaborativeRating {
  movieId: number;
  ratings: {
    userId: string;
    userName: string;
    rating: number; // 1-5
    review?: string;
    timestamp: Date;
    helpful: string[]; // userIds who found helpful
  }[];
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>; // rating -> count
  tags: Record<string, number>; // tag -> frequency
  lastUpdated: Date;
}
