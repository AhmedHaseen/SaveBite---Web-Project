/**
 * Authentication functionality for SaveBite application
 */
import { generateId, showNotification } from "./utils.js";

// Constants
const SESSION_KEY = "savebite_session";
const USERS_KEY = "savebite_users";

/**
 * User class representing a user in the system
 */
class User {
  constructor(id, name, email, role, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role; // 'customer', 'business', or 'admin'
    this.password = password; // In a real app, this would be hashed
    this.createdAt = new Date().toISOString();
    this.status = "active"; // 'active', 'blocked', 'pending'

    // Role-specific properties
    if (role === "business") {
      this.businessName = "";
      this.businessType = "";
      this.businessAddress = "";
      this.businessDescription = "";
    }
  }
}

/**
 * Session class representing a user session
 */
class Session {
  constructor(userId, userEmail, userName, userRole) {
    this.userId = userId;
    this.userEmail = userEmail;
    this.userName = userName;
    this.userRole = userRole;
    this.createdAt = new Date().toISOString();
    this.expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(); // 7 days from now
  }

  isValid() {
    return new Date(this.expiresAt) > new Date();
  }
}

/**
 * AuthService class for handling authentication operations
 */
class AuthService {
  constructor() {
    this.init();
  }

  /**
   * Initialize the auth service and create default admin user if no users exist
   */
  init() {
    const users = this.getUsers();

    // Create default admin user if no users exist
    if (users.length === 0) {
      const adminUser = new User(
        generateId(),
        "Admin User",
        "admin@savebite.com",
        "admin",
        "admin123" // In a real app, this would be hashed
      );

      users.push(adminUser);
      this.saveUsers(users);
    }

    // Update navigation based on auth status
    this.updateNavigation();
  }

  /**
   * Get all users from localStorage
   * @returns {Array} Array of user objects
   */
  getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Save users to localStorage
   * @param {Array} users - Array of user objects to save
   */
  saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /**
   * Get current user session
   * @returns {Object|null} Session object if exists, null otherwise
   */
  getSession() {
    const sessionJson = localStorage.getItem(SESSION_KEY);
    if (!sessionJson) return null;

    const session = JSON.parse(sessionJson);

    // Check if session is valid (not expired)
    if (new Date(session.expiresAt) <= new Date()) {
      // Session expired, clear it
      this.logout();
      return null;
    }

    return session;
  }

  /**
   * Save session to localStorage
   * @param {Object} session - Session object to save
   */
  saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Register a new user
   * @param {Object} userData - User data for registration
   * @returns {Object} Result object with success flag and message
   */
  register(userData) {
    const { name, email, password, role } = userData;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return { success: false, message: "All fields are required" };
    }

    // Check if email already exists
    const users = this.getUsers();
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return { success: false, message: "Email is already registered" };
    }

    // Create new user
    const newUser = new User(
      generateId(),
      name,
      email,
      role,
      password // In a real app, this would be hashed
    );

    // Add business-specific properties if role is business
    if (role === "business" && userData.businessName) {
      newUser.businessName = userData.businessName;
      newUser.businessType = userData.businessType || "other";
    }

    // Add user to users array and save
    users.push(newUser);
    this.saveUsers(users);

    // Automatically log in the new user
    const session = new Session(
      newUser.id,
      newUser.email,
      newUser.name,
      newUser.role
    );
    this.saveSession(session);

    return { success: true, message: "Registration successful!" };
  }

  /**
   * Log in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Result object with success flag and message
   */
  login(email, password) {
    // Validate required fields
    if (!email || !password) {
      return { success: false, message: "Email and password are required" };
    }

    // Find user by email
    const users = this.getUsers();
    const user = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    // Check password (in a real app, would compare hashed passwords)
    if (user.password !== password) {
      return { success: false, message: "Invalid email or password" };
    }

    // Check if user is blocked
    if (user.status === "blocked") {
      return {
        success: false,
        message: "Your account has been blocked. Please contact support.",
      };
    }

    // Create session
    const session = new Session(user.id, user.email, user.name, user.role);
    this.saveSession(session);

    return { success: true, message: "Login successful!" };
  }

  /**
   * Log out the current user
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
    this.updateNavigation();

    // Redirect to home page if on a protected page
    const protectedPages = ["dashboard.html", "admin.html", "cart.html"];
    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
      window.location.href = "index.html";
    }
  }

  /**
   * Get the current logged-in user
   * @returns {Object|null} User object if logged in, null otherwise
   */
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;

    const users = this.getUsers();
    return users.find((user) => user.id === session.userId) || null;
  }

  /**
   * Update navigation based on authentication status
   */
  updateNavigation() {
    // Get elements
    const authRequired = document.querySelectorAll(".auth-required");
    const authNotRequired = document.querySelectorAll(".auth-not-required");
    const customerOnly = document.querySelectorAll(".customer-only");
    const businessOnly = document.querySelectorAll(".business-only");
    const adminOnly = document.querySelectorAll(".admin-only");

    // Get current session
    const session = this.getSession();

    if (session) {
      // User is logged in
      authRequired.forEach((el) => (el.style.display = "block"));
      authNotRequired.forEach((el) => (el.style.display = "none"));

      // Show role-specific elements
      switch (session.userRole) {
        case "customer":
          customerOnly.forEach((el) => (el.style.display = "block"));
          businessOnly.forEach((el) => (el.style.display = "none"));
          adminOnly.forEach((el) => (el.style.display = "none"));
          break;
        case "business":
          customerOnly.forEach((el) => (el.style.display = "none"));
          businessOnly.forEach((el) => (el.style.display = "block"));
          adminOnly.forEach((el) => (el.style.display = "none"));
          break;
        case "admin":
          customerOnly.forEach((el) => (el.style.display = "none"));
          businessOnly.forEach((el) => (el.style.display = "none"));
          adminOnly.forEach((el) => (el.style.display = "block"));
          break;
      }
    } else {
      // User is not logged in
      authRequired.forEach((el) => (el.style.display = "none"));
      authNotRequired.forEach((el) => (el.style.display = "block"));
      customerOnly.forEach((el) => (el.style.display = "none"));
      businessOnly.forEach((el) => (el.style.display = "none"));
      adminOnly.forEach((el) => (el.style.display = "none"));
    }

    // Update cart count if user is a customer
    if (session && session.userRole === "customer") {
      this.updateCartCount();
    }
  }

  /**
   * Update cart count in the navigation
   */
  updateCartCount() {
    const cartCountElements = document.querySelectorAll(".cart-count");
    if (!cartCountElements.length) return;

    // Get cart from localStorage
    const cartJson = localStorage.getItem("savebite_cart");
    const cart = cartJson ? JSON.parse(cartJson) : { items: [] };

    // Calculate total items in cart
    const totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Update cart count elements
    cartCountElements.forEach((el) => {
      el.textContent = totalItems;

      // Show/hide based on count
      if (totalItems > 0) {
        el.style.display = "inline-flex";
      } else {
        el.style.display = "none";
      }
    });
  }
}

// Create and export authentication service instance
const authService = new AuthService();

// Set up login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const result = authService.login(email, password);

    const messageEl = document.getElementById("login-message");
    messageEl.textContent = result.message;
    messageEl.className = `auth-message ${
      result.success ? "success" : "error"
    }`;
    messageEl.style.display = "block";

    if (result.success) {
      // Redirect after successful login
      setTimeout(() => {
        const session = authService.getSession();
        if (session) {
          switch (session.userRole) {
            case "admin":
              window.location.href = "admin.html";
              break;
            case "business":
              window.location.href = "dashboard.html";
              break;
            default:
              window.location.href = "listings.html";
          }
        }
      }, 1000);
    }
  });
}

// Set up register form
const registerForm = document.getElementById("register-form");
if (registerForm) {
  // Show/hide business fields based on role selection
  const roleSelect = document.getElementById("role");
  const businessFields = document.querySelectorAll(".business-fields");

  if (roleSelect && businessFields.length) {
    roleSelect.addEventListener("change", () => {
      if (roleSelect.value === "business") {
        businessFields.forEach((field) => {
          field.style.display = "block";
          field.classList.add("show");
        });
      } else {
        businessFields.forEach((field) => {
          field.classList.remove("show");
          setTimeout(() => {
            field.style.display = "none";
          }, 300);
        });
      }
    });
  }

  // Handle form submission
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const userData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value,
    };

    // Add business fields if role is business
    if (userData.role === "business") {
      userData.businessName = document.getElementById("businessName").value;
      userData.businessType = document.getElementById("businessType").value;
    }

    // Check terms checkbox
    const termsChecked = document.getElementById("terms").checked;
    if (!termsChecked) {
      const messageEl = document.getElementById("register-message");
      messageEl.textContent =
        "You must agree to the Terms of Service and Privacy Policy";
      messageEl.className = "auth-message error";
      messageEl.style.display = "block";
      return;
    }

    const result = authService.register(userData);

    const messageEl = document.getElementById("register-message");
    messageEl.textContent = result.message;
    messageEl.className = `auth-message ${
      result.success ? "success" : "error"
    }`;
    messageEl.style.display = "block";

    if (result.success) {
      // Redirect after successful registration
      setTimeout(() => {
        const session = authService.getSession();
        if (session) {
          switch (session.userRole) {
            case "business":
              window.location.href = "dashboard.html";
              break;
            default:
              window.location.href = "listings.html";
          }
        }
      }, 1000);
    }
  });
}

// Set up logout button
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    authService.logout();
    showNotification("You have been logged out successfully", "info");
  });
}

// Protect pages that require authentication
function protectPage(allowedRoles = []) {
  const session = authService.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.userRole)) {
    window.location.href = "index.html";
    showNotification("You do not have permission to access this page", "error");
  }
}

// Protect specific pages
const currentPage = window.location.pathname.split("/").pop();

switch (currentPage) {
  case "dashboard.html":
    protectPage(["business", "admin"]);
    break;
  case "admin.html":
    protectPage(["admin"]);
    break;
  case "cart.html":
    protectPage(["customer"]);
    break;
}

// Update navigation on page load
document.addEventListener("DOMContentLoaded", () => {
  authService.updateNavigation();
});

export default authService;
