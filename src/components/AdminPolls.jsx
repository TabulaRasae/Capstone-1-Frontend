import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import { useNavigate } from "react-router-dom";

const AdminPolls = ({ user }) => {
  const [polls, setPolls] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!user) {
      setError("Please log in to access admin features");
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    fetchPolls();
  }, [user]);

  const fetchPolls = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/polls`, {
        headers: getAuthHeaders()
      });
      setPolls(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching polls:", error);
      if (error.response?.status === 403) {
        setError("Access denied. Only users with admin privileges can view this page.");
      } else {
        setError("Failed to fetch polls. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePoll = async (pollId, currentActiveStatus) => {
    const action = currentActiveStatus ? "disable" : "enable";
    const confirmMessage = `Are you sure you want to ${action} this poll? ${!currentActiveStatus ? '' : 'This will prevent new votes.'}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setProcessing(pollId);
      const response = await axios.patch(`${API_URL}/api/admin/polls/${pollId}/disable`, {}, {
        headers: getAuthHeaders()
      });
      
      setPolls(prev => prev.map(poll => 
        poll.id === pollId ? { ...poll, isActive: response.data.isActive } : poll
      ));
      
      alert(response.data.message);
      
    } catch (error) {
      console.error("Error updating poll status:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert("Failed to update poll status: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleDeletePoll = async (pollId, pollTitle) => {
    const confirmMessage = `Are you sure you want to PERMANENTLY DELETE the poll "${pollTitle}"? This action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    const doubleConfirm = window.prompt(
      `Type "DELETE" to confirm permanent deletion of poll "${pollTitle}"`
    );
    
    if (doubleConfirm !== "DELETE") {
      alert("Deletion cancelled.");
      return;
    }

    try {
      setProcessing(pollId);
      const response = await axios.delete(`${API_URL}/api/admin/polls/${pollId}`, {
        headers: getAuthHeaders()
      });
      
      setPolls(prev => prev.filter(poll => poll.id !== pollId));
      
      alert(response.data.message);
      
    } catch (error) {
      console.error("Error deleting poll:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Admin privileges required.");
      } else {
        alert("Failed to delete poll: " + (error.response?.data?.error || error.message));
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleViewPoll = (pollId) => {
    navigate(`/polls/${pollId}`);
  };

  const filteredPolls = polls
    .filter((poll) => {
      const titleMatch = poll.title?.toLowerCase().includes(search.toLowerCase());
      const creatorMatch = poll.creator?.username?.toLowerCase().includes(search.toLowerCase());
      return titleMatch || creatorMatch;
    })
    .filter((poll) => {
      switch (filter) {
        case "active":
          return poll.isActive && poll.status === "published";
        case "disabled":
          return !poll.isActive;
        case "draft":
          return poll.status === "draft";
        case "published":
          return poll.status === "published";
        case "closed":
          return poll.status === "closed";
        default:
          return true;
      }
    });

  const getStats = () => {
    const total = polls.length;
    const active = polls.filter(p => p.isActive && p.status === "published").length;
    const disabled = polls.filter(p => !p.isActive).length;
    const drafts = polls.filter(p => p.status === "draft").length;
    const published = polls.filter(p => p.status === "published").length;
    
    return { total, active, disabled, drafts, published };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="admin-polls-page">
        <div className="loading-container">
          <h2>Admin Panel - Poll Management</h2>
          <p>Loading polls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-polls-page">
        <div className="error-container">
          <h2>Admin Panel - Poll Management</h2>
          <div className="error-message">
            <p>{error}</p>
          </div>
          <button onClick={() => navigate("/polls")} className="back-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-polls-page">
      <div className="admin-header">
        <h2>Admin Panel - Poll Management</h2>
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Polls</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.disabled}</span>
            <span className="stat-label">Disabled</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.drafts}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
      </div>
      
      <div className="filters-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search polls by title or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button 
              onClick={() => setSearch("")} 
              className="clear-search-btn"
            >
              Clear
            </button>
          )}
        </div>

        <div className="filter-buttons">
          {["all", "active", "disabled", "draft", "published", "closed"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`filter-btn ${filter === filterType ? 'active' : ''}`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="polls-list">
        {filteredPolls.length === 0 ? (
          <div className="no-results">
            <p>No polls found matching your criteria.</p>
          </div>
        ) : (
          <div className="polls-grid">
            {filteredPolls.map((poll) => (
              <div
                key={poll.id}
                className={`poll-card ${!poll.isActive ? 'disabled' : ''} ${poll.status}`}
              >
                <div className="poll-header">
                  <h3 className="poll-title">{poll.title}</h3>
                  <div className="poll-badges">
                    <span className={`status-badge ${poll.status}`}>
                      {poll.status}
                    </span>
                    {!poll.isActive && (
                      <span className="disabled-badge">Disabled</span>
                    )}
                  </div>
                </div>

                <div className="poll-info">
                  <p><strong>Creator:</strong> @{poll.creator?.username || 'Unknown'}</p>
                  <p><strong>Votes:</strong> {poll.ballots?.length || 0}</p>
                  <p><strong>Created:</strong> {new Date(poll.createdAt).toLocaleDateString()}</p>
                  {poll.endAt && (
                    <p><strong>Ends:</strong> {new Date(poll.endAt).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="poll-actions">
                  <button
                    onClick={() => handleViewPoll(poll.id)}
                    className="view-btn"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleDisablePoll(poll.id, poll.isActive)}
                    disabled={processing === poll.id}
                    className={`toggle-btn ${poll.isActive ? 'disable' : 'enable'}`}
                  >
                    {processing === poll.id ? 'Processing...' : 
                     poll.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <button
                    onClick={() => handleDeletePoll(poll.id, poll.title)}
                    disabled={processing === poll.id}
                    className="delete-btn"
                  >
                    {processing === poll.id ? 'Processing...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredPolls.length > 0 && (
        <div className="results-footer">
          <p>Showing {filteredPolls.length} of {polls.length} polls</p>
        </div>
      )}
    </div>
  );
};

export default AdminPolls;
