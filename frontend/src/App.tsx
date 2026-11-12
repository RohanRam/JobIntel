import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { Footer } from "./components/layout/Footer";
import { DashboardPage } from "./pages/DashboardPage";
import { SalaryPredictorPage } from "./pages/SalaryPredictorPage";
import { SkillsPage } from "./pages/SkillsPage";
import { SkillGapPage } from "./pages/SkillGapPage";
import { AboutPage } from "./pages/AboutPage";

export const App: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  return (
    <BrowserRouter>
      <div className="canvas-wrapper">
        <div className="dashboard-floating-shell">
          {/* Vertical Navigation Sidebar */}
          <Sidebar
            mobileOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />

          {/* Main Workspace Area */}
          <div className="dashboard-main-area">
            <TopHeader
              onToggleMobileNav={() => setMobileNavOpen((prev) => !prev)}
            />
            <main className="dashboard-content-viewport">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/salary-predictor" element={<SalaryPredictorPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/skill-gap" element={<SkillGapPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Footer />
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
