import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../shared";
import { useNavigate } from "react-router-dom";
import "./CSS/UsersPage.css";

const UsersPage = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      setError("Please log in to access admin features");
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    // Fetch users with proper authentication
    axios
      .get(`${API_URL}/api/users`, {
        headers: getAuthHeaders()
      })
      .then((response) => {
        setUsers(response.data);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 403) {
          setError("Access denied. Only users with admin privileges can view this page.");
        } else {
          setError("Failed to fetch users. Please try again later.");
        }
        setLoading(false);
      });
  }, [user]);

  const handleUserClick = (id) => {
    navigate(`/users/${id}`);
  };

  const handleDisableUser = async (userId) => {
    try {
      await axios.patch(`${API_URL}/api/admin/users/${userId}/disable`, {}, {
        headers: getAuthHeaders()
      });
      
      // Update the user in the list
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, disabled: !u.disabled } : u
      ));
    } catch (error) {
      console.error("Error disabling user:", error);
      alert("Failed to update user status");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="users-page">
        <p>Loading admin panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users-page">
        <h2>Admin Panel</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate("/poll-list")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="users-page">
      <h2>Admin Panel - User Management</h2>
      <p>Total Users: {users.length}</p>
      
      <input
        type="text"
        placeholder="Search users by username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      
      <div className="users-list">
        {filteredUsers.length === 0 ? (
          <p>No users found matching your search.</p>
        ) : (
          <ul className="user-list">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={`user-card ${user.disabled ? 'disabled' : ''}`}
                onClick={() => handleUserClick(user.id)}
              >
                <div className="user-info">
                  <img
                    src={user.imageUrl || "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"}
                    alt={user.username}
                    className="user-pfp"
                  />
                  <div>
                    <p className="user-name">
                      {user.username}
                      {user.disabled && <span className="disabled-tag"> (Disabled)</span>}
                      {user.role === "admin" && <span className="admin-tag"> (Admin)</span>}
                    </p>
                    <p className="user-bio">{user.bio || "No bio available"}</p>
                  </div>
                </div>
                
                {user.role !== "admin" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisableUser(user.id);
                    }}
                    className={`admin-action-btn ${user.disabled ? 'enable' : 'disable'}`}
                  >
                    {user.disabled ? 'Enable' : 'Disable'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UsersPage;