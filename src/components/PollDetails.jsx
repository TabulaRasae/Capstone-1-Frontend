import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import RestrictedAccess from "./RestrictedAccess";
import VoteForm from "./VoteForm";
import IRVResults from "./IRVResults";
import { Button, Row, Col } from "react-bootstrap";

const PollDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [result, setResult] = useState(null);
  const [ballotCount, setBallotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [userBallot, setUserBallot] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUserBallot = useCallback(
    async (currentPoll) => {
      if (!user || currentPoll?.allowAnonymous) {
        setUserBallot(null);
        setHasVoted(false);
        return;
      }

      try {
        const ballotResp = await axios.get(
          `${API_URL}/api/polls/${id}/my-ballot`,
          { headers: getAuthHeaders() }
        );

        setUserBallot(ballotResp.data);
        setHasVoted(true);
        setVoteSubmitted(true);
        setShowResults(true);
      } catch (ballotErr) {
        if (ballotErr.response?.status === 404) {
          setUserBallot(null);
          setHasVoted(false);
        } else {
          console.error("Error fetching user ballot:", ballotErr);
        }
      }
    },
    [id, user]
  );

  const loadPoll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setVoteSubmitted(false);
      setHasVoted(false);
      setUserBallot(null);

      const response = await axios.get(`${API_URL}/api/polls/${id}`, {
        headers: getAuthHeaders(),
      });

      const pollData = response.data;
      pollData.pollOptions = pollData.pollOptions || pollData.PollOptions || [];

      setPoll(pollData);
      setResult(pollData.result || null);
      const totalVotes = pollData.ballotCount ?? pollData.result?.totalBallots ?? 0;
      setBallotCount(totalVotes);

      const pollEnded =
        pollData.status === "closed" ||
        (pollData.endAt && new Date(pollData.endAt) <= new Date());
      if (pollEnded) {
        setShowResults(true);
      }

      await fetchUserBallot(pollData);

      // Fallback: if no stored result came back, fetch from results endpoint to populate charts
      if (!pollData.result) {
        try {
          const resultsResp = await axios.get(`${API_URL}/api/polls/${id}/results`, {
            headers: getAuthHeaders(),
          });
          if (resultsResp.data?.result || resultsResp.data?.PollResult) {
            const resolvedResult = resultsResp.data.result || resultsResp.data.PollResult;
            setResult(resolvedResult);
            setBallotCount(resolvedResult.totalBallots || 0);
          }
        } catch (resultsErr) {
          console.error("Error fetching poll results directly:", resultsErr);
        }
      }
    } catch (err) {
      console.error("Error fetching poll:", err);
      if (err.response?.status === 403) {
        setError("restricted");
        setRequiresLogin(err.response.data.requiresLogin || false);
      } else if (err.response?.status === 404) {
        setError("Poll not found");
      } else {
        setError("Failed to load poll");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchUserBallot, id]);

  useEffect(() => {
    if (id) {
      loadPoll();
    }
  }, [id, loadPoll]);

  useEffect(() => {
    if (!poll?.endAt) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(poll.endAt);
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft("Poll ended");
        setShowResults(true);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [poll?.endAt]);

  const handleVoteSubmitted = async () => {
    setVoteSubmitted(true);
    await loadPoll();
    setShowResults(true);
  };

  const isPollActive =
    poll?.status === "published" &&
    poll?.isActive !== false &&
    (poll?.endAt ? new Date(poll.endAt) > new Date() : true);

  const hasNonRepeatVote = !poll?.allowAnonymous && hasVoted;
  const canVote = poll?.permissions?.canVote && isPollActive && !hasNonRepeatVote;
  const shouldShowResults = !isPollActive || showResults || voteSubmitted;
  const hasResultData =
    !!result &&
    ((result.PollResultValues && result.PollResultValues.length > 0) ||
      (result.pollResultValues && result.pollResultValues.length > 0));
  const totalVotes = result?.totalBallots ?? ballotCount ?? 0;

  if (loading) {
    return (
      <div className="poll-details-container">
        <div className="loading-spinner">Loading poll...</div>
      </div>
    );
  }

  if (error === "restricted") {
    return <RestrictedAccess requiresLogin={requiresLogin} />;
  }

  if (error) {
    return (
      <div className="poll-details-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/polls")} className="back-btn">
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-details-container">
        <div className="error-message">
          <h2>Poll not found</h2>
          <button onClick={() => navigate("/polls")} className="back-btn">
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  if (!poll.pollOptions || poll.pollOptions.length === 0) {
    return (
      <div className="poll-details-container">
        <div className="error-message">
          <h2>Invalid Poll</h2>
          <p>This poll has no options available.</p>
          <button onClick={() => navigate("/polls")} className="back-btn">
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-details-container">
      <div className="poll-header">
        <Button
          variant="secondary"
          onClick={() => navigate("/polls")}
          className="but-color"
        >
          ← Back to Polls
        </Button>

        <div className="poll-meta">
          {poll.creator && (
            <Row className="justify-content-center text-center mb-4">
              <Col xs="12" md="auto">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <img
                    src={
                      poll.creator.imageUrl ||
                      "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
                    }
                    alt={poll.creator.username}
                    style={{
                      width: "160px",
                      height: "160px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #e1e8ed",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <div className="text-color" style={{ fontWeight: "500" }}>
                    by @{poll.creator.username}
                  </div>
                </div>
              </Col>
            </Row>
          )}

          <div className="poll-restrictions">
            {poll.viewRestriction !== "public" && (
              <span className="restriction-badge view">
                👁️ {poll.viewRestriction} view
              </span>
            )}
            {poll.voteRestriction !== "public" && (
              <span className="restriction-badge vote">
                🗳️ {poll.voteRestriction} vote
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="poll-content">
        <h1 className="poll-title">{poll.title}</h1>

        {poll.description && (
          <p className="poll-description">{poll.description}</p>
        )}

        <div className="poll-status">
          {poll.endAt && (
            <div className={`poll-timer ${!isPollActive ? "ended" : ""}`}>
              {isPollActive ? `⏰ Time left: ${timeLeft}` : "⏰ Poll ended"}
            </div>
          )}

          <div className="poll-info">
            <p>📊 {totalVotes} votes cast</p>
            <p>
              <strong>Anonymous voting:</strong>{" "}
              {poll.allowAnonymous ? "Allowed" : "Not allowed"}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(poll.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Created by:</strong>{" "}
              {poll.creator?.username || "Unknown"}
            </p>
          </div>

          {canVote && (
            <VoteForm
              poll={poll}
              user={user}
              onVoteSubmitted={handleVoteSubmitted}
              hasVoted={hasNonRepeatVote}
            />
          )}

          {!canVote && !shouldShowResults && (
            <div className="voting-disabled">
              <p>
                {!user
                  ? "Please log in to vote"
                  : !poll.permissions?.canVote
                    ? "You don't have permission to vote on this poll"
                    : !isPollActive
                      ? "This poll has ended"
                      : "You have already voted on this poll"}
              </p>
              {!isPollActive || voteSubmitted ? (
                <button
                  onClick={() => setShowResults(true)}
                  className="show-results-btn"
                >
                  Show Results
                </button>
              ) : null}
            </div>
          )}

          {hasResultData && !shouldShowResults && (
            <div className="text-center my-3">
              <Button variant="outline-primary" onClick={() => setShowResults(true)}>
                Show Results
              </Button>
            </div>
          )}

          {shouldShowResults && result && (
            <div className="results-section">
              <h3>Results</h3>
              {totalVotes === 0 ? (
                <p>No ballots have been submitted yet.</p>
              ) : (
                <IRVResults poll={poll} result={result} />
              )}

              {canVote && isPollActive && (
                <Button
                  variant="secondary"
                  onClick={() => setShowResults(false)}
                  className="but-color"
                >
                  Back to Voting
                </Button>
              )}
            </div>
          )}

          {userBallot && userBallot.BallotRankings && (
            <div className="user-vote-section">
              <h4>Your Vote:</h4>
              <div className="user-rankings">
                {userBallot.BallotRankings.sort(
                  (a, b) => a.rank - b.rank
                ).map((ranking) => (
                  <div key={ranking.id} className="user-ranking">
                    <span className="rank-number">{ranking.rank}.</span>
                    <span className="rank-option">
                      {ranking.PollOption?.text || "Unknown option"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetails;
