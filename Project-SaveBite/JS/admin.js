/**
 * Admin functionality for SaveBite application
 */
import apiService from "./api.js";
import authService from "./auth.js";
import {
  formatDate,
  formatPrice,
  formatRelativeTime,
  showNotification,
  openModal,
} from "./utils.js";

/**
 * AdminService class for handling admin-related operations
 */
class AdminService {
  constructor() {
    this.init();
  }

  /**
   * Initialize the admin panel
   */
  init() {
    // Check if user is on admin page
    if (!document.querySelector(".admin-container")) {
      return;
    }

    // Check if user is authorized
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      window.location.href = "index.html";
      return;
    }

    // Update admin info
    this.updateAdminInfo(currentUser);

    // Set up tabs
    this.setupTabs();

    // Load admin data
    this.loadAdminData();
  }

  /**
   * Update admin information in the sidebar
   * @param {Object} admin - Admin user object
   */
  updateAdminInfo(admin) {
    const nameEl = document.getElementById("admin-name");
    const emailEl = document.getElementById("admin-email");

    if (nameEl) {
      nameEl.textContent = admin.name;
    }

    if (emailEl) {
      emailEl.textContent = admin.email;
    }
  }

  /**
   * Set up admin tabs
   */
  setupTabs() {
    const tabLinks = document.querySelectorAll(".sidebar-nav li");
    const tabContents = document.querySelectorAll(".admin-tab");

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
      case "dashboard":
        this.loadDashboardData();
        break;
      case "users":
        this.loadUsersData();
        break;
      case "listings":
        this.loadListingsData();
        break;
      case "orders":
        this.loadOrdersData();
        break;
      case "reports":
        this.loadReportsData();
        break;
      case "settings":
        this.loadSettingsData();
        break;
    }
  }

  /**
   * Load admin dashboard data
   */
  async loadAdminData() {
    // Get stats
    try {
      const result = await apiService.getStats("admin");

      if (result.success) {
        this.updateAdminStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  }

  /**
   * Update admin statistics
   * @param {Object} stats - Admin statistics
   */
  updateAdminStats(stats) {
    // Update stats cards
    const totalUsers = document.getElementById("total-users");
    const totalBusinesses = document.getElementById("total-businesses");
    const totalListings = document.getElementById("total-listings");
    const totalOrders = document.getElementById("total-orders");

    if (totalUsers) totalUsers.textContent = stats.totalUsers;
    if (totalBusinesses) totalBusinesses.textContent = stats.totalBusinesses;
    if (totalListings) totalListings.textContent = stats.activeListings;
    if (totalOrders) totalOrders.textContent = stats.totalOrders;

    // Update recent activity
    this.updateRecentActivity(stats.recentActivity);

    // Update other dashboard elements
    this.updateCharts(stats);
  }

  /**
   * Update charts with statistics
   * @param {Object} stats - Statistics for charts
   */
  updateCharts(stats) {
    // This is a placeholder for chart updates
    // In a real app, this would update chart visualizations

    // Update report values (in reports tab)
    const foodWasteReducedEl = document.getElementById("food-waste-reduced");
    const co2EmissionsAvoidedEl = document.getElementById(
      "co2-emissions-avoided"
    );
    const totalRevenueEl = document.getElementById("total-revenue");
    const userGrowthEl = document.getElementById("user-growth");

    if (foodWasteReducedEl)
      foodWasteReducedEl.textContent = stats.totalFoodSaved || 1500;
    if (co2EmissionsAvoidedEl)
      co2EmissionsAvoidedEl.textContent = stats.totalFoodSaved * 2.5 || 3750;
    if (totalRevenueEl)
      totalRevenueEl.textContent = Math.floor(stats.totalRevenue) || 12450;
    if (userGrowthEl) userGrowthEl.textContent = stats.totalUsers || 245;
  }

  /**
   * Update recent activity list
   * @param {Array} activities - Recent activities
   */
  updateRecentActivity(activities) {
    const activityList = document.getElementById("admin-activity-list");
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
   * Load dashboard tab data
   */
  loadDashboardData() {
    // Already loaded in loadAdminData
  }

  /**
   * Load users tab data
   */
  async loadUsersData() {
    const usersTableBody = document.getElementById("users-table-body");
    if (!usersTableBody) return;

    // Show loading state
    usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </td>
            </tr>
        `;

    try {
      // Get filter value
      const filter = document.getElementById("users-filter");
      const filterValue = filter ? filter.value : "all";

      // Get search value
      const search = document.getElementById("users-search");
      const searchValue = search ? search.value : "";

      // Get users
      const result = await apiService.getUsers({
        role: filterValue !== "all" ? filterValue.slice(0, -1) : "", // Remove 's' from end
        search: searchValue,
      });

      if (!result.success) {
        usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <p>${result.message}</p>
                        </td>
                    </tr>
                `;
        return;
      }

      const users = result.users;

      if (users.length === 0) {
        usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <p>No users found</p>
                        </td>
                    </tr>
                `;
        return;
      }

      // Generate table rows
      let tableRows = "";

      users.forEach((user) => {
        // Skip current admin user (can't manage self)
        const currentUser = authService.getCurrentUser();
        const isSelf = currentUser && currentUser.id === user.id;

        // Format joined date
        const joinedDate = formatDate(user.createdAt);

        // Get status class
        let statusClass = "";
        switch (user.status) {
          case "active":
            statusClass = "active";
            break;
          case "blocked":
            statusClass = "blocked";
            break;
          case "pending":
            statusClass = "pending";
            break;
        }

        tableRows += `
                    <tr>
                        <td>${
                          user.role === "business"
                            ? user.businessName || user.name
                            : user.name
                        }</td>
                        <td>${user.email}</td>
                        <td>${
                          user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        }</td>
                        <td>${joinedDate}</td>
                        <td><span class="user-status ${statusClass}">${
          user.status.charAt(0).toUpperCase() + user.status.slice(1)
        }</span></td>
                        <td>
                            <div class="user-actions">
                                <button class="view" data-id="${
                                  user.id
                                }"><i class="fas fa-eye"></i></button>
                                ${
                                  !isSelf
                                    ? `
                                    <button class="${
                                      user.status === "blocked"
                                        ? "edit"
                                        : "block"
                                    }" data-id="${user.id}" data-action="${
                                        user.status === "blocked"
                                          ? "active"
                                          : "blocked"
                                      }">
                                        <i class="fas ${
                                          user.status === "blocked"
                                            ? "fa-check-circle"
                                            : "fa-ban"
                                        }"></i>
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                        </td>
                    </tr>
                `;
      });

      // Update table body
      usersTableBody.innerHTML = tableRows;

      // Add event listeners
      const viewButtons = usersTableBody.querySelectorAll(".view");
      const actionButtons = usersTableBody.querySelectorAll(".block, .edit");

      viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const userId = button.getAttribute("data-id");
          this.showUserDetails(userId);
        });
      });

      actionButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const userId = button.getAttribute("data-id");
          const action = button.getAttribute("data-action");
          await this.updateUserStatus(userId, action);
        });
      });
    } catch (error) {
      console.error("Error loading users:", error);
      usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p>Error loading users. Please try again later.</p>
                    </td>
                </tr>
            `;
    }
  }
