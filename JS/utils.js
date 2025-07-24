/*
 * Utility functions for the SaveBite application
 */

/*
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} The formatted date string
 */
function formatDate(date, includeTime = false) {
  const dateObj = new Date(date);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return dateObj.toLocaleDateString("en-US", options);
}

/*
 * Format a price to a currency string
 * @param {number} price - The price to format
 * @returns {string} The formatted price string
 */
function formatPrice(price) {
  return "$" + parseFloat(price).toFixed(2);
}

/*
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
function calculateDiscount(originalPrice, discountedPrice) {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/*
 * Generate a unique ID
 * @returns {string} A unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/*
 * Check if a date is expired
 * @param {string|Date} date - The date to check
 * @returns {boolean} Whether the date is expired
 */
function isExpired(date) {
  const expiryDate = new Date(date);
  const now = new Date();
  return expiryDate < now;
}

/*
 * Format a relative time (e.g., "2 hours ago")
 * @param {string|Date} date - The date to format
 * @returns {string} The formatted relative time
 */
function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return formatDate(date);
}

/*
 * Format time until expiry (e.g., "Expires in 2 days")
 * @param {string|Date} date - The expiry date
 * @returns {string} The formatted time until expiry
 */
function formatTimeUntilExpiry(date) {
  const now = new Date();
  const expiryDate = new Date(date);
  const diffInSeconds = Math.floor((expiryDate - now) / 1000);

  if (diffInSeconds < 0) {
    return "Expired";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Expires in ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Expires in ${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `Expires in ${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
}

/*
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of message (success, error, info)
 * @param {number} duration - How long to show the message in milliseconds
 */
function showNotification(message, type = "info", duration = 3000) {
  // Check if notification container exists, if not create it
  let notificationContainer = document.getElementById("notification-container");

  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    notificationContainer.style.position = "fixed";
    notificationContainer.style.top = "20px";
    notificationContainer.style.right = "20px";
    notificationContainer.style.zIndex = "9999";
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

  // Style the notification
  notification.style.backgroundColor = getColorForType(type);
  notification.style.color = "white";
  notification.style.padding = "12px 16px";
  notification.style.borderRadius = "8px";
  notification.style.marginBottom = "10px";
  notification.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
  notification.style.display = "flex";
  notification.style.justifyContent = "space-between";
  notification.style.alignItems = "center";
  notification.style.transition = "all 0.3s ease";
  notification.style.opacity = "0";
  notification.style.transform = "translateX(50px)";

  // Add notification to container
  notificationContainer.appendChild(notification);

  // Trigger reflow to enable transition
  notification.offsetHeight;

  // Show notification with animation
  notification.style.opacity = "1";
  notification.style.transform = "translateX(0)";

  // Setup close button
  const closeButton = notification.querySelector(".notification-close");
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.color = "white";
  closeButton.style.cursor = "pointer";
  closeButton.style.padding = "0";
  closeButton.style.marginLeft = "10px";

  closeButton.addEventListener("click", () => {
    closeNotification(notification);
  });

  // Auto-close after duration
  setTimeout(() => {
    closeNotification(notification);
  }, duration);

  function closeNotification(notif) {
    notif.style.opacity = "0";
    notif.style.transform = "translateX(50px)";

    setTimeout(() => {
      notif.remove();
    }, 300);
  }

  function getIconForType(type) {
    switch (type) {
      case "success":
        return "fa-check-circle";
      case "error":
        return "fa-exclamation-circle";
      case "warning":
        return "fa-exclamation-triangle";
      default:
        return "fa-info-circle";
    }
  }

  function getColorForType(type) {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      case "warning":
        return "#FF9800";
      default:
        return "#2196F3";
    }
  }
}
/*
 * Toggle password visibility in password fields
 * @param {HTMLElement} toggleButton - The toggle button element
 * @param {HTMLElement} passwordInput - The password input element
 */
function setupPasswordToggle(toggleButton, passwordInput) {
  if (!toggleButton || !passwordInput) return;

  toggleButton.addEventListener("click", () => {
    const icon = toggleButton.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
}

/*
 * Set up mobile navigation menu toggle
 */
function setupMobileNav() {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (!mobileMenuToggle || !navLinks) return;

  mobileMenuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");

    const icon = mobileMenuToggle.querySelector("i");
    if (navLinks.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-times");
    } else {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !mobileMenuToggle.contains(event.target) &&
      !navLinks.contains(event.target)
    ) {
      navLinks.classList.remove("active");
      const icon = mobileMenuToggle.querySelector("i");
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  });
}

/*
 * Setup modal functionality
 * @param {string} modalId - The ID of the modal element
 * @param {string} openTriggerId - The ID of the element that opens the modal (optional)
 */
function setupModal(modalId, openTriggerId = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Set up open trigger if provided
  if (openTriggerId) {
    const openTrigger = document.getElementById(openTriggerId);
    if (openTrigger) {
      openTrigger.addEventListener("click", () => {
        openModal(modal);
      });
    }
  }

  // Set up close button(s)
  const closeButtons = modal.querySelectorAll(".modal-close");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeModal(modal);
    });
  });

  // Close when clicking outside modal content
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  // Close when pressing Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal(modal);
    }
  });
}

/*
 * Open a modal
 * @param {HTMLElement} modal - The modal element to open
 */
function openModal(modal) {
  modal.classList.add("show");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  setTimeout(() => {
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
      modalContent.style.transform = "translateY(0)";
      modalContent.style.opacity = "1";
    }
  }, 10);
}

/*
 * Close a modal
 * @param {HTMLElement} modal - The modal element to close
 */
function closeModal(modal) {
  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.style.transform = "translateY(-20px)";
    modalContent.style.opacity = "0";
  }

  setTimeout(() => {
    modal.classList.remove("show");
    document.body.style.overflow = ""; // Restore scrolling
  }, 300);
}

/*
 * Initialize common elements and functionality across all pages
 */
function initCommon() {
  // Setup mobile navigation
  setupMobileNav();

  // Setup password toggles
  const passwordToggles = document.querySelectorAll(".password-toggle");
  passwordToggles.forEach((toggle) => {
    const input = toggle.parentElement.querySelector('input[type="password"]');
    if (input) {
      setupPasswordToggle(toggle, input);
    }
  });

  // Initialize all modals
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    setupModal(modal.id);
  });
}

// Initialize common elements when DOM is loaded
document.addEventListener("DOMContentLoaded", initCommon);

// Export utility functions
export {
  formatDate,
  formatPrice,
  calculateDiscount,
  generateId,
  isExpired,
  formatRelativeTime,
  formatTimeUntilExpiry,
  showNotification,
  setupPasswordToggle,
  setupMobileNav,
  setupModal,
  openModal,
  closeModal,
};
