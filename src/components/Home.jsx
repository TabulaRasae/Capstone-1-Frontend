import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./CSS/Home.css";

const Home = () => {
  return (
    <Container className="home-container py-4">
      {/* Hero */}
      <Container className="block mb-5 text-center">
        <Row className="mb-3 justify-content-center">
          <Col xs={12}>
            <h1 className="main-title text-color">Create a poll in seconds</h1>
          </Col>
        </Row>
        <Row className="mb-3 justify-content-center">
          <Col xs={12} md={8}>
            <p className="subtitle styled-paragraph text-color">
              Want to ask your friends where to go Friday night or arrange a meeting
              with co-workers? Create a poll – and get answers in no time.
            </p>
          </Col>
        </Row>
        <Row className="mb-2 justify-content-center">
          <Col xs="auto">
            <Link to="/new-poll">
              <Button className="but-color" variant="secondary">Create a poll</Button>
            </Link>
          </Col>
        </Row>
        <Row>
          <Col>
            <p className="note styled-paragraph text-color">No signup required</p>
          </Col>
        </Row>
      </Container>

      {/* Ballot system explanation */}
      <Container className="block mb-5 text-center">
        <Row className="mb-3 justify-content-center">
          <Col xs={12}>
            <h2 className="text-color">How our voting system works</h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <p className="styled-paragraph text-color">
              We use a method called <strong>Instant Runoff Voting (IRV)</strong>,
              also known as <strong>ranked-choice voting</strong>. Voters rank all
              available options in order of preference—1st, 2nd, 3rd, and so on.
            </p>
            <p className="styled-paragraph text-color">
              If no option receives a majority of first-choice votes, the option
              with the fewest is eliminated, and those votes are transferred to each
              voter's next preferred option. This elimination process continues in
              rounds until one option has a majority.
            </p>
            <p className="styled-paragraph text-color">
              This ensures the winner is the most broadly accepted choice rather
              than just the most popular first pick.
            </p>
            <Link to="/new-poll">
              <Button className="but-color mt-3" variant="secondary">Create a poll</Button>
            </Link>
          </Col>
        </Row>
      </Container>

      {/* Config Options */}
      <Container className="block mb-5 text-center">
        <Row className="justify-content-center">
          <Col xs={12}>
            <h2 className="text-color">Simple polls with powerful options</h2>
            <ul className="text-color list-unstyled">
              <li>🕒 Set voting deadlines</li>
              <li>🔒 Prevent duplicate votes</li>
            </ul>
          </Col>
        </Row>
      </Container>

      {/* CTA */}
      <Container className="block cta text-center">
        <Row className="mb-3 justify-content-center">
          <Col xs={12}>
            <h2 className="text-color">
              Ready to get started? <span>It's free!</span>
            </h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs="auto" className="me-2">
            <Link to="/new-poll">
              <Button className="but-color" variant="secondary">Create a poll</Button>
            </Link>
          </Col>
          <Col xs="auto">
            <Link to="/signup">
              <Button className="but-color" variant="secondary">Sign up</Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Home;
