import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import { Container, Row, Col, Form, Spinner, Alert, Card, Button, InputGroup } from "react-bootstrap";

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
    <Container className="block py-4">
      <h2 className="text-color text-center mb-4">My Friends ({friends.length})</h2>

      <Form className="mb-3">
        <InputGroup className="mx-auto" style={{ maxWidth: "500px" }}>
          <Form.Control
            type="text"
            placeholder="Search your friends by username or bio..."
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          {searchTerm && (
            <Button variant="outline-secondary" onClick={clearSearch}>
              ✕
            </Button>
          )}
        </InputGroup>
        {friends.length > 0 && (
          <div className="text-center text-muted mt-2">
            {searchTerm ? (
              <span>{filteredFriends.length} of {friends.length} friends</span>
            ) : (
              <span>{friends.length} total friends</span>
            )}
          </div>
        )}
      </Form>

      <div className="text-center mb-3">
        {renderStatusMessage()}
      </div>

      <Row className="justify-content-center">
        {filteredFriends.length > 0 && !error && filteredFriends.map(friend => (
          <Col
            key={friend.id}
            xs={12}
            sm={10}
            md={8}
            lg={6}
            className="mb-3"
          >
            <Card onClick={() => handleUserClick(friend.id)} className="friend-card p-2" style={{ cursor: "pointer" }}>
              <Card.Body className="d-flex align-items-center">
                <img
                  src={friend.imageUrl || getDefaultProfileImage()}
                  alt={`${friend.username || friend.displayName}'s profile`}
                  className="me-3 rounded-circle"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = getDefaultProfileImage();
                  }}
                />
                <div className="flex-grow-1">
                  <Card.Title className="mb-1">{friend.username || friend.displayName}</Card.Title>
                  {friend.bio && <Card.Text className="mb-1 text-muted" style={{ fontSize: "0.9rem" }}>{friend.bio}</Card.Text>}
                  {getRelationshipBadge(friend.relationship)}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {/* Empty state when no search results */}
        {searchTerm && filteredFriends.length === 0 && friends.length > 0 && (
          <Col xs={12} className="text-center text-muted py-4">
            <p>No friends match your search criteria.</p>
            <p>Try a different search term or browse all your friends.</p>
          </Col>
        )}
      </Row>
    </Container>
  );

};

export default MyFriends;
