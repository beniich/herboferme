
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    TrendingDown,
    Users,
    MessageSquare,
    Star,
    ThumbsUp,
    Clock,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import { ExportButton } from '@/components/export/ExportButton';

export default function CitizenSatisfactionPage() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeRange]);

    // Donn  es factices pour d  monstration
    const satisfactionDistribution = [
        { name: 'Tr  s satisfait', value: 45, color: '#22c55e' },
        { name: 'Satisfait', value: 30, color: '#84cc16' },
        { name: 'Neutre', value: 15, color: '#eab308' },
        { name: 'Insatisfait', value: 7, color: '#f97316' },
        { name: 'Tr  s insatisfait', value: 3, color: '#ef4444' },
    ];

    const categoryRatings = [
        { category: 'Eau', rating: 4.2, max: 5 },
        { category: 'Routes', rating: 3.8, max: 5 },
        { category: 'D  chets', rating: 4.5, max: 5 },
        { category: '  lectricit  ', rating: 4.1, max: 5 },
        { category: '  clairage', rating: 3.9, max: 5 },
    ];

    const monthlyTrend = [
        { month: 'Jan', satisfied: 72, neutral: 18, unsatisfied: 10 },
        { month: 'F  v', satisfied: 75, neutral: 16, unsatisfied: 9 },
        { month: 'Mar', satisfied: 78, neutral: 15, unsatisfied: 7 },
        { month: 'Avr', satisfied: 80, neutral: 14, unsatisfied: 6 },
        { month: 'Mai', satisfied: 82, neutral: 13, unsatisfied: 5 },
        { month: 'Juin', satisfied: 85, neutral: 11, unsatisfied: 4 },
    ];

    const feedbackKeywords = [
        { word: 'rapide', count: 234, sentiment: 'positive' },
        { word: 'professionnel', count: 198, sentiment: 'positive' },
        { word: 'efficace', count: 176, sentiment: 'positive' },
        { word: 'lent', count: 87, sentiment: 'negative' },
        { word: 'excellent', count: 145, sentiment: 'positive' },
        { word: 'retard', count: 62, sentiment: 'negative' },
    ];

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Chargement des donn  es...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Satisfaction Citoyenne
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Mesure et analyse de la satisfaction des usagers
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-800"
                    >
                        <option value="7d">7 derniers jours</option>
                        <option value="30d">30 derniers jours</option>
                        <option value="90d">90 derniers jours</option>
                        <option value="1y">1 an</option>
                    </select>

                    <ExportButton
                        data={monthlyTrend}
                        columns={[
                            { header: 'Mois', key: 'month' },
                            { header: 'Satisfaits (%)', key: 'satisfied' },
                            { header: 'Neutres (%)', key: 'neutral' },
                            { header: 'Insatisfaits (%)', key: 'unsatisfied' },
                        ]}
                        filename="satisfaction-citoyenne"
                        title="Rapport de Satisfaction Citoyenne"
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Note Moyenne
                        </CardTitle>
                        <Star className="w-4 h-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">4.2/5</div>
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>+0.3 vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Taux de Satisfaction
                        </CardTitle>
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">85%</div>
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>+5% vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            R  ponses
                        </CardTitle>
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1,247</div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <Users className="w-4 h-4" />
                            <span>Ce mois</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Temps de R  ponse Moyen
                        </CardTitle>
                        <Clock className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">2.3h</div>
                        <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                            <TrendingDown className="w-4 h-4" />
                            <span>-15min vs mois dernier</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution de Satisfaction */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution de la Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={satisfactionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {satisfactionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/*   volution Mensuelle */}
                <Card>
                    <CardHeader>
                        <CardTitle>  volution de la Satisfaction</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="satisfied"
                                    stroke="#22c55e"
                                    name="Satisfaits"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="neutral"
                                    stroke="#eab308"
                                    name="Neutres"
                                    strokeWidth={2}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="unsatisfied"
                                    stroke="#ef4444"
                                    name="Insatisfaits"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Notes par Cat  gorie */}
                <Card>
                    <CardHeader>
                        <CardTitle>Satisfaction par Cat  gorie</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryRatings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Bar dataKey="rating" fill="#3b82f6" name="Note" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Radar Chart - Performance Multi-crit  res */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Multi-crit  res</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={categoryRatings}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="category" />
                                <PolarRadiusAxis domain={[0, 5]} />
                                <Radar
                                    name="Note"
                                    dataKey="rating"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Feedback Keywords */}
            <Card>
                <CardHeader>
                    <CardTitle>Mots-cl  s dans les Retours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {feedbackKeywords.map((keyword) => (
                            <div
                                key={keyword.word}
                                className={`px-4 py-2 rounded-full font-medium ${keyword.sentiment === 'positive'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                    }`}
                            >
                                {keyword.word} ({keyword.count})
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>Retours R  cents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            {
                                id: 1,
                                rating: 5,
                                comment: 'Excellent service, probl  me r  solu rapidement!',
                                category: 'Eau',
                                date: '2025-02-08',
                            },
                            {
                                id: 2,
                                rating: 4,
                                comment: 'Bonne prise en charge,   quipe professionnelle',
                                category: 'Routes',
                                date: '2025-02-08',
                            },
                            {
                                id: 3,
                                rating: 2,
                                comment: 'D  lai trop long, mais bon r  sultat final',
                                category: '  lectricit  ',
                                date: '2025-02-07',
                            },
                        ].map((feedback) => (
                            <div
                                key={feedback.id}
                                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < feedback.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-slate-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                            {feedback.category}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-500">{feedback.date}</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300">
                                    {feedback.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
