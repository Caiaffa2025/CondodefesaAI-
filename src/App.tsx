/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AnalysisForm = lazy(() => import('./components/AnalysisForm'));
const CaseDetail = lazy(() => import('./components/CaseDetail'));
const Support = lazy(() => import('./components/Support'));
const About = lazy(() => import('./components/About'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Quiz = lazy(() => import('./components/Quiz'));
const FAQ = lazy(() => import('./components/FAQ'));
const FineScanner = lazy(() => import('./components/FineScanner'));
const FinanceCalculator = lazy(() => import('./components/FinanceCalculator'));
const OccurrenceGenerator = lazy(() => import('./components/OccurrenceGenerator'));
const PreventiveAnalysis = lazy(() => import('./components/PreventiveAnalysis'));
const MyDocuments = lazy(() => import('./components/MyDocuments'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Protection = lazy(() => import('./components/Protection'));

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import FloatingSupport from './components/FloatingSupport';
import Footer from './components/Footer';
import { Toaster } from 'sonner';
import { onForegroundMessage } from './lib/notifications';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Loading Fallback Component
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm">
    <div className="relative">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-8 w-8 bg-blue-100 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="mt-6 text-slate-500 font-black text-xs uppercase tracking-[0.2em] animate-pulse">Carregando plataforma...</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    }
  };

  useEffect(() => {
    // Safety timeout to ensure app loads even if auth hangs
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth state check timed out, proceeding to load app.');
        setLoading(false);
      }
    }, 5000);

    // Initialize foreground message listener
    try {
      onForegroundMessage();
    } catch (e) {
      console.error('Failed to initialize notifications:', e);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || (firebaseUser.isAnonymous ? 'visitante@condodefesa.ai' : ''),
              displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Visitante' : 'Usuário'),
              plan: 'free',
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
          console.error('Error handling user profile:', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h1 className="text-xl font-black text-slate-900 mb-2 tracking-tight">CondoDefesa AI</h1>
        <p className="text-slate-500 font-medium mb-8 animate-pulse">Iniciando plataforma segura...</p>
        
        <button 
          onClick={() => setLoading(false)}
          className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
        >
          Demorando muito? Clique para forçar o carregamento
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
          <Navbar user={user} profile={profile} />
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage user={user} />} />
                <Route 
                  path="/dashboard" 
                  element={user ? <Dashboard user={user} profile={profile} /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/analisar" 
                  element={user ? <AnalysisForm user={user} profile={profile} /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/caso/:id" 
                  element={user ? <CaseDetail user={user} /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/suporte" 
                  element={<Support />} 
                  />
                <Route 
                  path="/sobre" 
                  element={<About />} 
                  />
                <Route 
                  path="/termos" 
                  element={<TermsOfUse />} 
                  />
                <Route 
                  path="/privacidade" 
                  element={<PrivacyPolicy />} 
                  />
                <Route 
                  path="/quiz" 
                  element={<Quiz />} 
                  />
                <Route 
                  path="/faq" 
                  element={<FAQ />} 
                  />
                <Route 
                  path="/scanner" 
                  element={user ? <FineScanner /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/calculadora" 
                  element={user ? <FinanceCalculator /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/ata-digital" 
                  element={user ? <OccurrenceGenerator /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/preventiva" 
                  element={user ? <PreventiveAnalysis profile={profile} /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/documentos" 
                  element={user ? <MyDocuments profile={profile} onUpdateProfile={refreshProfile} /> : <Navigate to="/" />} 
                  />
                <Route 
                  path="/admin" 
                  element={<AdminDashboard />} 
                  />
                <Route 
                  path="/protecao" 
                  element={<Protection />} 
                  />
              </Routes>
            </Suspense>
          </main>
          <ScrollToTop />
          <FloatingSupport user={user} profile={profile} />
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

