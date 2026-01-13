import React, { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Mail, Phone } from 'lucide-react';
import LinkedinIcon from '../../assets/social-icons/linkedin.webp';
import TwitterIcon from '../../assets/social-icons/twitter.webp';
import FacebookIcon from '../../assets/social-icons/facebook.webp';
import InstagramIcon from '../../assets/social-icons/instagram.webp';
import YoutubeIcon from '../../assets/social-icons/youtube.webp';
import HelpCenterModal from './HelpCenterModal';
import SecurityGuidelinesModal from './SecurityGuidelinesModal';

const Footer = () => {
    const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    return (
        <>
            <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
            <SecurityGuidelinesModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
            <footer className="relative mt-20 bg-[#ffffff]/60 backdrop-blur-3xl border-t border-white/60 pt-24 pb-10 rounded-t-[80px] shadow-[0_-20px_60px_-15px_rgba(255,255,255,0.8)] overflow-hidden">
                {/* Colorful Background Blobs matching reference */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                    <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000"></div>
                </div>

                {/* Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-[shimmer_10s_infinite_linear] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 xl:px-16 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                        {/* Brand Section */}
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <img src="/logo/Logo.png" alt="AI Mall Logo" className="w-16 h-16 object-contain" />
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                AI-MALL — India's First AI App Marketplace.<br />
                                100 AI Apps | AI-MALL | Partner Integrations<br />
                                Powered by UWO™
                            </p>

                            {/* Animated Social Icons - Glassy Cards */}



                            <div className="flex gap-3 pt-2">
                                {[
                                    { icon: LinkedinIcon, link: 'https://www.linkedin.com/in/aimall-global/' },
                                    { icon: TwitterIcon, link: 'https://x.com/aimallglobal' },
                                    { icon: FacebookIcon, link: 'https://www.facebook.com/aimallglobal/' },
                                    { icon: InstagramIcon, link: 'https://www.instagram.com/aimall.global/' },
                                    { icon: YoutubeIcon, link: 'https://www.youtube.com/@aimallglobal' }
                                ].map((social, index) => (
                                    <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden group">
                                        <img src={social.icon} alt="social" className="w-8 h-8 object-cover group-hover:scale-110 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Explore Links */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Explore</h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link to="/dashboard/marketplace" className="text-gray-500 hover:text-blue-600 font-medium transition-all duration-300 hover:translate-x-2 inline-block">
                                        Marketplace
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard/agents" className="text-gray-500 hover:text-blue-600 font-medium transition-all duration-300 hover:translate-x-2 inline-block">
                                        My Agents
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/vendor" className="text-gray-500 hover:text-blue-600 font-medium transition-all duration-300 hover:translate-x-2 inline-block">
                                        Become a Vendor
                                    </Link>
                                </li>

                            </ul>
                        </div>

                        {/* Support Links */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Support</h3>
                            <ul className="space-y-4">
                                <li key="Help Center">
                                    <button onClick={() => setIsHelpCenterOpen(true)} className="text-gray-500 hover:text-blue-600 font-medium transition-all duration-300 hover:translate-x-2 inline-block cursor-pointer">
                                        Help Center
                                    </button>
                                </li>
                                <li key="Security & Guidelines">
                                    <button onClick={() => setIsSecurityOpen(true)} className="text-gray-500 hover:text-blue-600 font-medium transition-all duration-300 hover:translate-x-2 inline-block cursor-pointer">
                                        Security & Guidelines
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Contact</h3>
                            <ul className="space-y-5">
                                <li className="flex items-start gap-3 text-gray-500 group">
                                    <MapPin size={20} className="text-blue-500 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <a href="https://www.google.com/maps/place/Jabalpur,+Madhya+Pradesh/@23.1756951,79.9687529,12z/data=!3m1!4b1!4m6!3m5!1s0x3981ae1a0fb6a97d:0x44020616bc43e3b9!8m2!3d23.1685786!4d79.9338798!16zL20vMDJkcm5r?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="group-hover:text-gray-700 transition-colors">Jabalpur, Madhya Pradesh</a>
                                </li>
                                <li className="flex items-center gap-3 text-gray-500 group">
                                    <Mail size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                    <a href="mailto:support@ai-mall.ai" className="group-hover:text-gray-700 transition-colors">admin@uwo24.com</a>
                                </li>
                                <li className="flex items-center gap-3 text-gray-500 group">
                                    <Phone size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                    <span className="group-hover:text-gray-700 transition-colors">+91 83589 90909</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-center items-center gap-4 text-xs font-medium text-gray-400">
                        <p>© 2026 AI Mall. All rights reserved. Partnered with UWO-LINK™.</p>
                        {/*iv className="flex gap-8">
                            <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-gray-600 transition-colors">Cookie Policy</a>
                        </div>*/}
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
