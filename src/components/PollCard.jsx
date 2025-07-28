import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, Spinner, Container, Stack } from "react-bootstrap";
import "./CSS/PollCardStyles.css";

const PollCard = ({ poll, onClick, onDuplicate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [creator, setCreator] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!poll.endAt) {
        setTimeLeft("No end date");
        return;
      }

      const now = new Date();
      const endTime = new Date(poll.endAt);
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (poll.status === "closed" || !poll.isActive) {
          setTimeLeft("Ended by admin");
          return;
        }

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m left`);
        } else {
          setTimeLeft("Less than 1m left");
        }
      } else {
        setTimeLeft("Poll ended");
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [poll.endAt]);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/users/${poll.creator_id}`
        );
        if (response.ok) {
          const userData = await response.json();
          setCreator(userData);
        } else {
          console.error("Failed to fetch creator:", response.status);
          setCreator({ username: "Unknown" });
        }
      } catch (error) {
        console.error("Error fetching creator:", error);
        setCreator({ username: "Unknown" });
      }
    };

    if (poll.creator_id) {
      fetchCreator();
    }
  }, [poll.creator_id]);


  const isPollActive =
    poll.status !== "closed" &&
    poll.isActive &&
    (poll.endAt ? new Date(poll.endAt) > new Date() : true);

  const copyToClipboard = async (e) => {
    e.stopPropagation();

    const pollUrl = `${window.location.origin}/polls/${poll.id}`;

    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.log("No link to copy");
    }
  };


  return (
    <Card
      className={`bg-colors mb-4 shadow-sm ${!isPollActive ? "opacity-75" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer", height: "250px", overflow: "hidden", backgroundColor: "#275068", background: "#275068 !important" }}
    >
      <Card.Body as={Stack} gap={3} className="d-flex flex-column h-100">
        <Stack gap={1}>
          <Card.Title className="text-color text-truncate">
            {poll.title}
          </Card.Title>
          <Card.Text
            style={{
              minHeight: "50px",
              maxHeight: "50px",
              overflow: "hidden",
              fontSize: "0.9rem",
              color: "#041B15",
            }}>
            {poll.description}
          </Card.Text>
        </Stack>
        <Stack className="mt-auto" gap={2}>
          <Row className="justify-content-center mt-1">
            <Col className="text-end">
              <Badge bg={isPollActive ? "primary" : "danger"}>
                {isPollActive ? "Live" : "Ended"}
              </Badge>
            </Col>
          </Row>
          <Row className="align-itmes-center">
            <Col xs="auto" className="text-color small">
              by {creator ? `@${creator.username}` : <Spinner animation="border" size="sm" />}
            </Col>
            <Col className="text-end small">
              <small className={!isPollActive ? "text-danger" : "text-primary"}>
                {timeLeft}
              </small>
            </Col>
          </Row>
          <Row className="justify-content-between">
            <Col xs="auto">
              <Button
                className="but-color"
                size="sm"
                variant="outline-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                Duplicate
              </Button>
            </Col>
            <Col xs="auto">
              <Button
                className="but-color"
                variant="outline-secondary"
                size="sm"
                onClick={copyToClipboard}
              >
                {copied ? "✓ Copied!" : "📋 Copy Link"}
              </Button>
            </Col>
          </Row>
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default PollCard;