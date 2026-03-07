"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = saved ? saved === "dark" : prefersDark;
        setIsDark(initial);
        document.documentElement.classList.toggle("dark", initial);
    }, []);

    const toggle = () => {
        const newVal = !isDark;
        setIsDark(newVal);
        document.documentElement.classList.toggle("dark", newVal);
        document.documentElement.classList.toggle("light", !newVal);
        localStorage.setItem("theme", newVal ? "dark" : "light");
    };

    return (
        <button
            onClick={toggle}
            className="flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle dark mode"
        >
            <span className="material-symbols-outlined">
                {isMounted ? (isDark ? "dark_mode" : "light_mode") : "light_mode"}
            </span>
        </button>
    );
}
