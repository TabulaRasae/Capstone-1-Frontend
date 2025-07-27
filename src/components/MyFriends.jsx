import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import './CSS/PublicUserFinderStyles.css';

const MyFriends = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API_URL}/api/users/${user.id}`,
        { headers: getAuthHeaders() }
      );
      
      console.log("Full user response:", response.data);
      
      const followersData = response.data.followers || [];
      const followingData = response.data.following || [];
      
      console.log("Followers data:", followersData);
      console.log("Following data:", followingData);
      
      const followers = followersData.map(f => {
        const followerUser = f.follower || f.User || f.user || f;
        console.log("Processing follower:", followerUser);
        return followerUser;
      }).filter(f => f && f.id && f.id !== user.id);
      
      const following = followingData.map(f => {
        const followingUser = f.following || f.User || f.user || f;
        console.log("Processing following:", followingUser);
        return followingUser;
      }).filter(f => f && f.id && f.id !== user.id);
      
      console.log("Processed followers:", followers);
      console.log("Processed following:", following);

      const friendsMap = new Map();
      
      followers.forEach(friend => {
        if (friend && friend.id) {
          friendsMap.set(friend.id, { 
            ...friend, 
            relationship: 'follower',
            displayName: friend.username || friend.name || `User ${friend.id}`
          });
        }
      });
      
      following.forEach(friend => {
        if (friend && friend.id) {
          if (friendsMap.has(friend.id)) {
            const existingFriend = friendsMap.get(friend.id);
            friendsMap.set(friend.id, { 
              ...existingFriend, 
              relationship: 'mutual' 
            });
          } else {
            friendsMap.set(friend.id, { 
              ...friend, 
              relationship: 'following',
              displayName: friend.username || friend.name || `User ${friend.id}`
            });
          }
        }
      });
      
      const finalFriends = Array.from(friendsMap.values());
      console.log("Final friends array:", finalFriends);
      
      setFriends(finalFriends);
      setError(null);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setError("Failed to load friends. Please try again.");
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredFriends = friends.filter(friend => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const username = (friend.username || friend.displayName || '').toLowerCase();
    const bio = (friend.bio || '').toLowerCase();
    
    return username.includes(searchLower) || bio.includes(searchLower);
  });

  const renderStatusMessage = () => {
    if (isLoading) {
      return <p className="status-message">Loading friends...</p>;
    }
    
    if (!user) {
      return <p className="status-message">Please log in to view your friends</p>;
    }
    
    if (error) {
      return <p className="status-message error-message">{error}</p>;
    }
    
    if (friends.length === 0) {
      return (
        <p className="status-message">
          You haven't connected with any users yet. Use the "Find Users" page to discover and follow other users!
        </p>
      );
    }
    
    if (searchTerm && filteredFriends.length === 0) {
      return (
        <p className="status-message">
          No friends found matching "{searchTerm}". 
          <button 
            className="clear-search-btn" 
            onClick={clearSearch}
            style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#1da1f2', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Clear search
          </button>
        </p>
      );
    }
    
    if (searchTerm && filteredFriends.length > 0) {
      return (
        <p className="status-message">
          Showing {filteredFriends.length} friend{filteredFriends.length === 1 ? '' : 's'} matching "{searchTerm}"
        </p>
      );
    }
    
    return <p className="status-message">Showing all {friends.length} friend{friends.length === 1 ? '' : 's'}</p>;
  };

  const getRelationshipBadge = (relationship) => {
    switch (relationship) {
      case 'mutual':
        return <span className="relationship-badge mutual">Mutual Follow</span>;
      case 'follower':
        return <span className="relationship-badge follower">Follows You</span>;
      case 'following':
        return <span className="relationship-badge following">You Follow</span>;
      default:
        return null;
    }
  };

  const getDefaultProfileImage = () => {
    return "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";
  };

  return (
    <div className="users-page">
      <div className="users-page-header">
        <h2>My Friends ({friends.length})</h2>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              className="search-input"
              type="text"
              placeholder="Search your friends by username or bio..."
              value={searchTerm}
              onChange={handleSearchInputChange}
            />
            {searchTerm && (
              <button 
                className="clear-search-button"
                onClick={clearSearch}
                type="button"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          {friends.length > 0 && (
            <div className="search-stats">
              {searchTerm ? (
                <span>
                  {filteredFriends.length} of {friends.length} friends
                </span>
              ) : (
                <span>{friends.length} total friends</span>
              )}
            </div>
          )}
        </div>
        
        <div className="status-container">
          {renderStatusMessage()}
        </div>
      </div>

      <div className="results-container">
        {filteredFriends.length > 0 && !error && (
          <ul className="user-list">
            {filteredFriends.map((friend) => (
              <li
                key={friend.id}
                className="user-card friend-card"
                onClick={() => handleUserClick(friend.id)}
              >
                <img 
                  src={friend.imageUrl || getDefaultProfileImage()} 
                  alt={`${friend.username || friend.displayName}'s profile`}
                  className="user-pfp" 
                  onError={(e) => {
                    e.target.src = getDefaultProfileImage();
                  }}
                />
                <div className="user-info">
                  <p className="user-name">{friend.username || friend.displayName}</p>
                  {friend.bio && <p className="user-bio">{friend.bio}</p>}
                  {getRelationshipBadge(friend.relationship)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Empty state when no search results */}
        {searchTerm && filteredFriends.length === 0 && friends.length > 0 && (
          <div className="empty-search-state">
            <p>No friends match your search criteria.</p>
            <p>Try a different search term or browse all your friends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFriends;