import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
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
                            <span className="text-[8px] font-bold tracking-[0.1em] text-slate-400 uppercase mt-0.5">Privacy Policy</span>
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
                    <span className="text-[9px] font-black text-[#76BA1B] uppercase tracking-[0.4em] mb-4 block text-center">Legal Document</span>
                    <h1 className="text-4xl sm:text-6xl font-black text-[#2B3990] tracking-tighter leading-none mb-6 text-center uppercase">
                        Privacy <br />
                        <span className="text-[#76BA1B]">Policy.</span>
                    </h1>
                    <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">Effective Date: December 30, 2025</p>
                </header>

                <div className="space-y-12 text-slate-600 leading-relaxed text-sm sm:text-base">
                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Introduction
                        </h2>
                        <p>
                            Welcome to HasCart ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website hascart.in and use our mobile application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Information We Collect
                        </h2>
                        <div className="space-y-4">
                            <p>
                                <strong className="text-slate-800">Personal Data:</strong> We may collect personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information such as your age, gender, hometown, and interests when you choose to participate in various activities related to the Application.
                            </p>
                            <p>
                                <strong className="text-slate-800">Derivative Data:</strong> Our servers automatically collect information when you access the Application, such as your native actions that are integral to the Application, including liking, re-tweeting, or replying to a post, as well as other interactions with the Application and other users via server log files.
                            </p>
                            <p>
                                <strong className="text-slate-800">Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Application.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Use of Your Information
                        </h2>
                        <p>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2">
                            <li>Create and manage your account.</li>
                            <li>Process your transactions and send you related information.</li>
                            <li>Fulfill and manage orders, payments, and other transactions related to the Application.</li>
                            <li>Improve our website and mobile application efficiency and operation.</li>
                            <li>Perform other business activities as needed.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Security of Your Information
                        </h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-[#2B3990] uppercase tracking-tight mb-4 flex items-center">
                            <span className="w-2 h-2 bg-[#76BA1B] rounded-full mr-3"></span>
                            Contact Us
                        </h2>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="font-bold text-[#2B3990]">HasCart Support</p>
                            <p>Email: support@hascart.in</p>
                            <p>Numbers: 7337307619, 6301348580</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-slate-100 bg-slate-50/50">
                <div className="container mx-auto px-5 text-center">
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">
                        HasCart Ecosystem • Protecting Your Digital Journey
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Privacy;
