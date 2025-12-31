import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <div className="min-h-screen bg-white text-slate-800 selection:bg-[#76BA1B]/10 selection:text-[#2B3990]">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full z-[100] bg-white/95 backdrop-blur-md py-4 shadow-sm border-b border-slate-100">
                <div className="container mx-auto px-5 flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 transition-transform">
                            <img src="/logo.png" alt="HasCart" className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
                        </div>
                        <div className="flex flex-col border-l border-slate-200 pl-3">
                            <span className="text-base sm:text-lg font-black tracking-tight text-[#2B3990] leading-none">
                                HAS<span className="text-[#76BA1B]">CART</span>
                            </span>
                            <span className="text-[8px] font-bold tracking-[0.1em] text-slate-400 uppercase mt-0.5">Terms of Service</span>
                        </div>
                    </Link>
                    <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-[#2B3990] hover:text-[#76BA1B] transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="pt-32 pb-24 container mx-auto px-5 max-w-4xl">
                <header className="mb-16">
                    <span className="text-[9px] font-black text-[#76BA1B] uppercase tracking-[0.4em] mb-4 block text-center">User Agreement</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-[#2B3990] tracking-tighter leading-none mb-6 text-center uppercase">
                        Terms <br />
                        <span className="text-[#76BA1B]">Of Service.</span>
                    </h1>
                    <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">Effective Date: December 30, 2025</p>
                </header>

                <div className="space-y-12 text-slate-600 leading-relaxed text-sm sm:text-base">
                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Agreement to Terms
                        </h2>
                        <p>
                            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and HasCart ("we," "us" or "our"), concerning your access to and use of the hascart.in website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
                        </p>
                        <p className="mt-4 italic">
                            By accessing the site and application, you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the site and application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Intellectual Property Rights
                        </h2>
                        <p>
                            Unless otherwise indicated, the Site and Application are our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site and Application and the trademarks, service marks, and logos contained therein are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            User Representations
                        </h2>
                        <p>
                            By using the Site, you represent and warrant that:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                            <li>You are not a minor in the jurisdiction in which you reside.</li>
                            <li>You will not access the Site through automated or non-human means.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Prohibited Activities
                        </h2>
                        <p>
                            You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Modifications and Interruptions
                        </h2>
                        <p>
                            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Contact Us
                        </h2>
                        <p>
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                        </p>
                        <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="font-bold text-[#2B3990]">HasCart Legal Department</p>
                            <p>Email: hascart99@gmail.com</p>
                            <p>Numbers: 9966141950</p>
                            <p>Address: Operational Headquarters, India</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
                <div className="container mx-auto px-5 text-center">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">
                        HasCart Ecosystem • Fair Usage & Integrity
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Terms;
