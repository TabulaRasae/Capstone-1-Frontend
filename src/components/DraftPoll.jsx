import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API_URL } from "../shared";
import UserSearchInput from "./UserSearchInput";
import { Form, Button, Container, Row, Col, Card, ListGroup, Alert } from "react-bootstrap";
import "./CSS/NewPoll.css";


const DraftPoll = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endDate, setEndDate] = useState("");
  const [isIndefinite, setIsIndefinite] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [viewRestriction, setViewRestriction] = useState("public");
  const [voteRestriction, setVoteRestriction] = useState("public");
  const [customViewUsers, setCustomViewUsers] = useState([]);
  const [customVoteUsers, setCustomVoteUsers] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //commit

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

useEffect(() => {
  if (!id && user) {
    console.log("Loading drafts for user:", user.id); 
    
    axios
      .get(`${API_URL}/api/polls`, {
        headers: getAuthHeaders()
      })
      .then((res) => {
        console.log("All polls received:", res.data); 
        
        const userDrafts = res.data.filter(
          (poll) => poll.creator_id === user.id && poll.status === "draft"
        );
        
        console.log("User drafts found:", userDrafts);
        setDrafts(userDrafts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load drafts:", err);
        setError("Failed to load drafts: " + (err.response?.data?.error || err.message));
        setLoading(false);
      });
  } else if (!id && !user) {
    setLoading(false);
    setError("Please log in to view drafts");
  } else if (id) {
    setLoading(false);
  }
}, [id, user]);

  useEffect(() => {
  if (id) {
    axios.get(`${API_URL}/api/polls/${id}`, {
      headers: getAuthHeaders()
    })
      .then(res => {
        const data = res.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setAllowAnonymous(data.allowAnonymous || false);
        setIsIndefinite(!data.endAt);
        setEndDate(data.endAt ? data.endAt.slice(0, 16) : "");
        setViewRestriction(data.viewRestriction || "public");
        setVoteRestriction(data.voteRestriction || "public");
        
        const pollOptions = data.PollOptions || data.pollOptions || [];
        setOptions(pollOptions.length > 0 ? pollOptions.map(opt => opt.text) : ["", ""]);
        if (data.viewRestriction === "custom" || data.voteRestriction === "custom") {
          return axios.get(`${API_URL}/api/polls/${id}/permissions`, {
            headers: getAuthHeaders()
          });
        }
        return { data: { customViewUsers: [], customVoteUsers: [] } };
      })
      .then(permissionsRes => {
        const permissions = permissionsRes.data;
        setCustomViewUsers(permissions.customViewUsers || []);
        setCustomVoteUsers(permissions.customVoteUsers || []);
      })
      .catch(err => {
        console.error("Error loading draft:", err);
        setError("Failed to load draft: " + (err.response?.data?.error || err.message));
      });
  }
}, [id]);

  const deleteDraft = async (draftId) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      try {
        await axios.delete(`${API_URL}/api/polls/${draftId}`, {
          headers: getAuthHeaders()
        });
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      } catch (err) {
        console.error("Failed to delete draft:", err);
        alert("Failed to delete draft: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOptionField = () => {
    setOptions([...options, ""]);
  };

  const removeOptionField = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleAddEndDate = () => {
    setIsIndefinite(false);
  };

  const handleRemoveEndDate = () => {
    setIsIndefinite(true);
    setEndDate("");
  };

  const validatePoll = (isDraft = false) => {
    if (!title.trim()) {
      return "Poll title is required.";
    }

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 1) {
      return "At least one option is required.";
    }

    if (!isDraft) {
      if (!isIndefinite) {
        if (!endDate) {
          return "Please select an end date or remove the end date to make it indefinite.";
        }

        const selectedEndDate = new Date(endDate);
        const now = new Date();
        if (selectedEndDate <= now) {
          return "End date must be in the future.";
        }
      }

      if (validOptions.length < 2) {
        return "At least two filled options are required for publishing.";
      }
    }

    return null;
  };

  const createPollData = (status) => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    
    const pollData = {
      creator_id: user.id,
      title: title.trim(),
      description: description.trim(),
      allowAnonymous: allowAnonymous && voteRestriction === "public",
      status: status,
      viewRestriction,
      voteRestriction,
      customViewUsers: viewRestriction === "custom" ? customViewUsers.map(u => u.id) : [],
      customVoteUsers: voteRestriction === "custom" ? customVoteUsers.map(u => u.id) : [],
      pollOptions: validOptions.map((optionText, index) => ({
        text: optionText.trim(),
        position: index + 1,
      })),
    };

    if (!isIndefinite && endDate) {
      pollData.endAt = new Date(endDate).toISOString();
    }

    return pollData;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    const validationError = validatePoll(isDraft);
    if (validationError) {
      return setError(validationError);
    }

    const action = isDraft ? "save draft" : "publish poll";
    const confirmMessage = isDraft 
      ? "Save changes to this draft?" 
      : "Are you sure you want to publish this draft?";

    if (window.confirm(confirmMessage)) {
      setIsSubmitting(true);
      try {
        const pollData = createPollData(isDraft ? "draft" : "published");
        
        await axios.put(`${API_URL}/api/polls/${id}`, pollData, {
          headers: getAuthHeaders()
        });
        
        if (isDraft) {
          alert("Draft saved successfully!");
          setError(""); 
        } else {
          navigate("/poll-list");
        }
      } catch (err) {
        console.error(`Failed to ${action}:`, err);
        setError(`Failed to ${action}: ` + (err.response?.data?.error || err.message));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveDraft = (e) => {
    handleSubmit(e, true);
  };

  const handlePublish = (e) => {
    handleSubmit(e, false);
  };

  if (!id) {
    if (loading) return <p>Loading drafts...</p>;
    return (
      <div>
        <h2>My Draft Polls</h2>
        {drafts.length === 0 ? (
          <p>You don't have any saved drafts.</p>
        ) : (
          <ul className="list-unstyled">
  {drafts.map((draft) => (
    <li key={draft.id} className="d-flex align-items-center mb-2">
      <Link to={`/edit-draft/${draft.id}`} className="draft-title-link text-decoration-none">
        {draft.title || "(Untitled Draft)"}
      </Link>
      <Button
        variant="danger"
        size="sm"
        className="ms-auto"
        onClick={() => deleteDraft(draft.id)}
      >
        Delete
      </Button>
    </li>
  ))}
</ul>

        )}
      </div>
    );
  }

 return (
  <Container className="block2 new-poll-container py-4">
    {!id ? (
      <Container className="p-4 mb-4">
          <h2 className="mb-4 text-color">My Draft Polls</h2>
          {loading ? (
            <p className="text-color">Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <p className="text-color">You don't have any saved drafts.</p>
          ) : (
            <ul className="list-unstyled">
              {drafts.map((draft) => (
                <li key={draft.id} className="d-flex justify-content-between align-items-center mb-2">
                  <Link to={`/edit-draft/${draft.id}`} className="draft-title-link text-decoration-none text-color">
                    {draft.title || "(Untitled Draft)"}
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => deleteDraft(draft.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Container>
    ) : (
      <>
        <h1 className="mb-4 text-color">Edit Drafted Poll</h1>
        {error && <Alert variant="danger" className="text-color">{error}</Alert>}

        <Form onSubmit={handlePublish}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label className="text-color">Poll Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your poll question"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label className="text-color">Description (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your poll"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-color">Who can view this poll?</Form.Label>
            {["public", "followers", "friends", "custom"].map((option) => (
              <Form.Check
                key={option}
                type="radio"
                label={<span className="text-color">{option.charAt(0).toUpperCase() + option.slice(1)}</span>}
                name="viewRestriction"
                value={option}
                checked={viewRestriction === option}
                onChange={(e) => setViewRestriction(e.target.value)}
              />
            ))}
            {viewRestriction === "custom" && (
              <div className="mt-2">
                <Form.Label className="text-color">Choose specific users:</Form.Label>
                <UserSearchInput
                  selectedUsers={customViewUsers}
                  onUsersChange={setCustomViewUsers}
                  placeholder="Search users by username..."
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-color">Who can vote on this poll?</Form.Label>
            {["public", "followers", "friends", "custom"].map((option) => (
              <Form.Check
                key={option}
                type="radio"
                label={<span className="text-color">{option.charAt(0).toUpperCase() + option.slice(1)}</span>}
                name="voteRestriction"
                value={option}
                checked={voteRestriction === option}
                onChange={(e) => setVoteRestriction(e.target.value)}
              />
            ))}
            {voteRestriction === "custom" && (
              <div className="mt-2">
                <Form.Label className="text-color">Choose specific users:</Form.Label>
                <UserSearchInput
                  selectedUsers={customVoteUsers}
                  onUsersChange={setCustomVoteUsers}
                  placeholder="Search users by username..."
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-color">Poll Duration</Form.Label>
            {isIndefinite ? (
              <div>
                <div className="mb-2 text-muted text-color">📅 This poll will run indefinitely</div>
                <Button className="but-color" variant="secondary" size="sm" onClick={handleAddEndDate}>
                  + Add end date
                </Button>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label htmlFor="endDate" className="text-color">Poll End Date & Time:</Form.Label>
                  <Button className="but-color" variant="secondary" size="sm" onClick={handleRemoveEndDate}>
                    Remove end date
                  </Button>
                </div>
                <Form.Control
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={getMinDateTime()}
                />
                <Form.Text muted className="text-color">Poll must end at least 1 hour from now.</Form.Text>
              </div>
            )}
          </Form.Group>

          {voteRestriction === "public" && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={<span className="text-color">Allow anonymous voting</span>}
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
              />
              <Form.Text muted className="text-color">
                If checked, users can vote without logging in
              </Form.Text>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="text-color">Poll Options</Form.Label>
            {options.map((opt, idx) => (
              <div key={idx} className="d-flex align-items-center mb-2">
                <Form.Control
                  type="text"
                  value={opt}
                  placeholder={`Option ${idx + 1}`}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => removeOptionField(idx)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button className="but-color" variant="secondary" size="sm" onClick={addOptionField}>
              + Add Option
            </Button>
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button
              className="but-color"
              variant="secondary"
              onClick={() => navigate("/edit-draft")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <div className="d-flex gap-2">
              <Button
                className="but-color"
                variant="secondary"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                className="but-color"
                variant="secondary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Draft"}
              </Button>
            </div>
          </div>
        </Form>
      </>
    )}
  </Container>
);

};

export default DraftPoll;