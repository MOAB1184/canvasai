import { FAQItem, NavLink, Page } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Students', href: '#', page: Page.STUDENTS },
  { label: 'Teachers', href: '#', page: Page.TEACHERS },
  { label: 'Pricing', href: '#', page: Page.PRICING },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Does this work directly inside Canvas LMS?",
    answer: "Yes! CanvasAI is a Chrome extension that overlays directly onto your Canvas dashboard, modules, and assignment pages. No need to switch tabs."
  },
  {
    question: "Is this considered cheating?",
    answer: "CanvasAI is designed as a tutor and study aid. It helps explain concepts, generate flashcards from slides, and organize your study plan. We strictly prohibit using it to generate essay content for submission."
  },
  {
    question: "How does the Auto-Grader work for teachers?",
    answer: "Teachers can upload their grading rubric and the assignment details. CanvasAI will scan student submissions and suggest grades and feedback based strictly on your rubric."
  },
  {
    question: "Can it read my PowerPoint slides?",
    answer: "Absolutely. CanvasAI can analyze PowerPoints, PDFs, and Word docs uploaded to your Canvas modules and turn them into summaries or flashcards instantly."
  },
  {
    question: "Do you offer school-wide licenses?",
    answer: "Yes. We offer bulk licensing for districts and universities that want to provide CanvasAI to all their faculty and students. Contact our sales team for details."
  },
  {
    question: "What if I have a quiz on Canvas?",
    answer: "CanvasAI enters 'Study Mode' during quizzes, disabling answer generation to ensure academic integrity while still allowing access to your personal study notes."
  }
];

export const PRICING_DATA = {
  students: [
    {
      name: "Free",
      price: "$0",
      description: "Organize your academic life.",
      features: [
        "Connect Canvas & View Grades",
        "Smart Calendar Organizer",
        "Assignment Dashboard",
        "No AI Features Included"
      ],
      buttonText: "Join Waitlist"
    },
    {
      name: "Essential",
      price: "$5",
      description: "Base AI models for help.",
      features: [
        "GPT-5 Mini, Claude 4.5 Haiku",
        "Gemini 2.5 Flash",
        "Generous Monthly Limits",
        "Homework Help & Tutoring"
      ],
      buttonText: "Buy Now"
    },
    {
      name: "Scholar",
      price: "$10",
      description: "Advanced models for exams.",
      features: [
        "Unlimited Base Models",
        "Access to Advanced Models",
        "GPT-5, Claude 4.5, Gemini 3 Pro",
        "Test Prep & Quiz Mode"
      ],
      buttonText: "Buy Now",
      highlighted: true
    },
    {
      name: "Genius",
      price: "$20",
      description: "Maximum academic power.",
      features: [
        "Generous Advanced Access",
        "Unlimited Base Models",
        "Deep Research Agents",
        "Priority 24/7 Support"
      ],
      buttonText: "Buy Now"
    }
  ],
  teachers: [
    {
      name: "Starter",
      price: "$0",
      description: "Try the toolkit.",
      features: [
        "5 Lesson Plans / mo",
        "Rubric Creator",
        "Limited Quiz Gen"
      ],
      buttonText: "Join Waitlist"
    },
    {
      name: "Assistant",
      price: "$10",
      description: "Save time.",
      features: [
        "Unlimited Lesson Plans",
        "Rubric Creator",
        "Quiz Generator",
        "Announcement Writer"
      ],
      buttonText: "Subscribe"
    },
    {
      name: "Professor",
      price: "$20",
      description: "Automate grading.",
      features: [
        "AI Auto-Grader (500/mo)",
        "Plagiarism Detection",
        "Student Analytics",
        "Lecture Transcription"
      ],
      buttonText: "Subscribe",
      highlighted: true
    }
  ],
  schools: [
    {
      name: "Pilot",
      price: "Free",
      description: "Test for your department.",
      features: [
        "5 Faculty Licenses",
        "100 Student Licenses",
        "Basic Integration",
        "Email Support"
      ],
      buttonText: "Contact for free pilot"
    },
    {
      name: "Campus",
      price: "Contact",
      description: "For districts & unis.",
      features: [
        "Site-wide License",
        "LTI Integration",
        "SSO Support",
        "Admin Dashboard",
        "Priority Support",
        "Custom Training"
      ],
      buttonText: "Contact Sales",
      highlighted: true
    }
  ]
};
