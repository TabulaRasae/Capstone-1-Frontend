import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../shared";
import UserSearchInput from "./UserSearchInput";
import { Card, Button, Badge, Spinner, Stack, Row, Col, Form, Container } from "react-bootstrap";

const NewPoll = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [endDate, setEndDate] = useState("");
  const [isIndefinite, setIsIndefinite] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [viewRestriction, setViewRestriction] = useState("public");
  const [voteRestriction, setVoteRestriction] = useState("public");
  const [customViewUsers, setCustomViewUsers] = useState([]);
  const [customVoteUsers, setCustomVoteUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="new-poll-container">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const creator_id = user.id;

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addOptionField = () => {
    setOptions([...options, ""]);
  };

  const removeOptionField = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
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
    creator_id,
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

  console.log("Creating poll data:", pollData); 

  return pollData;
};

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    
    const validationError = validatePoll(isDraft);
    if (validationError) {
      return setError(validationError);
    }

    const confirmMessage = isDraft 
      ? "Save this poll as a draft?" 
      : "Are you sure you want to publish this poll?";

    if (window.confirm(confirmMessage)) {
      setIsSubmitting(true);
      try {
        const pollData = createPollData(isDraft ? "draft" : "published");
        
        await axios.post(`${API_URL}/api/polls`, pollData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (isDraft) {
          alert("Poll saved as draft successfully!");
        }
        
        navigate("/polls");
      } catch (err) {
        const action = isDraft ? "save draft" : "publish poll";
        setError(`Failed to ${action}.`);
        console.error(`Poll ${action} error:`, err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSaveAsDraft = (e) => {
    handleSubmit(e, true);
  };

  const handlePublish = (e) => {
    handleSubmit(e, false);
  };

return (
  <Container className="block2 new-poll-container py-4">
    <h1 className="mb-4 text-color">Create New Poll</h1>
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
  <div>
    <Button
      className="but-color"
      variant="secondary"
      onClick={() => navigate("/polls")}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
  </div>

  <div className="d-flex gap-2">
    <Button
    className="but-color"
      variant="secondary"
      onClick={handleSaveAsDraft}
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
      {isSubmitting ? "Publishing..." : "Publish Poll"}
    </Button>
  </div>
</div>

    </Form>
  </Container>
);

};

export default NewPoll;
