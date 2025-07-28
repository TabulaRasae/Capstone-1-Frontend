import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import "./CSS/VoteFormStyles.css";

const VoteForm = ({ poll, user, onVoteSubmitted }) => {
  const [rankedOptions, setRankedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [checkingVoteStatus, setCheckingVoteStatus] = useState(true);

  useEffect(() => {
    const checkIfUserHasVoted = () => {
      if (poll.allowAnonymous) {
        setCheckingVoteStatus(false);
        setHasVoted(false);
        return;
      }

      if (user && poll.ballots) {
        const userBallot = poll.ballots.find(ballot => ballot.user_id === user.id);
        if (userBallot) {
          setHasVoted(true);
        }
      }

      setCheckingVoteStatus(false);
    };

    if (poll) {
      checkIfUserHasVoted();
    }
  }, [poll, user]);

  const handleOptionClick = (option) => {
    const existingIndex = rankedOptions.findIndex(item => item.id === option.id);
    
    if (existingIndex !== -1) {
      return;
    }

    setRankedOptions(prev => [...prev, option]);
    setError(null);
  };

  const handleUndo = () => {
    if (rankedOptions.length > 0) {
      setRankedOptions(prev => prev.slice(0, -1));
    }
  };

  const getRankForOption = (optionId) => {
    const index = rankedOptions.findIndex(item => item.id === optionId);
    return index !== -1 ? index + 1 : null;
  };

  const isOptionRanked = (optionId) => {
    return rankedOptions.some(item => item.id === optionId);
  };

  const submitVote = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (hasVoted && !poll.allowAnonymous) {
        setError("You have already voted on this poll");
        return;
      }

      if (rankedOptions.length === 0) {
        setError("Please rank at least one option");
        return;
      }

      const rankingsArray = rankedOptions.map((option, index) => ({
        pollOptionId: option.id,
        rank: index + 1,
      }));

      if (rankedOptions.length < poll.pollOptions.length) {
        const confirmContinue = window.confirm(
          `You have ranked ${rankedOptions.length} out of ${poll.pollOptions.length} options. Do you want to submit your vote anyway?`
        );
        if (!confirmContinue) {
          setSubmitting(false);
          return;
        }
      }

      const voteData = {
        pollId: poll.id,
        userId: user ? user.id : null,
        rankings: rankingsArray,
      };

      const response = await axios.post(`${API_URL}/api/ballots`, voteData);
      
      setSuccess(true);
      setRankedOptions([]);

      if (!poll.allowAnonymous) {
        setHasVoted(true);
      }
      
      if (onVoteSubmitted) {
        onVoteSubmitted(response.data);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setError(error.response?.data?.error || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const resetVote = () => {
    setRankedOptions([]);
    setError(null);
  };

  if (checkingVoteStatus) {
    return (
      <div className="vote-form-container">
        <div className="loading-message">
          <p>Checking vote status...</p>
        </div>
      </div>
    );
  }

  if (hasVoted && !poll.allowAnonymous) {
    return (
      <div className="vote-form-container">
        <div className="already-voted-message">
          <h3>✓ You have already voted on this poll</h3>
          <p>Thank you for your participation!</p>
          <p className="vote-info">You can only vote once per poll when anonymous voting is disabled.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="vote-form-container">
        <div className="success-message">
          <h3>✓ Vote submitted successfully!</h3>
          <p>Thank you for participating in this poll.</p>
          {poll.allowAnonymous ? (
            <p className="anonymous-note">
              {user ? 
                "Your vote was submitted. You can vote again since anonymous voting is enabled." : 
                "Your vote was submitted anonymously. You can vote again."
              }
            </p>
          ) : (
            <p className="logged-in-note">Your vote has been recorded.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vote-form-container">
      <h3>Rank the Options</h3>
      <p className="voting-instructions">
        Click the options in order of preference. Your first click = 1st choice, second click = 2nd choice, etc.
      </p>
      
      {/* Show voting type notice */}
      {poll.allowAnonymous ? (
        <div className="anonymous-voting-notice">
          <p>🔓 Anonymous voting is enabled</p>
          <p className="small-text">
            {user ? 
              "You can vote multiple times on this poll" : 
              "You are voting anonymously and can vote multiple times"
            }
          </p>
        </div>
      ) : user ? (
        <div className="logged-in-voting-notice">
          <p>👤 You are voting as @{user.username}</p>
          <p className="small-text">You can only vote once on this poll</p>
        </div>
      ) : (
        <div className="login-required-notice">
          <p>🔒 Please log in to vote on this poll</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Current Rankings Display */}
      {rankedOptions.length > 0 && (
        <div className="current-rankings">
          <h4>Your Current Rankings:</h4>
          <ol className="ranking-list">
            {rankedOptions.map((option, index) => (
              <li key={option.id} className="ranking-item">
                <span className="rank-number">{index + 1}.</span>
                <span className="option-text">{option.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Options Grid */}
      <div className="options-grid">
        {poll.pollOptions
          .sort((a, b) => a.position - b.position)
          .map((option) => {
            const rank = getRankForOption(option.id);
            const isRanked = isOptionRanked(option.id);
            
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className={`vote-option-button ${isRanked ? 'ranked' : 'unranked'}`}
                disabled={submitting}
              >
                <div className="option-content">
                  <span className="option-text">{option.text}</span>
                  {rank && (
                    <span className="rank-badge">{rank}</span>
                  )}
                </div>
              </button>
            );
          })}
      </div>

      {/* Control Buttons */}
      <div className="vote-controls">
        <button
          onClick={handleUndo}
          disabled={rankedOptions.length === 0 || submitting}
          className="undo-btn"
        >
          ↶ Undo Last Selection
        </button>
        
        <button
          onClick={resetVote}
          disabled={rankedOptions.length === 0 || submitting}
          className="reset-btn"
        >
          🗑️ Reset All
        </button>
        
        <button
          onClick={submitVote}
          disabled={submitting || rankedOptions.length === 0}
          className="submit-vote-btn"
        >
          {submitting ? "Submitting..." : `Submit Vote (${rankedOptions.length} ranked)`}
        </button>
      </div>
    </div>
  );
};

export default VoteForm;