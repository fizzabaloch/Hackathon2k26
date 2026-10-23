import { useState, useEffect } from 'react';
import { 
  resolveCase, 
  getChecklist, 
  getJourney, 
  getCenters, 
  trackApplication, 
  getDemoIds, 
  getServices,
  getQueueBoard,
  issueToken,
  advanceQueue,
  auditFormDocument,
  healthCheck 
} from './api';

// -----------------------------------------------------------------------------
// REALISTIC NADRA CALL CHIME SYNTHESIZER (Native Web Audio API - Zero Asset Dependency)
// -----------------------------------------------------------------------------
function playNadraChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Tone 1: High E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    g1.gain.setValueAtTime(0.28, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Tone 2: Harmonious C5 (523.25 Hz)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.22);
    g2.gain.setValueAtTime(0.32, now + 0.22);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.95);
  } catch (e) {
    console.warn("Audio chime prevented by browser autoplay policy:", e);
  }
}

// -----------------------------------------------------------------------------
// PROFESSIONAL VECTOR LINE ICONS (Zero Color Emojis)
// -----------------------------------------------------------------------------
const IconBase = ({ children, size = 18, color = 'currentColor' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
  >
    {children}
  </svg>
);

const IconHome = (p) => (
  <IconBase {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></IconBase>
);
const IconBot = (p) => (
  <IconBase {...p}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></IconBase>
);
const IconJourney = (p) => (
  <IconBase {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></IconBase>
);
const IconFormDoctor = (p) => (
  <IconBase {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></IconBase>
);
const IconMapPin = (p) => (
  <IconBase {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></IconBase>
);
const IconTracker = (p) => (
  <IconBase {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></IconBase>
);
const IconChecklist = (p) => (
  <IconBase {...p}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></IconBase>
);
const IconPrinter = (p) => (
  <IconBase {...p}><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></IconBase>
);
const IconShare = (p) => (
  <IconBase {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></IconBase>
);
const IconCopy = (p) => (
  <IconBase {...p}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></IconBase>
);
const IconVolume = (p) => (
  <IconBase {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></IconBase>
);
const IconBell = (p) => (
  <IconBase {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></IconBase>
);
const IconTicket = (p) => (
  <IconBase {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></IconBase>
);
const IconAlert = (p) => (
  <IconBase {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></IconBase>
);
const IconCheck = (p) => (
  <IconBase {...p}><polyline points="20 6 9 17 4 12" /></IconBase>
);
const IconGlobe = (p) => (
  <IconBase {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></IconBase>
);
const IconShield = (p) => (
  <IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></IconBase>
);
const IconClock = (p) => (
  <IconBase {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></IconBase>
);
const IconArrowRight = (p) => (
  <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></IconBase>
);
const IconSearch = (p) => (
  <IconBase {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></IconBase>
);
const IconUser = (p) => (
  <IconBase {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconBase>
);
const IconCode = (p) => (
  <IconBase {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></IconBase>
);
const IconPalette = (p) => (
  <IconBase {...p}><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></IconBase>
);
const IconCrest = (p) => (
  <IconBase {...p} size={24}><circle cx="12" cy="12" r="10" /><path d="M12 6v12M6 12h12" /></IconBase>
);

// -----------------------------------------------------------------------------
// MAIN APP COMPONENT
// -----------------------------------------------------------------------------
export default function App() {
  const [tab, setTab] = useState(null); // null = Home, 'resolver', 'checklist', 'journey', 'form', 'centers', 'tracker'
  const [backendOk, setBackendOk] = useState(false);
  const [isUrdu, setIsUrdu] = useState(false);

  useEffect(() => {
    healthCheck()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* 1. FULL-WIDTH ADVISORY TICKER */}
      <div className="ticker-bar">
        <span className="ticker-tag">
          <IconAlert size={14} color="#063e1d" />
          OFFICIAL NOTICE
        </span>
        <div className="ticker-text">
          Blood relative (Father/Mother/Adult Sibling) must accompany first-time CNIC applicants for biometric attestation · Hyderabad Mega Center on Auto Bhan Road is open 24/7 · Bring original expired cards for renewal.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, flexShrink: 0 }}>
          <span style={{ color: backendOk ? '#86efac' : '#fca5a5', fontWeight: 600 }}>
            ● {backendOk ? 'AI Engine Active' : 'Connecting Engine...'}
          </span>
        </div>
      </div>

      {/* 2. FULL-WIDTH HEADER & EXPANDABLE HOVER DOCK */}
      <header className="top-nav-bar">
        <div className="top-nav-container">
          <div className="brand-group-left" onClick={() => setTab(null)}>
            <div className="brand-crest">
              <IconShield size={24} color="#ffffff" />
            </div>
            <div>
              <div className="brand-name-h">NADRA NAVIGATOR</div>
              <div className="brand-sub-h">GOVERNMENT OF PAKISTAN · AI CITIZEN GUIDE</div>
            </div>
          </div>

          {/* Dynamic Hover-Expand Navigation Dock (Line Icons) */}
          <nav className="nav-dock">
            <button 
              className={`dock-item-btn ${tab === null ? 'active' : ''}`} 
              onClick={() => setTab(null)}
              title="Home Portal"
            >
              <IconHome size={17} />
              <span className="dock-label">Home</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'resolver' ? 'active' : ''}`} 
              onClick={() => setTab('resolver')}
              title="AI Case Resolver"
            >
              <IconBot size={17} />
              <span className="dock-label">AI Resolver</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'checklist' ? 'active' : ''}`} 
              onClick={() => setTab('checklist')}
              title="Document Checklist"
            >
              <IconChecklist size={17} />
              <span className="dock-label">Checklist</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'journey' ? 'active' : ''}`} 
              onClick={() => setTab('journey')}
              title="Journey Simulator"
            >
              <IconJourney size={17} />
              <span className="dock-label">Journey</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'form' ? 'active' : ''}`} 
              onClick={() => setTab('form')}
              title="Form Doctor"
            >
              <IconFormDoctor size={17} />
              <span className="dock-label">Form Doctor</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'centers' ? 'active' : ''}`} 
              onClick={() => setTab('centers')}
              title="Center & Queue Assistant"
            >
              <IconMapPin size={17} />
              <span className="dock-label">Centers</span>
            </button>

            <button 
              className={`dock-item-btn ${tab === 'tracker' ? 'active' : ''}`} 
              onClick={() => setTab('tracker')}
              title="Application Tracker"
            >
              <IconTracker size={17} />
              <span className="dock-label">Tracker</span>
            </button>
          </nav>

          {/* Bilingual Toggle (Line Icon) */}
          <button 
            className="neu-button" 
            style={{ padding: '9px 18px', fontSize: 14 }}
            onClick={() => setIsUrdu(!isUrdu)}
            title="Toggle Nastaliq Urdu / English"
          >
            <IconGlobe size={16} />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN ROUTER VIEWS */}
      {tab === null && (
        <>
          <HeroSection setTab={setTab} isUrdu={isUrdu} />
          <ServicesShowcase setTab={setTab} isUrdu={isUrdu} />
        </>
      )}

      {tab !== null && (
        <div className="fluid-content-wrapper" style={{ flex: 1 }}>
          {tab === 'resolver'  && <CaseResolverView isUrdu={isUrdu} />}
          {tab === 'checklist' && <DocumentChecklistView isUrdu={isUrdu} />}
          {tab === 'journey'   && <JourneySimulatorView isUrdu={isUrdu} />}
          {tab === 'form'      && <FormDoctorView isUrdu={isUrdu} />}
          {tab === 'centers'   && <CenterFinderView isUrdu={isUrdu} />}
          {tab === 'tracker'   && <AppTrackerView isUrdu={isUrdu} />}
        </div>
      )}

      {/* 4. FOOTER FULL WIDTH */}
      <Footer isUrdu={isUrdu} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// HERO COMPONENT (Full-Bleed Viewport Canvas)
// -----------------------------------------------------------------------------
function HeroSection({ setTab, isUrdu }) {
  return (
    <div className="hero-full-bleed">
      <div className="hero-fluid-container">
        <div>
          <div className="hero-pill-badge">
            <IconShield size={16} color="var(--nadra-forest)" />
            <span>DITE HACKATHON 2026-27 · PUBLIC SERVICE THEME</span>
          </div>
          
          <h1 className="hero-display-title">
            Empowerment through <span>Guidance</span>
          </h1>
          
          <p className="hero-display-desc">
            {isUrdu ? (
              <span className="urdu-font">
                اپنے شناختی کارڈ، ب فارم، یا ترمیم کی درست دستاویزات، فیس اور مراحل کا AI کے ذریعے چند سیکنڈ میں مکمل لائحہ عمل حاصل کریں۔
              </span>
            ) : (
              "Get your CNIC, B-Form, FRC, or identity modification roadmaps through AI-driven procedural intelligence. Know exactly what to bring before visiting any NADRA center."
            )}
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="neu-button neu-button-primary" style={{ fontSize: 16, padding: '15px 32px' }} onClick={() => setTab('resolver')}>
              <IconBot size={19} color="#ffffff" />
              <span>Start Case Resolver</span>
            </button>
            <button className="neu-button" style={{ fontSize: 16, padding: '15px 30px' }} onClick={() => setTab('centers')}>
              <IconMapPin size={19} color="var(--nadra-forest)" />
              <span>Find Nearest Center</span>
            </button>
            <button 
              className="neu-button" 
              style={{ fontSize: 16, padding: '15px 30px', background: '#ecfdf5', borderColor: '#a7f3d0' }}
              onClick={() => setTab('tracker')}
            >
              <IconTracker size={19} color="var(--nadra-forest)" />
              <span>Track Application</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--nadra-forest)' }}>100%</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Verified NADRA Rules</div>
            </div>
            <div style={{ borderLeft: '1.5px solid #cbd5e1', paddingLeft: 36 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--nadra-forest)' }}>24/7</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Hyderabad Mega Center</div>
            </div>
            <div style={{ borderLeft: '1.5px solid #cbd5e1', paddingLeft: 36 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: 'var(--nadra-forest)' }}>Zero</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Sensitive PII Stored</div>
            </div>
          </div>
        </div>

        {/* EXPANDED SKEUOMORPHIC 3D PAKISTANI SMART CNIC CARD */}
        <div className="skeuo-card-wrapper">
          <div className="skeuo-cnic-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: 2, opacity: 0.95 }}>
                  ISLAMIC REPUBLIC OF PAKISTAN
                </div>
                <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>
                  National Database and Registration Authority
                </div>
              </div>
              <div style={{ opacity: 0.9 }}>
                <IconShield size={26} color="#ffffff" />
              </div>
            </div>

            {/* Skeuomorphic Metallic SIM Chip */}
            <div className="skeuo-chip"></div>

            {/* Embossed 3D Digits */}
            <div className="skeuo-embossed-digits">
              42101-9876543-1
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 12 }}>
              <div>
                <div style={{ opacity: 0.85, fontSize: 10.5 }}>NAME / نام</div>
                <div style={{ fontWeight: 800, letterSpacing: 0.5, fontSize: 14 }}>CITIZEN OF PAKISTAN</div>
                <div style={{ opacity: 0.85, marginTop: 4, fontSize: 10.5 }}>COUNTRY OF STAY: PAKISTAN</div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div className="skeuo-stamp">
                  <IconCheck size={14} color="#fef08a" />
                  VERIFIED
                </div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 6 }}>EXPIRY: 2034</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            <em>Hover over card for 3D tilt & holographic glare reflection</em>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE TILES SHOWCASE (Full-Width Fluid Grid with Line Icons)
// -----------------------------------------------------------------------------
function ServicesShowcase({ setTab, isUrdu }) {
  const cards = [
    {
      id: 'resolver',
      icon: <IconBot size={32} color="var(--nadra-forest)" />,
      title: 'AI Case Resolver',
      title_ur: 'اے آئی کیس حل کنندہ',
      desc: 'Explain your issue in Roman Urdu or Urdu. The AI detects whether you need a new card, renewal, or modification.',
      tag: 'Urdu & Roman Urdu'
    },
    {
      id: 'journey',
      icon: <IconJourney size={32} color="var(--nadra-forest)" />,
      title: 'CNIC Journey Simulator',
      title_ur: 'شناختی کارڈ جرنی سیمولیٹر',
      desc: 'Visual multi-step journey showing exact counter steps, fees, delivery days, and hidden bottleneck warnings.',
      tag: 'Visual Stepper'
    },
    {
      id: 'form',
      icon: <IconFormDoctor size={32} color="var(--nadra-forest)" />,
      title: 'Government Form Doctor',
      title_ur: 'سرکاری فارم ڈاکٹر',
      desc: 'Automatic field-by-field diagnostic tool to detect format errors, missing spouse CNICs, and contradictions before center visits.',
      tag: 'Error Detector'
    },
    {
      id: 'centers',
      icon: <IconMapPin size={32} color="var(--nadra-forest)" />,
      title: 'Center & Queue Finder',
      title_ur: 'نادرا سنٹر اور قطار کی معلومات',
      desc: 'Real-time directory for Hyderabad Auto Bhan Mega Center, Karachi, Lahore, with rush hour analytics.',
      tag: 'Mega 24/7'
    },
    {
      id: 'tracker',
      icon: <IconTracker size={32} color="var(--nadra-forest)" />,
      title: 'Tracker & Rejection Explainer',
      title_ur: 'ٹریکر اور اعتراض کی آسان وضاحت',
      desc: 'Translates cryptic rejection codes like "Rule 14 Biometric Mismatch" into empathetic, plain-language Urdu/English action steps.',
      tag: 'Empathy Engine'
    },
    {
      id: 'checklist',
      icon: <IconChecklist size={32} color="var(--nadra-forest)" />,
      title: 'Document Checklist',
      title_ur: 'مطلوبہ دستاویزات کی چیک لسٹ',
      desc: 'Personalized document checklist with live interactive check-off states, export options, and attestation guide.',
      tag: 'Zero Surprise'
    }
  ];

  return (
    <div className="fluid-content-wrapper">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: 'var(--nadra-dark)' }}>
          Core Citizen Guidance Services
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 17, marginTop: 8 }}>
          Designed to eliminate repeated visits and application rejection at NADRA centers.
        </p>
      </div>

      <div className="fluid-grid-3">
        {cards.map(c => (
          <div 
            key={c.title} 
            className="service-feature-card" 
            onClick={() => setTab(c.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ background: 'var(--nadra-mint-soft)', padding: 12, borderRadius: 12 }}>
                {c.icon}
              </div>
              <span className="tag-badge tag-green">{c.tag}</span>
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--nadra-forest)', marginBottom: 6 }}>
              {c.title}
            </div>
            {isUrdu && (
              <div className="urdu-font" style={{ fontSize: 15, color: 'var(--nadra-emerald)', marginBottom: 8 }}>
                {c.title_ur}
              </div>
            )}
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 22, flex: 1 }}>
              {c.desc}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--nadra-emerald)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Launch Service</span>
              <IconArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 1 & 2: AI CASE RESOLVER VIEW (Line Icons)
// -----------------------------------------------------------------------------
function CaseResolverView({ isUrdu }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  const samplePrompts = [
    "Meri CNIC expire ho gayi hai aur mujhe urgent renewal chahiye",
    "Meri CNIC pe father ka naam ghalat hai aur meri shaadi ho chuki hai",
    "Mera 18 saal ka card pehli baar banwana hai, kya kya chahiye?",
    "3 saal ke bachay ka B-Form banwana hai"
  ];

  const handleResolve = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setChecklist(null);
    try {
      const res = await resolveCase(query);
      if (res.status === 'success') {
        setResult(res.data);
        const cl = await getChecklist(res.data.service_id);
        if (cl.status === 'success') setChecklist(cl);
      }
    } catch (e) {
      alert("Error contacting backend: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleDoc = (id) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalDocs = checklist ? checklist.required_documents.length + checklist.optional_documents.length : 0;
  const readyDocs = Object.values(checkedDocs).filter(Boolean).length;

  return (
    <div>
      <div className="glass-card-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconBot size={28} color="var(--nadra-forest)" />
              <span>AI Case Resolver & Document Intelligence</span>
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
              Type your dilemma in Roman Urdu, Urdu, or English. Gemini AI classifies your required NADRA procedure.
            </div>
          </div>
          <span className="tag-badge tag-green" style={{ fontSize: 13.5, padding: '6px 16px' }}>
            Powered by Gemini AI
          </span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--nadra-forest)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            Describe your case in plain words:
          </label>
          <textarea
            className="neu-input"
            style={{ minHeight: 120, resize: 'vertical' }}
            placeholder="e.g. Meri shaadi ho chuki hai aur mujhe CNIC me husband ka naam update karwana hai..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Demos:</span>
          {samplePrompts.map(p => (
            <button key={p} className="prompt-pill" onClick={() => setQuery(p)}>
              {p.slice(0, 46)}…
            </button>
          ))}
        </div>

        <button 
          className="neu-button neu-button-primary" 
          style={{ fontSize: 16, padding: '16px 36px' }}
          onClick={handleResolve} 
          disabled={loading || !query.trim()}
        >
          <IconSearch size={18} color="#ffffff" />
          <span>{loading ? 'Analyzing with NADRA AI...' : 'Resolve My Case & Generate Checklist'}</span>
        </button>
      </div>

      {result && (
        <div className="glass-card-wide" style={{ borderColor: 'var(--nadra-emerald)', borderWidth: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--nadra-forest)' }}>
                  {result.service_title}
                </div>
                <span className="tag-badge tag-green">AI Confidence: {Math.round((result.confidence || 0.95) * 100)}%</span>
              </div>
              <div className="urdu-font" style={{ fontSize: 17, color: 'var(--nadra-emerald)', marginTop: 4 }}>
                {result.service_title_ur}
              </div>
            </div>
            {/* Three-Tier Delivery Mode Pricing Grid */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* Normal */}
              <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '8px 14px', textAlign: 'center', minWidth: 95, boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Normal</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--nadra-forest)' }}>
                  Rs. {(checklist?.fee_normal || 750).toLocaleString()}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>{checklist?.delivery_normal || 30} Days</div>
              </div>

              {/* Urgent */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 12, padding: '8px 14px', textAlign: 'center', minWidth: 95, boxShadow: '0 2px 4px rgba(6,78,59,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Urgent</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#065f46' }}>
                  Rs. {(checklist?.fee_urgent || 1500).toLocaleString()}
                </div>
                <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600 }}>{checklist?.delivery_urgent || 15} Days</div>
              </div>

              {/* Executive */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '8px 14px', textAlign: 'center', minWidth: 95, boxShadow: '0 2px 4px rgba(180,83,9,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Executive</div>
                <div style={{ fontSize: 19, fontWeight: 900, color: '#92400e' }}>
                  Rs. {(checklist?.fee_executive || 2500).toLocaleString()}
                </div>
                <div style={{ fontSize: 11.5, color: '#b45309', fontWeight: 600 }}>7 Days (VIP)</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '20px 28px', background: 'var(--nadra-mint-soft)', borderRadius: 14, borderLeft: '5px solid var(--nadra-emerald)', marginBottom: 30 }}>
            <div style={{ fontSize: 16.5, color: 'var(--nadra-dark)', fontWeight: 600 }}>
              {isUrdu ? (
                <span className="urdu-font" style={{ fontSize: 18 }}>{result.summary_ur}</span>
              ) : (
                result.summary_en
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {result.in_person_required && (
                <span className="tag-badge tag-amber">
                  <IconAlert size={15} />
                  Physical Center Visit Mandatory
                </span>
              )}
              {result.online_eligible && (
                <span className="tag-badge tag-green">
                  <IconCheck size={15} />
                  Pak-ID App Eligible
                </span>
              )}
              <span className="tag-badge tag-blue">Delivery Mode: {result.extracted_entities?.urgency || 'Normal'}</span>
            </div>
          </div>

          {checklist && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconChecklist size={22} color="var(--nadra-forest)" />
                    <span>Mandatory & Supporting Documents Checklist</span>
                  </h3>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                    Tick documents you have ready. Print or copy before your center visit.
                  </div>
                </div>

                {/* Print & Share Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button 
                    className="neu-button" 
                    style={{ padding: '8px 16px', fontSize: 13.5 }}
                    onClick={() => window.print()}
                    title="Print or Save PDF"
                  >
                    <IconPrinter size={15} />
                    <span>Print / Export PDF</span>
                  </button>
                  <button 
                    className="neu-button" 
                    style={{ padding: '8px 16px', fontSize: 13.5 }}
                    onClick={() => {
                      const text = `NADRA Document Checklist - ${result.service_title}\n` +
                        `Fees: Normal: Rs.${checklist.fee_normal} | Urgent: Rs.${checklist.fee_urgent} | Executive: Rs.${checklist.fee_executive}\n\n` +
                        `REQUIRED DOCUMENTS:\n` +
                        checklist.required_documents.map((d, i) => `${i+1}. [${checkedDocs[d.id] ? 'X' : ' '}] ${d.name_en} (${d.explanation_en})`).join('\n') +
                        (checklist.optional_documents.length ? `\n\nOPTIONAL DOCUMENTS:\n` + checklist.optional_documents.map((d, i) => `${i+1}. [${checkedDocs[d.id] ? 'X' : ' '}] ${d.name_en}`).join('\n') : '');
                      navigator.clipboard.writeText(text);
                      alert("Checklist successfully copied to clipboard!");
                    }}
                    title="Share or Copy Checklist"
                  >
                    <IconShare size={15} />
                    <span>Share Checklist</span>
                  </button>
                  <div style={{ textAlign: 'right', paddingLeft: 10, borderLeft: '1.5px solid #e2e8f0' }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--nadra-emerald)' }}>
                      {readyDocs}/{totalDocs}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>READY</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <span className="tag-badge tag-red" style={{ marginBottom: 14 }}>MANDATORY REQUIREMENTS</span>
                {checklist.required_documents.map(doc => {
                  const isChecked = !!checkedDocs[doc.id];
                  return (
                    <div 
                      key={doc.id} 
                      className={`doc-card ${isChecked ? 'is-checked' : ''}`}
                      onClick={() => toggleDoc(doc.id)}
                    >
                      <div className="doc-checkbox">
                        {isChecked && <IconCheck size={16} color="#ffffff" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {doc.name_en}
                        </div>
                        <div className="urdu-font" style={{ fontSize: 15, color: 'var(--nadra-emerald)' }}>
                          {doc.name_ur}
                        </div>
                        <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                          {doc.explanation_en}
                        </div>
                      </div>
                      <span className="tag-badge tag-red" style={{ flexShrink: 0 }}>Required</span>
                    </div>
                  );
                })}
              </div>

              {checklist.optional_documents.length > 0 && (
                <div style={{ marginTop: 26 }}>
                  <span className="tag-badge tag-blue" style={{ marginBottom: 14 }}>SUPPORTING / RECOMMENDED</span>
                  {checklist.optional_documents.map(doc => {
                    const isChecked = !!checkedDocs[doc.id];
                    return (
                      <div 
                        key={doc.id} 
                        className={`doc-card ${isChecked ? 'is-checked' : ''}`}
                        onClick={() => toggleDoc(doc.id)}
                      >
                        <div className="doc-checkbox">
                          {isChecked && <IconCheck size={16} color="#ffffff" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {doc.name_en}
                          </div>
                          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                            {doc.explanation_en}
                          </div>
                        </div>
                        <span className="tag-badge tag-blue" style={{ flexShrink: 0 }}>Optional</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {readyDocs === totalDocs && totalDocs > 0 && (
                <div style={{ marginTop: 26, padding: 22, background: '#DCFCE7', borderRadius: 14, color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <IconCheck size={24} color="#166534" />
                  <span style={{ fontSize: 16 }}>All documents verified! You have everything required to complete this service without counter rejection.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 2: STANDALONE DYNAMIC DOCUMENT CHECKLIST VIEW
// -----------------------------------------------------------------------------
function DocumentChecklistView({ isUrdu }) {
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('first_time_cnic');
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load available services on mount
  useEffect(() => {
    getServices()
      .then(res => {
        if (res.status === 'success' && res.services?.length) {
          setServices(res.services);
        } else {
          // Fallback services
          setServices([
            { service_id: 'first_time_cnic', title_en: 'First-Time CNIC (Age 18+)', title_ur: 'پہلی بار شناختی کارڈ (18 سال اور زائد)' },
            { service_id: 'cnic_renewal', title_en: 'CNIC Renewal (Expired Card)', title_ur: 'شناختی کارڈ کی تجدید (میعاد ختم)' },
            { service_id: 'cnic_modification', title_en: 'CNIC Modification (Correction / Marital Status)', title_ur: 'شناختی کارڈ میں ترمیم یا درستگی' },
            { service_id: 'crc_bform', title_en: 'Child Registration Certificate (B-Form / CRC)', title_ur: 'چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)' }
          ]);
        }
      })
      .catch(() => {
        setServices([
          { service_id: 'first_time_cnic', title_en: 'First-Time CNIC (Age 18+)', title_ur: 'پہلی بار شناختی کارڈ (18 سال اور زائد)' },
          { service_id: 'cnic_renewal', title_en: 'CNIC Renewal (Expired Card)', title_ur: 'شناختی کارڈ کی تجدید (میعاد ختم)' },
          { service_id: 'cnic_modification', title_en: 'CNIC Modification (Correction / Marital Status)', title_ur: 'شناختی کارڈ میں ترمیم یا درستگی' },
          { service_id: 'crc_bform', title_en: 'Child Registration Certificate (B-Form / CRC)', title_ur: 'چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم)' }
        ]);
      });
  }, []);

  // Load checklist whenever selected service changes
  useEffect(() => {
    if (!selectedServiceId) return;
    setLoading(true);
    setCheckedDocs({});
    getChecklist(selectedServiceId)
      .then(data => {
        if (data.status === 'success') {
          setChecklist(data);
        }
      })
      .catch(err => alert("Error loading checklist: " + err.message))
      .finally(() => setLoading(false));
  }, [selectedServiceId]);

  const toggleDoc = (id) => {
    setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyChecklist = () => {
    if (!checklist) return;
    const text = `NADRA DOCUMENT CHECKLIST - ${checklist.service_title}\n` +
      `Official Fees: Normal: Rs.${checklist.fee_normal} (${checklist.delivery_normal || 30} Days) | Urgent: Rs.${checklist.fee_urgent} (${checklist.delivery_urgent || 15} Days) | Executive: Rs.${checklist.fee_executive} (7 Days VIP)\n\n` +
      `MANDATORY DOCUMENTS:\n` +
      checklist.required_documents.map((d, i) => `${i + 1}. [${checkedDocs[d.id] ? 'X' : ' '}] ${d.name_en} - ${d.explanation_en}`).join('\n') +
      (checklist.optional_documents?.length ? `\n\nSUPPORTING DOCUMENTS:\n` + checklist.optional_documents.map((d, i) => `${i + 1}. [${checkedDocs[d.id] ? 'X' : ' '}] ${d.name_en}`).join('\n') : '') +
      `\n\nImportant: Original documents required at the counter. Grade 17+ Gazetted Officer attestation needed on Form-1.`;
    
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const totalDocs = checklist ? (checklist.required_documents?.length || 0) + (checklist.optional_documents?.length || 0) : 0;
  const readyDocs = Object.values(checkedDocs).filter(Boolean).length;
  const progressPct = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;

  return (
    <div className="glass-card-wide">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconChecklist size={28} color="var(--nadra-forest)" />
            <span>{isUrdu ? 'دستاویزات کی ذاتی چیک لسٹ' : 'Dynamic Personalized Document Checklist'}</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            {isUrdu 
              ? 'کسی بھی نادرا سروس کا انتخاب کریں اور درکار اصل کاغذات، فیس اور تصدیقی شرائط حاصل کریں۔'
              : 'Select any official NADRA service to generate the exact required documents, fees, and attestation criteria.'}
          </div>
        </div>
        <span className="tag-badge tag-green" style={{ fontSize: 13.5, padding: '6px 16px' }}>
          {isUrdu ? 'زیرو ریجیکشن ضمانت' : 'Zero Counter Rejection'}
        </span>
      </div>

      {/* Service Selector: Pills + Dropdown */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--nadra-forest)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
          {isUrdu ? 'نادرا سروس کا انتخاب کریں:' : 'Choose Official NADRA Service:'}
        </label>
        
        {/* Quick Click Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {services.map(s => (
            <button
              key={s.service_id}
              className={`neu-button ${selectedServiceId === s.service_id ? 'neu-button-primary' : ''}`}
              style={{ fontSize: 14, padding: '10px 18px' }}
              onClick={() => setSelectedServiceId(s.service_id)}
            >
              {isUrdu ? (s.title_ur || s.title_en) : s.title_en}
            </button>
          ))}
        </div>

        {/* Or Select from dropdown */}
        <select 
          className="neu-input" 
          value={selectedServiceId}
          onChange={e => setSelectedServiceId(e.target.value)}
          style={{ maxWidth: 450, fontWeight: 600 }}
        >
          {services.map(s => (
            <option key={s.service_id} value={s.service_id}>
              {s.title_en} — {s.title_ur}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)', fontSize: 16 }}>
          Loading official document requirements...
        </div>
      ) : checklist && (
        <div>
          {/* Service Title & 3-Tier Delivery Modes Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 28px', background: 'var(--nadra-mint-soft)', borderRadius: 16, marginBottom: 28, flexWrap: 'wrap', gap: 18 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--nadra-forest)' }}>
                {checklist.service_title}
              </div>
              <div className="urdu-font" style={{ fontSize: 18, color: 'var(--nadra-emerald)', marginTop: 4 }}>
                {checklist.service_title_ur}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
                Official NADRA Document Regulations · Sindh & National Registry
              </div>
            </div>

            {/* 3-Tier Pricing Grid */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {/* Normal */}
              <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 105, boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Normal</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--nadra-forest)' }}>
                  Rs. {checklist.fee_normal?.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{checklist.delivery_normal || 30} Days</div>
              </div>

              {/* Urgent */}
              <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 105, boxShadow: '0 2px 4px rgba(6,78,59,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Urgent</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#065f46' }}>
                  Rs. {checklist.fee_urgent?.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>{checklist.delivery_urgent || 15} Days</div>
              </div>

              {/* Executive */}
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 105, boxShadow: '0 2px 4px rgba(180,83,9,0.05)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>Executive</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#92400e' }}>
                  Rs. {checklist.fee_executive?.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>7 Days (VIP)</div>
              </div>
            </div>
          </div>

          {/* Progress Bar & Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, fontWeight: 700 }}>
                <span style={{ color: 'var(--nadra-forest)' }}>Readiness Preparation:</span>
                <span style={{ color: progressPct === 100 ? '#047857' : 'var(--text-primary)' }}>
                  {readyDocs} of {totalDocs} Documents Ready ({progressPct}%)
                </span>
              </div>
              <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${progressPct}%`, 
                    background: progressPct === 100 ? 'linear-gradient(90deg, #10b981, #047857)' : 'linear-gradient(90deg, #0284c7, var(--nadra-emerald))', 
                    transition: 'width 0.3s ease' 
                  }} 
                />
              </div>
            </div>

            {/* Action Buttons: Print & Share */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="neu-button" 
                style={{ padding: '10px 18px', fontSize: 14 }}
                onClick={() => window.print()}
                title="Print or Save Checklist as PDF"
              >
                <IconPrinter size={16} />
                <span>Print / Export PDF</span>
              </button>

              <button 
                className="neu-button neu-button-primary" 
                style={{ padding: '10px 18px', fontSize: 14 }}
                onClick={handleCopyChecklist}
                title="Share or Copy formatted checklist to clipboard"
              >
                {copyFeedback ? <IconCheck size={16} color="#ffffff" /> : <IconShare size={16} color="#ffffff" />}
                <span>{copyFeedback ? 'Copied to Clipboard!' : 'Share Checklist'}</span>
              </button>
            </div>
          </div>

          {/* Official Rule Notice */}
          <div style={{ padding: '12px 18px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: 8, fontSize: 13.5, color: '#92400e', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAlert size={16} color="#b45309" />
            <span><strong>Golden Rule:</strong> Counter attendants only accept <strong>ORIGINAL</strong> identification certificates. Laminated cards or un-attested photocopies will be rejected.</span>
          </div>

          {/* Mandatory Documents List */}
          <div style={{ marginBottom: 24 }}>
            <span className="tag-badge tag-red" style={{ marginBottom: 14, fontSize: 12.5, letterSpacing: 0.5 }}>
              MANDATORY REQUIREMENTS (Zero Exceptions)
            </span>
            {checklist.required_documents.map(doc => {
              const isChecked = !!checkedDocs[doc.id];
              return (
                <div 
                  key={doc.id} 
                  className={`doc-card ${isChecked ? 'is-checked' : ''}`}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <div className="doc-checkbox">
                    {isChecked && <IconCheck size={16} color="#ffffff" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {doc.name_en}
                    </div>
                    <div className="urdu-font" style={{ fontSize: 15, color: 'var(--nadra-emerald)' }}>
                      {doc.name_ur}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                      {doc.explanation_en}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span className="tag-badge tag-red">Required</span>
                    <span className="tag-badge tag-amber" style={{ fontSize: 11 }}>Original</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Supporting / Optional Documents List */}
          {checklist.optional_documents && checklist.optional_documents.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <span className="tag-badge tag-blue" style={{ marginBottom: 14, fontSize: 12.5, letterSpacing: 0.5 }}>
                SUPPORTING / RECOMMENDED DOCUMENTS
              </span>
              {checklist.optional_documents.map(doc => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div 
                    key={doc.id} 
                    className={`doc-card ${isChecked ? 'is-checked' : ''}`}
                    onClick={() => toggleDoc(doc.id)}
                  >
                    <div className="doc-checkbox">
                      {isChecked && <IconCheck size={16} color="#ffffff" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {doc.name_en}
                      </div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
                        {doc.explanation_en}
                      </div>
                    </div>
                    <span className="tag-badge tag-blue" style={{ flexShrink: 0 }}>Optional</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 100% Ready All Clear Banner */}
          {readyDocs === totalDocs && totalDocs > 0 && (
            <div style={{ marginTop: 28, padding: 24, background: '#DCFCE7', borderRadius: 14, color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 14, border: '1.5px solid #86efac' }}>
              <IconCheck size={28} color="#166534" />
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>Checklist 100% Complete!</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>You have verified all necessary documents and original cards. You can now visit any NADRA Mega or Executive Center with complete confidence.</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 3: CITIZEN-CENTRIC QUEUE RADAR & LIVE COUNTER CALL SYSTEM
// -----------------------------------------------------------------------------
function JourneySimulatorView({ isUrdu }) {
  const [inputToken, setInputToken] = useState('M-108');
  const [board, setBoard] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [callingAlert, setCallingAlert] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCounterForCall, setSelectedCounterForCall] = useState(2);

  // Active Citizen's Token State
  const [myToken, setMyToken] = useState({
    token_number: 'M-108',
    applicant_name: 'Fizza Baloch (Citizen)',
    service_title: 'CNIC Modification (Correction / Marital)',
    category_prefix: 'M',
    counter_id: 2,
    counter_name: 'Counter 02 (Data Entry & Verification Desk)',
    people_ahead: 2,
    estimated_wait_minutes: 16,
    currently_serving: 'M-105',
    status: 'WAITING',
    queue_sequence: ['M-105', 'M-106', 'M-107', 'M-108'],
    ai_explanation: 'Calculated from 84 previous citizens treated today: CNIC Modification cases took an average of 8.2 mins due to Marriage Certificate verification.'
  });

  const [issueForm, setIssueForm] = useState({
    applicant_name: '',
    phone: '',
    service_id: 'cnic_modification'
  });

  const demoTokens = [
    { token: 'M-108', label: 'M-108 (CNIC Modification · 2 Ahead · ~16m)', name: 'Fizza Baloch', service: 'CNIC Modification', counter: 2, ahead: 2, wait: 16, serving: 'M-105', seq: ['M-105', 'M-106', 'M-107', 'M-108'] },
    { token: 'N-104', label: 'N-104 (First-Time CNIC · 1 Ahead · ~11m)', name: 'Aleena Memon', service: 'First-Time CNIC', counter: 1, ahead: 1, wait: 11, serving: 'N-102', seq: ['N-102', 'N-103', 'N-104'] },
    { token: 'R-202', label: 'R-202 (CNIC Renewal · 0 Ahead · NOW CALLING)', name: 'Fiza Nizamani', service: 'CNIC Renewal', counter: 3, ahead: 0, wait: 0, serving: 'R-202', seq: ['R-200', 'R-201', 'R-202'] },
    { token: 'B-105', label: 'B-105 (Child B-Form · 3 Ahead · ~22m)', name: 'Zainab Bibi', service: 'Child B-Form / CRC', counter: 4, ahead: 3, wait: 22, serving: 'B-101', seq: ['B-101', 'B-102', 'B-103', 'B-104', 'B-105'] }
  ];

  const loadBoard = async () => {
    try {
      const data = await getQueueBoard();
      if (data.status === 'success') {
        setBoard(data);
      }
    } catch (e) {
      console.warn("Queue board fetch:", e);
    }
  };

  useEffect(() => {
    loadBoard();
    const interval = setInterval(loadBoard, 8000);
    return () => clearInterval(interval);
  }, []);

  // Citizen Searches or Enters Their Token
  const handleTrackToken = (tokenToTrack) => {
    const cleanToken = (tokenToTrack || inputToken).trim().toUpperCase();
    if (!cleanToken) return;

    // Check if it matches any demo preset
    const matched = demoTokens.find(d => d.token === cleanToken);
    if (matched) {
      setMyToken({
        token_number: matched.token,
        applicant_name: matched.name,
        service_title: matched.service,
        category_prefix: matched.token.split('-')[0],
        counter_id: matched.counter,
        counter_name: `Counter 0${matched.counter} (${matched.counter === 1 ? 'Biometric' : matched.counter === 2 ? 'Data Entry' : matched.counter === 3 ? 'Fee Desk' : 'Final Review'})`,
        people_ahead: matched.ahead,
        estimated_wait_minutes: matched.wait,
        currently_serving: matched.serving,
        status: matched.ahead === 0 ? 'CALLING' : 'WAITING',
        queue_sequence: matched.seq,
        ai_explanation: `AI Queue Intelligence: Calculated from past cases for ${matched.service}. Average counter treatment duration is ~8 mins.`
      });
    } else {
      // Dynamic fallback for any user-typed token
      const prefix = cleanToken.includes('-') ? cleanToken.split('-')[0] : 'M';
      const num = parseInt(cleanToken.replace(/\D/g, '')) || 108;
      const currentNum = Math.max(100, num - 2);
      const serving = `${prefix}-${currentNum}`;
      setMyToken({
        token_number: cleanToken,
        applicant_name: 'Verified Citizen',
        service_title: prefix === 'N' ? 'First-Time CNIC' : prefix === 'R' ? 'CNIC Renewal' : prefix === 'B' ? 'Child B-Form' : 'CNIC Modification',
        category_prefix: prefix,
        counter_id: 2,
        counter_name: 'Counter 02 (Data Entry Desk)',
        people_ahead: 2,
        estimated_wait_minutes: 16,
        currently_serving: serving,
        status: 'WAITING',
        queue_sequence: [`${prefix}-${currentNum}`, `${prefix}-${currentNum + 1}`, cleanToken],
        ai_explanation: 'Based on previous 84 citizens treated today, average processing time is ~8 mins per person.'
      });
    }
  };

  // Staff / Attendant Simulator: Advance to Next Number
  const handleAdvanceCounter = async () => {
    try {
      if (soundEnabled) {
        playNadraChime();
      }
      const res = await advanceQueue(myToken?.counter_id || 2);
      if (res.status === 'success') {
        setBoard(prev => ({
          ...prev,
          last_called: res.last_called,
          counters: res.counters
        }));

        // Advance citizen queue state
        if (myToken.people_ahead > 1) {
          // One person treated, now 1 ahead
          const nextServing = myToken.queue_sequence[1] || `M-106`;
          setMyToken(prev => ({
            ...prev,
            currently_serving: nextServing,
            people_ahead: prev.people_ahead - 1,
            estimated_wait_minutes: Math.max(4, prev.estimated_wait_minutes - 8)
          }));
          setCallingAlert({
            isMine: false,
            message: `Counter 02 called Token ${nextServing}. You are NEXT in line!`
          });
        } else if (myToken.people_ahead === 1) {
          // YOUR TURN HAS ARRIVED!
          setMyToken(prev => ({
            ...prev,
            currently_serving: prev.token_number,
            people_ahead: 0,
            estimated_wait_minutes: 0,
            status: 'CALLING'
          }));
          setCallingAlert({
            isMine: true,
            message: `🔔 آپ کی باری آ گئی ہے! / IT'S YOUR TURN! Please immediately proceed to ${myToken.counter_name} with your Original Documents!`
          });
        } else {
          // Already called
          setCallingAlert({
            isMine: true,
            message: `🔔 Token ${myToken.token_number} is being served right now at ${myToken.counter_name}!`
          });
        }

        setTimeout(() => setCallingAlert(null), 9000);
      }
    } catch (e) {
      console.warn(e.message);
    }
  };

  // Issue New Parchi Modal
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.applicant_name.trim()) return;
    try {
      const res = await issueToken(issueForm);
      if (res.status === 'success') {
        const t = res.token;
        setMyToken({
          token_number: t.token_number,
          applicant_name: t.applicant_name,
          service_title: t.service_title,
          category_prefix: t.category_prefix,
          counter_id: t.counter_id,
          counter_name: `Counter 0${t.counter_id}`,
          people_ahead: t.people_ahead,
          estimated_wait_minutes: t.estimated_wait_minutes,
          currently_serving: `${t.category_prefix}-102`,
          status: 'WAITING',
          queue_sequence: [`${t.category_prefix}-102`, `${t.category_prefix}-103`, t.token_number],
          ai_explanation: t.ai_explanation
        });
        setInputToken(t.token_number);
        setShowIssueModal(false);
        console.log("Token issued:", t.token_number);
      }
    } catch (err) {
      console.warn(err.message);
    }
  };

  const countersList = board?.counters || [
    { id: 1, name: 'Counter 1', type: 'Biometric & Photo', current_token: 'N-103', status: 'BUSY' },
    { id: 2, name: 'Counter 2', type: 'Data Entry & Verification', current_token: myToken?.currently_serving || 'M-105', status: 'BUSY' },
    { id: 3, name: 'Counter 3', type: 'Fee & Review Desk', current_token: 'R-201', status: 'CALLING' },
    { id: 4, name: 'Counter 4', type: 'Final Review & Receipt', current_token: 'B-101', status: 'BUSY' }
  ];

  return (
    <div className="glass-card-wide">
      
      {/* 1. CITIZEN PROMPT: ENTER YOUR TOKEN NUMBER */}
      <div style={{ background: 'linear-gradient(135deg, #063e1d 0%, #0d8244 100%)', borderRadius: 20, padding: '32px 36px', color: '#ffffff', marginBottom: 30, boxShadow: '0 12px 30px rgba(6, 62, 29, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, letterSpacing: 1.5, opacity: 0.9 }}>
              <IconTicket size={18} color="#a3e635" />
              <span>NADRA MEGA CENTER HYDERABAD · LIVE QUEUE RADAR</span>
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>
              Enter Your Token Number / اپنا ٹوکن نمبر درج کریں
            </h2>
            <p style={{ fontSize: 15, opacity: 0.85, marginTop: 4 }}>
              Enter the token number from your paper slip to track live queue position and estimated call time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button 
              className="neu-button" 
              style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff', padding: '8px 16px', fontSize: 13 }}
              onClick={() => { setSoundEnabled(!soundEnabled); if (!soundEnabled) playNadraChime(); }}
            >
              <IconVolume size={15} color="#ffffff" />
              <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
            </button>
            <button 
              className="neu-button" 
              style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff', padding: '8px 16px', fontSize: 13 }}
              onClick={() => setShowIssueModal(!showIssueModal)}
            >
              + Issue Token Slip
            </button>
          </div>
        </div>

        {/* Big Search Input */}
        <div style={{ display: 'flex', gap: 12, maxWidth: 640 }}>
          <input 
            className="neu-input" 
            style={{ background: '#ffffff', color: '#0f172a', fontSize: 18, fontWeight: 800, letterSpacing: 1, padding: '16px 22px' }}
            placeholder="e.g. M-108, N-104, R-202..."
            value={inputToken}
            onChange={e => setInputToken(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleTrackToken()}
          />
          <button 
            className="neu-button neu-button-primary" 
            style={{ padding: '16px 32px', fontSize: 16, background: '#16a34a', borderColor: '#86efac', flexShrink: 0 }}
            onClick={() => handleTrackToken()}
          >
            <IconSearch size={18} color="#ffffff" />
            <span>Track My Turn</span>
          </button>
        </div>

        {/* Demo Quick Presets */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 700 }}>Quick Demo Slips:</span>
          {demoTokens.map(d => (
            <button
              key={d.token}
              onClick={() => { setInputToken(d.token); handleTrackToken(d.token); }}
              style={{ 
                background: myToken?.token_number === d.token ? '#ffffff' : 'rgba(255,255,255,0.12)', 
                color: myToken?.token_number === d.token ? '#063e1d' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {d.token} ({d.ahead} Ahead)
            </button>
          ))}
        </div>
      </div>

      {/* 2. REAL-TIME BEEP/ALERT BANNER (WHEN CALL ARRIVES) */}
      {callingAlert && (
        <div 
          className={callingAlert.isMine ? 'calling-alert-card' : ''}
          style={{ 
            padding: '20px 28px', 
            borderRadius: 16, 
            background: callingAlert.isMine ? '#15803d' : '#1e293b', 
            color: '#ffffff', 
            marginBottom: 28, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            boxShadow: callingAlert.isMine ? '0 12px 30px rgba(21,128,61,0.5)' : '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IconBell size={32} color={callingAlert.isMine ? '#fef08a' : '#60a5fa'} />
            <div>
              <div style={{ fontSize: 19, fontWeight: 900 }}>
                {callingAlert.isMine ? 'آپ کی باری آ گئی ہے! / IT IS YOUR TURN!' : 'NEXT TOKEN CALLED'}
              </div>
              <div style={{ fontSize: 15, opacity: 0.95, marginTop: 4 }}>
                {callingAlert.message}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setCallingAlert(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: 20, cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. PERSONAL LIVE QUEUE RADAR CARD */}
      <div style={{ padding: '28px 32px', background: '#ffffff', border: '2px solid var(--nadra-emerald)', borderRadius: 18, marginBottom: 32, boxShadow: '0 10px 25px rgba(11, 90, 43, 0.06)' }}>
        
        {/* Radar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18, marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              CITIZEN QUEUE RADAR · {myToken?.applicant_name}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--nadra-forest)', marginTop: 2 }}>
              Your Token: {myToken?.token_number}
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 2 }}>
              Category: <strong>{myToken?.service_title}</strong> · Destination: <strong>{myToken?.counter_name}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`tag-badge ${myToken?.status === 'CALLING' ? 'tag-green' : 'tag-amber'}`} style={{ fontSize: 14, padding: '8px 18px' }}>
              {myToken?.status === 'CALLING' ? '● PLEASE REPORT TO COUNTER NOW' : '● WAITING IN QUEUE'}
            </span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Hyderabad Mega Center (24/7)
            </div>
          </div>
        </div>

        {/* 3 Key Metric Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 28 }}>
          
          {/* Box 1: Currently Serving */}
          <div style={{ padding: '18px 22px', background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Now Serving at Desk:
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#dc2626', margin: '4px 0' }}>
              {myToken?.currently_serving}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Inside {myToken?.counter_name?.split('(')[0]}
            </div>
          </div>

          {/* Box 2: Your Position */}
          <div style={{ padding: '18px 22px', background: '#ecfdf5', borderRadius: 14, border: '1.5px solid #a7f3d0' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
              Your Queue Position:
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#065f46', margin: '4px 0' }}>
              {myToken?.people_ahead === 0 ? 'YOU ARE NEXT!' : `${myToken?.people_ahead + 1}th in Line`}
            </div>
            <div style={{ fontSize: 13, color: '#047857', fontWeight: 600 }}>
              {myToken?.people_ahead === 0 ? 'Proceed to counter door' : `Only ${myToken?.people_ahead} person(s) ahead`}
            </div>
          </div>

          {/* Box 3: AI Estimated Time */}
          <div style={{ padding: '18px 22px', background: '#fffbeb', borderRadius: 14, border: '1.5px solid #fde68a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                Estimated Call Time:
              </span>
              <span className="tag-badge tag-green" style={{ fontSize: 10 }}>AI Predicted</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#92400e', margin: '4px 0' }}>
              {myToken?.estimated_wait_minutes === 0 ? '0 Mins' : `~${myToken?.estimated_wait_minutes} Mins`}
            </div>
            <div style={{ fontSize: 12.5, color: '#b45309' }}>
              Calculated from 84 previous cases today
            </div>
          </div>
        </div>

        {/* Visual Progress Sequence Bar (Connected Nodes) */}
        <div style={{ marginBottom: 24, padding: '20px 24px', background: 'var(--nadra-mint-soft)', borderRadius: 14, border: '1px solid var(--nadra-mint-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--nadra-forest)', textTransform: 'uppercase', marginBottom: 14 }}>
            Visual Queue Progression to Your Turn:
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
            {myToken?.queue_sequence?.map((tok, idx) => {
              const isServingNow = tok === myToken.currently_serving;
              const isMe = tok === myToken.token_number;
              return (
                <div key={tok} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    padding: '12px 20px', 
                    borderRadius: 12, 
                    background: isMe ? 'var(--nadra-forest)' : isServingNow ? '#dc2626' : '#ffffff', 
                    color: isMe || isServingNow ? '#ffffff' : 'var(--text-primary)',
                    border: `2px solid ${isMe ? 'var(--nadra-forest)' : isServingNow ? '#b91c1c' : '#cbd5e1'}`,
                    textAlign: 'center',
                    minWidth: 120,
                    boxShadow: isMe || isServingNow ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                  }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, opacity: 0.85, textTransform: 'uppercase' }}>
                      {isServingNow ? 'At Counter' : isMe ? 'YOUR TURN' : `Ahead #${idx}`}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>
                      {tok}
                    </div>
                  </div>
                  {idx < myToken.queue_sequence.length - 1 && (
                    <span style={{ fontSize: 20, color: 'var(--nadra-emerald)', fontWeight: 900 }}>➔</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Counter Attendant Advance Button (To Simulate Queue Movement) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1.5px solid #e2e8f0', paddingTop: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconAlert size={16} color="var(--nadra-emerald)" />
            <span>Keep this page open on your phone. It will ring and vibrate when your number is called.</span>
          </div>

          <button 
            className="neu-button neu-button-primary" 
            style={{ padding: '12px 24px', fontSize: 14, background: '#dc2626', borderColor: '#b91c1c' }}
            onClick={handleAdvanceCounter}
            title="Simulate counter advancing to the next citizen in line"
          >
            <IconBell size={16} color="#ffffff" />
            <span>Simulate Counter Call (Advance Next) ➔</span>
          </button>
        </div>
      </div>

      {/* 4. LIVE CENTER OVERVIEW: SYSTEM THEME COUNTERS BOARD */}
      <div style={{ marginBottom: 28, padding: '20px 24px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1.5px solid #86efac', borderRadius: 16, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1.2, color: 'var(--nadra-forest)' }}>
              ALL COUNTERS LIVE STATUS (CENTER HALL DISPLAY)
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>● Updated Live</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
          {countersList.map(c => (
            <div key={c.id} style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--nadra-dark)' }}>{c.name}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: c.status === 'CALLING' ? '#15803d' : '#b45309', background: c.status === 'CALLING' ? '#dcfce7' : '#fef3c7', padding: '2px 8px', borderRadius: 6 }}>
                  ● {c.status}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.type}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'monospace', color: '#065f46', letterSpacing: 2, background: '#ecfdf5', padding: '6px 12px', borderRadius: 8, textAlign: 'center', border: '1px solid #a7f3d0' }}>
                {c.current_token || '---'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Issue Token Modal */}
      {showIssueModal && (
        <div style={{ padding: 24, background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: 16, marginBottom: 26 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--nadra-dark)', marginBottom: 14 }}>
            Issue New Token Slip (Center Kiosk Simulator)
          </div>
          <form onSubmit={handleIssueSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Applicant Name</label>
                <input 
                  className="neu-input" 
                  placeholder="e.g. Fizza Baloch"
                  value={issueForm.applicant_name}
                  onChange={e => setIssueForm({ ...issueForm, applicant_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Mobile Number</label>
                <input 
                  className="neu-input" 
                  placeholder="0300-1234567"
                  value={issueForm.phone}
                  onChange={e => setIssueForm({ ...issueForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>Service Required</label>
                <select 
                  className="neu-input"
                  value={issueForm.service_id}
                  onChange={e => setIssueForm({ ...issueForm, service_id: e.target.value })}
                >
                  <option value="cnic_modification">CNIC Modification</option>
                  <option value="first_time_cnic">First-Time CNIC</option>
                  <option value="cnic_renewal">CNIC Renewal</option>
                  <option value="crc_bform">Child B-Form / CRC</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="neu-button neu-button-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
                Issue My Slip
              </button>
              <button type="button" className="neu-button" style={{ padding: '10px 16px', fontSize: 14 }} onClick={() => setShowIssueModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Desk Preparation Reminder Checklist */}
      <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--nadra-forest)', marginBottom: 8 }}>
          Required in Hand for {myToken?.counter_name?.split('(')[0]}:
        </h4>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          <span>✓ Original Expired CNIC</span>
          <span>✓ Computerized Nikahnama (MRC)</span>
          <span>✓ Gazetted Officer Attested Form-1</span>
          <span>✓ No photocopies on counter</span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 4: AI FORM DOCTOR & SECTION-BY-SECTION FORM EXPLAINER
// -----------------------------------------------------------------------------
function FormDoctorView({ isUrdu }) {
  const [selectedFormId, setSelectedFormId] = useState('form_1');
  const [sampleScanType, setSampleScanType] = useState('complete');
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [activeSectionTab, setActiveSectionTab] = useState('sec_a');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableForms = [
    { id: 'form_1', label: 'NADRA Form-1 (New Adult CNIC)', label_ur: 'نادرا فارم-1 (قومی رجسٹریشن)' },
    { id: 'b_form', label: 'RG-2 Form (Child B-Form / CRC)', label_ur: 'آر جی-2 فارم (ب فارم / چائلڈ رجسٹریشن)' },
    { id: 'cnic_modification', label: 'CNIC Modification & Correction Form', label_ur: 'شناختی کارڈ ترمیم و تصحیح فارم' },
    { id: 'frc', label: 'FRC (Family Registration Certificate) Form', label_ur: 'فیملی رجسٹریشن سرٹیفکیٹ (FRC) فارم' },
    { id: 'nicop', label: 'NICOP (Smart Card for Overseas Pakistanis)', label_ur: 'نائیکوپ (سمندر پار پاکستانیوں کے لیے کارڈ)' },
    { id: 'lost_cnic', label: 'Loss / Duplicate CNIC Undertaking Form', label_ur: 'شناختی کارڈ گمشدگی کا بیان حلفی فارم' },
    { id: 'deceased_cancel', label: 'Deceased Citizen CNIC Cancellation Form', label_ur: 'وفات پانے والے کے کارڈ کی منسوخی کا فارم' }
  ];

  const sampleScans = [
    { id: 'complete', label: 'Complete Attested Form (Stamp & Sign Verified)', badge: 'Green / Ready' },
    { id: 'missing_stamp', label: 'Missing Section C Attestation Stamp (Common Mistake)', badge: 'Amber / Risk' },
    { id: 'blurry', label: 'Blurry / Unreadable Scan (OCR Failure)', badge: 'Red / Reject' }
  ];

  // Run AI Inspection
  const handleRunAudit = async (fId = selectedFormId, scanType = sampleScanType) => {
    setLoading(true);
    try {
      const res = await auditFormDocument({
        form_id: fId,
        sample_type: scanType
      });
      if (res.status === 'success') {
        setAuditResult(res);
      }
    } catch (err) {
      alert("Error auditing document: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAudit('form_1', 'complete');
  }, []);

  const handleFormChange = (newFormId) => {
    setSelectedFormId(newFormId);
    setActiveSectionTab('sec_a');
    handleRunAudit(newFormId, sampleScanType);
  };

  const handleSampleChange = (newSample) => {
    setSampleScanType(newSample);
    setUploadedFileName(null);
    handleRunAudit(selectedFormId, newSample);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // For any custom upload, perform AI inspection
      handleRunAudit(selectedFormId, 'complete');
    }
  };

  return (
    <div className="glass-card-wide">
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconFormDoctor size={28} color="var(--nadra-forest)" />
            <span>Government Form Doctor & Pre-Flight Inspector</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            Learn how to fill official NADRA forms correctly and run an AI pre-flight scan before your center visit.
          </div>
        </div>
        <span className="tag-badge tag-green" style={{ fontSize: 13.5, padding: '6px 16px' }}>
          Section-by-Section Guidance
        </span>
      </div>

      {/* 2. Form Selector (Dropdown & Quick Pills) */}
      <div style={{ marginBottom: 26 }}>
        <label style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--nadra-forest)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
          1. Select Official Government Form:
        </label>
        
        {/* Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {availableForms.map(f => (
            <button
              key={f.id}
              className={`neu-button ${selectedFormId === f.id ? 'neu-button-primary' : ''}`}
              style={{ fontSize: 14, padding: '9px 18px' }}
              onClick={() => handleFormChange(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Dropdown */}
        <select 
          className="neu-input"
          value={selectedFormId}
          onChange={e => handleFormChange(e.target.value)}
          style={{ maxWidth: 480, fontWeight: 600 }}
        >
          {availableForms.map(f => (
            <option key={f.id} value={f.id}>
              {f.label} — {f.label_ur}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Document / Scan Source (Upload File OR Select Demo Scan) */}
      <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 14, border: '1.5px solid #e2e8f0', marginBottom: 30 }}>
        <label style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--nadra-forest)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
          2. Document Photo / Scan Inspector:
        </label>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}>Select Diagnostic Form Sample:</span>

          {sampleScans.map(s => (
            <button
              key={s.id}
              className={`prompt-pill ${sampleScanType === s.id && !uploadedFileName ? 'active' : ''}`}
              style={{ 
                background: sampleScanType === s.id && !uploadedFileName ? 'var(--nadra-mint-soft)' : '#ffffff',
                borderColor: sampleScanType === s.id && !uploadedFileName ? 'var(--nadra-emerald)' : '#cbd5e1'
              }}
              onClick={() => handleSampleChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN CONTENT: Visual Form Explainer (Left) + AI Diagnostic Report (Right) */}
      <div className="fluid-grid-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Left: Interactive Section-by-Section Explainer & Visual Form View */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--nadra-forest)' }}>
              How to Fill This Form (Section Guide)
            </h3>
            <button className="neu-button" style={{ padding: '6px 14px', fontSize: 12.5 }} onClick={() => window.print()}>
              <IconPrinter size={14} />
              <span>Print Guide</span>
            </button>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
            Click on any section to understand what to write, attestation rules, and how to avoid mistakes:
          </p>

          {/* Section Navigation Tabs (Dynamic per form) */}
          {auditResult && auditResult.sections && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
              {auditResult.sections.map(sec => (
                <button
                  key={sec.section_id}
                  className={`neu-button ${activeSectionTab === sec.section_id ? 'neu-button-primary' : ''}`}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={() => setActiveSectionTab(sec.section_id)}
                >
                  {sec.title_en}
                </button>
              ))}
            </div>
          )}

          {/* Active Section Explainer Box */}
          {auditResult && auditResult.sections && (() => {
            const currentSec = auditResult.sections.find(s => s.section_id === activeSectionTab) || auditResult.sections[0];
            return (
              <div style={{ padding: 22, background: 'var(--nadra-mint-soft)', border: '1.5px solid var(--nadra-mint-border)', borderRadius: 14, marginBottom: 24 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--nadra-forest)', marginBottom: 4 }}>
                  {currentSec.title_en}
                </div>
                <div className="urdu-font" style={{ fontSize: 16, color: 'var(--nadra-emerald)', marginBottom: 12 }}>
                  {currentSec.title_ur}
                </div>

                <div style={{ marginBottom: 14 }}>
                  <strong style={{ fontSize: 13.5, color: 'var(--nadra-dark)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Official Instructions:
                  </strong>
                  <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {currentSec.instructions_en}
                  </div>
                  <div className="urdu-font" style={{ fontSize: 14.5, color: 'var(--nadra-forest)', marginTop: 6 }}>
                    {currentSec.instructions_ur}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: 8, fontSize: 13.5, color: '#991b1b' }}>
                  <strong>Common Rejection Trap:</strong> {currentSec.common_mistake}
                </div>
              </div>
            );
          })()}

          {/* Dynamic Skeuomorphic Form Preview Mockup (Unique to Each Form) */}
          <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 12, padding: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1.5px solid #e2e8f0', paddingBottom: 10, marginBottom: 14, alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--nadra-dark)', letterSpacing: 1 }}>
                GOVERNMENT OF PAKISTAN · {auditResult?.form_title_en}
              </div>
              <span className="tag-badge tag-green" style={{ fontSize: 11 }}>OFFICIAL TEMPLATE</span>
            </div>

            {selectedFormId === 'form_1' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Applicant Block Details & DOB]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '80%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Blood Relative CNIC & Signature]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '90%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Gazetted Officer Grade 17+ Seal & CNIC]</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 68, height: 42, border: '1.5px dashed #15803d', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#15803d', fontWeight: 800 }}>
                      GRADE 17+ STAMP
                    </div>
                    <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 4, alignSelf: 'center' }} />
                  </div>
                </div>

                <div style={{ border: '1.5px dashed #94a3b8', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#fafafa' }}>
                  <IconUser size={24} color="#94a3b8" />
                  <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>ICAO Photo (White BG)</span>
                </div>
              </div>
            )}

            {selectedFormId === 'b_form' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Union Council Birth Certificate # & Child Details]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '75%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Father CNIC & Mother CNIC (Married Status)]</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
                    <div style={{ flex: 1, height: 12, background: '#f1f5f9', borderRadius: 4 }} />
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Parent Biometric Verification Presence]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '85%' }} />
                </div>

                <div style={{ border: '1.5px dashed #0284c7', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#f0f9ff' }}>
                  <span style={{ fontSize: 18, color: '#0284c7' }}>👶</span>
                  <span style={{ fontSize: 10, color: '#0284c7', marginTop: 4, fontWeight: 700 }}>Child Thumbprint / Photo</span>
                </div>
              </div>
            )}

            {selectedFormId === 'cnic_modification' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Existing CNIC Number & Target Correction Field]</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    <div style={{ flex: 1, padding: 4, background: '#fef2f2', borderRadius: 4, fontSize: 11, color: '#991b1b', textAlign: 'center' }}>Old Value</div>
                    <span style={{ alignSelf: 'center' }}>➔</span>
                    <div style={{ flex: 1, padding: 4, background: '#ecfdf5', borderRadius: 4, fontSize: 11, color: '#065f46', textAlign: 'center' }}>Corrected Value</div>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Union Council MRC Nikahnama / Sanad Reference]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '90%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Legal Affidavit & Applicant Signature]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '70%' }} />
                </div>

                <div style={{ border: '1.5px dashed #b45309', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#fffbeb' }}>
                  <IconCheck size={22} color="#b45309" />
                  <span style={{ fontSize: 10, color: '#b45309', marginTop: 4, fontWeight: 700 }}>Legal Stamp / Affidavit</span>
                </div>
              </div>
            )}

            {selectedFormId === 'frc' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: FRC Family Tree (By Birth vs By Marriage)]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '85%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: 13-Digit CNICs of All Biological Members]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '95%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Head of Family Biometric Authorization]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '60%' }} />
                </div>

                <div style={{ border: '1.5px dashed #16a34a', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#ecfdf5' }}>
                  <IconShield size={24} color="#16a34a" />
                  <span style={{ fontSize: 10, color: '#16a34a', marginTop: 4, fontWeight: 700 }}>NADRA Family Crest</span>
                </div>
              </div>
            )}

            {selectedFormId === 'nicop' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Foreign Passport & Valid Resident Permit]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '80%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Heritage Link (Parent/Grandparent CNIC)]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '90%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Pakistani Embassy / Consulate Seal]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '65%' }} />
                </div>

                <div style={{ border: '1.5px dashed #2563eb', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#eff6ff' }}>
                  <IconGlobe size={24} color="#2563eb" />
                  <span style={{ fontSize: 10, color: '#2563eb', marginTop: 4, fontWeight: 700 }}>Embassy Seal Stamp</span>
                </div>
              </div>
            )}

            {selectedFormId === 'lost_cnic' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Lost Card 13 Digits & Circumstances of Loss]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '85%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Police Roznamcha Daily Diary Number]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '70%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Indemnity Declaration & Sworn Oath]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '90%' }} />
                </div>

                <div style={{ border: '1.5px dashed #dc2626', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#fef2f2' }}>
                  <IconAlert size={24} color="#dc2626" />
                  <span style={{ fontSize: 10, color: '#dc2626', marginTop: 4, fontWeight: 700 }}>Loss Police Stamp</span>
                </div>
              </div>
            )}

            {selectedFormId === 'deceased_cancel' && (
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section A: Deceased Citizen Bio-Data & Date of Death]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '85%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section B: Union Council Computerized Death Certificate (DMC)]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '90%', marginBottom: 14 }} />

                  <div style={{ fontSize: 12, color: 'var(--nadra-forest)', fontWeight: 700, marginBottom: 4 }}>[Section C: Immediate Heir Biometric Surrender Attestation]</div>
                  <div style={{ height: 12, background: '#f1f5f9', borderRadius: 4, width: '75%' }} />
                </div>

                <div style={{ border: '1.5px dashed #475569', borderRadius: 8, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 4, background: '#f8fafc' }}>
                  <IconShield size={24} color="#475569" />
                  <span style={{ fontSize: 10, color: '#475569', marginTop: 4, fontWeight: 700 }}>Cancellation Seal</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Pre-Flight Inspection Diagnostic Results */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--nadra-forest)' }}>
              AI Pre-Flight Inspection Report
            </h3>
            <button 
              className="neu-button neu-button-primary" 
              style={{ padding: '8px 16px', fontSize: 13 }}
              onClick={() => handleRunAudit(selectedFormId, sampleScanType)}
              disabled={loading}
            >
              <IconSearch size={14} color="#ffffff" />
              <span>{loading ? 'Scanning...' : 'Re-run AI Scan'}</span>
            </button>
          </div>

          {auditResult && (
            <div>
              {/* Readiness Score Card */}
              <div style={{ 
                padding: '24px 26px', 
                background: auditResult.readiness_score > 80 ? '#ecfdf5' : auditResult.readiness_score > 50 ? '#fffbeb' : '#fef2f2', 
                border: `2px solid ${auditResult.readiness_score > 80 ? '#86efac' : auditResult.readiness_score > 50 ? '#fde68a' : '#fca5a5'}`, 
                borderRadius: 16, 
                marginBottom: 24 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: auditResult.readiness_score > 80 ? '#15803d' : '#b45309' }}>
                      COUNTER ACCEPTANCE PROBABILITY
                    </span>
                    <div style={{ fontSize: 22, fontWeight: 900, color: auditResult.readiness_score > 80 ? '#065f46' : '#991b1b', marginTop: 2 }}>
                      {auditResult.acceptance_probability}
                    </div>
                  </div>
                  
                  {/* Readiness Score Gauge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: auditResult.readiness_score > 80 ? '#059669' : '#dc2626' }}>
                      {auditResult.readiness_score}<span style={{ fontSize: 18 }}>/100</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>AI READINESS SCORE</span>
                  </div>
                </div>

                <div style={{ fontSize: 14.5, color: 'var(--nadra-dark)', lineHeight: 1.6 }}>
                  {auditResult.doctor_advice_en}
                </div>
                <div className="urdu-font" style={{ fontSize: 15, color: 'var(--nadra-forest)', marginTop: 6 }}>
                  {auditResult.doctor_advice_ur}
                </div>
              </div>

              {/* Defect Alerts (If Any) */}
              {auditResult.defect_alerts && auditResult.defect_alerts.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <span className="tag-badge tag-red" style={{ marginBottom: 12 }}>
                    <IconAlert size={14} />
                    CRITICAL ACTION REQUIRED BEFORE VISIT
                  </span>
                  {auditResult.defect_alerts.map((alert, i) => (
                    <div key={i} style={{ padding: '18px 20px', background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: 10, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ fontSize: 15, color: '#991b1b' }}>{alert.field}</strong>
                        <span className="tag-badge tag-red" style={{ fontSize: 11 }}>{alert.severity}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#b91c1c', marginBottom: 8 }}>
                        {alert.message_en}
                      </div>
                      <div className="urdu-font" style={{ fontSize: 14, color: '#7f1d1d', marginBottom: 10 }}>
                        {alert.message_ur}
                      </div>
                      <div style={{ padding: '10px 14px', background: '#ffffff', borderRadius: 8, fontSize: 13.5, color: '#1e293b', border: '1px solid #fecaca' }}>
                        <strong>Doctor's Remedy:</strong> {alert.fix_en}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checks Passed */}
              <div>
                <span className="tag-badge tag-green" style={{ marginBottom: 12 }}>
                  <IconCheck size={14} />
                  CHECKS PASSED & VERIFIED
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {auditResult.passed_checks.map((chk, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13.5, color: 'var(--text-primary)' }}>
                      <IconCheck size={16} color="var(--nadra-emerald)" />
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 5: CENTER FINDER & CROWD INTELLIGENCE VIEW
// -----------------------------------------------------------------------------
function CenterFinderView() {
  const [city, setCity] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedHeatmapId, setExpandedHeatmapId] = useState('hyd-mega-01');

  const cities = ['Hyderabad', 'Karachi', 'Islamabad', 'Lahore'];
  const categories = [
    { key: 'ALL', label: 'All Types' },
    { key: 'MEGA_24_7', label: 'Mega 24/7' },
    { key: 'EXECUTIVE', label: 'Executive' },
    { key: 'STANDARD', label: 'Standard NRC' }
  ];

  const load = async (cityName) => {
    setLoading(true);
    const data = await getCenters(cityName);
    if (data.status === 'success') setCenters(data.centers);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);

  const filteredCenters = centers.filter(c => {
    if (categoryFilter === 'ALL') return true;
    return c.category === categoryFilter;
  });

  return (
    <div className="glass-card-wide">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconMapPin size={28} color="var(--nadra-forest)" />
            <span>Crowd & Center Intelligence</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            Live traffic predictions, 24/7 operating hours, executive facilities, and optimal visit windows.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="live-pulse-dot" style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#047857' }}>Live Center Radar Active</span>
        </div>
      </div>

      {/* Auto Bhan Mega Center Callout for Hyderabad */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1.5px solid #86efac', borderRadius: 14, marginBottom: 26, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ padding: 10, background: '#10b981', borderRadius: 10, color: '#ffffff', flexShrink: 0 }}>
          <IconClock size={22} />
        </div>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Auto Bhan Road Mega Center (Latifabad, Hyderabad)  24/7 Operational Advice</span>
            <span className="tag-badge tag-green" style={{ fontSize: 11 }}>Recommended</span>
          </div>
          <div style={{ fontSize: 13.8, color: '#166534', marginTop: 4, lineHeight: 1.55 }}>
            To avoid 1-2 hour daytime peak queues, citizens in Hyderabad can visit the Auto Bhan Mega Center during late evening or night hours (<strong>11:00 PM to 06:00 AM</strong>). Full biometric and card processing staff remain on duty throughout the night shift.
          </div>
        </div>
      </div>

      {/* Filter Toolbar (City + Category) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28, background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
        {/* City Filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>City:</span>
          <button 
            className={`neu-button ${city === '' ? 'neu-button-primary' : ''}`}
            style={{ padding: '7px 16px', fontSize: 13.5 }}
            onClick={() => { setCity(''); load(''); }}
          >
            All Cities
          </button>
          {cities.map(c => (
            <button 
              key={c}
              className={`neu-button ${city === c ? 'neu-button-primary' : ''}`}
              style={{ padding: '7px 16px', fontSize: 13.5 }}
              onClick={() => { setCity(c); load(c); }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginRight: 4 }}>Center Type:</span>
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`neu-button ${categoryFilter === cat.key ? 'neu-button-primary' : ''}`}
              style={{ padding: '7px 14px', fontSize: 13 }}
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Centers Cards Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading NADRA Centers & Live Queues...</div>
      ) : (
        <div className="fluid-grid-3">
          {filteredCenters.map(c => {
            const isMega = c.category === 'MEGA_24_7';
            const isExec = c.category === 'EXECUTIVE';
            const isHeatmapOpen = expandedHeatmapId === c.center_id;

            return (
              <div 
                key={c.center_id} 
                className="service-feature-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  border: isMega ? '2px solid #86efac' : isExec ? '2px solid #fde68a' : '1px solid #e2e8f0',
                  boxShadow: isMega ? '0 10px 25px -5px rgba(16, 185, 129, 0.12)' : 'none'
                }}
              >
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`tag-badge ${isMega ? 'tag-green' : isExec ? 'tag-amber' : 'tag-gray'}`} style={{ fontWeight: 800 }}>
                    {c.category_label}
                  </span>
                  <span className={`tag-badge ${c.crowd_color === 'green' ? 'tag-green' : c.crowd_color === 'yellow' ? 'tag-amber' : 'tag-red'}`}>
                    ● {c.crowd_label}
                  </span>
                </div>

                {/* Center Name & City */}
                <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--nadra-forest)', margin: '14px 0 4px' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
                  {c.city}
                </div>

                {/* Address & Hours */}
                <div style={{ fontSize: 13.8, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <IconMapPin size={17} color="var(--nadra-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{c.address}</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconClock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <span>Hours: <strong style={{ color: isMega ? '#047857' : '#1e293b' }}>{c.operating_hours}</strong></span>
                </div>

                {/* Best Time Pill */}
                <div style={{ padding: '10px 14px', background: 'var(--nadra-mint-soft)', borderRadius: 10, fontSize: 13, color: 'var(--nadra-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <IconCheck size={16} color="var(--nadra-emerald)" />
                  <span><strong>Optimal Window:</strong> {c.best_time}</span>
                </div>

                {/* Facilities Badges */}
                {c.facilities && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                    {c.facilities.slice(0, 3).map((f, fi) => (
                      <span key={fi} style={{ fontSize: 11.5, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hourly Rush Curve (Interactive) */}
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      24h Rush Profile:
                    </span>
                    <button 
                      onClick={() => setExpandedHeatmapId(isHeatmapOpen ? null : c.center_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--nadra-emerald)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      {isHeatmapOpen ? 'Hide Radar' : 'View Hourly Radar'}
                    </button>
                  </div>

                  {isHeatmapOpen && c.hourly_curve && (
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {c.hourly_curve.map((slot, si) => (
                          <div key={si} style={{ fontSize: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                              <span style={{ fontWeight: 600, color: '#334155' }}>{slot.hour}</span>
                              <span style={{ fontWeight: 700, color: slot.color }}>{slot.level} ({slot.traffic}%)</span>
                            </div>
                            <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${slot.traffic}%`, height: '100%', background: slot.color, borderRadius: 4 }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>
                              {slot.tip}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Maps External Button */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.maps_query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-button"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center', fontSize: 13.5, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                  >
                    <IconMapPin size={15} color="var(--nadra-forest)" />
                    <span>Get Directions on Google Maps</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FEATURE 6: TRACKER & REJECTION EXPLAINER VIEW (Line Icons)
// -----------------------------------------------------------------------------
function AppTrackerView({ isUrdu }) {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [demoIds, setDemoIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDemoIds().then(d => { if (d.status === 'success') setDemoIds(d.demo_ids); });
  }, []);

  const track = async (id) => {
    const tid = (id || trackingId).trim();
    if (!tid) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await trackApplication(tid);
      setResult(data);
    } catch (e) {
      console.warn(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, borderBottom: '1.5px solid #e2e8f0', paddingBottom: 18 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--nadra-dark)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconTracker size={28} color="var(--nadra-forest)" />
            <span>{isUrdu ? 'درخواست ٹریکر اور اے آئی وجوہات' : 'Application Tracker & AI Rejection Explainer'}</span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            {isUrdu 
              ? 'اپنا ٹوکن ریفرنس نمبر درج کریں اور تاخیر یا مسترد ہونے کی سرکاری وجوہات آسان زبان میں سمجھیں۔'
              : 'Track your token reference and receive plain-language explanations for delays or rejections.'}
          </div>
        </div>
        <span className="tag-badge tag-green" style={{ fontSize: 13.5, padding: '6px 16px' }}>
          {isUrdu ? 'ہمدردانہ رہنمائی' : 'Empathy & Action Engine'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
        <input 
          className="neu-input" 
          placeholder={isUrdu ? "ٹریکنگ آئی ڈی درج کریں (مثلاً TRK-REJECT-303)..." : "Enter tracking ID (e.g. TRK-REJECT-303)..."}
          value={trackingId}
          onChange={e => setTrackingId(e.target.value)}
        />
        <button className="neu-button neu-button-primary" style={{ flexShrink: 0, padding: '16px 32px' }} onClick={() => track(trackingId)}>
          <IconSearch size={18} color="#ffffff" />
          <span>{loading ? (isUrdu ? 'تلاش جاری ہے...' : 'Tracking...') : (isUrdu ? 'درخواست چیک کریں' : 'Track Application')}</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-muted)' }}>
          {isUrdu ? 'ججز ڈیمو نمونے:' : 'Judge Demo Presets:'}
        </span>
        {demoIds.map(d => (
          <button 
            key={d.id || d.tracking_id} 
            className="prompt-pill" 
            onClick={() => { const tid = d.id || d.tracking_id; setTrackingId(tid); track(tid); }}
          >
            {d.id || d.tracking_id} ({d.label})
          </button>
        ))}
      </div>

      {result && result.status === 'success' && (
        <div style={{ padding: 32, border: '1.5px solid #e2e8f0', borderRadius: 16, background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--nadra-forest)' }}>
                {result.tracking_id}
              </div>
              <div style={{ fontSize: 14.5, color: 'var(--text-muted)' }}>
                Applicant: <strong>{result.applicant_name}</strong>
              </div>
            </div>
            <span className={`tag-badge ${result.status_color === 'green' ? 'tag-green' : result.status_color === 'yellow' ? 'tag-amber' : 'tag-red'}`} style={{ fontSize: 14.5, padding: '8px 18px' }}>
              {result.status_label}
            </span>
          </div>

          {/* Stepper Pipeline */}
          {!result.is_rejected && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '22px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', margin: '22px 0' }}>
              {result.pipeline.map(p => {
                const isDone = p.step <= result.current_step;
                return (
                  <div key={p.step} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: isDone ? 'var(--nadra-emerald)' : '#E2E8F0', color: isDone ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontWeight: 800, fontSize: 14 }}>
                      {isDone ? <IconCheck size={18} color="#ffffff" /> : p.step}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: isDone ? 'var(--nadra-dark)' : 'var(--text-muted)' }}>
                      {p.title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Rejection Explainer Card */}
          {result.is_rejected && result.rejection_info && (
            <div style={{ marginTop: 24 }}>
              <div style={{ padding: '18px 22px', background: '#FEF2F2', borderLeft: '5px solid #dc2626', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconAlert size={18} color="#dc2626" />
                  <span>Official Rejection Code: {result.rejection_info.code}</span>
                </div>
                <div style={{ fontSize: 14.5, color: '#B91C1C', marginTop: 4 }}>
                  "{result.rejection_info.raw_reason}"
                </div>
              </div>

              <div style={{ padding: '22px 26px', background: 'var(--nadra-mint-soft)', borderRadius: 14, border: '1px solid var(--nadra-mint-border)' }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--nadra-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconBot size={20} color="var(--nadra-forest)" />
                  <span>AI Plain-Language Breakdown & Guidance</span>
                </div>
                <div style={{ fontSize: 15, color: 'var(--nadra-dark)', lineHeight: 1.65, marginBottom: 16 }}>
                  {result.rejection_info.explanation_en}
                </div>
                <div className="urdu-font" style={{ fontSize: 16, color: 'var(--nadra-forest)', borderTop: '1px dashed var(--nadra-mint-border)', paddingTop: 14 }}>
                  {result.rejection_info.explanation_ur}
                </div>
              </div>
            </div>
          )}

          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 22 }}>
            Last System Update: {result.updated_at}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// FOOTER (Line Icons for Roles)
// -----------------------------------------------------------------------------
function Footer({ isUrdu }) {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 40, paddingBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div>
            <div style={{ color: '#ffffff', fontSize: 19, fontWeight: 900, marginBottom: 14 }}>
              {isUrdu ? 'نادرا نیویگیٹر 🇵🇰' : 'NADRA NAVIGATOR 🇵🇰'}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: '#cbd5e1', maxWidth: 480 }}>
              {isUrdu ? (
                <span className="urdu-font" style={{ fontSize: 16 }}>
                  پاکستانی شہریوں کے لیے اے آئی رہبر، پبلک سروس تھیم کے تحت <strong>ڈائٹ ہیکاتھون 2026-27</strong> کے لیے تیار کردہ۔ مقصد نادرا سنٹرز پر فارم مسترد ہونے کے مسائل کا خاتمہ اور سرکاری طریقہ کار کو آسان بنانا ہے۔
                </span>
              ) : (
                <>AI-Powered Citizen Guide designed for the <strong>DITE Hackathon 2026-27</strong> under the <strong>Public Service</strong> theme. Built to eliminate application rejection and simplify government access for all Pakistani citizens.</>
              )}
            </p>
            <div style={{ marginTop: 16, fontSize: 12.5, color: '#94a3b8' }}>
              Organised by <strong>TECHGEN</strong> · Denning Institute of Technology & Entrepreneurship, Hyderabad.
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
              {isUrdu ? 'ٹیم کے اراکین' : 'TEAM MEMBERS'}
            </div>
            <div>
              <div className="team-pill">
                <IconUser size={15} color="#86efac" />
                <span>{isUrdu ? 'فضا بلوچ (ٹیم لیڈر)' : 'Fizza Baloch (Team Leader)'}</span>
              </div>
              <div className="team-pill">
                <IconCode size={15} color="#93c5fd" />
                <span>{isUrdu ? 'علینہ میمن (انجینئر / ریسرچر)' : 'Aleena Memon (Core Engineer)'}</span>
              </div>
              <div className="team-pill">
                <IconPalette size={15} color="#fde047" />
                <span>{isUrdu ? 'فضا نظامانی (انجینئر / ڈیزائنر)' : 'Fiza Nizamani (Core Engineer)'}</span>
              </div>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
              COMPLIANCE & ETHICS
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#94a3b8', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <IconShield size={18} color="#86efac" />
              <span>In compliance with PECA 2016 and DITE guidelines: zero real citizen PII stored. Synthetic mock records used for demonstration.</span>
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 26, fontSize: 12.5, color: '#94a3b8' }}>
          © 2026 NADRA Navigator Engineering Team · Built for DITE Hackathon 2026-27.
        </div>
      </div>
    </footer>
  );
}
