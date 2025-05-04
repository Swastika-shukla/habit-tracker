// src/app/HabitTracker.tsx
"use client"; // Required for hooks like useState, useEffect

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { FiMenu, FiX, FiSun, FiMoon, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiTrendingUp, FiTarget, FiSettings, FiBarChart2, FiCheckCircle, FiAward } from 'react-icons/fi';
import confetti from 'canvas-confetti';

// --- Mock Data ---
interface Habit {
    id: number;
    name: string;
    goal: number; // e.g., times per day/week
    currentProgress: number; // today's progress
    frequency: 'daily' | 'weekly';
    category: string;
    streak: number;
    history: { date: string; completed: boolean }[]; // YYYY-MM-DD
    color: string; // Tailwind color class (e.g., 'bg-blue-500')
}

interface User {
    name: string;
    avatar: string;
    joinedDate: string; // ISO Date string
}

const mockHabits: Habit[] = [
    { id: 1, name: "Morning Run", goal: 1, currentProgress: 0, frequency: "daily", category: "Fitness", streak: 5, history: [{ date: "2025-05-01", completed: true }, { date: "2025-04-30", completed: true }, { date: "2025-04-29", completed: true }], color: "bg-blue-500" },
    { id: 2, name: "Read 30 Mins", goal: 1, currentProgress: 1, frequency: "daily", category: "Learning", streak: 12, history: [{ date: "2025-05-01", completed: true }, { date: "2025-04-30", completed: true }], color: "bg-green-500" },
    { id: 3, name: "Drink Water", goal: 8, currentProgress: 4, frequency: "daily", category: "Health", streak: 2, history: [{ date: "2025-05-01", completed: false }, { date: "2025-04-30", completed: true }], color: "bg-cyan-500" },
    { id: 4, name: "Weekly Review", goal: 1, currentProgress: 0, frequency: "weekly", category: "Productivity", streak: 3, history: [], color: "bg-purple-500" },
];

// const mockUser: User = {
//     name: "Swastika Shukla",
//     avatar: `https://api.dicebear.com/6.x/initials/svg?seed=Alex`, // Simple avatar placeholder
//     joinedDate: "2025-01-15T10:00:00Z",
// };
const mockUser: User = {
    name: "Swastika Shukla",
    avatar: `/pp.jpg`, 
    joinedDate: "2025-01-15T10:00:00Z",
};
// --- Simple useDarkMode Hook (Example) ---
const useDarkMode = (): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference !== null) {
            setIsDark(storedPreference === 'true');
        } else {
            // Optional: Set based on system preference if no stored preference
            // setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDark]);

    return [isDark, setIsDark];
};

// Aesthetic Navigation Tabs Component - Corrected Hover/Inactive Colors
const NavigationTabs: React.FC<{
    activeTab: string;
    setActiveTab: (tab: string) => void;
    darkMode: boolean;
}> = ({ activeTab, setActiveTab, darkMode }) => {
    const tabs = ["Dashboard", "Stats", "Habits", "Settings"];
    // Define the green color (using Tailwind's green-700 as an approximation)
    const defaultColor = "text-green-700 dark:text-green-500"; // Green for default/active text
    const activeBgColor = "bg-green-600"; // Slightly brighter green for underline
    // Define the hover color (using near-black/near-white for contrast)
    const hoverColor = "hover:text-gray-900 dark:hover:text-gray-100";

    return (
        // Removed sticky and top classes, ensure solid background
        <nav className={`w-full border-b border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark z-30`}>
            {/* Centered the buttons using justify-center */}
            <div className="container mx-auto px-4 flex justify-center space-x-2 sm:space-x-4">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        // text-lg. Default is green, hover is black/near-black. Active is green.
                        className={`relative px-3 sm:px-5 py-4 text-lg font-sans font-bold transition-colors duration-300 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${darkMode ? 'focus-visible:ring-offset-background-dark' : 'focus-visible:ring-offset-background-light'}
                            ${activeTab === tab.toLowerCase()
                                ? defaultColor // Active tab text color (Green)
                                : `${defaultColor} ${hoverColor}` // Inactive tab text (Green) + Hover to black/near-black
                            }`
                        }
                    >
                        {/* Text */}
                        {tab}

                        {/* Animated underline for active state - Use green color */}
                        {/* REMOVED group-hover:scale-x-100 to prevent underline appearing on hover */}
                        {/* Underline only appears fully when active */}
                        <span
                            className={`absolute bottom-0 left-0 right-0 h-1 transition-transform duration-300 ease-out scale-x-0 ${activeBgColor} ${activeTab === tab.toLowerCase() ? 'scale-x-100' : ''}`}
                        ></span>
                    </button>
                ))}
            </div>
        </nav>
    );
};
const Header: React.FC<{
    // Removed props related to navigation and sidebar toggle
    darkMode: boolean;
    // Removed setDarkMode as the toggle button is gone, but kept darkMode for styling
}> = ({ darkMode }) => {

    // Define background color based on the target image (adjust as needed)
    // Using a light beige/off-white for light mode, and a dark background for dark mode
    const headerBgColor = darkMode ? 'bg-background-dark' : 'bg-[#F8F6F1]'; // Example light color
    const textColor = darkMode ? 'text-content-dark' : 'text-[#3a4d39]'; // Example dark green text color for light mode

    return (
        // Removed sticky and shadow, added padding, using new background/text colors
        <header className={`w-full p-6 md:p-10 ${headerBgColor} ${textColor} relative overflow-hidden`}>
            {/* Placeholder for background botanical elements (could use absolute positioning and SVGs/Images) */}
            {/* <img src="/path/to/leaf-left.svg" alt="" className="absolute top-0 left-0 w-1/4 opacity-50 -z-10" /> */}
            {/* <img src="/path/to/leaf-right.svg" alt="" className="absolute top-0 right-0 w-1/3 opacity-30 -z-10" /> */}

            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

                {/* Left Section (Checkmark, Title, Quote) */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-green-700' : 'bg-green-500'} text-white`}>
                        <FiCheckCircle size={28} />
                    </div>
                    <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Habit Tracker
                    </h1>
                    <p className="text-sm italic max-w-md">
                        “Sow a thought, reap an action; sow an action, reap a habit; sow a habit reap a character; sow a character, reap a destiny.” - Stephen R. Covey
                    </p>
                </div>

                {/* Right Section (Central "HABITS" Graphic Placeholder) */}
                <div className="flex-shrink-0 relative w-48 h-48 md:w-60 md:w-60 flex items-center justify-center">
                    {/* Placeholder Circle */}
                    <div className={`absolute inset-0 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-green-100'} opacity-50`}></div>

                    {/* Placeholder Text */}
                    <span className={`relative text-3xl font-semibold tracking-widest ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        HABITS
                    </span>

                    {/* Placeholder Icons (Absolutely positioned around the circle - simplified) */}
                    {/* These would ideally be SVGs or images */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-4 p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-md`}>
                        <FiTrendingUp size={16} className="text-accent-fitness" /> {/* Dumbbell Placeholder */}
                    </div>
                     <div className={`absolute right-0 top-1/2 -translate-y-1/2 mr-[-10px] p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-md`}>
                        <FiCalendar size={16} className="text-accent-learning" /> {/* Book Placeholder */}
                    </div>
                     <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 mb-[-10px] p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-md`}>
                        <FiTarget size={16} className="text-accent-health" /> {/* Paw Print Placeholder */}
                    </div>
                     <div className={`absolute left-0 top-1/2 -translate-y-1/2 ml-[-10px] p-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'} shadow-md`}>
                        <FiSettings size={16} className="text-accent-productivity" /> {/* Money Bag Placeholder */}
                    </div>
                     {/* Add more placeholder icons as needed */}
                </div>
            </div>
        </header>
    );
};



// Habit Card Component
const HabitCard: React.FC<{ habit: Habit; onComplete: (id: number, event: React.MouseEvent<HTMLButtonElement>) => void; darkMode: boolean }> = ({ habit, onComplete, darkMode }) => {
    const progressPercentage = habit.goal > 0 ? Math.min((habit.currentProgress / habit.goal) * 100, 100) : 0;
    const isCompleted = habit.currentProgress >= habit.goal;

    return (
        <motion.div
            layout 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-lg shadow-md flex items-center space-x-4 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
        >
            <div className={`w-3 h-10 rounded-full ${habit.color}`}></div>
            <div className="flex-grow">
                <div className="flex justify-between items-baseline mb-1">
                    <span className="font-medium text-sm truncate" title={habit.name}>{habit.name}</span>
                     <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {habit.currentProgress}/{habit.goal} {habit.frequency === 'weekly' ? ' (Weekly)' : ''}
                     </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <motion.div
                        className={`${habit.color} h-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                 {habit.streak > 1 && (
                     <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>🔥 {habit.streak} day streak</p>
                 )}
            </div>
            <button
                onClick={(e) => !isCompleted && onComplete(habit.id, e)}
                disabled={isCompleted}
                className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isCompleted
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : `${habit.color.replace('bg-', 'hover:bg-').replace('-500', '-600')} text-white opacity-80 hover:opacity-100 focus:ring-${habit.color.split('-')[1]}-500`
                    } ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
                aria-label={isCompleted ? 'Completed' : `Mark ${habit.name} complete`}
            >
                <FiCheckCircle size={18} />
            </button>
        </motion.div>
    );
};

// Reusable Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; darkMode: boolean }> = ({ isOpen, onClose, title, children, darkMode }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
                    onClick={onClose} // Close on backdrop click
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`rounded-xl shadow-2xl w-full max-w-md p-6 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'}`}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">{title}</h2>
                            <button onClick={onClose} className={`p-1 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Close modal">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Add/Edit Habit Modal Content (Simplified)
const AddEditHabitForm: React.FC<{
    onSave: (habit: Omit<Habit, 'id' | 'history' | 'currentProgress' | 'streak'> & { id?: number }) => void;
    onClose: () => void;
    initialData?: Habit | null;
    darkMode: boolean;
}> = ({ onSave, onClose, initialData, darkMode }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [goal, setGoal] = useState(initialData?.goal || 1);
    const [frequency, setFrequency] = useState<'daily' | 'weekly'>(initialData?.frequency || 'daily');
    const [category, setCategory] = useState(initialData?.category || 'General');
    const [color, setColor] = useState(initialData?.color || 'bg-blue-500'); // Default color

    const availableColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return; // Basic validation

        onSave({
            id: initialData?.id, // Include ID if editing
            name: name.trim(),
            goal: Number(goal) || 1, // Ensure goal is a number
            frequency,
            category: category.trim() || 'General',
            color,
        });
    };

    const inputClass = `w-full px-3 py-2 rounded-md border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300 placeholder-gray-500'}`;
    const labelClass = `block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="habitName" className={labelClass}>Habit Name</label>
                <input
                    type="text" id="habitName" value={name} onChange={(e) => setName(e.target.value)}
                    className={inputClass} placeholder="e.g., Exercise" required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="habitGoal" className={labelClass}>Goal ({frequency === 'daily' ? 'per day' : 'per week'})</label>
                    <input
                         type="number" id="habitGoal" value={goal} onChange={(e) => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
                         min="1" className={inputClass} required
                    />
                 </div>
                 <div>
                    <label htmlFor="habitFrequency" className={labelClass}>Frequency</label>
                    <select
                         id="habitFrequency" value={frequency} onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                         className={inputClass}
                    >
                         <option value="daily">Daily</option>
                         <option value="weekly">Weekly</option>
                    </select>
                 </div>
            </div>
            <div>
                <label htmlFor="habitCategory" className={labelClass}>Category</label>
                <input
                    type="text" id="habitCategory" value={category} onChange={(e) => setCategory(e.target.value)}
                    className={inputClass} placeholder="e.g., Fitness, Work"
                />
            </div>
             <div>
                <label className={labelClass}>Color</label>
                 <div className="flex flex-wrap gap-2">
                    {availableColors.map(c => (
                         <button
                             type="button" key={c} onClick={() => setColor(c)}
                             className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${c} ${color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''} ${darkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}`}
                             aria-label={`Select color ${c.split('-')[1]}`}
                         />
                     ))}
                 </div>
             </div>

            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className={`px-4 py-2 text-sm rounded-md transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    {initialData ? 'Save Changes' : 'Add Habit'}
                </button>
            </div>
        </form>
    );
};


// Footer Component
const Footer: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
    return (
        <footer className={`mt-12 py-6 border-t ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
            <div className="container mx-auto px-4 text-center text-sm">
                © {new Date().getFullYear()} HabitTrack. Built by Swastika Shukla
            </div>
        </footer>
    );
};


// --- Main HabitTracker Component ---
const HabitTracker: React.FC = () => {
    const [habits, setHabits] = useState<Habit[]>(mockHabits);
    const [user] = useState<User>(mockUser);
    const [activeTab, setActiveTab] = useState<string>("dashboard"); // 'dashboard', 'stats', 'habits', 'settings'
    const [darkMode, setDarkMode] = useDarkMode();
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null); // Habit being edited


    // Calculate Stats (Memoized)
    const stats = useMemo(() => {
        const totalHabits = habits.length;
        const completedToday = habits.filter(h => h.currentProgress >= h.goal).length;
        const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
        const overallCompletionRate = totalHabits > 0
            ? Math.round((habits.reduce((sum, h) => sum + (h.currentProgress / h.goal), 0) / totalHabits) * 100)
            : 0;
        // Basic consistency calculation (e.g., completed in last 7 days)
        // This is a simplification. Real history tracking would be needed.
        const consistencyData = habits.map(h => ({
             name: h.name.length > 15 ? h.name.substring(0, 12) + '...' : h.name, // Truncate long names for chart
             consistency: Math.random() * 100, // Using random for demo - replace with real calc
             fillColor: h.color.replace('bg-', '#').replace('-500', '') // Convert Tailwind class to hex for Recharts (approximation)
        }));


        return {
            totalHabits,
            completedToday,
            longestStreak,
            overallCompletionRate: Math.min(overallCompletionRate, 100), // Cap at 100%
            consistencyData
        };
    }, [habits]);

    // Handle Habit Completion
    const handleCompleteHabit = useCallback((id: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setHabits(prevHabits =>
            prevHabits.map(habit => {
                if (habit.id === id) {
                    // Trigger Confetti
                    const rect = (event.target as Element).getBoundingClientRect();
                    const origin = {
                         x: (rect.left + rect.width / 2) / window.innerWidth,
                         y: (rect.top + rect.height / 2) / window.innerHeight
                    };
                     confetti({ particleCount: 100, spread: 70, origin: origin, colors: ['#2563eb', '#ffffff'] }); // Blue and white

                    // Increment progress, potentially increase streak (simplified)
                    // In a real app, you'd check the date and update history/streak properly
                    const newProgress = habit.currentProgress + 1;
                    const isNowComplete = newProgress >= habit.goal;
                    return { ...habit, currentProgress: newProgress, streak: isNowComplete ? habit.streak + 1 : habit.streak };
                }
                return habit;
            })
        );
     }, []); // Empty dependency array for confetti, might need adjustment if colors depend on state

    // Handle Add/Edit Habit Save
    const handleSaveHabit = (habitData: Omit<Habit, 'id' | 'history' | 'currentProgress' | 'streak'> & { id?: number }) => {
         if (habitData.id) { // Editing existing habit
             setHabits(prev => prev.map(h => h.id === habitData.id ? { ...h, ...habitData } : h));
         } else { // Adding new habit
             const newHabit: Habit = {
                 ...habitData,
                 id: Date.now(), // Simple unique ID generation
                 currentProgress: 0,
                 streak: 0,
                 history: []
             };
             setHabits(prev => [...prev, newHabit]);
         }
         closeModal();
    };

    // Modal Controls
    const openAddModal = () => {
         setEditingHabit(null); // Ensure we are adding, not editing
         setIsAddEditModalOpen(true);
    };

     const openEditModal = (habit: Habit) => {
         setEditingHabit(habit);
         setIsAddEditModalOpen(true);
     };

    const closeModal = () => {
        setIsAddEditModalOpen(false);
        setEditingHabit(null); // Clear editing state when closing
    };

    // -- Simple Calendar Heatmap Grid (Placeholder) --
    const renderCalendarHeatmap = () => {
         const daysInMonth = 31; // Example for May
         const cells = [];
         const today = new Date().getDate();

         for (let i = 1; i <= daysInMonth; i++) {
            const intensity = Math.floor(Math.random() * 5); // 0-4 intensity levels (mock data)
            let bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-100';
            if (intensity === 1) bgColor = 'bg-blue-200 dark:bg-blue-800';
             if (intensity === 2) bgColor = 'bg-blue-400 dark:bg-blue-600';
             if (intensity === 3) bgColor = 'bg-blue-600 dark:bg-blue-400';
             if (intensity >= 4) bgColor = 'bg-blue-800 dark:bg-blue-200';

             cells.push(
                <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${bgColor} ${i === today ? 'ring-2 ring-red-500' : ''}`}
                     title={`May ${i} - Activity Level: ${intensity}`} // Basic tooltip
                ></div>
            );
         }
         return <div className="flex flex-wrap gap-1 p-2 rounded border border-gray-200 dark:border-gray-700">{cells}</div>;
    };


    return (
        <div className={`${darkMode ? "dark" : ""} min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
            <Header darkMode={darkMode} />
            <NavigationTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            />

            <main className="flex-grow container mx-auto px-12 py-6 md:py-8">
                <AnimatePresence mode="wait"> {/* Use mode="wait" for smoother transitions */}
                    {/* --- Dashboard View --- */}
                    {activeTab === "dashboard" && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold mb-2">Welcome back, {user.name.split(' ')[0]}!</h1>
                            <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"} text-sm`}>Here's your progress overview.</p>

                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`p-4 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Habits</h3>
                                    <p className="text-2xl font-semibold">{stats.totalHabits}</p>
                                </motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className={`p-4 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completed Today</h3>
                                    <p className="text-2xl font-semibold">{stats.completedToday} <span className="text-base">/ {stats.totalHabits}</span></p>
                                </motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`p-4 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Longest Streak</h3>
                                    <p className="text-2xl font-semibold">🔥 {stats.longestStreak} <span className="text-base">days</span></p>
                                </motion.div>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className={`p-4 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Overall Progress</h3>
                                     <div className="flex items-center space-x-2">
                                         <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                                             <motion.div
                                                 className="bg-green-500 h-full"
                                                 initial={{ width: 0 }}
                                                 animate={{ width: `${stats.overallCompletionRate}%` }}
                                                 transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                                              />
                                         </div>
                                         <span className="text-sm font-semibold">{stats.overallCompletionRate}%</span>
                                     </div>
                                </motion.div>
                            </div>

                             {/* Insights Section (Simple) */}
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className={`mb-8 p-5 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                 <h2 className="text-lg font-semibold mb-3 flex items-center"><FiAward className="mr-2 text-yellow-500"/> Quick Insights</h2>
                                 <div className="text-sm space-y-1">
                                     <p>🌟 Your longest streak is <span className="font-semibold">{stats.longestStreak} days</span>! Keep it up!</p>
                                     {/* Add more dynamic insights based on stats if needed */}
                                     <p>💡 Focus on completing your daily habits to build consistency.</p>
                                      <p>📊 Check the <button onClick={()=> setActiveTab('stats')} className="text-blue-500 hover:underline">Stats</button> tab for detailed charts.</p>
                                 </div>
                             </motion.div>


                            {/* Today's Habits */}
                            <h2 className="text-xl font-semibold mb-4">Today's Habits</h2>
                             {habits.filter(h => h.frequency === 'daily').length > 0 ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     <AnimatePresence>
                                         {habits.filter(h => h.frequency === 'daily').map((habit) => ( // Filter for daily habits here
                                             <HabitCard key={habit.id} habit={habit} onComplete={handleCompleteHabit} darkMode={darkMode} />
                                         ))}
                                     </AnimatePresence>
                                 </div>
                             ) : (
                                 <p className={`text-center p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} text-gray-500 dark:text-gray-400`}>No daily habits added yet. Go to the <button onClick={()=> setActiveTab('habits')} className="text-blue-500 hover:underline">Habits</button> tab to add some!</p>
                             )}

                             {/* Weekly Habits (Optional Section) */}
                             {habits.filter(h => h.frequency === 'weekly').length > 0 && (
                                 <>
                                     <h2 className="text-xl font-semibold mt-8 mb-4">This Week's Habits</h2>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                         <AnimatePresence>
                                             {habits.filter(h => h.frequency === 'weekly').map((habit) => (
                                                 <HabitCard key={habit.id} habit={habit} onComplete={handleCompleteHabit} darkMode={darkMode} />
                                             ))}
                                         </AnimatePresence>
                                     </div>
                                 </>
                             )}
                        </motion.div>
                    )}

                    {/* --- Stats View --- */}
                    {activeTab === "stats" && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold mb-6">Your Statistics</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Habit Consistency Chart */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center"><FiBarChart2 className="mr-2 text-green-500"/> Habit Consistency (Demo)</h3>
                                    {stats.consistencyData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={stats.consistencyData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                                 <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4B5563" : "#E5E7EB"}/>
                                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#4B5563' }} />
                                                <YAxis tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#4B5563' }} unit="%"/>
                                                <Tooltip
                                                     contentStyle={{ backgroundColor: darkMode ? '#374151' : '#ffffff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                                     itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }}
                                                     labelStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937', fontWeight: 'bold' }}
                                                 />
                                                <Bar dataKey="consistency" name="Consistency %" barSize={20}>
                                                      {stats.consistencyData.map((entry, index) => (
                                                            // <Cell key={`cell-${index}`} fill={entry.fillColor || '#16A34A'} /> // Use habit color or default
                                                            <Cell key={`cell-${index}`} fill={'#16A34A'} />
                                                      ))}
                                                 </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                     ) : (
                                         <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm text-center py-10`}>No habit data to display charts.</p>
                                     )}
                                     <p className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Consistency data is randomly generated for this demo.</p>
                                </motion.div>

                                {/* Streaks Overview (Placeholder/Simple) */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                    <h3 className="text-lg font-semibold mb-4">🔥 Streaks Overview</h3>
                                     {habits.filter(h => h.streak > 0).length > 0 ? (
                                         <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                             {habits.filter(h => h.streak > 0).sort((a,b) => b.streak - a.streak).map(habit => (
                                                 <li key={habit.id} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-700 pb-1">
                                                     <span>{habit.name}</span>
                                                     <span className="font-semibold">{habit.streak} days</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     ) : (
                                         <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm text-center py-4`}>No active streaks yet. Keep completing your habits!</p>
                                     )}
                                     <p className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Your longest streak ever is {stats.longestStreak} days.</p>
                                </motion.div>

                                {/* Calendar Heatmap Placeholder */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"} lg:col-span-2`}>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center"><FiCalendar className="mr-2 text-purple-500"/> Monthly Activity Heatmap (Demo)</h3>
                                    {renderCalendarHeatmap()}
                                    <p className={`mt-3 text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        This is a simplified heatmap representation with random data. Darker squares indicate more activity. Red outline marks today.
                                    </p>
                                </motion.div>

                            </div>
                        </motion.div>
                    )}

                    {/* --- Habits View --- */}
                    {activeTab === "habits" && (
                        <motion.div
                            key="habits"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                        <div className="flex justify-between items-center mb-6">
     <h1 className="text-2xl font-semibold">Manage Habits</h1>
     <button 
         onClick={openAddModal} 
         className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" 
     >
         <FiPlus className="mr-1 -ml-1" size={16}/> Add New Habit
     </button>
 </div>

                             {habits.length > 0 ? (
                                 <div className="space-y-4">
                                     {habits.map(habit => (
                                         <motion.div
                                             key={habit.id} layout
                                             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                                             className={`p-4 rounded-lg shadow-md flex items-center justify-between space-x-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                                         >
                                             <div className="flex items-center space-x-3 flex-grow">
                                                 <div className={`w-3 h-8 rounded-full ${habit.color}`}></div>
                                                 <div>
                                                      <p className="font-medium">{habit.name}</p>
                                                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                          Goal: {habit.goal} / {habit.frequency} | Category: {habit.category || 'N/A'}
                                                      </p>
                                                 </div>
                                             </div>
                                             <div className="flex space-x-2">
                                                 <button onClick={() => openEditModal(habit)} className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Edit Habit">
                                                     <FiEdit2 size={16}/>
                                                 </button>
                                                 <button
                                                     onClick={() => {
                                                          if (window.confirm(`Are you sure you want to delete "${habit.name}"? This cannot be undone.`)) {
                                                               setHabits(prev => prev.filter(h => h.id !== habit.id));
                                                          }
                                                     }}
                                                     className={`p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 dark:text-red-400`}
                                                     title="Delete Habit"
                                                  >
                                                     <FiTrash2 size={16}/>
                                                 </button>
                                             </div>
                                         </motion.div>
                                     ))}
                                 </div>
                             ) : (
                                <p className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} text-gray-500 dark:text-gray-400`}>You haven't added any habits yet. Click "Add New Habit" to get started!</p>
                             )}
                        </motion.div>
                    )}

                    {/* --- Settings View --- */}
                    {activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="mb-6">
                                <h1 className="text-2xl font-semibold tracking-tight flex items-center"><FiSettings className="mr-2"/> Settings</h1>
                                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-1 text-sm`}>
                                    Manage your preferences and account details.
                                </p>
                            </div>
                            <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    transition={{ delay: 0.1 }} 
    className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
>
    <h3 className="text-lg font-semibold mb-4">Appearance</h3>
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Theme</span>
        <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${darkMode ? 'bg-green-600' : 'bg-gray-300'} ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
            onClick={() => setDarkMode(!darkMode)}
            aria-pressed={darkMode}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
            <span className="sr-only">Use setting</span>
            <span className={`inline-block w-4 h-4 transform ${darkMode ? 'translate-x-6' : 'translate-x-1'} bg-white rounded-full transition-transform duration-300 ease-in-out shadow`} />
        </button>
    </div>
     <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
         Switch between light and dark mode. Your preference is saved locally.
     </p>
</motion.div>

                            {/* Profile Settings (Simulation) */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                <h3 className="text-lg font-semibold mb-4">Profile</h3>
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={user.avatar} alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover" />
                                            <div>
                                                <label htmlFor="userName" className="block text-sm font-medium mb-1">Name</label>
                                                <input
                                                    type="text" id="userName" defaultValue={user.name}
                                                    className={`w-full sm:w-64 px-3 py-2 rounded-md border text-sm ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300 text-gray-700'} cursor-not-allowed`}
                                                    placeholder="Your Name"
                                                    readOnly // Make read-only for this demo
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="userJoined" className="block text-sm font-medium mb-1">Joined Date</label>
                                            <input
                                                type="text" id="userJoined" value={`Joined on ${new Date(user.joinedDate).toLocaleDateString()}`}
                                                className={`w-full sm:w-64 px-3 py-2 rounded-md border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-500'} cursor-not-allowed`}
                                                readOnly
                                            />
                                        </div>
                                        <div className="pt-4 text-right">
                                        <button
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 cursor-not-allowed"
                                        disabled // Keep disabled attribute
                                        >
                                        Update Profile (Disabled)
                                        </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>User profile not loaded.</p>
                                )}
                            </motion.div>

                            {/* Notification Settings (Placeholder) */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                                <div className="space-y-3">
                                    {['Daily Reminders', 'Weekly Summary', 'Streak Milestones'].map(label => (
                                         <div key={label} className="flex items-center justify-between">
                                             <span className="text-sm font-medium">{label}</span>
                                             {/* Placeholder Toggle Switch */}
                                              <button
                                                  className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-not-allowed transition-colors duration-300 ease-in-out focus:outline-none ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
                                                  disabled aria-label={`${label} toggle (disabled)`}
                                               >
                                                  <span className={`inline-block w-4 h-4 transform translate-x-1 bg-white rounded-full transition-transform duration-300 ease-in-out shadow opacity-50`} />
                                              </button>
                                         </div>
                                    ))}
                                </div>
                                <p className={`mt-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Notification settings are placeholders and not functional in this demo.
                                </p>
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

             {/* Add/Edit Habit Modal */}
             <Modal isOpen={isAddEditModalOpen} onClose={closeModal} title={editingHabit ? 'Edit Habit' : 'Add New Habit'} darkMode={darkMode}>
                 <AddEditHabitForm
                     onSave={handleSaveHabit}
                     onClose={closeModal}
                     initialData={editingHabit}
                     darkMode={darkMode}
                 />
             </Modal>

            <Footer darkMode={darkMode} />
        </div>
    );
};

export default HabitTracker; // Export the single component

