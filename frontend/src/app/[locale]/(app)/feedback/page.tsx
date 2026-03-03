'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CitizenFeedbackPage() {
    // State
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const [criteria, setCriteria] = useState({
        punctuality: false,
        professionalism: false,
        quality: false,
        cleanup: false
    });

    // Handlers
    const handleCriteriaChange = (key: keyof typeof criteria) => {
        setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <span className="material-symbols-outlined text-6xl text-green-600 dark:text-green-400">check_circle</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-4">Thank You!</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                    Your feedback has been successfully submitted. We appreciate your input as it helps us improve our municipal services for everyone.
                </p>
                <Link href="/" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Navigation Header */}
            <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-white">public</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">ReclamTrack</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex gap-6">
                            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Portal Home</Link>
                            <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">Help Center</Link>
                        </nav>
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Citizen&background=2424eb&color=fff" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Section */}
            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                {/* Page Heading */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Share Your Feedback</h1>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">description</span>
                        <span className="text-sm font-medium uppercase tracking-wider">Case ID: REC-001     Infrastructure Repair</span>
                    </div>
                </div>

                {/* Feedback Form Card */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-10">
                    {/* 1. Star Rating */}
                    <section>
                        <h2 className="text-lg font-bold mb-4">Overall Satisfaction</h2>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="group focus:outline-none transition-transform active:scale-95"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <span className={`material-symbols-outlined text-4xl transition-colors ${star <= (hoverRating || rating)
                                            ? 'text-primary'
                                            : 'text-slate-300 dark:text-slate-700'
                                        }`} style={{ fontVariationSettings: `'FILL' ${star <= (hoverRating || rating) ? 1 : 0}` }}>
                                        star
                                    </span>
                                </button>
                            ))}
                            <span className="ml-4 text-sm font-semibold text-primary">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Average'}
                                {rating === 4 && 'Good'}
                                {rating === 5 && 'Excellent'}
                            </span>
                        </div>
                    </section>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* 2. Checklist Criteria */}
                    <section>
                        <h2 className="text-lg font-bold mb-4">Satisfaction Criteria</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Which aspects of the service met your expectations?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors group ${criteria.punctuality ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <input
                                    checked={criteria.punctuality}
                                    onChange={() => handleCriteriaChange('punctuality')}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mr-4"
                                    type="checkbox"
                                />
                                <span className="text-sm font-medium">Punctuality of the team</span>
                            </label>
                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors group ${criteria.professionalism ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <input
                                    checked={criteria.professionalism}
                                    onChange={() => handleCriteriaChange('professionalism')}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mr-4"
                                    type="checkbox"
                                />
                                <span className="text-sm font-medium">Professionalism of staff</span>
                            </label>
                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors group ${criteria.quality ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <input
                                    checked={criteria.quality}
                                    onChange={() => handleCriteriaChange('quality')}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mr-4"
                                    type="checkbox"
                                />
                                <span className="text-sm font-medium">Quality of Repair</span>
                            </label>
                            <label className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors group ${criteria.cleanup ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                <input
                                    checked={criteria.cleanup}
                                    onChange={() => handleCriteriaChange('cleanup')}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary mr-4"
                                    type="checkbox"
                                />
                                <span className="text-sm font-medium">Site Cleanup</span>
                            </label>
                        </div>
                    </section>

                    <hr className="border-slate-100 dark:border-slate-800" />

                    {/* 3. Comments */}
                    <section>
                        <h2 className="text-lg font-bold mb-4">Detailed Feedback</h2>
                        <textarea
                            className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-primary text-sm p-4 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all"
                            placeholder="Tell us more about your experience or provide specific suggestions for improvement..."
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </section>

                    {/* 4. Photo Upload */}
                    <section>
                        <h2 className="text-lg font-bold mb-4">Evidence & Documentation</h2>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-primary">cloud_upload</span>
                            </div>
                            <p className="text-sm font-bold mb-1">Drag and Drop Photo of Completed Work</p>
                            <p className="text-xs text-slate-500">PNG, JPG or PDF up to 10MB</p>
                            <button type="button" className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all">
                                Browse Files
                            </button>
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={rating === 0}
                            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${rating === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'
                                }`}
                        >
                            <span>Submit Feedback</span>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                        <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                            By submitting this form, you agree to our Terms of Service. <br />
                            Your feedback helps us improve municipal services for all citizens.
                        </p>
                    </div>
                </form>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 mt-12 bg-white dark:bg-slate-900">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-4">
                    <p>   2026 ReclamTrack. Official Municipal Service Portal.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-primary underline decoration-slate-200">Privacy Policy</Link>
                        <Link href="#" className="hover:text-primary underline decoration-slate-200">Accessibility Statement</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
