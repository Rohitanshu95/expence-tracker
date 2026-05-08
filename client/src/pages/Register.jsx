import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import Logo from '../components/Logo';

const orb = (d, dur, x, y) => ({
  animate: { y: [0, y, 0], x: [0, x, 0], scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] },
  transition: { duration: dur, delay: d, repeat: Infinity, ease: 'easeInOut' }
});

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.25 } } };
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } } };

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await register(username, email, password); setSuccess(true); setTimeout(() => navigate('/login'), 2000); }
    catch {} finally { setSubmitting(false); }
  };

  const wrap = (f) => ({ position: 'relative', borderRadius: '12px', border: focused === f ? '2px solid #7c3aed' : '2px solid #f1f5f9', background: '#f8fafc', transition: 'border-color 0.2s' });
  const ico = (f) => ({ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused === f ? '#7c3aed' : '#94a3b8', transition: 'color 0.2s' });
  const inp = (pr = '0.85rem') => ({ width: '100%', padding: `0.72rem ${pr} 0.72rem 2.5rem`, border: 'none', background: 'transparent', fontSize: '0.88rem', fontWeight: 600, outline: 'none', color: '#1e293b' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', background: '#0f172a', position: 'relative', overflow: 'hidden', width: '100%' }}>
      {/* Orbs */}
      <motion.div {...orb(0, 6, -25, 20)} style={{ position: 'absolute', top: '-70px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <motion.div {...orb(1, 7, 20, -25)} style={{ position: 'absolute', bottom: '100px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <motion.div {...orb(2, 5, 15, 15)} style={{ position: 'absolute', top: '35%', left: '65%', width: '110px', height: '110px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)', filter: 'blur(25px)' }} />

      {/* Sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div key={i} animate={{ y: [0, -50, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }} transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
          style={{ position: 'absolute', top: `${10 + i * 6}%`, left: `${12 + i * 16}%`, width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', boxShadow: '0 0 6px rgba(255,255,255,0.3)' }} />
      ))}

      {/* Branding — 25% of screen */}
      <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 35%', paddingBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 14 }}
          style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', boxShadow: '0 12px 28px rgba(124,58,237,0.35)', overflow: 'hidden' }}>
          <Logo size={36} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '0.15rem' }}>Get Started</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
          style={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><UserPlus size={12} /></motion.span>
          Create your free account
        </motion.p>
      </motion.div>

      {/* Form Card — 75% of screen */}
      <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{ flex: '0 0 65%', background: 'white', borderRadius: '28px 28px 0 0', padding: '1rem 1.5rem 1.25rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, boxShadow: '0 -8px 30px rgba(0,0,0,0.12)' }}>

        {/* Handle */}
        <motion.div initial={{ width: 0 }} animate={{ width: '36px' }} transition={{ delay: 0.5, duration: 0.3 }}
          style={{ height: '4px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto 0.5rem', flexShrink: 0 }} />

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem', border: '1px solid #fecaca', flexShrink: 0 }}>
              <AlertCircle size={15} />{error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.85rem', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem', border: '1px solid #a7f3d0', flexShrink: 0 }}>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }}><CheckCircle size={15} /></motion.div>Account created! Redirecting...
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form onSubmit={submit} variants={stagger} initial="hidden" animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1, justifyContent: 'center' }}>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
            <motion.div whileTap={{ scale: 0.995 }} style={wrap('name')}>
              <User size={16} style={ico('name')} />
              <input type="text" required placeholder="John Doe" value={username} onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')} style={inp()} />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <motion.div whileTap={{ scale: 0.995 }} style={wrap('email')}>
              <Mail size={16} style={ico('email')} />
              <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')} style={inp()} />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <motion.div whileTap={{ scale: 0.995 }} style={wrap('pw')}>
              <Lock size={16} style={ico('pw')} />
              <input type={showPw ? 'text' : 'password'} required placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('pw')} onBlur={() => setFocused('')} style={inp('2.75rem')} />
              <motion.button type="button" onClick={() => setShowPw(!showPw)} whileTap={{ scale: 0.8 }}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <motion.button type="submit" disabled={submitting || success} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ width: '100%', background: (submitting || success) ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', padding: '0.8rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.92rem', marginTop: '0.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: (submitting || success) ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}>
              {submitting ? <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>Creating...</motion.span>
                : success ? 'Redirecting...'
                : (<>Create Account<motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight size={16} /></motion.div></>)}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ textAlign: 'center', flexShrink: 0, marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
            Already have an account?{' '}<Link to="/login" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
