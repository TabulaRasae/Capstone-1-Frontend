import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import "./CSS/VoteFormStyles.css";
import { Container, Row, Col, Form, Spinner, Alert, Card, Button } from "react-bootstrap";

const VoteForm = ({ poll, user, onVoteSubmitted }) => {
  const [rankedOptions, setRankedOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  if (success) {
    return (
      <div className="vote-form-container">
        <div className="success-message">
          <h3>✓ Vote submitted successfully!</h3>
          <p>Thank you for participating in this poll.</p>
          {!user && (
            <p className="anonymous-note">Your vote was submitted anonymously.</p>
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
      
      {!user && poll.allowAnonymous && (
        <div className="anonymous-voting-notice">
          <p>🔓 You are voting anonymously</p>
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
        <Button
          variant="secondary"
          onClick={handleUndo}
          disabled={rankedOptions.length === 0 || submitting}
          className="undo-btn"
        >
          ↶ Undo Last Selection
        </Button>
        
        <Button
          variant="danger"
          onClick={resetVote}
          disabled={rankedOptions.length === 0 || submitting}
          className="reset-btn"
        >
          🗑️ Reset All
        </Button>
        
        <Button
          variant="secondary"
          onClick={submitVote}
          disabled={submitting || rankedOptions.length === 0}
          className="submit-vote-btn"
        >
          {submitting ? "Submitting..." : `Submit Vote (${rankedOptions.length} ranked)`}
        </Button>
      </div>
    </div>
  );
};

export default VoteForm;