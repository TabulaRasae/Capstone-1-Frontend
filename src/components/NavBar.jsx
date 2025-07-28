import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown, Button } from "react-bootstrap";
import "./CSS/NavBarStyles.css";

const NavBar = ({ user, onLogout }) => {
  const [pollsDropdownOpen, setPollsDropdownOpen] = useState(false);
  const [friendsDropdownOpen, setFriendsDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expand="md" className="nav-bg" expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}>
      <Container>
        <Navbar.Brand className="image" href="/"><img src="https://i.ibb.co/SXnV5XZ7/pollster-logo.png" /></Navbar.Brand>
        <Navbar.Brand className="brand-text-welcome" as={Link} to="/"><strong>Follster</strong></Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Navbar.Text className="brand-text-welcome me-4">
                  Welcome, <strong>{user.username}</strong>!
                </Navbar.Text>
                <Nav.Link as={Link} to="/me" className="brand-text me-2" onClick={() => setExpanded(false)}>Profile</Nav.Link>
                {user.role === "admin" && (
                  <>
                  <Nav.Link as={Link} to="/admin/users" className="brand-text me-2">Admin Users</Nav.Link>
                  <Nav.Link as={Link} to="/admin/polls" className="brand-text me-2">Admin Polls</Nav.Link>
                  </>
                )}

                <Dropdown
                  className="nav-item dropdown hover-dropdown me-2"
                  onMouseEnter={() => window.innerWidth >= 768 && setPollsDropdownOpen(true)}
                  onMouseLeave={() => window.innerWidth >= 768 && setPollsDropdownOpen(false)}
                  show={pollsDropdownOpen}
                >
                  <Dropdown.Toggle
                    as="a"
                    className="brand-text nav-link"
                    href="#"
                    id="polls-nav-dropdown"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.innerWidth < 768) {
                        setPollsDropdownOpen((prev) => !prev);
                      }
                    }}
                  >
                    Polls <span className={`arrow ${pollsDropdownOpen ? "rotate" : ""}`}>&#9662;</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    onClick={() => {
                      setPollsDropdownOpen(false);
                      document.activeElement?.blur(); // fix mobile lingering focus
                      setExpanded(false);
                    }}
                    className="nav-bg"
                  >
                    <Dropdown.Item as={Link} to="/new-poll" onClick={() => setExpanded(false)} className="brand-text">Create Poll</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/poll-list" onClick={() => setExpanded(false)} className="brand-text">Poll List</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/edit-draft" onClick={() => setExpanded(false)} className="brand-text">Drafted Polls</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Dropdown
                  className="nav-item dropdown hover-dropdown me-2"
                  onMouseEnter={() => window.innerWidth >= 768 && setFriendsDropdownOpen(true)}
                  onMouseLeave={() => window.innerWidth >= 768 && setFriendsDropdownOpen(false)}
                  show={friendsDropdownOpen}
                >
                  <Dropdown.Toggle
                    as="a"
                    className="brand-text nav-link"
                    href="#"
                    id="friends-nav-dropdown"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.innerWidth < 768) {
                        setFriendsDropdownOpen((prev) => !prev);
                      }
                    }}
                  >
                    Friends <span className={`arrow ${friendsDropdownOpen ? "rotate" : ""}`}>&#9662;</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    onClick={() => {
                      setFriendsDropdownOpen(false);
                      document.activeElement?.blur();
                      setExpanded(false);
                    }}
                    className="nav-bg"
                  >
                    <Dropdown.Item as={Link} to="/search-friends" className="brand-text me-2" onClick={() => setExpanded(false)}>Find Friends</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/my-friends" className="brand-text me-2" onClick={() => setExpanded(false)}>My Friends</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Nav.Link as={Link} to="/about-Us" className="brand-text me-2" onClick={() => setExpanded(false)}>About Us</Nav.Link>

                <Nav.Item className="d-flex align-items-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-3"
                    onClick={() => {
                      setExpanded(false);
                      onLogout(); // ✅ Fixed: Added the missing parentheses
                    }}
                  >
                    Logout
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/poll-list" className="brand-text me-2" onClick={() => setExpanded(false)}>Public Polls</Nav.Link>
                <Nav.Link as={Link} to="/login" className="brand-text me-2" onClick={() => setExpanded(false)}>Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="brand-text me-2" onClick={() => setExpanded(false)}>Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;