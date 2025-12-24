import React, { useEffect, useState, useRef } from 'react';
import { useBanners } from '../hooks/useBanners';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const { banners, loading } = useBanners();
    const revealRefs = useRef([]);
    revealRefs.current = [];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('reveal-visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        revealRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [loading, banners]);

    const addToRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-800 overflow-x-hidden selection:bg-[#76BA1B]/10 selection:text-[#2B3990]">
            {/* Dynamic Keyframes & Utilities */}
            <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-mesh {
          background-color: #ffffff;
          background-image: 
            radial-gradient(at 0% 0%, rgba(118, 186, 27, 0.02) 0, transparent 50%), 
            radial-gradient(at 100% 0%, rgba(43, 57, 144, 0.02) 0, transparent 50%);
        }
      `}</style>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md py-2 shadow-sm border-b border-slate-100' : 'bg-transparent py-4'}`}>
                <div className="container mx-auto px-5 flex justify-between items-center">
                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 transition-transform">
                            <img src="/logo.png" alt="HasCart" className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-3">
                            <span className="text-base sm:text-lg font-black tracking-tight text-[#2B3990] leading-none">
                                HAS<span className="text-[#76BA1B]">CART</span>
                            </span>
                            <span className="text-[8px] font-bold tracking-[0.1em] text-slate-400 uppercase mt-0.5">Shop Smart</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="vision" className="relative pt-24 pb-12 sm:pt-40 sm:pb-24 overflow-hidden hero-mesh">
                <div className="container mx-auto px-5 relative text-center">
                    <div className="inline-flex items-center px-3 py-1 mb-6 bg-[#76BA1B]/5 rounded-full border border-[#76BA1B]/10 reveal" ref={addToRefs}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#76BA1B] mr-2 animate-pulse" />
                        <span className="text-[9px] font-black text-[#76BA1B] uppercase tracking-[0.15em]">Official App Terminal</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-[#2B3990] leading-[1.1] tracking-tighter mb-6 reveal" ref={addToRefs}>
                        YOUR SMART <br />
                        SHOPPING <span className="text-[#76BA1B]">PARTNER.</span>
                    </h1>

                    <p className="max-w-xl mx-auto text-slate-500 text-sm sm:text-lg font-medium leading-relaxed mb-10 reveal" ref={addToRefs}>
                        Experience the next generation of marketplace integration. Find the best products and shop with confidence through our ecosystem.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 reveal" ref={addToRefs}>
                        <a href="#download" className="w-full sm:w-auto px-8 py-3.5 bg-[#2B3990] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md">
                            Get the App
                        </a>
                        <a href="#performance" className="w-full sm:w-auto px-8 py-3.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                            Browse Offers
                        </a>
                    </div>
                </div>
            </section>

            {/* Download Section */}
            <section id="download" className="py-12 sm:py-24 bg-slate-50 overflow-hidden">
                <div className="container mx-auto px-5">
                    <div className="bg-white rounded-[2rem] p-8 sm:p-20 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#76BA1B]/5 to-transparent skew-x-12 translate-x-1/2 opacity-50" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10 text-center lg:text-left">
                            <div className="reveal" ref={addToRefs}>
                                <span className="text-[9px] font-black text-[#76BA1B] uppercase tracking-[0.4em] mb-4 block">Mobile Experience</span>
                                <h2 className="text-3xl sm:text-5xl font-black text-[#2B3990] tracking-tighter leading-none mb-6 uppercase">
                                    Take HasCart <br />
                                    <span className="text-[#76BA1B]">Everywhere.</span>
                                </h2>
                                <p className="text-slate-500 text-base sm:text-lg font-medium mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                                    Download our official mobile application to access exclusive rewards and faster checkout anytime, anywhere.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <a href="#" className="flex items-center justify-center px-6 py-4 bg-black text-white rounded-xl transition-all hover:scale-105 space-x-3">
                                        <div className="text-2xl">🤖</div>
                                        <div className="text-left">
                                            <div className="text-[9px] font-bold uppercase tracking-widest leading-none">Coming soon to</div>
                                            <div className="text-lg font-black leading-none mt-1">Play Store</div>
                                        </div>
                                    </a>

                                    <a href="/hascart.apk" download className="flex items-center justify-center px-6 py-4 bg-[#76BA1B] text-white rounded-xl transition-all hover:scale-105 space-x-3 shadow-lg shadow-[#76BA1B]/15">
                                        <div className="text-2xl">📦</div>
                                        <div className="text-left">
                                            <div className="text-[9px] font-bold uppercase tracking-widest leading-none text-white/80">Direct Download</div>
                                            <div className="text-lg font-black leading-none mt-1 text-white">Get APK</div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <div className="relative reveal reveal-delay-2 flex justify-center lg:justify-end" ref={addToRefs}>
                                <div className="w-full max-w-[320px] aspect-[4/5] bg-slate-50 rounded-[2rem] p-3 border border-slate-100 shadow-inner overflow-hidden">
                                    <div className="w-full h-full bg-[#2B3990] rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-20 h-20 bg-white rounded-2xl mb-6 flex items-center justify-center shadow-xl">
                                            <img src="/logo.png" alt="Logo" className="w-14 h-14 object-contain" />
                                        </div>
                                        <h4 className="text-white text-2xl font-black uppercase tracking-tighter mb-3">HasCart App</h4>
                                        <div className="px-4 py-1.5 bg-[#76BA1B] rounded-full text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                                            Beta v1.0.0
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Banners Section */}
            <section id="performance" className="py-16 sm:py-24">
                <div className="container mx-auto px-5">
                    <div className="max-w-2xl mb-12 sm:mb-16 reveal text-center sm:text-left" ref={addToRefs}>
                        <h2 className="text-3xl sm:text-5xl font-black text-[#2B3990] tracking-tighter leading-none mb-4">
                            LATEST <br />
                            <span className="text-[#76BA1B]">OFFERS.</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-sm sm:text-base">Stay updated with our newest marketplace deals and upcoming promotional events.</p>
                    </div>

                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="w-6 h-6 border-3 border-slate-100 border-t-[#76BA1B] rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {banners.length > 0 ? banners.slice(0, 6).map((banner, i) => (
                                <div key={banner._id || i} className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 reveal" ref={addToRefs} style={{ transitionDelay: `${i * 100}ms` }}>
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <span className="text-[9px] font-black text-[#76BA1B] uppercase tracking-widest mb-2 block">Marketplace Promotion</span>
                                        <h3 className="text-lg font-bold text-[#2B3990] group-hover:text-[#76BA1B] transition-colors">{banner.title || "HasCart Exclusive"}</h3>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">More content being prepared.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 sm:py-20 border-t border-slate-100 bg-white">
                <div className="container mx-auto px-5">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-10 text-center lg:text-left">
                        <div className="flex flex-col items-center lg:items-start">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-9 h-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-1 shadow-sm">
                                    <img src="/logo.png" alt="HasCart" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-black tracking-tighter text-[#2B3990]">HAS<span className="text-[#76BA1B]">CART</span></span>
                            </div>
                            <p className="text-slate-400 font-bold text-[11px] tracking-tight">© 2025 HasCart Ecosystem. All rights reserved.</p>
                        </div>

                        <div className="flex gap-10 sm:gap-16">
                            <FooterLinks title="Ecosystem" links={['Marketplace', 'Rewards']} />
                            <FooterLinks title="Platform" links={['Terms', 'Privacy']} />
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                            <a href="/hascart.apk" download className="flex items-center space-x-2 text-[#76BA1B] hover:text-[#2B3990] transition-colors border border-[#76BA1B]/20 px-3 py-1.5 rounded-lg">
                                <span>📦</span>
                                <span>Download android APK</span>
                            </a>
                            <span>Build: 1.0.0-LTS</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FooterLinks = ({ title, links }) => (
    <div className="flex flex-col space-y-3">
        <span className="text-[10px] font-black text-[#2B3990] uppercase tracking-widest mb-1">{title}</span>
        {links.map((link, i) => (
            <a key={i} href="#" className="text-slate-400 hover:text-[#2B3990] transition-colors text-[11px] font-bold">{link}</a>
        ))}
    </div>
);

export default Landing;
