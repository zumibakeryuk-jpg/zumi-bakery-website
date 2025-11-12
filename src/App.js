
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';

// --- EmailJS configuration ---
const EMAILJS_SERVICE_ID = 'service_128wpem';
const EMAILJS_TEMPLATE_ID = 'template_insvw2k';
const EMAILJS_PUBLIC_KEY = 'VMmRrsjDMUVK2vWORiwwE';

// --- Cookie data ---
const sampleCookies = [
  {
    id: 'smores-hershey',
    name: "S'mores Hershey Cookie",
    color: '#EAD8B7',
    image: '/cookies/smores-hershey.jpg',
    calories: 340,
    allergens: ['Wheat', 'Milk'],
    reviews: [5, 5, 4],
    description: 'Toasted marshmallow, Hershey chocolate pockets and buttery cookie.'
  },
  {
    id: 'chocolate-chunk',
    name: 'Chocolate Chunk Cookie',
    color: '#6B4226',
    image: '/cookies/chocolate-chunk.jpg',
    calories: 360,
    allergens: ['Wheat', 'Soy'],
    reviews: [4, 4, 5, 5],
    description: 'Large, melty dark and milk chocolate chunks in a golden cookie.'
  },
  {
    id: 'red-velvet-oreo',
    name: 'Red Velvet Oreo Cookie',
    color: '#E23E57',
    image: '/cookies/red-velvet-oreo.jpg',
    calories: 320,
    allergens: ['Wheat', 'Egg', 'Milk'],
    reviews: [5, 5, 5],
    description: 'Cream cheese filling with a soft red velvet cookie base.'
  }
];

const ZUMI_CREAM = '#FAF7F5';

function Stars({ value = 0, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const filled = hover ? idx <= hover : idx <= value;
        return (
          <button
            key={i}
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onRate && onRate(idx)}
            aria-label={`Rate ${idx}`}
            className={`text-lg leading-none ${filled ? 'scale-110' : 'opacity-50'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cookieData, setCookieData] = useState(sampleCookies);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [form, setForm] = useState({ email: '', quantity: 1, notes: '', rating: 5 });
  const [sending, setSending] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    const t = setTimeout(()=> setShowSplash(false), 1200);
    return ()=> clearTimeout(t);
  }, []);

  const selected = cookieData[selectedIndex];

  const avgRating = useMemo(() => {
    const r = selected.reviews || [];
    if (!r.length) return 0;
    return (r.reduce((a, b) => a + b, 0) / r.length).toFixed(1);
  }, [selected]);

  const sendOrder = async () => {
    if (!form.email || !form.quantity) return alert('Please provide an email and quantity.');
    setSending(true);
    const templateParams = {
      cookie: selected.name,
      rating: '★'.repeat(form.rating) + '☆'.repeat(5 - form.rating),
      quantity: form.quantity,
      email: form.email,
      notes: form.notes || '—'
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      setCookieData((prev) =>
        prev.map((c, i) =>
          i === selectedIndex ? { ...c, reviews: [...c.reviews, form.rating] } : c
        )
      );

      setShowThanks(true);
      setIsOrderOpen(false);
      setForm({ email: '', quantity: 1, notes: '', rating: 5 });

      setTimeout(() => setShowThanks(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Could not send order. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: ZUMI_CREAM, fontFamily: 'Poppins, sans-serif', minHeight: '100vh' }}>
      {/* Splash */}
      <AnimatePresence>
        {showSplash && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:80, background:ZUMI_CREAM }}>
            <div style={{ textAlign:'center' }}>
              <img src="%PUBLIC_URL%/favicon.png" alt="ZUMI logo" style={{ width:120, height:120, objectFit:'contain' }} />
              <h1 style={{ marginTop:10, fontWeight:800 }}>ZUMI Bakery — Fresh Cookies UK</h1>
              <p style={{ marginTop:6 }}>Handcrafted Cookies — Made with Love in England 🇬🇧</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position:'fixed', top:0, left:0, right:0, background:'rgba(255,255,255,0.95)', padding:12, zIndex:40, boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <div style={{ maxWidth:420, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontWeight:800 }}>ZUMI Bakery</div>
        </div>
      </div>

      <div style={{ paddingTop:74, paddingBottom:120 }}>
        {cookieData.map((c, idx) => (
          <section key={c.id} style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px', background: idx===selectedIndex? c.color: 'transparent', transition:'background 350ms ease' }} onClick={()=>setSelectedIndex(idx)}>
            <div style={{ maxWidth:420, width:'100%' }}>
              <motion.div layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} style={{ background:'rgba(255,255,255,0.95)', borderRadius:24, padding:20, boxShadow:'0 8px 30px rgba(10,10,10,0.08)'}}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                  <img src={c.image} alt={c.name} style={{ width:260, height:260, objectFit:'cover', borderRadius:16, boxShadow:'0 6px 20px rgba(0,0,0,0.08)'}} />
                  <div style={{ textAlign:'center' }}>
                    <h2 style={{ fontSize:22, fontWeight:800 }}>{c.name}</h2>
                    <p style={{ color:'#444', marginTop:6 }}>{c.description}</p>
                  </div>

                  <div style={{ width:'100%', display:'flex', justifyContent:'space-between', marginTop:10, alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ fontWeight:700 }}>{avgRating} ★</div>
                      <div style={{ color:'#666', fontSize:12 }}>({c.reviews.length} reviews)</div>
                    </div>
                    <div style={{ color:'#666', fontSize:12 }}>{c.calories} cal</div>
                  </div>

                  <div style={{ width:'100%', marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div><Stars value={Math.round(c.reviews.reduce((a,b)=>a+b,0)/c.reviews.length)} /></div>
                    <button onClick={()=>setIsOrderOpen(true)} style={{ padding:'10px 16px', borderRadius:12, background:'#000', color:'#fff', fontWeight:700 }}>ORDER NOW</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        ))}

        <section style={{ minHeight: '40vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
          <div style={{ maxWidth:420, textAlign:'center' }}>
            <motion.h3 initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }} style={{ fontWeight:700 }}>About ZUMI Bakery</motion.h3>
            <motion.p initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.15 }} style={{ color:'#444', marginTop:8 }}>Handcrafted cookies, baked fresh in the UK. Founded by Davi & Emily — made with love, quality ingredients, and no shortcuts.</motion.p>
            <motion.div initial={{ opacity:0, y:6 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:0.8 }} style={{ marginTop:12, display:'flex', justifyContent:'center', gap:8, alignItems:'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="0.5"></circle></svg>
              <a href="https://www.instagram.com/zumi.bakery.uk" target="_blank" rel="noreferrer" style={{ textDecoration:'underline' }}>@zumi.bakery.uk</a>
            </motion.div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isOrderOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:80 }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.28)' }} onClick={()=>setIsOrderOpen(false)}></div>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }} style={{ background:'#fff', borderRadius:20, padding:18, width:'92%', maxWidth:420, boxShadow:'0 18px 40px rgba(0,0,0,0.12)' }}>
              <h3 style={{ fontWeight:800, fontSize:18 }}>Order {selected.name}</h3>
              <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:10 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700 }}>Rating</label>
                  <div style={{ marginTop:6 }}><Stars value={form.rating} onRate={(v)=>setForm(s=>({...s, rating:v}))} /></div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700 }}>Quantity</label>
                  <input type="number" min={1} value={form.quantity} onChange={(e)=>setForm(s=>({...s, quantity: Number(e.target.value)}))} style={{ width:'100%', marginTop:6, padding:10, borderRadius:10, border:'1px solid #e6e6e6' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700 }}>Your email</label>
                  <input type="email" value={form.email} onChange={(e)=>setForm(s=>({...s, email:e.target.value}))} style={{ width:'100%', marginTop:6, padding:10, borderRadius:10, border:'1px solid #e6e6e6' }} placeholder="you@example.com" />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700 }}>Notes (optional)</label>
                  <textarea value={form.notes} onChange={(e)=>setForm(s=>({...s, notes:e.target.value}))} style={{ width:'100%', marginTop:6, padding:10, borderRadius:10, border:'1px solid #e6e6e6' }} rows={3} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <button onClick={()=>setIsOrderOpen(false)} style={{ padding:'10px 14px', borderRadius:10 }}>Cancel</button>
                  <button disabled={sending} onClick={sendOrder} style={{ padding:'10px 14px', borderRadius:10, background:'#000', color:'#fff', fontWeight:700 }}>{sending? 'Sending...' : 'Send Order'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showThanks && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:90 }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.18)', backdropFilter:'blur(4px)' }}></div>
            <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.9, opacity:0 }} style={{ background:'#fff', borderRadius:16, padding:18, boxShadow:'0 18px 40px rgba(0,0,0,0.12)' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:24 }}>✨</div>
                <h4 style={{ fontWeight:800, marginTop:8 }}>Thanks for your order!</h4>
                <p style={{ color:'#666', marginTop:6 }}>We’ll contact you soon 💌</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ position:'fixed', left:0, right:0, bottom:18, display:'flex', justifyContent:'center' }}>
        <div style={{ width:'92%', maxWidth:420 }}>
          <button onClick={()=>setIsOrderOpen(true)} style={{ width:'100%', padding:14, borderRadius:12, background:'#000', color:'#fff', fontWeight:800 }}>ORDER NOW</button>
        </div>
      </div>

    </div>
  );
}
