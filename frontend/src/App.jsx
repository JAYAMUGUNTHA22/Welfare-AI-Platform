import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FindSchemesPage } from '@/pages/FindSchemesPage';
import { MySchemesPage } from '@/pages/MySchemesPage';
import { SchemeDetailsPage } from '@/pages/SchemeDetailsPage';
import { EligibilityPage } from '@/pages/EligibilityPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { BenefitsPage } from '@/pages/BenefitsPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { AIAssistantPage } from '@/pages/AIAssistantPage';
import { WhatIfPage } from '@/pages/WhatIfPage';
import { ComparePage } from '@/pages/ComparePage';
import { AdminPage } from '@/pages/AdminPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ApplicationTrackingProvider } from '@/contexts/ApplicationTrackingContext';

function App() {
  return (
    <BrowserRouter>
      <ApplicationTrackingProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-schemes" element={<MySchemesPage />} />
        <Route path="/schemes" element={<FindSchemesPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
        <Route path="/schemes/:id/eligibility" element={<EligibilityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/assistant" element={<AIAssistantPage />} />
        <Route path="/what-if" element={<WhatIfPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      </ApplicationTrackingProvider>
    </BrowserRouter>
  );
}

export default App;
