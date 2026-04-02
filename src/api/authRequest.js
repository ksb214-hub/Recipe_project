// src/api/authRequest.js
import axios from "axios";

const authRequest = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

export default authRequest;