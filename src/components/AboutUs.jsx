import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./CSS/Home.css";

const AboutUs = () => {
  return (
    <Container className="about-container py-4">
      <Container className="block mb-5 text-center">
        <Row className="mb-3 justify-content-center">
          <Col xs={12}>
            <h1 className="text-color">About Us</h1>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <p className="styled-paragraph text-color">
              This platform was built with a simple goal: to make decision-making
              fair, fast, and accessible to everyone.
            </p>
            <p className="styled-paragraph text-color">
              Whether you're planning a night out, organizing an event, or just
              settling a debate, our ranked-choice poll system ensures the results
              reflect the group's true consensus.
            </p>
          </Col>
        </Row>
      </Container>

      <Container className="block mb-5 text-center">
        <Row className="mb-3 justify-content-center">
          <Col xs={12}>
            <h2 className="text-color">Why Ranked-Choice?</h2>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col xs={12} md={8}>
            <p className="styled-paragraph text-color">
              Traditional polls can be skewed by vote splitting or tactical voting.
              With ranked-choice, every vote counts more fairly. Voters rank the
              options in order of preference, and a winner is chosen through a
              series of instant-runoff rounds.
            </p>
            <p className="styled-paragraph text-color">
              This method leads to more satisfying outcomes because it rewards broad
              support, not just a passionate minority.
            </p>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default AboutUs;
