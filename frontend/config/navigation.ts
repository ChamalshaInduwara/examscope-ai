import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MessageCircleQuestion,
  Upload,
} from "lucide-react";

export const dashboardNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Subjects",
    href: "/subjects",
    icon: BookOpen,
  },
  {
    title: "Upload Center",
    href: "/uploads",
    icon: Upload,
  },
  {
    title: "Past Paper Analysis",
    href: "/analysis",
    icon: FileText,
  },
  {
    title: "Predictions",
    href: "/predictions",
    icon: BrainCircuit,
  },
  {
    title: "Generate Questions",
    href: "/generate",
    icon: FileQuestion,
  },
  {
    title: "Study Assistant",
    href: "/study-assistant",
    icon: MessageCircleQuestion,
  },
  {
    title: "Mock Exams",
    href: "/mock-exams",
    icon: GraduationCap,
  },
  {
    title: "Saved Revision",
    href: "/revision",
    icon: FolderOpen,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];