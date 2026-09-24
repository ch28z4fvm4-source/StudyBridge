/** Tutors who receive email alerts for help requests — open network, any location */

export interface TutorContact {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  available: boolean;
}

export const tutorContacts: TutorContact[] = [
  {
    id: "1",
    name: "Maya Chen",
    email: "maya.chen@gmail.com",
    subjects: ["Algebra II", "Chemistry"],
    available: true,
  },
  {
    id: "2",
    name: "Jordan Rivera",
    email: "jordan.rivera@gmail.com",
    subjects: ["AP US History", "English"],
    available: true,
  },
  {
    id: "3",
    name: "Aisha Patel",
    email: "aisha.patel@gmail.com",
    subjects: ["Geometry", "Biology"],
    available: false,
  },
  {
    id: "4",
    name: "Ethan Brooks",
    email: "ethan.brooks@gmail.com",
    subjects: ["Calculus", "Physics"],
    available: true,
  },
];

export function tutorsForSubject(subject: string): TutorContact[] {
  return tutorContacts.filter(
    (t) => t.available && t.subjects.some((s) => s.toLowerCase() === subject.toLowerCase()),
  );
}
