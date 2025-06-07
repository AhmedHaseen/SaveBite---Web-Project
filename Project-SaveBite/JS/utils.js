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
