/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AnalysisForm from './components/AnalysisForm';
import CaseDetail from './components/CaseDetail';
import Support from './components/Support';
import About from './components/About';
import TermsOfUse from './components/TermsOfUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import Quiz from './components/Quiz';
import FineScanner from './components/FineScanner';
import FinanceCalculator from './components/FinanceCalculator';
import OccurrenceGenerator from './components/OccurrenceGenerator';
import PreventiveAnalysis from './components/PreventiveAnalysis';
import MyDocuments from './components/MyDocuments';
import AdminDashboard from './components/AdminDashboard';
import Protection from './components/Protection';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import FloatingSupport from './components/FloatingSupport';
import Footer from './components/Footer';
import { Toaster } from 'sonner';
import { onForegroundMessage } from './lib/notifications';

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
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuário',
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
          <Navbar user={user} profile={profile} />
          <main className="flex-grow">
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
          </main>
          <ScrollToTop />
          <FloatingSupport />
          <Footer />
        </div>
      </Router>
    </>
  );
}

