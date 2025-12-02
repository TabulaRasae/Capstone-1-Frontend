import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IRVResults = ({ poll, result }) => {
  const options = poll?.pollOptions || poll?.PollOptions || [];
  const normalized = useMemo(() => {
    const values = result?.PollResultValues || result?.pollResultValues || [];
    const positionMap = new Map(options.map((opt) => [opt.id, opt.position || 0]));

    return values.map((val) => {
      const optionId = val.option_id || val.optionId || val?.PollOption?.id;
      const optionText =
        val.optionText ||
        val?.PollOption?.text ||
        options.find((opt) => opt.id === optionId)?.text ||
        `Option ${optionId}`;

      return {
        id: optionId,
        text: optionText,
        votes: val.votes || 0,
        position: val.tieBreakerPosition ?? positionMap.get(optionId) ?? 0,
      };
    });
  }, [options, result]);

  const winnerId = result?.winnerOptionId || null;
  const isDraw = result?.isDraw || false;
  const tieBreakApplied = result?.tieBreakApplied || false;

  const sorted = [...normalized].sort((a, b) => {
    if (winnerId) {
      if (a.id === winnerId) return -1;
      if (b.id === winnerId) return 1;
    }
    if (b.votes === a.votes) {
      return (a.position || 0) - (b.position || 0);
    }
    return b.votes - a.votes;
  });

  const labels = sorted.map((entry) => entry.text);
  const votesData = sorted.map((entry) => entry.votes);

  const data = {
    labels,
    datasets: [
      {
        label: "Votes (last counted round)",
        data: votesData,
        backgroundColor: sorted.map((entry) => {
          if (isDraw) return "#FF9800";
          return entry.id === winnerId ? "#EB5E28" : "#CCC5B9";
        }),
        borderColor: "#252422",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = result?.totalBallots || 0;
            const count = context.parsed.x;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            return `${count} votes (${percentage}%)`;
          },
        },
      },
    },
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const getWinnerText = () => {
    if (!result) return "No data available";
    if (isDraw && !winnerId) return "Draw (resolved by position)";

    const winner =
      options.find((opt) => opt.id === winnerId)?.text ||
      sorted.find((entry) => entry.id === winnerId)?.text;

    return winner || "No winner yet";
  };

  if (!result || normalized.length === 0) {
    return <p>No results available yet.</p>;
  }

  return (
    <div className="irv-results">
      <h3>Current Winner: {getWinnerText()}</h3>
      <p>Total ballots: {result.totalBallots ?? 0}</p>
      {tieBreakApplied && (
        <p className="draw-notice" style={{ color: "#FF9800", fontWeight: "bold" }}>
          Tie breaker applied using original option order.
        </p>
      )}
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

export default IRVResults;
