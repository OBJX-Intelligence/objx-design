import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/pages/LandingPage";
import { WorkPage } from "@/pages/WorkPage";
import { AdminPage } from "@/pages/AdminPage";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <LandingPage />
            </Layout>
          }
        />
        <Route
          path="/work"
          element={
            <Layout>
              <WorkPage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-sm">
                Page not found.
              </div>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
