import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

const orb = (d, dur, x, y) => ({
  animate: { y: [0, y, 0], x: [0, x, 0], scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: dur, delay: d, repeat: Infinity, ease: 'easeInOut' }
});

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } } };
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState('');
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await login(email, password); navigate('/'); }
    catch {} finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', background: '#0f172a', position: 'relative', overflow: 'hidden', width: '100%' }}>
      {/* Orbs */}
      <motion.div {...orb(0, 6, 30, -25)} style={{ position: 'absolute', top: '-80px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <motion.div {...orb(1.5, 7, -20, 30)} style={{ position: 'absolute', bottom: '80px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <motion.div {...orb(0.8, 5, -15, -20)} style={{ position: 'absolute', top: '45%', right: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', filter: 'blur(25px)' }} />

      {/* Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div key={i} animate={{ y: [0, -50, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }} transition={{ duration: 3, delay: i * 0.6, repeat: Infinity }}
          style={{ position: 'absolute', top: `${12 + i * 5}%`, left: `${8 + i * 18}%`, width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', boxShadow: '0 0 6px rgba(255,255,255,0.3)' }} />
      ))}

      {/* Branding — 30% of screen */}
      <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 40%', paddingBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}
          style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', boxShadow: '0 12px 28px rgba(37,99,235,0.35)', overflow: 'hidden' }}>
          <Logo size={36} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.15rem' }}>Welcome Back</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><Sparkles size={12} /></motion.span>
          Sign in to manage your finances
        </motion.p>
      </motion.div>

      {/* Form Card — 70% of screen */}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{ flex: '0 0 60%', background: 'white', borderRadius: '28px 28px 0 0', padding: '1rem 1.5rem 1.25rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, boxShadow: '0 -8px 30px rgba(0,0,0,0.12)' }}>
        
        {/* Handle */}
        <motion.div initial={{ width: 0 }} animate={{ width: '36px' }} transition={{ delay: 0.5, duration: 0.3 }}
          style={{ height: '4px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto 0.6rem', flexShrink: 0 }} />

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.75rem', border: '1px solid #fecaca', flexShrink: 0 }}>
              <AlertCircle size={15} />{error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form onSubmit={submit} variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, justifyContent: 'center' }}>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <motion.div whileTap={{ scale: 0.995 }} style={{ position: 'relative', borderRadius: '12px', border: focused === 'email' ? '2px solid #2563eb' : '2px solid #f1f5f9', background: '#f8fafc', transition: 'border-color 0.2s' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#2563eb' : '#94a3b8', transition: 'color 0.2s' }} />
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                style={{ width: '100%', padding: '0.75rem 0.85rem 0.75rem 2.5rem', border: 'none', background: 'transparent', fontSize: '0.88rem', fontWeight: 600, outline: 'none', color: '#1e293b' }} />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <motion.div whileTap={{ scale: 0.995 }} style={{ position: 'relative', borderRadius: '12px', border: focused === 'pw' ? '2px solid #2563eb' : '2px solid #f1f5f9', background: '#f8fafc', transition: 'border-color 0.2s' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused === 'pw' ? '#2563eb' : '#94a3b8', transition: 'color 0.2s' }} />
              <input type={showPw ? 'text' : 'password'} required placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 2.5rem', border: 'none', background: 'transparent', fontSize: '0.88rem', fontWeight: 600, outline: 'none', color: '#1e293b' }} />
              <motion.button type="button" onClick={() => setShowPw(!showPw)} whileTap={{ scale: 0.8 }}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: 'white', padding: '0.8rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.92rem', marginTop: '0.15rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
              {submitting ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Signing in...</motion.span> : (
                <>Sign In<motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight size={16} /></motion.div></>
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Footer — pinned at bottom */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ textAlign: 'center', flexShrink: 0, marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
            Don't have an account?{' '}<Link to="/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create One</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
