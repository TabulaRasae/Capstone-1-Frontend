import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";

const defaultAvatar = "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";

const NavBar = ({ user, onLogout }) => {
  const [friendsDropdownOpen, setFriendsDropdownOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar expand="md" className="nav-bg navbar-modern" expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}>
      <Container className="navbar-inner">
        <Navbar.Brand className="image" href="/">
          <img src="https://i.ibb.co/SXnV5XZ7/pollster-logo.png" alt="Follster logo" />
        </Navbar.Brand>
        <Navbar.Brand className="brand-text-welcome" as={Link} to="/"><strong>Follster</strong></Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" aria-label="Toggle navigation" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto nav-links">
            <Nav.Link as={Link} to="/" className="brand-text me-2" onClick={() => setExpanded(false)}>Home</Nav.Link>
            {user ? (
              <>
                {user.role === "admin" && (
                  <>
                  <Nav.Link as={Link} to="/admin/users" className="brand-text me-2">Admin Users</Nav.Link>
                  <Nav.Link as={Link} to="/admin/polls" className="brand-text me-2">Admin Polls</Nav.Link>
                  </>
                )}

                <Nav.Link as={Link} to="/polls" className="brand-text me-2" onClick={() => setExpanded(false)}>
                  Polls
                </Nav.Link>

                <Dropdown
                  className="nav-item dropdown hover-dropdown me-2"
                  show={friendsDropdownOpen}
                >
                  <Dropdown.Toggle
                    as="a"
                    className="brand-text nav-link"
                    href="#"
                    id="friends-nav-dropdown"
                    onClick={(e) => {
                      e.preventDefault();
                      setFriendsDropdownOpen((prev) => !prev);
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
                    className="nav-menu-panel"
                  >
                    <Dropdown.Item as={Link} to="/search-friends" className="me-2" onClick={() => setExpanded(false)}>Find Friends</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/my-friends" className="me-2" onClick={() => setExpanded(false)}>My Friends</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <Nav.Link as={Link} to="/new-poll" className="but-color nav-cta" onClick={() => setExpanded(false)}>
                  Create Poll
                </Nav.Link>
                <Dropdown
                  align="end"
                  className="nav-avatar-wrapper"
                  show={avatarOpen}
                  onToggle={(isOpen) => setAvatarOpen(isOpen)}
                >
                  <Dropdown.Toggle
                    as="button"
                    className="avatar-button"
                    aria-label="Open profile menu"
                  >
                    <img src={user.imageUrl || defaultAvatar} alt={`${user.username} avatar`} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="nav-menu-panel">
                    <Dropdown.Item
                      as={Link}
                      to="/me"
                      onClick={() => {
                        setAvatarOpen(false);
                        setExpanded(false);
                      }}
                    >
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/polls"
                      onClick={() => {
                        setAvatarOpen(false);
                        setExpanded(false);
                      }}
                    >
                      My Polls
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/edit-draft"
                      onClick={() => {
                        setAvatarOpen(false);
                        setExpanded(false);
                      }}
                    >
                      Drafts
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        setAvatarOpen(false);
                        setExpanded(false);
                        onLogout();
                      }}
                    >
                      Log out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/polls" className="brand-text me-2" onClick={() => setExpanded(false)}>Public Polls</Nav.Link>
                <Nav.Link as={Link} to="/login" className="brand-text me-2" onClick={() => setExpanded(false)}>Login</Nav.Link>
                <Nav.Link as={Link} to="/new-poll" className="but-color nav-cta" onClick={() => setExpanded(false)}>
                  Create a poll
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
