'use client';

import { Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Documentation', href: '/docs' },
            { label: 'API', href: '/api' },
        ],
        company: [
            { label: 'About Us', href: '/about' },
            { label: 'Careers', href: '/careers' },
            { label: 'Blog', href: '/blog' },
            { label: 'Press Kit', href: '/press' },
        ],
        support: [
            { label: 'Help Center', href: '/help' },
            { label: 'Contact', href: '/contact' },
            { label: 'Status', href: '/status' },
            { label: 'Privacy Policy', href: '/legal/privacy' },
        ],
        legal: [
            { label: 'Terms of Service', href: '/legal/terms' },
            { label: 'Privacy Policy', href: '/legal/privacy' },
            { label: 'Cookie Policy', href: '/legal/cookies' },
            { label: 'GDPR', href: '/legal/gdpr' },
        ],
    };

    const socialLinks = [
        { icon: <Twitter className="w-5 h-5" />, href: 'https://cloudindustrie.com', label: 'Twitter' },
        { icon: <Linkedin className="w-5 h-5" />, href: 'https://cloudindustrie.com', label: 'LinkedIn' },
        { icon: <Mail className="w-5 h-5" />, href: 'mailto:sam@cloudindustrie.com', label: 'Email' },
    ];

    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-primary p-2 rounded-lg text-white">
                                <span className="material-symbols-outlined text-2xl">account_balance</span>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold leading-none">CloudIndustrie</h2>
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                    Digital Infrastructure
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-xs">
                            Modernizing municipal complaint management with real-time tracking,
                            intelligent routing, and citizen engagement.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>71-75 Shelton Street, Covent Garden, London, UK</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>sam@cloudindustrie.com</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Product
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href as any}
                                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Company
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href as any}
                                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Support
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href as any}
                                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Legal
                        </h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href as any}
                                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                               {currentYear} Cloudindustrie Ltd. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>

                        {/* Language & Theme Selector */}
                        <div className="flex items-center gap-2 text-sm">
                            <select title="Language selector" aria-label="Select language" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="en">English</option>
                                <option value="fr">Fran  ais</option>
                                <option value="ar">              </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
