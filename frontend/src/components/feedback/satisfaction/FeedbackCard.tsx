'use client';

import { Feedback } from '@/lib/satisfaction-data';

export default function FeedbackCard({ feedback }: { feedback: Feedback }) {
    return (
        <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
            {/* Avatar placeholder */}
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined filled-icon">person</span>
            </div>

            <div className="flex-1">
                {/* Header (name / date / district) */}
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{feedback.name}</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            {feedback.time}    {" "}
                            <span className="font-bold text-primary">
                                {feedback.district}
                            </span>
                        </p>
                    </div>

                    {/* Rating stars */}
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`material-symbols-outlined text-sm filled-icon ${i < feedback.rating
                                        ? "text-amber-400"
                                        : "text-slate-300 dark:text-slate-600"
                                    }`}
                            >
                                star
                            </span>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                    {feedback.comment}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {feedback.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold tracking-tight uppercase"
                        >
                            {tag}
                        </span>
                    ))}
                    {feedback.escalated && (
                        <span className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider">
                            Escalated
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
