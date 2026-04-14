import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Users } from 'lucide-react';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const statsRef = doc(db, 'analytics', 'visitorStats');
    const unsubscribe = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        setCount(docSnap.data().totalVisitors || 0);
      }
    });

    return () => unsubscribe();
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-600 font-black text-xs uppercase tracking-widest shadow-sm"
    >
      <Users className="w-4 h-4" />
      <span>{count.toLocaleString()} Visitantes Protegidos</span>
    </motion.div>
  );
}
