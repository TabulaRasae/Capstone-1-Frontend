import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Row, Col, Spinner, Container, Stack } from "react-bootstrap";
import { API_URL } from "../shared";

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
    poll.status === "published" &&
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

  const creator = poll.creator || poll.Creator || null;
  const creatorUsername = creator?.username || "Unknown";

  console.log("Poll object:", poll); 
  console.log("Creator object:", creator); 

  return (
    <Card
      className={`bg-colors mb-4 shadow-sm h-[250px] overflow-hidden cursor-pointer ${!isPollActive ? "opacity-75" : ""}`}
      onClick={onClick}
    >
      <Card.Body as={Stack} gap={3} className="d-flex flex-column h-100">
        <Stack gap={1}>
          <Card.Title className="text-color text-truncate">
            {poll.title}
          </Card.Title>
          <Card.Text className="min-h-[50px] max-h-[50px] overflow-hidden text-sm text-white/80 leading-5">
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
