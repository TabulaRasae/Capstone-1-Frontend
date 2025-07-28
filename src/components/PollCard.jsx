import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, Spinner, Container, Stack } from "react-bootstrap";
import { API_URL } from "../shared";
import "./CSS/PollCardStyles.css";

const PollCard = ({ poll, onClick, onDuplicate, showDuplicateButton = true }) => {
  const [timeLeft, setTimeLeft] = useState("");
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

  // Get creator info from the poll object (included from backend)
  // Handle different possible structures
  const creator = poll.creator || poll.Creator || null;
  const creatorUsername = creator?.username || "Unknown";

  console.log("Poll object:", poll); // Debug log
  console.log("Creator object:", creator); // Debug log

  return (
    <Card
      className={`mb-4 shadow-sm ${!isPollActive ? "opacity-50" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer", height: "250px", overflow: "hidden" }}
    >
      <Card.Body as={Stack} gap={3} className="d-flex flex-column h-100">
        <Stack gap={1}>
          <Card.Title className="text-truncate">
            {poll.title}
          </Card.Title>
          <Card.Text 
            style={{
              minHeight: "50px", 
              maxHeight: "50px", 
              overflow: "hidden", 
              fontSize: "0.9rem",
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

          <Row className="align-items-center">
            <Col xs="auto" className="text-muted small">
              by @{creatorUsername}
            </Col>
            <Col className="text-end small">
              <small className={!isPollActive ? "text-danger" : "text-primary"}>
                {timeLeft}
              </small>
            </Col>
          </Row>

          <Row className="justify-content-between">
            {showDuplicateButton && (
              <Col xs="auto">
                <Button 
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
            )}
            <Col xs="auto">
              <Button 
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