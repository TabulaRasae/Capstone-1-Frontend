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

const IRVResults = ({ poll }) => {
  const { winnerId, lastTallies, barOrder, isDraw } = useMemo(
    () => instantRunoff(poll),
    [poll]
  );

  const labels = barOrder.map(
    (id) => poll.pollOptions.find((o) => o.id === id)?.text || `#${id}`
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Votes (last round before elimination)",
        data: barOrder.map((id) => lastTallies[id] || 0),
        backgroundColor: barOrder.map((id) => {
          if (isDraw) return "#FF9800"; 
          return id === winnerId ? "#EB5E28" : "#CCC5B9";
        }),
        borderColor: "#252422",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    plugins: { 
      legend: { display: false }, 
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = poll.ballots?.length || 0;
            const percentage = total > 0 ? ((context.parsed.x / total) * 100).toFixed(1) : 0;
            return `${context.parsed.x} votes (${percentage}%)`;
          }
        }
      }
    },
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const getWinnerText = () => {
    if (isDraw) return "Draw";
    if (!winnerId) return "No data to display a current winner";
    return poll.pollOptions.find((o) => o.id === winnerId)?.text || "Unknown candidate";
  };

  function instantRunoff(poll) {
    if (!poll || !Array.isArray(poll.ballots) || poll.ballots.length === 0) {
      return { winnerId: null, lastTallies: {}, barOrder: [], isDraw: false };
    }

    const candidateIds = poll.pollOptions.map((o) => o.id);
    
    const ballots = poll.ballots
      .map((b) => {
        if (!b.ballotRankings || !Array.isArray(b.ballotRankings)) {
          return [];
        }
        return b.ballotRankings
          .sort((a, b) => a.rank - b.rank)
          .map((r) => r.option_id)
          .filter((id) => candidateIds.includes(id));
      })
      .filter((ballot) => ballot.length > 0);

    if (ballots.length === 0) {
      return { winnerId: null, lastTallies: {}, barOrder: [], isDraw: false };
    }

    let active = new Set(candidateIds);
    const lastTallies = {};
    let roundCount = 0;
    const maxRounds = candidateIds.length; 

    while (active.size > 1 && roundCount < maxRounds) {
      roundCount++;
      const roundCounts = Object.fromEntries([...active].map((id) => [id, 0]));

      for (const ballot of ballots) {
        const firstActive = ballot.find((id) => active.has(id));
        if (firstActive !== undefined) {
          roundCounts[firstActive] += 1;
        }
      }

      const total = Object.values(roundCounts).reduce((a, b) => a + b, 0);
      
      for (const [id, count] of Object.entries(roundCounts)) {
        if (count > total / 2) {
          return composeResult(parseInt(id, 10), lastTallies, roundCounts, false);
        }
      }

      const minVotes = Math.min(...Object.values(roundCounts));
      const lowestCandidates = Object.entries(roundCounts)
        .filter(([_, count]) => count === minVotes)
        .map(([id]) => parseInt(id, 10));

      if (lowestCandidates.length === active.size) {
        return composeResult(null, lastTallies, roundCounts, true);
      }

      const eliminated = lowestCandidates.sort()[0];
      lastTallies[eliminated] = roundCounts[eliminated];
      active.delete(eliminated);
    }

    if (active.size === 1) {
      const winnerId = [...active][0];
      const finalCounts = Object.fromEntries([...active].map((id) => [id, 0]));

      for (const ballot of ballots) {
        const firstActive = ballot.find((id) => active.has(id));
        if (firstActive !== undefined) {
          finalCounts[firstActive] += 1;
        }
      }
      
      return composeResult(winnerId, lastTallies, finalCounts, false);
    }

    return { winnerId: null, lastTallies, barOrder: [], isDraw: true };
  }

  function composeResult(winnerId, lastTallies, finalRoundCounts, isDraw) {
    Object.entries(finalRoundCounts).forEach(([id, count]) => {
      const numericId = parseInt(id, 10);
      if (lastTallies[numericId] == null) {
        lastTallies[numericId] = count;
      }
    });

    if (winnerId !== null && finalRoundCounts[winnerId] !== undefined) {
      lastTallies[winnerId] = finalRoundCounts[winnerId];
    }

    const barOrder = Object.keys(lastTallies)
      .map((id) => parseInt(id, 10))
      .sort((a, b) => {
        if (!isDraw) {
          if (a === winnerId) return -1;
          if (b === winnerId) return 1;
        }
        return (lastTallies[b] || 0) - (lastTallies[a] || 0);
      });

    return { winnerId: isDraw ? null : winnerId, lastTallies, barOrder, isDraw };
  }

  return (
    <div className="irv-results">
      <h3>Current Winner: {getWinnerText()}</h3>
      <p>Total ballots: {poll.ballots?.length ?? 0}</p>
      {isDraw && (
        <p className="draw-notice" style={{ color: "#FF9800", fontWeight: "bold" }}>
          Multiple candidates are tied with the same number of votes
        </p>
      )}
      {barOrder.length > 0 && <Bar data={data} options={options} />}
    </div>
  );
};

export default IRVResults;
