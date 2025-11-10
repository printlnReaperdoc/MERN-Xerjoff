import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };
    let isValid = true;

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      setMessage("✅ Login successful!");
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box component="main" sx={{ width: "100%", maxWidth: 420 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login Page
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            error={!!errors.email}
            helperText={errors.email}
            disabled={loading}
            fullWidth
            margin="normal"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            error={!!errors.password}
            helperText={errors.password}
            disabled={loading}
            fullWidth
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate("/register")}
            disabled={loading}
            fullWidth
            sx={{ mt: 1 }}
          >
            Register
          </Button>
        </Box>
        {message && (
          <Typography sx={{ mt: 2 }} align="center">
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Login;
