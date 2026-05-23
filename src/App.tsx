import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "./context/AppContext";
import { pageVariants } from "./animations/variants";
import Navbar from "./components/Navbar";
import SettingsModal from "./components/SettingsModal";
import ToastContainer from "./components/ToastContainer";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentPortal from "./pages/StudentPortal";
import AIReview from "./pages/AIReview";
import Leaderboard from "./pages/Leaderboard";

const PAGES = {
  teacher: TeacherDashboard,
  student: StudentPortal,
  review: AIReview,
  leaderboard: Leaderboard,
} as const;

export default function App() {
  const { role } = useApp();
  const Page = PAGES[role];
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-ink dark:text-slate-100">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={role} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Page />
          </motion.div>
        </AnimatePresence>
      </main>
      <SettingsModal />
      <ToastContainer />
    </div>
  );
}
