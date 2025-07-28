import React, { useState, useEffect } from "react";
import axios from "axios";
import PollCard from "./PollCard";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../shared";
import { Container, Row, Col, Form, Spinner, Alert, Card, Button } from "react-bootstrap";
import "./CSS/PollList.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const PollList = ({ user }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  console.log(user);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const duplicatePoll = async (pollToDuplicate) => {
    try {
      if (!user) {
        alert("Please log in to duplicate polls");
        return;
      }
      const draftPollData = {
        creator_id: user.id,
        title: `${pollToDuplicate.title} (Copy)`,
        description: pollToDuplicate.description || "",
        allowAnonymous: pollToDuplicate.allowAnonymous || false,
        status: "draft",
        viewRestriction: pollToDuplicate.viewRestriction || "public",
        voteRestriction: pollToDuplicate.voteRestriction || "public",
        customViewUsers: [], 
        customVoteUsers: [], 
        endAt: pollToDuplicate.endAt || null,
        pollOptions: (pollToDuplicate.pollOptions || pollToDuplicate.PollOptions || []).map((option, index) => ({
          text: option.text,
          position: index + 1,
        })),
      };
      console.log("Creating duplicate poll with data:", draftPollData);

      const response = await axios.post(`${API_URL}/api/polls`, draftPollData, {
        headers: getAuthHeaders()
      });

      const newDraftId = response.data.id;
      console.log("Draft created with ID:", newDraftId);

      navigate(`/edit-draft/${newDraftId}`);

    } catch (error) {
      console.error("Failed to duplicate poll:", error);
      if (error.response?.status === 401) {
        alert("Please log in to duplicate polls");
      } else {
        alert("Failed to duplicate poll: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleUserClick = (id) => {
    navigate(`/polls/${id}`);
  };

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await axios.get(`${API_URL}/api/polls`, { headers });
        
        const publishedPolls = response.data.filter(poll => poll.status === "published");
        
        setPolls(publishedPolls);
      } catch (err) {
        setError("Failed to fetch polls.");
        console.error("Error fetching polls:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPolls();
  }, []);

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading polls...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }

  const filteredPolls = polls.filter((poll) => {
    const titleMatch = poll.title?.toLowerCase().includes(search.toLowerCase());
    const descriptionMatch = poll.description?.toLowerCase().includes(search.toLowerCase());
    return titleMatch || descriptionMatch;
  });

  return (

    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>All Polls</h2>
        <div className="text-muted">
          {polls.length} published poll{polls.length !== 1 ? 's' : ''}
        </div>
      </div>
      <Form.Group className="mb-4">
        <Form.Control 
          className="shadow-sm rounded"
          type="text"
          placeholder="Search polls by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form.Group>

      {search && (
        <div className="mb-3">
          <small className="text-muted">
            {filteredPolls.length} poll{filteredPolls.length !== 1 ? 's' : ''} matching "{search}"
            {search && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 ms-2"
                onClick={() => setSearch("")}
              >
                Clear
              </Button>
            )}
          </small>
        </div>
      )}

      {filteredPolls.length === 0 ? (
        <div className="text-center my-5">
          <div className="mb-3">
            {search ? (
              <>
                <h5>No polls found matching "{search}"</h5>
                <p className="text-muted">Try a different search term or browse all polls.</p>
                <Button variant="secondary" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h5>No polls available</h5>
                <p className="text-muted">Be the first to create a poll!</p>
                {user && (
                  <Button variant="primary" onClick={() => navigate("/new-poll")}>
                    Create New Poll
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} className="g-4">
          {filteredPolls.map((poll) => (
            <Col key={poll.id}>
              <PollCard 
                poll={poll} 
                onClick={() => handleUserClick(poll.id)} 
                onDuplicate={() => duplicatePoll(poll)}
                showDuplicateButton={!!user} 
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Footer info */}
      {filteredPolls.length > 0 && (
        <div className="text-center mt-5">
          <small className="text-muted">
            Showing {filteredPolls.length} of {polls.length} published polls
          </small>
        </div>

      )}
    </Container>
  );
};

export default PollList;