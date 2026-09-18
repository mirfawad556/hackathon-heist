import { useState, useRef, useEffect } from 'react';
import { Upload, Layers, Orbit, FileImage, Download, ChevronRight, ChevronLeft, Bell, User, Database, Users, Camera, ExternalLink, Moon, Cpu, Satellite, Sparkles, X, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'clahe' | 'ai'>('clahe');
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');
  const [activeTab, setActiveTab] = useState<'overview' | 'home' | 'studio' | 'dataset'>('overview');
  const [pendingTab, setPendingTab] = useState<'overview' | 'home' | 'studio' | 'dataset'>('overview');
  const [selectedCrater, setSelectedCrater] = useState<{name: string, desc: string, temp: string, fact: string} | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [isWarping, setIsWarping] = useState(false);
  const [isZoomingIn, setIsZoomingIn] = useState(false);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [tabHistory, setTabHistory] = useState<('overview' | 'home' | 'studio' | 'dataset')[]>([]);
  const [particles, setParticles] = useState<{id: number, x: number, y: number, tx: number, ty: number}[]>([]);
  
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isNavMoving, setIsNavMoving] = useState(false);

  useEffect(() => {
    const tabs = ['overview', 'home', 'studio', 'dataset'];
    const activeIndex = tabs.indexOf(pendingTab);
    const activeEl = navRefs.current[activeIndex];
    
    if (activeEl) {
      setPillStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1
      });
      
      setIsNavMoving(true);
      const timer = setTimeout(() => {
        setIsNavMoving(false);
      }, 300); // 300ms matches the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [pendingTab]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEnhancedImageUrl(null);
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', selectedImage);
    formData.append('model', selectedModel);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/enhance`, formData, {
        responseType: 'blob',
      });
      
      const enhancedUrl = URL.createObjectURL(response.data);
      setEnhancedImageUrl(enhancedUrl);
    } catch (error: any) {
      console.error("Error enhancing image:", error);
      let errorMsg = "Failed to process image. Make sure the backend is running.";
      if (error.response && error.response.data) {
        // If it's a blob, we need to read it as text
        if (error.response.data instanceof Blob) {
           try {
             const text = await error.response.data.text();
             const json = JSON.parse(text);
             if (json.detail) errorMsg = `Backend Error: ${json.detail}`;
           } catch (e) {}
        }
      }
      alert(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImageUrl) return;
    const link = document.createElement('a');
    link.href = enhancedImageUrl;
    link.download = `enhanced_${selectedImage?.name || 'lunar_image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateTo = (tab: 'overview' | 'home' | 'studio' | 'dataset', isBack: boolean = false) => {
    if (tab === activeTab) return;
    
    if (!isBack) {
      setTabHistory(prev => [...prev, activeTab]);
    }

    setPendingTab(tab);
    setIsPageTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      window.scrollTo(0, 0);
      setIsPageTransitioning(false);
    }, 300); // 300ms fade transition
  };

  const handleBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      navigateTo(prevTab, true);
    } else {
      navigateTo('overview', true);
    }
  };

  const spawnParticles = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newParticles = Array.from({length: 15}).map((_, i) => ({
      id: Date.now() + i,
      x, y,
      tx: (Math.random() - 0.5) * 100,
      ty: (Math.random() - 0.5) * 100,
    }));
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const handleGetStarted = () => {
    setTabHistory(prev => [...prev, activeTab]);
    setPendingTab('home');
    setIsZoomingIn(true);
    setIsZoomingOut(true); // prepare next page for zoom out
    setTimeout(() => {
      setActiveTab('home');
      window.scrollTo(0, 0);
      setIsZoomingIn(false);
      setTimeout(() => setIsZoomingOut(false), 50); // trigger css transition
    }, 1200);
  };

  const handleLaunchStudio = () => {
    setTabHistory(prev => [...prev, activeTab]);
    setPendingTab('studio');
    setIsWarping(true);
    setTimeout(() => {
      setActiveTab('studio');
      window.scrollTo(0, 0);
      setTimeout(() => setIsWarping(false), 50); // slight delay to allow render before removing overlay
    }, 1200);
  };

  return (
    <div className="min-h-screen text-white font-sans overflow-x-hidden relative">
      {/* SVG Filters */}
      <svg width="0" height="0" className="absolute hidden">
        <filter id="sharpen">
          <feConvolveMatrix order="3 3" preserveAlpha="true" kernelMatrix="0 -1 0 -1 5 -1 0 -1 0" />
        </filter>
        <filter id="hyper-sharpen">
          <feConvolveMatrix order="3 3" preserveAlpha="true" kernelMatrix="-1 -1 -1 -1 9 -1 -1 -1 -1" />
        </filter>
      </svg>

      {/* Global Starry Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img src="/bg_stars.jpg" alt="Space Background" className="w-full h-full object-cover opacity-90 blur-[3px] scale-[1.02] transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040b16]/60 via-[#040b16]/30 to-[#040b16]/70"></div>
      </div>

      {/* Warp Transition Overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-[#040b16] flex items-center justify-center transition-all duration-1000 ${isWarping ? 'opacity-100 visible scale-110' : 'opacity-0 invisible scale-100 pointer-events-none'}`}
      >
        <div className="flex flex-col items-center">
          <Orbit className="w-16 h-16 text-blue-500 animate-spin mb-6" />
          <h2 className="text-2xl font-bold tracking-widest text-blue-400">INITIALIZING IMAGE STUDIO...</h2>
        </div>
      </div>

      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between transition-all duration-300 bg-transparent">
        <div className="flex items-center space-x-3 w-32">
          {activeTab !== 'overview' && (
              <button 
                onClick={(e) => { spawnParticles(e); handleBack(); }} 
                className="relative flex items-center text-gray-300 hover:text-white transition-colors bg-black/20 hover:bg-white/5 px-5 py-2 rounded-full border border-white/5 active:scale-95 font-semibold backdrop-blur-sm overflow-visible"
              >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
              
            </button>
          )}
        </div>
        <div className="flex space-x-1 text-sm text-gray-300 font-medium p-1 bg-black/20 rounded-full border border-white/5 hidden md:flex backdrop-blur-sm relative">
          {/* Animated Sliding Pill Background */}
          <div 
            className={`absolute top-1 bottom-1 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300 ease-out z-0 pointer-events-none ${isNavMoving ? 'bg-white/25 blur-[2px] scale-x-[1.02]' : 'bg-white/10 blur-0 scale-x-100'}`}
            style={{ 
              left: `${pillStyle.left}px`, 
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity 
            }}
          />

          <button 
            ref={(el) => { navRefs.current[0] = el; }} 
            onClick={(e) => { spawnParticles(e); navigateTo('overview'); }} 
            className={`px-5 py-2 rounded-full transition-colors duration-300 relative z-10 ${pendingTab === 'overview' ? 'text-white' : 'hover:text-white hover:bg-white/5'}`}
          >
            Overview
          </button>
          <button 
            ref={(el) => { navRefs.current[1] = el; }} 
            onClick={(e) => { spawnParticles(e); navigateTo('home'); }} 
            className={`px-5 py-2 rounded-full transition-colors duration-300 relative z-10 ${pendingTab === 'home' ? 'text-white' : 'hover:text-white hover:bg-white/5'}`}
          >
            Home
          </button>
          <button 
            ref={(el) => { navRefs.current[2] = el; }} 
            onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} 
            className={`px-5 py-2 rounded-full transition-colors duration-300 relative z-10 ${pendingTab === 'studio' ? 'text-white' : 'hover:text-white hover:bg-white/5'}`}
          >
            Studio
          </button>
          <button 
            ref={(el) => { navRefs.current[3] = el; }} 
            onClick={(e) => { spawnParticles(e); navigateTo('dataset'); }} 
            className={`px-5 py-2 rounded-full transition-colors duration-300 relative z-10 ${pendingTab === 'dataset' ? 'text-white' : 'hover:text-white hover:bg-white/5'}`}
          >
            Dataset
          </button>
        </div>
        <div className="flex space-x-3 relative">
          {/* Notification Group */}
          <div className="relative flex items-center justify-center z-50 h-[42px]">
            {showNotification && (
              <div 
                className="absolute top-[41px] right-0 w-80 glass rounded-2xl rounded-tr-none p-5 z-40 text-left animate-fade-in border-t-0"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
              >
                {/* Custom top border and inset shadow that stops before the button */}
                <div className="absolute top-0 left-0 right-[42px] h-[1px] bg-[rgba(255,255,255,0.08)]"></div>
                <div className="absolute top-[1px] left-0 right-[42px] h-[1px] bg-[rgba(255,255,255,0.15)]"></div>
                
                <h3 className="text-white font-bold mb-2">Chandrayaan-2 Updates</h3>
                <div className="text-sm text-gray-300 mb-3 leading-relaxed">
                  <span className="text-blue-400 font-semibold">• Live:</span> OHRC detects new surface variations in PSR-3.<br/>
                  <span className="text-yellow-500/90 text-xs font-medium">Updated 2 mins ago</span>
                </div>
                <div className="flex justify-end">
                  <a href="https://www.isro.gov.in/Chandrayaan2.html" target="_blank" rel="noopener noreferrer" className="text-sky-400 text-xs hover:text-sky-300 hover:underline inline-flex items-center transition-colors">
                    View ISRO Source <ChevronRight className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
            <button 
              onClick={() => { setShowNotification(!showNotification); setShowContact(false); }} 
              className={`relative z-50 flex items-center justify-center w-[42px] h-[42px] transition-all duration-300 group ${
                showNotification 
                  ? 'glass rounded-t-2xl rounded-b-none border-b-0 translate-y-[1px]' 
                  : 'bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-sm rounded-full active:scale-95'
              }`}
              style={showNotification ? { boxShadow: 'none' } : {}}
            >
              <Bell className={`w-5 h-5 transition-colors ${showNotification ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
            </button>
          </div>

          {/* Contact Group */}
          <div className="relative flex items-center justify-center z-50 h-[42px]">
            {showContact && (
              <div 
                className="absolute top-[41px] right-0 w-80 glass rounded-2xl rounded-tr-none p-6 z-40 text-left animate-fade-in border-t-0"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' }}
              >
                {/* Custom top border and inset shadow that stops before the button */}
                <div className="absolute top-0 left-0 right-[42px] h-[1px] bg-[rgba(255,255,255,0.08)]"></div>
                <div className="absolute top-[1px] left-0 right-[42px] h-[1px] bg-[rgba(255,255,255,0.15)]"></div>

                <div className="flex items-center mb-6">
                  <Users className="w-5 h-5 text-sky-400 mr-2.5" />
                  <h3 className="text-sky-400 font-bold text-[17px]">Team Information</h3>
                </div>

                <div className="mb-5">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Team Name</h4>
                  <div className="flex items-center">
                    <Sparkles className="w-5 h-5 text-amber-500 mr-3" />
                    <span className="text-white font-bold text-lg">Syntax Finder</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-5"></div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4">Contact Details</h4>
                  
                  <div className="space-y-4">
                    <a href="mailto:mirfawad1@gmail.com" className="flex items-center group">
                      <div className="w-10 h-10 rounded-full bg-sky-950/40 flex items-center justify-center mr-4 group-hover:bg-sky-900/40 transition-colors border border-sky-900/50">
                        <Mail className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Email Us</div>
                        <div className="text-gray-400 text-xs font-mono mt-0.5 tracking-tight group-hover:text-gray-300 transition-colors">mirfawad1@gmail.com</div>
                      </div>
                    </a>

                    <a href="tel:+916006624246" className="flex items-center group">
                      <div className="w-10 h-10 rounded-full bg-emerald-950/40 flex items-center justify-center mr-4 group-hover:bg-emerald-900/40 transition-colors border border-emerald-900/50">
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Call Us</div>
                        <div className="text-gray-400 text-xs font-mono mt-0.5 tracking-widest group-hover:text-gray-300 transition-colors">600 662 4246</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}
            <button 
              onClick={() => { setShowContact(!showContact); setShowNotification(false); }} 
              className={`relative z-50 flex items-center justify-center w-[42px] h-[42px] transition-all duration-300 group ${
                showContact 
                  ? 'glass rounded-t-2xl rounded-b-none border-b-0 translate-y-[1px]' 
                  : 'bg-black/20 hover:bg-white/10 border border-white/5 backdrop-blur-sm rounded-full active:scale-95'
              }`}
              style={showContact ? { boxShadow: 'none' } : {}}
            >
              <User className={`w-5 h-5 transition-colors ${showContact ? 'text-white' : 'text-gray-300 group-hover:text-white'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content with Page Transition Animation */}
      <div className={`pt-24 pb-12 transition-all duration-300 transform ${isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        
        {activeTab === 'overview' && (
          <main className="container mx-auto px-6 h-[calc(100vh-6rem)] flex flex-col md:flex-row items-center relative overflow-visible">
            <div className={`md:w-1/2 space-y-6 z-10 transition-opacity duration-500 ${isZoomingIn ? 'opacity-0' : 'opacity-100'}`}>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase animate-fade-in">From Darkness to Discovery</h2>
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight animate-fade-in-delayed">
                See What <br /> <span className="text-blue-500">Darkness Hides.</span>
              </h1>
              <div className="text-gray-300 max-w-xl text-sm md:text-base leading-relaxed animate-fade-in-delayed-2 space-y-4 border-l-2 border-blue-500/30 pl-5">
                <p>
                  <span className="text-white font-medium tracking-wide">Chandrayaan-2</span>, India's second mission to the Moon, remains a pivotal moment in lunar exploration, primarily due to the extraordinary data still being returned by its Orbiter.
                </p>
                <p className="text-gray-400">
                  While the lander module was lost during a soft-landing attempt in 2019, the Orbiter was successfully inserted into a 100-kilometer polar orbit. It is equipped with eight state-of-the-art scientific instruments, four of which are specifically designed to capture different types of images and spectra of the lunar surface.
                </p>
                <p>
                  <a href="https://www.isro.gov.in/Chandrayaan2.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors inline-flex items-center mt-2 group">
                    Support lunar research <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 mb-2 animate-fade-in-delayed-2">
                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/40 transition-colors shadow-sm">
                    <Moon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Low-light image enhancement</h3>
                </button>
                
                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/40 transition-colors shadow-sm">
                    <Cpu className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Deep learning / computer vision</h3>
                </button>

                <button onClick={(e) => { spawnParticles(e); navigateTo('dataset'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:bg-sky-500/40 transition-colors shadow-sm">
                    <Satellite className="w-4 h-4 text-sky-400 group-hover:text-sky-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Satellite imagery</h3>
                </button>

                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/40 transition-colors shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Astronomical image processing</h3>
                </button>
              </div>
              <div className="pt-6 animate-fade-in-delayed-2">
                <button onClick={(e) => { spawnParticles(e); handleGetStarted(); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95 flex items-center">
                  Let's Get Started <ChevronRight className="ml-2 w-5 h-5"/>
                </button>
              </div>
            </div>
            
            {/* Massive Overview Moon */}
            <div className={`absolute right-[-20%] top-1/2 -translate-y-1/2 md:w-[800px] md:h-[800px] z-0 pointer-events-none rounded-full transition-transform ease-in-out ${isZoomingIn ? 'duration-[1200ms] scale-[15] -translate-x-[20vw] translate-y-[10vh]' : 'duration-1000 scale-100'}`}>
              
              {/* Massive Atmospheric Aura (Blur Around the Moon) */}
              <div className="absolute inset-[-100px] bg-sky-300/15 rounded-full blur-[100px] animate-pulse-glow z-0"></div>
              <div className="absolute inset-[-20px] bg-white/10 rounded-full blur-[50px] z-0"></div>
              
              {/* Cropped Moon Container with soft blurry edges */}
              <div 
                className="absolute inset-0 z-10 shadow-[0_0_150px_rgba(255,255,255,0.2)] rounded-full"
                style={{ 
                  WebkitMaskImage: 'radial-gradient(closest-side, black 96%, transparent 100%)',
                  maskImage: 'radial-gradient(closest-side, black 96%, transparent 100%)'
                }}
              >
                <img 
                  src="/realistic_moon.png" 
                  alt="Giant Moon" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240%] h-[240%] max-w-none object-cover" 
                  style={{ filter: `${isZoomingIn ? '' : 'url(#sharpen) '}brightness(0.9) contrast(1.4) saturate(0.5)`, willChange: 'transform' }}
                />
                {/* Cool Blue Atmospheric Overlay */}
                <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-sky-400/10 mix-blend-screen"></div>
                {/* Inner shadow to soften the edges of the moon itself */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(0,0,0,0.8)] z-20"></div>
              </div>
            </div>
          </main>
        )}
        {activeTab === 'home' && (
          <main className="container mx-auto px-6 h-[calc(100vh-6rem)] flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-8 z-10">
              <h2 className="text-sm font-semibold tracking-widest text-blue-400 uppercase animate-fade-in">From Darkness to Discovery</h2>
              <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight animate-fade-in-delayed">
                See What <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-700">Darkness Hides.</span>
              </h1>
              <p className="text-gray-400 max-w-md text-lg animate-fade-in-delayed-2">
                AI-powered enhancement of permanently shadowed lunar regions captured by Chandrayaan-2's OHRC. Uncover hidden terrain and support lunar research.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 mb-2 animate-fade-in-delayed-2">
                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/40 transition-colors shadow-sm">
                    <Moon className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Low-light image enhancement</h3>
                </button>
                
                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 group-hover:bg-purple-500/40 transition-colors shadow-sm">
                    <Cpu className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Deep learning / computer vision</h3>
                </button>

                <button onClick={(e) => { spawnParticles(e); navigateTo('dataset'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center mb-3 group-hover:bg-sky-500/40 transition-colors shadow-sm">
                    <Satellite className="w-4 h-4 text-sky-400 group-hover:text-sky-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Satellite imagery</h3>
                </button>

                <button onClick={(e) => { spawnParticles(e); navigateTo('studio'); }} className="text-left w-full glass rounded-xl p-4 flex flex-col justify-center border-t border-white/5 hover:-translate-y-1 hover:bg-white/5 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:bg-emerald-500/40 transition-colors shadow-sm">
                    <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">Astronomical image processing</h3>
                </button>
              </div>
              <div className="flex space-x-4 pt-6 animate-fade-in-delayed-2">
                <button onClick={(e) => { spawnParticles(e); handleLaunchStudio(); }} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95 active:bg-blue-400 active:backdrop-blur-md flex items-center">
                  Launch Image Studio <ChevronRight className="ml-2 w-5 h-5"/>
                </button>
                <button onClick={(e) => { spawnParticles(e); navigateTo('dataset'); }} className="glass hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition-all duration-200 active:scale-95 active:bg-white/20 active:backdrop-blur-xl">
                  Explore Dataset
                </button>
              </div>
            </div>
            
            <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center items-center h-[550px]">
              <div className="absolute w-[650px] h-[650px] bg-white/10 rounded-full blur-[120px] animate-pulse-glow z-0"></div>
              
              {/* Elegant Lunar Rings and Halos */}
              <div className="absolute w-[440px] h-[440px] rounded-full border border-white/20 z-10 shadow-[0_0_40px_rgba(255,255,255,0.15)]"></div>
              <div className="absolute w-[480px] h-[480px] rounded-full border border-blue-300/10 z-10 border-dashed animate-spin-slow" style={{ animationDuration: '200s' }}></div>
              
              <div className="absolute w-[560px] h-[560px] rounded-full border border-white/5 z-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '300s' }}>
                 {/* Little orbital satellite/moonlet */}
                 <div className="absolute top-[-4px] left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"></div>
              </div>

              <div 
                className={`relative w-[400px] h-[400px] rounded-full z-30 shadow-[0_0_80px_rgba(255,255,255,0.15)] cursor-crosshair flex justify-center items-center transition-transform ease-in-out ${isZoomingOut ? 'duration-0 scale-[15] -translate-x-[20vw] translate-y-[10vh]' : 'duration-[1500ms] scale-100 translate-x-0 translate-y-0'}`}
                style={{ 
                  WebkitMaskImage: 'radial-gradient(closest-side, black 96%, transparent 100%)',
                  maskImage: 'radial-gradient(closest-side, black 96%, transparent 100%)',
                  willChange: 'transform'
                }}
              >
                
                {/* Seamless Transition Overlay - Matches Overview Moon exactly to hide slider mount lag */}
                <div className={`absolute inset-0 z-50 transition-opacity ease-in-out ${isZoomingOut ? 'duration-0 opacity-100' : 'duration-[1500ms] opacity-0 pointer-events-none'}`}>
                  <img 
                    src="/realistic_moon.png" 
                    alt="Giant Moon" 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240%] h-[240%] max-w-none object-cover" 
                    style={{ filter: 'brightness(0.9) contrast(1.4) saturate(0.5)' }}
                  />
                  <div className="absolute inset-0 bg-blue-900/30 mix-blend-overlay"></div>
                  <div className="absolute inset-0 bg-sky-400/10 mix-blend-screen"></div>
                </div>

                <ReactCompareSlider
                  itemOne={
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 animate-spin-slow">
                        <img 
                          src="/realistic_moon.png" 
                          alt="Dark Moon" 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240%] h-[240%] max-w-none object-cover" 
                          style={{ filter: `${isZoomingOut ? '' : 'blur(1.5px) '}brightness(0.55) contrast(1.1) grayscale(0.2)` }}
                        />
                      </div>
                      <div className="absolute bottom-6 right-[calc(50%+3px)] bg-black/60 text-white/90 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] backdrop-blur-md z-10 pointer-events-none">BEFORE</div>
                    </div>
                  }
                  itemTwo={
                    <div className="w-full h-full relative">
                      <div className="absolute inset-0 animate-spin-slow">
                        <img 
                          src="/realistic_moon.png" 
                          alt="Clear Moon" 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240%] h-[240%] max-w-none object-cover" 
                          style={{ filter: `${isZoomingOut ? '' : 'url(#hyper-sharpen) '}brightness(1.2) contrast(1.5) saturate(1.1)` }}
                        />
                      </div>
                      <div className="absolute bottom-6 left-[calc(50%+3px)] bg-blue-600/70 text-white/90 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] backdrop-blur-md z-10 pointer-events-none">AFTER</div>
                    </div>
                  }
                  className="w-full h-full rounded-full"
                  handle={
                    <div className="w-1.5 h-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] cursor-ew-resize flex items-center justify-center relative">
                      <div className="h-12 w-1.5 bg-white rounded-full opacity-60"></div>
                    </div>
                  }
                />

                {/* Spherical Shading Overlay for 3D effect */}
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.9), inset 10px 10px 20px rgba(255,255,255,0.1)' }}></div>
                
              </div>
            </div>
          </main>
        )}

        {activeTab === 'dataset' && (
          <main className="container mx-auto px-6 py-8 animate-fade-in">
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-3">Open Science & Datasets</h1>
              <p className="text-gray-400">Contribute to lunar exploration and access real telemetry data from global space agencies.</p>
            </div>

            {/* Three Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <a href="https://pradan.issdc.gov.in/" target="_blank" rel="noopener noreferrer" className="block relative glass rounded-xl p-6 border-t border-white/10 hover:-translate-y-1 hover:bg-white/5 transition-all shadow-lg group">
                <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 border border-blue-500/30 group-hover:bg-blue-600/30 transition-colors">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Analyze Public Space Data</h3>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  ISRO makes data from its planetary missions available to the public through the PRADAN portal via ISRO's ISSDC (Indian Space Science Data Centre). Anyone can register, download actual raw scientific data from missions like Chandrayaan-2, and analyze it using professional GIS or astronomy software.
                </p>
              </a>

              <a href="https://www.zooniverse.org/" target="_blank" rel="noopener noreferrer" className="block relative glass rounded-xl p-6 border-t border-white/10 hover:-translate-y-1 hover:bg-white/5 transition-all shadow-lg group">
                <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 border border-purple-500/30 group-hover:bg-purple-600/30 transition-colors">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Citizen Science Projects</h3>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  You can join global platforms like Zooniverse. These projects ask citizens to help analyze massive sets of real space imagery—such as mapping craters, identifying surface features, or spotting exoplanets—tasks where human eyes are often more reliable than automated AI.
                </p>
              </a>

              <a href="https://science.nasa.gov/citizen-science" target="_blank" rel="noopener noreferrer" className="block relative glass rounded-xl p-6 border-t border-white/10 hover:-translate-y-1 hover:bg-white/5 transition-all shadow-lg group">
                <ExternalLink className="absolute top-6 right-6 w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                <div className="w-12 h-12 bg-sky-600/20 rounded-lg flex items-center justify-center mb-4 border border-sky-500/30 group-hover:bg-sky-600/30 transition-colors">
                  <Camera className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Astrophotography</h3>
                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  If you take high-quality images of the Moon, eclipses, or meteor showers with a DSLR or telescope, keep them completely raw. Maintain exact logs of location, precise UTC time, aperture, and exposure. Amateur networks compile these raw images to monitor transient lunar phenomena like meteor impacts.
                </p>
              </a>
            </div>

            <h2 className="text-xl font-bold mb-6 text-gray-200">Sample OHRC PSR Datasets</h2>
            <div className="glass rounded-xl overflow-hidden w-full border-t border-white/10 shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-black/40">
                    <th className="p-4 font-medium text-gray-400 uppercase tracking-wider text-xs">Region Name</th>
                    <th className="p-4 font-medium text-gray-400 uppercase tracking-wider text-xs">Type</th>
                    <th className="p-4 font-medium text-gray-400 uppercase tracking-wider text-xs">Images</th>
                    <th className="p-4 font-medium text-gray-400 uppercase tracking-wider text-xs">Status</th>
                    <th className="p-4 font-medium text-gray-400 uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Haworth", type: "PSR / South Pole", count: 12, status: "Available", desc: "Located at the lunar South pole. Never receives direct sunlight.", temp: "-230°C", fact: "High potential for water ice." },
                    { name: "Shoemaker", type: "PSR / South Pole", count: 8, status: "Available", desc: "Named after Eugene Shoemaker. A prominent PSR crater.", temp: "-220°C", fact: "Target of the Lunar Prospector mission." },
                    { name: "Faustini", type: "PSR / South Pole", count: 15, status: "Available", desc: "Lies near the south pole. One of the coldest places in the solar system.", temp: "-238°C", fact: "Excellent candidate for future lunar base." },
                    { name: "Shackleton", type: "PSR / South Pole", count: 4, status: "Processing", desc: "Situated exactly at the lunar South pole. Interior is in perpetual darkness.", temp: "-210°C", fact: "Rim receives almost continuous sunlight." },
                    { name: "Cabeus", type: "PSR / South Pole", count: 9, status: "Available", desc: "The site of the LCROSS mission impact in 2009.", temp: "-233°C", fact: "Impact confirmed the presence of water in the lunar soil." }
                  ].map((crater, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-medium flex items-center">
                        <Orbit className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-400 transition-colors"/>
                        {crater.name} Crater
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{crater.type}</td>
                      <td className="p-4 text-gray-400 text-sm">{crater.count} TIFFs</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${crater.status === 'Available' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}>
                          {crater.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            if (crater.status === 'Available') {
                              setSelectedCrater({name: crater.name, desc: crater.desc, temp: crater.temp, fact: crater.fact});
                              navigateTo('studio');
                            }
                          }} 
                          disabled={crater.status !== 'Available'}
                          className={`text-sm font-medium inline-flex items-center transition-colors ${crater.status === 'Available' ? 'text-blue-400 hover:text-blue-300' : 'text-gray-600 cursor-not-allowed'}`}
                        >
                          Open in Studio <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        )}

        {activeTab === 'studio' && (
          <main className="container mx-auto px-6 py-4 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold">Image Studio</h1>
                <p className="text-sm text-gray-400 mt-1">Upload a lunar image and let AI reveal what's hidden.</p>
              </div>
              <div className="flex space-x-3 text-sm text-gray-400 glass px-4 py-2 rounded-full">
                <span className={originalImageUrl ? 'text-blue-400 font-medium' : 'text-gray-500'}>1. Upload</span>
                <span className="text-gray-600">&gt;</span>
                <span className={isProcessing ? 'text-blue-400 font-medium' : 'text-gray-500'}>2. Process</span>
                <span className="text-gray-600">&gt;</span>
                <span className={enhancedImageUrl ? 'text-blue-400 font-medium' : 'text-gray-500'}>3. Analyze</span>
              </div>
            </div>

            {selectedCrater && (
              <div className="mb-6 bg-gradient-to-r from-blue-900/40 to-black/40 border border-blue-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(37,99,235,0.15)] relative animate-fade-in flex items-start">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mr-4 border border-blue-500/30 flex-shrink-0">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    Analyzing Dataset: {selectedCrater.name} Crater 
                    <span className="ml-3 text-[10px] uppercase tracking-widest bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">Loaded</span>
                  </h3>
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">{selectedCrater.desc}</p>
                  <div className="flex space-x-6 mt-3 text-xs text-gray-400 font-medium">
                    <span className="flex items-center"><span className="text-blue-400 mr-1.5">Est. Temp:</span> {selectedCrater.temp}</span>
                    <span className="flex items-center"><span className="text-blue-400 mr-1.5">Fact:</span> {selectedCrater.fact}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedCrater(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-1 bg-white/5 rounded-md hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Controls Panel */}
              <div className="glass rounded-xl p-6 h-fit space-y-8 col-span-1 border-t border-white/10">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center uppercase tracking-wide"><Upload className="w-4 h-4 mr-2 text-blue-400"/> Upload Image</h3>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl cursor-pointer bg-black/20 hover:bg-blue-900/10 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <FileImage className="w-5 h-5 text-blue-400" />
                      </div>
                      <p className="mb-2 text-sm text-gray-300"><span className="font-bold text-white">Click to browse</span> or drag</p>
                      <p className="text-xs text-gray-500">TIFF, PNG, JPG (Max 50MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {selectedImage && (
                    <div className="mt-3 p-2 bg-blue-900/20 border border-blue-900 rounded flex items-center justify-between text-xs text-blue-200">
                      <span className="truncate max-w-[150px]">{selectedImage.name}</span>
                      <span>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center uppercase tracking-wide"><Layers className="w-4 h-4 mr-2 text-blue-400"/> Enhancement Model</h3>
                  <div className="space-y-3">
                    <label className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedModel === 'clahe' ? 'bg-blue-600/10 border border-blue-500/30' : 'border border-gray-800 bg-black/20 hover:bg-white/5'}`}>
                      <input type="radio" name="model" checked={selectedModel === 'clahe'} onChange={() => setSelectedModel('clahe')} className="form-radio mt-0.5 text-blue-500 bg-black/50 border-gray-600 focus:ring-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-white block">CLAHE</span>
                        <span className="text-xs text-gray-400">Traditional contrast enhancement</span>
                      </div>
                    </label>
                    <label className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedModel === 'ai' ? 'bg-blue-600/10 border border-blue-500/30' : 'border border-gray-800 bg-black/20 hover:bg-white/5'}`}>
                      <input type="radio" name="model" checked={selectedModel === 'ai'} onChange={() => setSelectedModel('ai')} className="form-radio mt-0.5 text-blue-500 bg-black/50 border-gray-600 focus:ring-blue-500" />
                      <div>
                        <span className="text-sm font-medium text-white block">AI Low-Light Model (Recommended)</span>
                        <span className="text-xs text-gray-400">Deep learning denoise & upscale</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={(e) => { spawnParticles(e); processImage(); }} 
                  disabled={!selectedImage || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex justify-center items-center shadow-lg ${!selectedImage || isProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-900/50 hover:-translate-y-0.5'}`}
                >
                  {isProcessing ? (
                    <><Orbit className="w-5 h-5 mr-2 animate-spin"/> Processing...</>
                  ) : (
                    'Enhance Image'
                  )}
                </button>

                <div className="bg-black/30 border border-gray-800 rounded-xl p-4 text-xs text-gray-400 space-y-3">
                  <h4 className="font-semibold text-gray-200 uppercase tracking-wide">How it works</h4>
                  <p><strong className="text-blue-400">1. Select Model:</strong> Keep "AI Low-Light Model" selected for deep learning denoising and upscaling, or switch to "CLAHE" for traditional contrast enhancement.</p>
                  <p><strong className="text-blue-400">2. Apply Enhancement:</strong> Click the prominent blue Enhance Image button to process your uploaded moon image.</p>
                  <p><strong className="text-blue-400">3. Compare Results:</strong> Use the Before / After and Side by Side toggle buttons above the main viewer to easily compare the enhanced details.</p>
                  <p><strong className="text-blue-400">4. Move Forward:</strong> When satisfied, click the green Next button below to proceed to the next step.</p>
                </div>

                <button 
                  onClick={(e) => { spawnParticles(e); navigateTo('dataset'); }} 
                  className="w-full relative flex justify-center items-center text-green-400 hover:text-white transition-colors bg-green-500/10 px-4 py-3 mt-4 rounded-lg border border-green-500/20 active:scale-95 font-semibold backdrop-blur-md shadow-[0_0_15px_rgba(74,222,128,0.15)] overflow-visible"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              </div>

              {/* Viewer Panel */}
              <div className="lg:col-span-3 glass rounded-xl flex flex-col h-[700px] border-t border-white/10 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-black/20">
                  <div className="flex bg-black/50 rounded-lg p-1 border border-gray-800">
                    <button onClick={() => setViewMode('slider')} className={`px-5 py-1.5 text-sm rounded-md font-medium transition-colors ${viewMode === 'slider' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>Before / After</button>
                    <button onClick={() => setViewMode('side-by-side')} className={`px-5 py-1.5 text-sm rounded-md font-medium transition-colors ${viewMode === 'side-by-side' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}>Side by Side</button>
                  </div>
                  {enhancedImageUrl && (
                    <button onClick={handleDownload} className="flex items-center text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10">
                      <Download className="w-4 h-4 mr-2" /> Download Result
                    </button>
                  )}
                </div>
                
                <div className="flex-1 p-6 flex items-center justify-center bg-[#02050a] relative">
                  {!originalImageUrl ? (
                     <div className="text-gray-500 flex flex-col items-center animate-pulse">
                       <Orbit className="w-16 h-16 mb-6 opacity-20" />
                       <p className="text-lg font-light tracking-wide">Awaiting lunar telemetry...</p>
                     </div>
                  ) : enhancedImageUrl ? (
                    <div className="w-full h-full max-h-[600px] flex justify-center items-center rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                      <TransformWrapper initialScale={1} minScale={0.5} maxScale={8}>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            {/* Floating Zoom Controls */}
                            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => zoomIn()} className="bg-[#070d19]/80 hover:bg-blue-600 text-white p-2 rounded-lg backdrop-blur-md transition-colors font-bold text-xl leading-none w-10 h-10 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer">+</button>
                              <button onClick={() => zoomOut()} className="bg-[#070d19]/80 hover:bg-blue-600 text-white p-2 rounded-lg backdrop-blur-md transition-colors font-bold text-xl leading-none w-10 h-10 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer">-</button>
                              <button onClick={() => resetTransform()} className="bg-[#070d19]/80 hover:bg-blue-600 text-white p-2 rounded-lg backdrop-blur-md transition-colors font-bold text-[10px] leading-none w-10 h-10 flex items-center justify-center border border-white/10 shadow-lg cursor-pointer">RESET</button>
                            </div>
                            
                            <TransformComponent wrapperStyle={{width: "100%", height: "100%", cursor: "grab"}} contentStyle={{width: "100%", height: "100%"}}>
                              {viewMode === 'slider' ? (
                                <ReactCompareSlider
                                  itemOne={<ReactCompareSliderImage src={originalImageUrl} alt="Original Dark Image" />}
                                  itemTwo={<ReactCompareSliderImage src={enhancedImageUrl} alt="Enhanced Lunar Surface" />}
                                  className="rounded-xl w-full h-full object-contain"
                                  style={{ width: "100%", height: "100%" }}
                                />
                              ) : (
                                <div className="flex w-full h-full gap-4 p-4 items-center justify-center">
                                  <div className="w-1/2 h-full max-h-full relative border border-gray-800/50 rounded-lg overflow-hidden bg-black/40 flex justify-center">
                                    <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-10 font-medium border border-white/10 backdrop-blur-sm">Before</span>
                                    <img src={originalImageUrl} alt="Original" className="w-full h-full object-contain pointer-events-none" />
                                  </div>
                                  <div className="w-1/2 h-full max-h-full relative border border-blue-900/30 rounded-lg overflow-hidden bg-black/40 flex justify-center">
                                    <span className="absolute top-3 left-3 bg-blue-600/70 text-white text-xs px-2 py-1 rounded-md z-10 font-medium border border-blue-400/30 backdrop-blur-sm">After</span>
                                    <img src={enhancedImageUrl} alt="Enhanced" className="w-full h-full object-contain pointer-events-none" />
                                  </div>
                                </div>
                              )}
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  ) : (
                    <div className="w-full h-full flex justify-center items-center relative rounded-xl overflow-hidden ring-1 ring-white/5 cursor-grab active:cursor-grabbing">
                      <TransformWrapper initialScale={1} minScale={0.5} maxScale={8}>
                        <TransformComponent wrapperStyle={{width: "100%", height: "100%"}} contentStyle={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                          <img src={originalImageUrl} alt="Original" className="max-h-full max-w-full object-contain rounded-xl pointer-events-none" />
                        </TransformComponent>
                      </TransformWrapper>
                       {isProcessing && (
                         <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center flex-col">
                           <Orbit className="w-16 h-16 text-blue-500 animate-spin mb-6" />
                           <p className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse">ENHANCING TERRAIN</p>
                           <div className="w-48 h-1 bg-gray-800 mt-6 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-1/2 animate-pulse rounded-full"></div>
                           </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
      
      {/* Global Particle Explosion System */}
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {particles.map(p => (
            <span 
              key={p.id}
              className="absolute w-2 h-2 bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.8)] rounded-sm animate-pixel-explosion"
              style={{
                left: p.x,
                top: p.y,
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`
              } as any}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
