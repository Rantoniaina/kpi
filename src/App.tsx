import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { PageLoading } from "@/components/ui/loading-spinner";
import { UpdateChecker } from "@/components/UpdateChecker";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.Dashboard })));
const Developers = lazy(() => import("@/pages/Developers").then(m => ({ default: m.Developers })));
const Tickets = lazy(() => import("@/pages/Tickets").then(m => ({ default: m.Tickets })));
const Bugs = lazy(() => import("@/pages/Bugs").then(m => ({ default: m.Bugs })));
const Reports = lazy(() => import("@/pages/Reports").then(m => ({ default: m.Reports })));
const Settings = lazy(() => import("@/pages/Settings").then(m => ({ default: m.Settings })));

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route 
              index 
              element={
                <Suspense fallback={<PageLoading text="Loading dashboard..." />}>
                  <Dashboard />
                </Suspense>
              } 
            />
            <Route 
              path="developers" 
              element={
                <Suspense fallback={<PageLoading text="Loading developers..." />}>
                  <Developers />
                </Suspense>
              } 
            />
            <Route 
              path="tickets" 
              element={
                <Suspense fallback={<PageLoading text="Loading tickets..." />}>
                  <Tickets />
                </Suspense>
              } 
            />
            <Route 
              path="bugs" 
              element={
                <Suspense fallback={<PageLoading text="Loading bugs..." />}>
                  <Bugs />
                </Suspense>
              } 
            />
            <Route 
              path="reports" 
              element={
                <Suspense fallback={<PageLoading text="Loading reports..." />}>
                  <Reports />
                </Suspense>
              } 
            />
            <Route 
              path="settings" 
              element={
                <Suspense fallback={<PageLoading text="Loading settings..." />}>
                  <Settings />
                </Suspense>
              } 
            />
          </Route>
        </Routes>
        <Toaster />
        <UpdateChecker />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
