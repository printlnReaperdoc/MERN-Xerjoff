import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const userId = localStorage.getItem("userId"); // fetch userId
  if (!userId) {
    navigate("/login");
    return;
  }

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: { "user-id": userId },
      });
      setUser(res.data);
      setName(res.data.name || "");
      setPreview(res.data.profileImage ? `/uploads/${res.data.profileImage}` : null);
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [navigate]);

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const userId = localStorage.getItem("token");
    if (!userId) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (password) formData.append("password", password);
    if (profilePic) formData.append("profileImage", profilePic); // match backend

    try {
      await axios.put("/api/users/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "user-id": userId, // send user-id header
        },
      });
      setSuccess("Profile updated successfully.");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="update-profile-container">
      <h2>Update Profile</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Profile Picture:</label>
          <input type="file" accept="image/*" onChange={handlePicChange} />
          {preview && (
            <div>
              <img
                src={preview}
                alt="Profile Preview"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default UpdateProfile;
