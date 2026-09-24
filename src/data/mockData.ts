export const platformMetrics = {
  studentsHelped: 3847,
  tutorsActive: 412,
  volunteerHours: 12840,
};

export interface Tutor {
  id: string;
  name: string;
  grade: string;
  subjects: string[];
  hours: number;
  rating: number;
  studentsHelped: number;
  avatar: string;
  bio: string;
  available: boolean;
}

export const tutors: Tutor[] = [
  {
    id: "1",
    name: "Maya Chen",
    grade: "11th grade",
    subjects: ["Algebra II", "Chemistry"],
    hours: 48,
    rating: 4.9,
    studentsHelped: 23,
    avatar: "MC",
    bio: "Math & science tutor based in Oregon. I help students anywhere — same classes, same struggles.",
    available: true,
  },
  {
    id: "2",
    name: "Jordan Rivera",
    grade: "12th grade",
    subjects: ["AP US History", "English"],
    hours: 62,
    rating: 4.8,
    studentsHelped: 31,
    avatar: "JR",
    bio: "History and writing help. Online sessions with students across the country.",
    available: true,
  },
  {
    id: "3",
    name: "Aisha Patel",
    grade: "10th grade",
    subjects: ["Geometry", "Biology"],
    hours: 34,
    rating: 4.7,
    studentsHelped: 18,
    avatar: "AP",
    bio: "Patient tutor focused on building confidence in STEM subjects.",
    available: false,
  },
  {
    id: "4",
    name: "Ethan Brooks",
    grade: "12th grade",
    subjects: ["Calculus", "Physics"],
    hours: 71,
    rating: 5.0,
    studentsHelped: 29,
    avatar: "EB",
    bio: "Senior who competed in Science Olympiad. Ask me about problem sets!",
    available: true,
  },
];

export interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
}

export interface Conversation {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  subject: string;
  lastMessage: string;
  unread: number;
  active: boolean;
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    id: "c1",
    tutorId: "1",
    tutorName: "Maya Chen",
    tutorAvatar: "MC",
    subject: "Algebra II — Quadratic Equations",
    lastMessage: "Try substituting x = 3 into the original equation.",
    unread: 2,
    active: true,
    messages: [
      {
        id: "m1",
        author: "Maya Chen",
        avatar: "MC",
        content: "Hey! I saw your request about factoring quadratics. Want to walk through problem #7 together?",
        timestamp: "2:14 PM",
      },
      {
        id: "m2",
        author: "You",
        avatar: "EP",
        content: "Yes please! I keep getting stuck when the leading coefficient isn't 1.",
        timestamp: "2:16 PM",
        isOwn: true,
      },
      {
        id: "m3",
        author: "Maya Chen",
        avatar: "MC",
        content: "That's super common. Let's use the AC method — I'll share my whiteboard notes.",
        timestamp: "2:17 PM",
      },
      {
        id: "m4",
        author: "Maya Chen",
        avatar: "MC",
        content: "Try substituting x = 3 into the original equation.",
        timestamp: "2:22 PM",
      },
    ],
  },
  {
    id: "c2",
    tutorId: "2",
    tutorName: "Jordan Rivera",
    tutorAvatar: "JR",
    subject: "AP US History — Essay Review",
    lastMessage: "Your thesis is strong. Let's tighten paragraph 2.",
    unread: 0,
    active: false,
    messages: [
      {
        id: "m5",
        author: "Jordan Rivera",
        avatar: "JR",
        content: "I read your draft on the New Deal. Your thesis is strong. Let's tighten paragraph 2.",
        timestamp: "Yesterday",
      },
    ],
  },
  {
    id: "c3",
    tutorId: "4",
    tutorName: "Ethan Brooks",
    tutorAvatar: "EB",
    subject: "Physics — Kinematics",
    lastMessage: "Session scheduled for Thursday at 4 PM.",
    unread: 0,
    active: false,
    messages: [
      {
        id: "m6",
        author: "Ethan Brooks",
        avatar: "EB",
        content: "Session scheduled for Thursday at 4 PM. I'll send practice problems beforehand.",
        timestamp: "Mon",
      },
    ],
  },
];

export interface TutorRequest {
  id: string;
  studentName: string;
  subject: string;
  topic: string;
  urgency: "low" | "medium" | "high";
  requestedAt: string;
}

export const incomingRequests: TutorRequest[] = [
  {
    id: "r1",
    studentName: "Sam L.",
    subject: "Chemistry",
    topic: "Balancing redox equations",
    urgency: "high",
    requestedAt: "10 min ago",
  },
  {
    id: "r2",
    studentName: "Taylor K.",
    subject: "Geometry",
    topic: "Proof writing help",
    urgency: "medium",
    requestedAt: "1 hr ago",
  },
  {
    id: "r3",
    studentName: "Chris M.",
    subject: "English",
    topic: "Thesis statement for book report",
    urgency: "low",
    requestedAt: "3 hrs ago",
  },
];

export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export const tutorReviews: Review[] = [
  {
    id: "rev1",
    studentName: "Alex T.",
    rating: 5,
    comment: "Maya explained quadratics better than my textbook. Super patient!",
    date: "Jun 18",
  },
  {
    id: "rev2",
    studentName: "Priya N.",
    rating: 5,
    comment: "Helped me prep for my chem quiz in one session. Would recommend.",
    date: "Jun 15",
  },
  {
    id: "rev3",
    studentName: "Marcus W.",
    rating: 4,
    comment: "Great session on factoring. Wish we had more time!",
    date: "Jun 12",
  },
];

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export const tutorBadges: Badge[] = [
  {
    id: "b1",
    name: "First Session",
    description: "Completed your first tutoring session",
    icon: "🌱",
    earned: true,
    earnedDate: "Sep 2025",
  },
  {
    id: "b2",
    name: "10 Hours Club",
    description: "Logged 10 verified volunteer hours",
    icon: "⏱️",
    earned: true,
    earnedDate: "Oct 2025",
  },
  {
    id: "b3",
    name: "Community Builder",
    description: "Helped 15 different students",
    icon: "🤝",
    earned: true,
    earnedDate: "Nov 2025",
  },
  {
    id: "b4",
    name: "5-Star Mentor",
    description: "Maintained a 4.8+ rating across 10 reviews",
    icon: "⭐",
    earned: true,
    earnedDate: "Dec 2025",
  },
  {
    id: "b5",
    name: "50 Hours Hero",
    description: "Logged 50 verified volunteer hours",
    icon: "🏅",
    earned: false,
  },
  {
    id: "b6",
    name: "Subject Expert",
    description: "Tutor in 3+ subjects with 20+ sessions each",
    icon: "📚",
    earned: false,
  },
];

export interface SessionRecord {
  id: string;
  tutorName: string;
  studentName: string;
  subject: string;
  date: string;
  duration: string;
  status: "completed" | "scheduled" | "cancelled";
}

export const sessionHistory: SessionRecord[] = [
  {
    id: "s1",
    tutorName: "Maya Chen",
    studentName: "Alex T.",
    subject: "Algebra II",
    date: "Jun 18, 2026",
    duration: "45 min",
    status: "completed",
  },
  {
    id: "s2",
    tutorName: "Maya Chen",
    studentName: "Priya N.",
    subject: "Chemistry",
    date: "Jun 15, 2026",
    duration: "30 min",
    status: "completed",
  },
  {
    id: "s3",
    tutorName: "Maya Chen",
    studentName: "Marcus W.",
    subject: "Algebra II",
    date: "Jun 12, 2026",
    duration: "50 min",
    status: "completed",
  },
  {
    id: "s4",
    tutorName: "Maya Chen",
    studentName: "Sam L.",
    subject: "Chemistry",
    date: "Jun 25, 2026",
    duration: "45 min",
    status: "scheduled",
  },
];

export const volunteerHoursData = {
  totalHours: 48.5,
  verifiedHours: 44.0,
  pendingHours: 4.5,
  sessions: [
    { date: "Jun 18, 2026", student: "Alex T.", subject: "Algebra II", hours: 0.75, verified: true },
    { date: "Jun 15, 2026", student: "Priya N.", subject: "Chemistry", hours: 0.5, verified: true },
    { date: "Jun 12, 2026", student: "Marcus W.", subject: "Algebra II", hours: 0.85, verified: true },
    { date: "Jun 10, 2026", student: "Taylor K.", subject: "Geometry", hours: 1.0, verified: true },
    { date: "Jun 8, 2026", student: "Chris M.", subject: "Algebra II", hours: 0.5, verified: false },
  ],
};

export const tutorChatMap: Record<string, string> = {
  "1": "c1",
  "2": "c2",
  "4": "c3",
};

export function getTutorChatPath(tutorId: string): string {
  const conversationId = tutorChatMap[tutorId];
  return conversationId ? `/chat/${conversationId}` : "/chat";
}

export function getTutorById(id: string): Tutor | undefined {
  return tutors.find((t) => t.id === id);
}
