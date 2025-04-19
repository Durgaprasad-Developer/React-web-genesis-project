
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StudyProvider } from "./contexts/StudyContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Resources from "./pages/Resources";
import StudyTimer from "./pages/StudyTimer";
import Notes from "./pages/Notes";
import Courses from "./pages/Courses";
import NotFound from "./pages/NotFound";

const App = () => (
  <StudyProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/study-timer" element={<StudyTimer />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StudyProvider>
);

export default App;
