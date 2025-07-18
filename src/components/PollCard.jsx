import React, { useState, useEffect } from 'react';
import './CSS/PollCardStyles.css';

const PollCard = ({ poll, onClick }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!poll.endAt) {
        setTimeLeft('No end date');
        return;
      }

      const now = new Date();
      const endTime = new Date(poll.endAt); 
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m left`);
        } else {
          setTimeLeft('Less than 1m left');
        }
      } else {
        setTimeLeft('Poll ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); 

    return () => clearInterval(timer);
  }, [poll.endAt]); 

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${poll.creator_id}`);
        if (response.ok) {
          const userData = await response.json();
          setCreator(userData);
        } else {
          console.error('Failed to fetch creator:', response.status);
          setCreator({ username: 'Unknown' });
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
        setCreator({ username: 'Unknown' }); 
      }
    };

    if (poll.creator_id) {
      fetchCreator();
    }
  }, [poll.creator_id]);

  const isPollActive = poll.endAt ? new Date(poll.endAt) > new Date() : true; 

return (
    <div 
      className={`poll-card ${!isPollActive ? 'poll-ended' : ''}`}
      onClick={onClick} 
      style={{ cursor: 'pointer' }} 
    >
      <div className="poll-header">
        <h3 className="poll-title">{poll.title}</h3>
        <div className="poll-meta">
          <span className="poll-creator">
            by {creator ? `@${creator.username}` : 'Loading...'}
          </span>
          <span className={`poll-time ${!isPollActive ? 'ended' : ''}`}>
            {timeLeft}
          </span>
        </div>
      </div>
      
      {poll.description && (
        <div className="poll-description">
          <p>{poll.description}</p>
        </div>
      )}
      
      {!isPollActive && (
        <div className="poll-status">
          <span className="status-badge">Ended</span>
        </div>
      )}
    </div>
  );
};

export default PollCard;