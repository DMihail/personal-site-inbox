import type { Message } from "./types";

export const mockMessages: Message[] = [
  {
    id: "1",
    senderName: "Sarah Chen",
    senderEmail: "sarah.chen@vercel.com",
    company: "Vercel",
    subject: "Senior Frontend Engineer - Remote",
    preview:
      "Hi! I came across your portfolio and was impressed by your work on the realtime systems. We're looking for a senior frontend engineer to join our edge computing team. The role involves working on Next.js core features and developer tooling. Would love to discuss this opportunity with you.",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    isImportant: true,
    isArchived: false,
    source: "portfolio.contact",
    tags: ["remote", "senior"],
  },
  {
    id: "2",
    senderName: "Michael Rodriguez",
    senderEmail: "michael@linear.app",
    company: "Linear",
    subject: "Founding Engineer Opportunity",
    preview:
      "Hey there! Really loved your approach to state management and UI architecture. We're building the next generation of issue tracking and looking for founding engineers who care deeply about craft. This would be an opportunity to shape product direction from the ground up.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    isImportant: true,
    isArchived: false,
    source: "portfolio.contact",
    tags: ["founding", "equity"],
  },
  {
    id: "3",
    senderName: "Emily Thompson",
    senderEmail: "emily.t@stripe.com",
    company: "Stripe",
    subject: "Staff Engineer - Developer Platform",
    preview:
      "I noticed your work on developer tooling and APIs. Stripe's developer platform team is expanding and we're looking for staff engineers to help build the next generation of payment infrastructure. Your experience with realtime systems would be highly relevant.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
    isImportant: false,
    isArchived: false,
    source: "portfolio.contact",
    tags: ["staff", "platform"],
  },
  {
    id: "4",
    senderName: "James Park",
    senderEmail: "james@supabase.io",
    company: "Supabase",
    subject: "Senior Full-Stack Engineer",
    preview:
      "Your portfolio caught my attention, especially your work with Firebase and realtime databases. We're building open-source Firebase alternatives and looking for engineers passionate about developer experience. Let's chat about what we're building.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    isImportant: false,
    isArchived: false,
    source: "portfolio.contact",
    tags: ["full-stack", "open-source"],
  },
  {
    id: "5",
    senderName: "Alex Kumar",
    senderEmail: "alex@raycast.com",
    company: "Raycast",
    subject: "Engineering Role - Productivity Tools",
    preview:
      "Saw your engineering console designs - the attention to detail is exactly what we look for at Raycast. We're hiring engineers who understand that great tools are built on great taste. Interested in learning more?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: true,
    isImportant: false,
    isArchived: false,
    source: "portfolio.contact",
  },
];

