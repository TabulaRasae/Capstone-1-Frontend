import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../shared";
import { Container, Form, InputGroup, Button, Row, Col, Card, Spinner } from "react-bootstrap";

const PublicUserFinder = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const response = await axios.get(
          `${API_URL}/api/polls/search/users?q=${encodeURIComponent(searchTerm)}`,
          { headers: getAuthHeaders() }
        );

        // Filter out the current user from results
        const filteredResults = response.data.filter(
          searchUser => user ? searchUser.id !== user.id : true
        );

        setSearchResults(filteredResults);
        setError(null);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
        setError("Failed to search users. Please try again.");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  const handleUserClick = (userId) => {
    if (user && userId === user.id) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to render status message
  const renderStatusMessage = () => {
    if (isSearching) {
      return <p className="status-message">Searching...</p>;
    }

    if (searchTerm.length > 0 && searchTerm.length < 2) {
      return <p className="status-message">Type at least 2 characters to search</p>;
    }

    if (!hasSearched && searchTerm.length === 0) {
      return <p className="status-message">Start typing to find users</p>;
    }

    if (hasSearched && searchResults.length === 0 && searchTerm.length >= 2 && !error) {
      return <p className="status-message">No users found.</p>;
    }

    if (error) {
      return <p className="status-message error-message">{error}</p>;
    }

    // Return empty paragraph to maintain space
    return <p className="status-message">&nbsp;</p>;
  };

  return (
    <Container className="block py-4">
      <h2 className="text-color text-center mb-4">Find Users</h2>

      <Form className="mb-3">
        <InputGroup className="mx-auto" style={{ maxWidth: "500px" }}>
          <Form.Control
            type="text"
            placeholder="Search users by username..."
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
        </InputGroup>
      </Form>

      <div className="text-center mb-3">
        {renderStatusMessage()}
      </div>

      <Row className="justify-content-center">
        {searchResults.length > 0 && !error && searchResults.map(searchUser => (
          <Col
            key={searchUser.id}
            xs={12}
            sm={10}
            md={8}
            lg={6}
            className="mb-3"
          >
            <Card
              className="poll-card"
              onClick={() => handleUserClick(searchUser.id)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body className="d-flex align-items-start">
                <img
                  src={
                    searchUser.imageUrl ||
                    "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
                  }
                  alt={`${searchUser.username}'s profile`}
                  className="me-3 rounded-circle"
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <Card.Title className="poll-title mb-1">{searchUser.username}</Card.Title>
                  {searchUser.bio && (
                    <Card.Text className="user-bio text-muted" style={{ fontSize: "14px" }}>
                      {searchUser.bio}
                    </Card.Text>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );

};

export default PublicUserFinder;
