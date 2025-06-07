/**
 * Dashboard functionality for SaveBite application
 */
import apiService from "./api.js";
import authService from "./auth.js";
import listingService from "./listing.js";
import {
  formatDate,
  formatPrice,
  formatRelativeTime,
  showNotification,
} from "./utils.js";

/**
 * DashboardService class for handling dashboard-related operations
 */
class DashboardService {
  constructor() {
    this.init();
  }

  /**
   * Initialize the dashboard
   */
  init() {
    // Check if user is on dashboard page
    if (!document.querySelector(".dashboard-container")) {
      return;
    }

    // Check if user is authorized
    const currentUser = authService.getCurrentUser();
    if (
      !currentUser ||
      (currentUser.role !== "business" && currentUser.role !== "admin")
    ) {
      window.location.href = "index.html";
      return;
    }

    // Update user info
    this.updateUserInfo(currentUser);

    // Set up tabs
    this.setupTabs();

    // Load dashboard data
    this.loadDashboardData();
  }

  /**
   * Update user information in the sidebar
   * @param {Object} user - User object
   */
  updateUserInfo(user) {
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");

    if (nameEl) {
      nameEl.textContent = user.businessName || user.name;
    }

    if (emailEl) {
      emailEl.textContent = user.email;
    }
  }

  /**
   * Set up dashboard tabs
   */
  setupTabs() {
    const tabLinks = document.querySelectorAll(".sidebar-nav li");
    const tabContents = document.querySelectorAll(".dashboard-tab");

    if (!tabLinks.length || !tabContents.length) return;

    tabLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Remove active class from all links
        tabLinks.forEach((l) => l.classList.remove("active"));

        // Add active class to clicked link
        link.classList.add("active");

        // Show corresponding tab content
        const tabId = link.getAttribute("data-tab");

        tabContents.forEach((tab) => {
          if (tab.id === tabId) {
            tab.classList.add("active");
          } else {
            tab.classList.remove("active");
          }
        });

        // Load tab-specific data
        this.loadTabData(tabId);
      });
    });
  }

  /**
   * Load data for specific tab
   * @param {string} tabId - Tab ID
   */
  loadTabData(tabId) {
    switch (tabId) {
      case "overview":
        this.loadOverviewData();
        break;
      case "listings":
        this.loadListingsData();
        break;
      case "orders":
        this.loadOrdersData();
        break;
      case "settings":
        this.loadSettingsData();
        break;
    }
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    // Get stats
    try {
      const result = await apiService.getStats("business");

      if (result.success) {
        this.updateDashboardStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  /**
   * Update dashboard statistics
   * @param {Object} stats - Dashboard statistics
   */
  updateDashboardStats(stats) {
    // Update stats cards
    const activeListingsCount = document.getElementById(
      "active-listings-count"
    );
    const pendingOrdersCount = document.getElementById("pending-orders-count");
    const foodSavedCount = document.getElementById("food-saved-count");

    if (activeListingsCount)
      activeListingsCount.textContent = stats.activeListings;
    if (pendingOrdersCount)
      pendingOrdersCount.textContent = stats.pendingOrders;
    if (foodSavedCount) foodSavedCount.textContent = stats.foodSaved;

    // Update recent activity
    this.updateRecentActivity(stats.recentActivity);

    // Update expiring listings
    this.updateExpiringListings(stats.expiringListings);
  }

  /**
   * Update recent activity list
   * @param {Array} activities - Recent activities
   */
  updateRecentActivity(activities) {
    const activityList = document.getElementById("activity-list");
    if (!activityList) return;

    if (!activities || activities.length === 0) {
      activityList.innerHTML = `
                <div class="no-activity">
                    <p>No recent activity</p>
                </div>
            `;
      return;
    }

    let activitiesHTML = "";

    activities.forEach((activity) => {
      // Get icon based on activity type
      let iconClass = "fas fa-info-circle";
      let iconColor = "var(--info-color)";

      switch (activity.type) {
        case "listing-created":
          iconClass = "fas fa-plus-circle";
          iconColor = "var(--success-color)";
          break;
        case "listing-updated":
          iconClass = "fas fa-edit";
          iconColor = "var(--primary-color)";
          break;
        case "order-placed":
          iconClass = "fas fa-shopping-cart";
          iconColor = "var(--accent-color)";
          break;
        case "order-completed":
          iconClass = "fas fa-check-circle";
          iconColor = "var(--success-color)";
          break;
      }

      activitiesHTML += `
                <div class="activity-item">
                    <div class="activity-icon" style="background-color: ${iconColor}20; color: ${iconColor}">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="activity-info">
                        <h4>${activity.message}</h4>
                        <p>${formatRelativeTime(activity.timestamp)}</p>
                    </div>
                </div>
            `;
    });

    activityList.innerHTML = activitiesHTML;
  }

  /**
   * Update expiring listings list
   * @param {Array} listings - Expiring listings
   */
  updateExpiringListings(listings) {
    const expiringList = document.getElementById("expiring-list");
    if (!expiringList) return;

    if (!listings || listings.length === 0) {
      expiringList.innerHTML = `
                <div class="no-expiring">
                    <p>No listings expiring soon</p>
                </div>
            `;
      return;
    }

    let listingsHTML = "";

    listings.forEach((listing) => {
      listingsHTML += `
                <div class="expiring-item">
                    <div class="expiring-icon" style="background-color: var(--warning-color)20; color: var(--warning-color)">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="expiring-info">
                        <h4>${listing.foodName}</h4>
                        <p>Expires ${formatRelativeTime(listing.expiryDate)}</p>
                    </div>
                    <div class="expiring-time">
                        <button class="btn btn-small" data-id="${
                          listing.id
                        }">Edit</button>
                    </div>
                </div>
            `;
    });

    expiringList.innerHTML = listingsHTML;

    // Add event listeners to edit buttons
    const editButtons = expiringList.querySelectorAll("button");
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const listingId = button.getAttribute("data-id");

        // Switch to listings tab
        document.querySelector('[data-tab="listings"]').click();

        // Show edit modal
        setTimeout(() => {
          listingService.showEditListingModal(listingId);
        }, 300);
      });
    });
  }

  /**
   * Load overview tab data
   */
  loadOverviewData() {
    // Already loaded in loadDashboardData
  }

  /**
   * Load listings tab data
   */
  loadListingsData() {
    const listingsTableBody = document.getElementById("listings-table-body");
    if (listingsTableBody) {
      listingService.renderBusinessListings(listingsTableBody);
    }
  }


  
}
