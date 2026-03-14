import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from "chart.js";
import type { Note } from "@/lib/db";
import { analyzeSentiment, type Sentiment } from "@/lib/sentiment";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const COLORS: Record<Sentiment, string> = {
  positive: "rgba(74, 222, 128, 0.7)",
  calm: "rgba(96, 165, 250, 0.7)",
  creative: "rgba(251, 146, 60, 0.7)",
  melancholy: "rgba(148, 163, 184, 0.7)",
  neutral: "rgba(100, 116, 139, 0.5)",
};

interface Props { notes: Note[]; }

export const AnalyticsDashboard: React.FC<Props> = ({ notes }) => {
  const { weekData, monthData, twoMonthData } = useMemo(() => {
    const now = Date.now();
    const week = 7 * 86400000;
    const month = 30 * 86400000;

    const bucket = (ms: number) => {
      const counts: Record<Sentiment, number> = { positive: 0, calm: 0, creative: 0, melancholy: 0, neutral: 0 };
      notes.filter(n => now - n.updatedAt < ms).forEach(n => {
        const s = analyzeSentiment(n.content);
        counts[s]++;
      });
      return counts;
    };

    return { weekData: bucket(week), monthData: bucket(month), twoMonthData: bucket(2 * month) };
  }, [notes]);

  const makeChart = (data: Record<Sentiment, number>, label: string) => ({
    labels: Object.keys(data).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      label,
      data: Object.values(data),
      backgroundColor: Object.keys(data).map(s => COLORS[s as Sentiment]),
      borderRadius: 8,
      borderSkipped: false as const,
    }],
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "hsl(215, 12%, 50%)", font: { size: 11 } } },
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "hsl(215, 12%, 50%)", font: { size: 11 } } },
    },
  };

  const totalNotes = notes.length;
  const totalWords = notes.reduce((a, n) => a + n.wordCount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Emotion Stats</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalNotes}</p>
          <p className="text-xs text-muted-foreground">Total Notes</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalWords.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Words</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{notes.filter(n => n.type === "future-letter").length}</p>
          <p className="text-xs text-muted-foreground">Time Capsules</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { data: weekData, label: "Last 7 Days" },
          { data: monthData, label: "Last 30 Days" },
          { data: twoMonthData, label: "Last 60 Days" },
        ].map(({ data, label }) => (
          <div key={label} className="glass rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">{label}</h3>
            <div className="h-48">
              <Bar data={makeChart(data, label)} options={options} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
