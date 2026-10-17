// Single source for all site content. Remaining TODOs: résumé PDF, project screenshots.

export const site = {
  name: "Sajjad Hussain",
  role: "Frontend & Full-Stack Engineer",
  // Custom domain via NEXT_PUBLIC_SITE_URL; otherwise Vercel's production URL; localhost in dev.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  description:
    "Software Development Engineer in Bengaluru, building React and TypeScript applications for smart TVs and the web.",
  email: "sajjadhussain1427@gmail.com",
  location: "Bengaluru, India",
  photo: "", // empty = illustrated avatar (components/AvatarArt.tsx)
  resume: "", // TODO: e.g. "/resume.pdf" in public/
  shortBio:
    "Software Development Engineer building React and TypeScript applications for smart TVs, web players and Safari, with a focus on performance, reliability and well-defined APIs.",
  longBio: [
    "I'm a Software Development Engineer based in Bengaluru, building a streaming application for the living room that runs on smart TVs, the web player and Safari.",
    "My work centres on frontend performance and code quality. I've led React and TypeScript efforts to make the application faster and more stable, built a shared component library that the team adopted, and championed thorough unit testing so regressions are caught before they reach users.",
    "I also work across the stack: defining REST API contracts with backend teams, diagnosing production issues through log analysis and monitoring, and building tools that help the team test playback under real-world network conditions.",
    "Outside work I build side projects, including this site. The bugs on it are intentional, which is more than most developers can say.",
  ],
  currently: ["Working on: a next-generation streaming experience for the big screen", "Building: this portfolio"],
  socials: [
    { label: "GitHub", href: "https://github.com/SajjadHussain2000" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/sajjad-hussain-284972182" },
  ],
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/articles", label: "Articles" },
  { href: "/newsletter", label: "Newsletter" },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript (ES6+)", "TypeScript", "Python", "C++", "SQL"] },
  { group: "Frontend", items: ["React", "Redux", "HTML5", "CSS3 / SCSS", "Webpack", "Responsive Design"] },
  { group: "Backend & Databases", items: ["Node.js", "Express", "FastAPI", "REST APIs", "Oracle", "MongoDB"] },
  { group: "Cloud, DevOps & Tools", items: ["AWS", "Docker", "Jenkins", "CI/CD", "Splunk", "Git", "Linux", "Agile / Scrum"] },
  { group: "Testing", items: ["Jest", "Enzyme", "Pytest", "Appium"] },
];

export type Project = {
  slug: string;
  title: string;
  summary: string;
  year?: string;
  role?: string;
  stack: string[];
  problem: string;
  approach: string;
  result: string;
  cover?: string; // image in public/, e.g. "/projects/one.png"
  featured?: boolean;
  liveUrl?: string;
  repoUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "video-stream-proxy-simulator",
    title: "VideoStreamProxySimulator",
    summary:
      "A configurable proxy between video origin and player that reproduces network failures to test playback resilience.",
    stack: ["Python", "Flask", "HLS", "DASH", "JavaScript"],
    featured: true,
    repoUrl: "https://github.com/SajjadHussain2000/VideoStreamProxySimulator",
    problem:
      "A video player has to recover from socket timeouts, stalled playlists and buffering. These failures are hard to reproduce reliably, which makes recovery logic hard to test.",
    approach:
      "A Python and Flask proxy sits between the origin and the player and intercepts session starts, playlist requests and segment requests. HLS is fully supported; DASH support is preliminary. Scriptable delay rules target playlists and individual audio or video segments, and a lightweight web UI configures scenarios and shows live traffic.",
    result:
      "Deployed and in active use by the QE team to verify that the player recovers from network instability.",
  },
  {
    slug: "chatsphere",
    title: "ChatSphere",
    summary:
      "A full-stack real-time chat application with one-to-one and group conversations, typing indicators and live notifications.",
    stack: ["MongoDB", "Express", "React", "Node.js", "Socket.IO", "Chakra UI"],
    featured: true,
    repoUrl: "https://github.com/SajjadHussain2000/chat-app",
    problem:
      "The goal was to build a complete real-time product end to end, with authentication, persistence and live messaging, rather than a UI prototype.",
    approach:
      "Built on the MERN stack with Socket.IO for real-time events. It supports direct and group conversations, typing indicators and notifications, with JWT-based authentication and secure file sharing.",
    result: "Deployed to production as a working full-stack application.",
  },
];

export type Role = {
  company: string;
  logo?: "tivo"; // see components/CompanyLogo.tsx
  title: string;
  period: string;
  location?: string;
  points: string[];
};

export const experience: Role[] = [
  {
    company: "TiVo",
    logo: "tivo",
    title: "Software Development Engineer",
    period: "Oct 2026 — Present",
    location: "Bengaluru",
    points: [
      "Delivered a feature end to end for a smart-TV streaming app, from requirements and technical design to production release, across smart TV, web player and Safari. Added a caching layer with TTL-based expiry and invalidation to cut redundant API calls and speed up page loads.",
      "Worked with backend teams to extend several REST services with device-type support, defining the API contracts and validating the integration on all three platforms.",
      "Investigated production crashes in Splunk using SPL queries on app-load errors, and built a crash-monitoring dashboard that tracks failures by device type to speed up root-cause analysis.",
    ],
  },
  {
    company: "TiVo",
    logo: "tivo",
    title: "Associate Software Development Engineer",
    period: "Jun 2023 — Sep 2026",
    location: "Bengaluru",
    points: [
      "Improved application performance by 50% and reduced bug occurrences by 40% while leading React and TypeScript development, using memoization, code splitting and lazy loading to cut re-renders and load times.",
      "Restructured state management with Redux and memoized selectors, simplifying data flow and speeding up feature development by 25%.",
      "Built a reusable component library and coding standards that the team adopted, improving consistency and delivery speed.",
      "Raised unit test coverage above 90% with Jest and Enzyme, catching regressions earlier and shortening release cycles.",
    ],
  },
];

export const education: { title: string; place: string; period: string }[] = [
  {
    title: "B.Tech in Computer Science and Engineering · CGPA 8.38/10",
    place: "Lovely Professional University",
    period: "Aug 2019 — Aug 2023",
  },
];
