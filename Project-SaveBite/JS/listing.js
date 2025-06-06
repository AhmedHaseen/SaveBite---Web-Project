/**
 * Listing functionality for SaveBite application
 */
import apiService from "./api.js";
import authService from "./auth.js";
import {
  formatDate,
  formatPrice,
  calculateDiscount,
  isExpired,
  formatTimeUntilExpiry,
  showNotification,
  openModal,
} from "./utils.js";

/**
 * ListingService class for handling listing-related operations
 */
class ListingService {
  constructor() {
    this.currentFilters = {
      category: "all",
      sortBy: "expiry",
      search: "",
    };
  }

  /**
   * Render listings in a container
   * @param {HTMLElement} container - Container to render listings in
   * @param {Object} options - Options for rendering
   */
  async renderListings(container, options = {}) {
    if (!container) return;

    // Show loading spinner
    container.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;

    // Merge options with defaults
    const defaultOptions = {
      filters: this.currentFilters,
      limit: 0,
      showAddToCart: true,
      businessId: null,
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      // Get listings
      const listings = await apiService.getListings(mergedOptions.filters);

      // Handle no results
      if (listings.length === 0) {
        const noResults = document.getElementById("no-results");
        if (noResults) {
          noResults.style.display = "block";
        } else {
          container.innerHTML = `
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <h3>No listings found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    `;
        }
        return;
      }

      // Hide no results message if exists
      const noResults = document.getElementById("no-results");
      if (noResults) {
        noResults.style.display = "none";
      }

      // Create listings HTML
      let listingsHTML = "";

      listings.forEach((listing, index) => {
        // Skip if listing is not active
        if (listing.status !== "active" && !options.showAll) {
          return;
        }

        // Calculate discount percentage
        const discountPercentage = calculateDiscount(
          listing.originalPrice,
          listing.discountedPrice
        );

        // Check if listing is expired
        const expired = isExpired(listing.expiryDate);

        // Create listing card
        listingsHTML += `
                    <div class="listing-card" data-id="${
                      listing.id
                    }" style="animation-delay: ${index * 0.1}s">
                        <div class="listing-image">
                            <img src="${listing.imageUrl}" alt="${
          listing.foodName
        }">
                        </div>
                        <div class="listing-content">
                            <h3 class="listing-title">${listing.foodName}</h3>
                            <p class="listing-business">
                                <i class="fas fa-store"></i> ${
                                  listing.businessName
                                }
                            </p>
                            <div class="listing-details">
                                <span class="listing-expiry">
                                    <i class="fas fa-clock"></i> ${
                                      expired
                                        ? "Expired"
                                        : formatTimeUntilExpiry(
                                            listing.expiryDate
                                          )
                                    }
                                </span>
                                <span class="listing-quantity">
                                    <i class="fas fa-cubes"></i> ${
                                      listing.quantity
                                    } left
                                </span>
                            </div>
                            <div class="listing-price">
                                <div class="price-discount">
                                    <span class="original-price">${formatPrice(
                                      listing.originalPrice
                                    )}</span>
                                    <span class="discounted-price">${formatPrice(
                                      listing.discountedPrice
                                    )}</span>
                                </div>
                                <span class="discount-badge">-${discountPercentage}%</span>
                            </div>
                            <div class="listing-action">
                                ${
                                  mergedOptions.showAddToCart && !expired
                                    ? `<button class="btn btn-primary btn-block add-to-cart-btn" data-id="${listing.id}">
                                        <i class="fas fa-cart-plus"></i> Add to Cart
                                    </button>`
                                    : `<button class="btn btn-secondary btn-block view-listing-btn" data-id="${listing.id}">
                                        View Details
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
      });

      // Update container
      container.innerHTML = listingsHTML;

      // Add event listeners
      this.addEventListeners(container, mergedOptions.showAddToCart);
    } catch (error) {
      console.error("Error rendering listings:", error);
      container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading listings</h3>
                    <p>Please try again later</p>
                </div>
            `;
    }
  }

  /**
   * Add event listeners to listing elements
   * @param {HTMLElement} container - Container with listing elements
   * @param {boolean} showAddToCart - Whether add to cart buttons are present
   */
  addEventListeners(container, showAddToCart = true) {
    // Add event listeners to "Add to Cart" buttons
    if (showAddToCart) {
      const addToCartButtons = container.querySelectorAll(".add-to-cart-btn");
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          e.stopPropagation(); // Prevent opening listing detail
          const listingId = button.getAttribute("data-id");
          await this.addToCart(listingId);
        });
      });
    }

    // Add event listeners to view detail
    const listingCards = container.querySelectorAll(".listing-card");
    listingCards.forEach((card) => {
      card.addEventListener("click", () => {
        const listingId = card.getAttribute("data-id");
        this.showListingDetail(listingId);
      });
    });

    // Add event listeners to view detail buttons
    const viewButtons = container.querySelectorAll(".view-listing-btn");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent duplicate triggers
        const listingId = button.getAttribute("data-id");
        this.showListingDetail(listingId);
      });
    });
  }

  /**
   * Show listing detail in modal
   * @param {string} listingId - ID of listing to show
   */
  async showListingDetail(listingId) {
    const modal = document.getElementById("listing-modal");
    const detailContainer = document.getElementById("listing-detail");

    if (!modal || !detailContainer) {
      console.error("Listing modal or detail container not found");
      return;
    }

    // Show loading state
    detailContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;

    openModal(modal);

    try {
      // Get listing details
      const listing = await apiService.getListingById(listingId);

      if (!listing) {
        detailContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        <h3>Listing not found</h3>
                        <p>The listing you're looking for may have been removed</p>
                    </div>
                `;
        return;
      }

      // Calculate discount
      const discountPercentage = calculateDiscount(
        listing.originalPrice,
        listing.discountedPrice
      );

      // Check if listing is expired
      const expired = isExpired(listing.expiryDate);

      // Get current user
      const currentUser = authService.getCurrentUser();
      const isCustomer = currentUser && currentUser.role === "customer";

      // Create listing detail HTML
      detailContainer.innerHTML = `
                <div class="listing-detail-image">
                    <img src="${listing.imageUrl}" alt="${listing.foodName}">
                </div>
                <div class="listing-detail-content">
                    <h2 class="listing-detail-title">${listing.foodName}</h2>
                    <p class="listing-detail-business">
                        <i class="fas fa-store"></i> ${listing.businessName}
                    </p>
                    <p class="listing-detail-description">${
                      listing.description
                    }</p>
                    
                    <div class="listing-detail-info">
                        <div class="detail-info-item">
                            <span><i class="fas fa-calendar-alt"></i> Expires</span>
                            <span>${formatDate(listing.expiryDate, true)}</span>
                        </div>
                        <div class="detail-info-item">
                            <span><i class="fas fa-cubes"></i> Available</span>
                            <span>${listing.quantity} items</span>
                        </div>
                        <div class="detail-info-item">
                            <span><i class="fas fa-tag"></i> Category</span>
                            <span>${this.formatCategory(
                              listing.category
                            )}</span>
                        </div>
                    </div>
                    
                    <div class="listing-detail-price">
                        <div class="price-group">
                            <span class="original-price">${formatPrice(
                              listing.originalPrice
                            )}</span>
                            <span class="discounted-price">${formatPrice(
                              listing.discountedPrice
                            )}</span>
                        </div>
                        <span class="listing-detail-discount">-${discountPercentage}% OFF</span>
                    </div>
                    
                    ${
                      isCustomer && !expired
                        ? `
                        <div class="quantity-selector">
                            <label for="item-quantity">Quantity:</label>
                            <div class="quantity-controls">
                                <button type="button" class="quantity-btn minus" id="quantity-minus">-</button>
                                <input type="number" class="quantity-input" id="item-quantity" value="1" min="1" max="${listing.quantity}">
                                <button type="button" class="quantity-btn plus" id="quantity-plus">+</button>
                            </div>
                        </div>
                        
                        <div class="listing-detail-actions">
                            <button class="btn btn-primary" id="detail-add-to-cart" data-id="${listing.id}">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="btn btn-secondary" id="detail-view-more">
                                View More Items
                            </button>
                        </div>
                    `
                        : expired
                        ? `
                        <div class="listing-detail-actions">
                            <button class="btn btn-secondary" disabled>
                                <i class="fas fa-clock"></i> Expired
                            </button>
                            <button class="btn btn-primary" id="detail-view-more">
                                View More Items
                            </button>
                        </div>
                    `
                        : `
                        <div class="listing-detail-actions">
                            <button class="btn btn-secondary" id="detail-view-more">
                                View More Items
                            </button>
                        </div>
                    `
                    }
                    
                    <div class="pickup-location">
                        <h4><i class="fas fa-map-marker-alt"></i> Pickup Location</h4>
                        <p>${listing.pickupAddress}</p>
                        <p>${
                          listing.pickupOnly
                            ? "Pickup only"
                            : "Pickup or delivery available"
                        }</p>
                    </div>
                </div>
            `;

      // Add event listeners
      if (isCustomer && !expired) {
        // Quantity controls
        const quantityInput = document.getElementById("item-quantity");
        const minusBtn = document.getElementById("quantity-minus");
        const plusBtn = document.getElementById("quantity-plus");

        if (quantityInput && minusBtn && plusBtn) {
          minusBtn.addEventListener("click", () => {
            const currentVal = parseInt(quantityInput.value);
            if (currentVal > 1) {
              quantityInput.value = currentVal - 1;
            }
          });

          plusBtn.addEventListener("click", () => {
            const currentVal = parseInt(quantityInput.value);
            if (currentVal < listing.quantity) {
              quantityInput.value = currentVal + 1;
            }
          });

          quantityInput.addEventListener("change", () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
              value = 1;
            } else if (value > listing.quantity) {
              value = listing.quantity;
            }
            quantityInput.value = value;
          });
        }

        // Add to cart button
        const addToCartBtn = document.getElementById("detail-add-to-cart");
        if (addToCartBtn) {
          addToCartBtn.addEventListener("click", async () => {
            const quantity = parseInt(
              document.getElementById("item-quantity").value
            );
            await this.addToCart(listing.id, quantity);
            modal.querySelector(".modal-close").click(); // Close modal
          });
        }
      }

      // View more button
      const viewMoreBtn = document.getElementById("detail-view-more");
      if (viewMoreBtn) {
        viewMoreBtn.addEventListener("click", () => {
          window.location.href = "listings.html";
          modal.querySelector(".modal-close").click(); // Close modal
        });
      }
    } catch (error) {
      console.error("Error showing listing detail:", error);
      detailContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error loading listing details</h3>
                    <p>Please try again later</p>
                </div>
            `;
    }
  }

  /**
   * Add a listing to the cart
   * @param {string} listingId - ID of listing to add
   * @param {number} quantity - Quantity to add (default: 1)
   */
  async addToCart(listingId, quantity = 1) {
    try {
      // Check if user is logged in
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        showNotification("Please log in to add items to your cart", "error");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        return;
      }

      // Check if user is a customer
      if (currentUser.role !== "customer") {
        showNotification("Only customers can add items to cart", "error");
        return;
      }

      // Get listing details
      const listing = await apiService.getListingById(listingId);

      if (!listing) {
        showNotification("Listing not found", "error");
        return;
      }

      // Check if listing is expired
      if (isExpired(listing.expiryDate)) {
        showNotification("This listing has expired", "error");
        return;
      }

      // Check if listing is available
      if (listing.quantity <= 0) {
        showNotification("This item is out of stock", "error");
        return;
      }

      // Check if requested quantity is available
      if (quantity > listing.quantity) {
        quantity = listing.quantity;
        showNotification(
          `Only ${quantity} items available. Adjusted quantity.`,
          "warning"
        );
      }

      // Add to cart
      const cartItem = {
        id: listing.id,
        businessId: listing.businessId,
        businessName: listing.businessName,
        name: listing.foodName,
        originalPrice: listing.originalPrice,
        discountedPrice: listing.discountedPrice,
        quantity: quantity,
        imageUrl: listing.imageUrl,
        expiryDate: listing.expiryDate,
        pickupOnly: listing.pickupOnly,
        pickupAddress: listing.pickupAddress,
      };

      await apiService.addToCart(cartItem);

      // Update cart count
      authService.updateCartCount();

      showNotification(`${listing.foodName} added to cart`, "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Error adding item to cart", "error");
    }
  }

  /**
   * Set up filter controls for listings page
   */
  setupFilters() {
    // Get filter elements
    const categoryFilter = document.getElementById("category-filter");
    const sortByFilter = document.getElementById("sort-by");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const resetBtn = document.getElementById("filter-reset");

    if (!categoryFilter || !sortByFilter || !searchInput || !searchBtn) {
      return;
    }

    // Set up category filter
    categoryFilter.addEventListener("change", () => {
      this.currentFilters.category = categoryFilter.value;
      this.applyFilters();
    });

    // Set up sort filter
    sortByFilter.addEventListener("change", () => {
      this.currentFilters.sortBy = sortByFilter.value;
      this.applyFilters();
    });

    // Set up search
    searchBtn.addEventListener("click", () => {
      this.currentFilters.search = searchInput.value.trim();
      this.applyFilters();
    });

    // Search on enter key
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.currentFilters.search = searchInput.value.trim();
        this.applyFilters();
      }
    });

    // Reset filters
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        categoryFilter.value = "all";
        sortByFilter.value = "expiry";
        searchInput.value = "";

        this.currentFilters = {
          category: "all",
          sortBy: "expiry",
          search: "",
        };

        this.applyFilters();
      });
    }
  }

  /**
   * Apply current filters and update listings
   */
  applyFilters() {
    const listingsContainer = document.getElementById("listings-container");
    if (listingsContainer) {
      this.renderListings(listingsContainer, {
        filters: this.currentFilters,
      });
    }
  }

  /**
   * Format category name for display
   * @param {string} category - Category slug
   * @returns {string} Formatted category name
   */
  formatCategory(category) {
    switch (category) {
      case "meals":
        return "Prepared Meals";
      case "bakery":
        return "Bakery";
      case "produce":
        return "Produce";
      case "dairy":
        return "Dairy";
      case "other":
        return "Other";
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  /**
   * Render a listing form (add/edit)
   * @param {HTMLFormElement} form - Form element
   * @param {Object} listing - Listing data for editing (null for new listing)
   */
  renderListingForm(form, listing = null) {
    if (!form) return;

    // Set form values if editing
    if (listing) {
      // Set form ID
      if (form.id === "edit-listing-form") {
        document.getElementById("edit-listing-id").value = listing.id;
      }

      // Set basic fields
      form.elements["foodName"].value = listing.foodName;
      form.elements["category"].value = listing.category;
      form.elements["originalPrice"].value = listing.originalPrice;
      form.elements["discountedPrice"].value = listing.discountedPrice;
      form.elements["quantity"].value = listing.quantity;

      // Format date for datetime-local input
      const expiryDate = new Date(listing.expiryDate);
      const formattedDate = expiryDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      form.elements["expiryDate"].value = formattedDate;

      form.elements["description"].value = listing.description;
      form.elements["imageUrl"].value = listing.imageUrl;
      form.elements["pickupOnly"].checked = listing.pickupOnly;
      form.elements["pickupAddress"].value = listing.pickupAddress;
    } else {
      // Set default values for new listing
      form.reset();

      // Set default expiry date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
      form.elements["expiryDate"].value = tomorrow.toISOString().slice(0, 16);

      // Get business address from user profile
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.businessAddress) {
        form.elements["pickupAddress"].value = currentUser.businessAddress;
      }
    }
  }

  /**
   * Submit a listing form (add/edit)
   * @param {HTMLFormElement} form - Form element
   * @param {string} mode - Form mode ('add' or 'edit')
   */
  async submitListingForm(form, mode = "add") {
    try {
      // Check if user is authorized
      const currentUser = authService.getCurrentUser();
      if (
        !currentUser ||
        (currentUser.role !== "business" && currentUser.role !== "admin")
      ) {
        showNotification("Only businesses can manage listings", "error");
        return false;
      }

      // Get form data
      const formData = new FormData(form);
      const listingData = {
        foodName: formData.get("foodName"),
        category: formData.get("category"),
        originalPrice: parseFloat(formData.get("originalPrice")),
        discountedPrice: parseFloat(formData.get("discountedPrice")),
        quantity: parseInt(formData.get("quantity")),
        expiryDate: new Date(formData.get("expiryDate")).toISOString(),
        description: formData.get("description"),
        imageUrl: formData.get("imageUrl"),
        pickupOnly: formData.get("pickupOnly") === "on",
        pickupAddress: formData.get("pickupAddress"),
      };

      // Validate required fields
      for (const [key, value] of Object.entries(listingData)) {
        if (value === "" || value === null || value === undefined) {
          showNotification(`Please fill in all required fields`, "error");
          return false;
        }
      }

      // Validate prices
      if (listingData.discountedPrice >= listingData.originalPrice) {
        showNotification(
          "Discounted price must be less than original price",
          "error"
        );
        return false;
      }

      // Validate expiry date
      const expiryDate = new Date(listingData.expiryDate);
      const now = new Date();
      if (expiryDate <= now) {
        showNotification("Expiry date must be in the future", "error");
        return false;
      }

      let result;

      if (mode === "edit") {
        // Get listing ID
        const listingId = document.getElementById("edit-listing-id").value;

        // Update listing
        result = await apiService.updateListing(listingId, listingData);
      } else {
        // Create new listing
        result = await apiService.createListing(listingData);
      }

      if (result.success) {
        showNotification(
          mode === "edit"
            ? "Listing updated successfully"
            : "Listing created successfully",
          "success"
        );
        return true;
      } else {
        showNotification(result.message, "error");
        return false;
      }
    } catch (error) {
      console.error("Error submitting listing form:", error);
      showNotification("Error saving listing", "error");
      return false;
    }
  }

  /**
   * Delete a listing
   * @param {string} listingId - ID of listing to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteListing(listingId) {
    try {
      // Confirm deletion
      if (
        !confirm(
          "Are you sure you want to delete this listing? This action cannot be undone."
        )
      ) {
        return false;
      }

      const result = await apiService.deleteListing(listingId);

      if (result.success) {
        showNotification("Listing deleted successfully", "success");
        return true;
      } else {
        showNotification(result.message, "error");
        return false;
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      showNotification("Error deleting listing", "error");
      return false;
    }
  }

  /**
   * Render business listings in a table
   * @param {HTMLElement} tableBody - Table body element to render listings in
   */
  async renderBusinessListings(tableBody) {
    if (!tableBody) return;

    // Show loading state
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                </td>
            </tr>
        `;

    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      if (
        !currentUser ||
        (currentUser.role !== "business" && currentUser.role !== "admin")
      ) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <p>Only businesses can view their listings</p>
                        </td>
                    </tr>
                `;
        return;
      }

      // Get listings for current business
      const listings = await apiService.getListings({
        businessId: currentUser.id,
      });

      if (listings.length === 0) {
        // Show no listings message
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <p>No listings found. Create your first listing to get started.</p>
                        </td>
                    </tr>
                `;

        // Show no listings container if it exists
        const noListings = document.getElementById("no-listings");
        if (noListings) {
          noListings.style.display = "block";
        }

        return;
      }

      // Hide no listings container if it exists
      const noListings = document.getElementById("no-listings");
      if (noListings) {
        noListings.style.display = "none";
      }

      // Generate table rows
      let tableRows = "";

      listings.forEach((listing) => {
        // Get status class
        let statusClass = "bg-success";
        if (listing.status === "sold-out") {
          statusClass = "bg-warning";
        } else if (
          listing.status === "expired" ||
          isExpired(listing.expiryDate)
        ) {
          statusClass = "bg-error";
        }

        // Get status text
        let statusText =
          listing.status.charAt(0).toUpperCase() + listing.status.slice(1);
        if (listing.status === "active" && isExpired(listing.expiryDate)) {
          statusText = "Expired";
        }

        // Calculate remaining time
        const expiryText = isExpired(listing.expiryDate)
          ? "Expired"
          : formatDate(listing.expiryDate, true);

        tableRows += `
                    <tr>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${listing.imageUrl}" alt="${
          listing.foodName
        }" width="40" height="40" style="object-fit: cover; border-radius: 4px; margin-right: 8px;">
                                ${listing.foodName}
                            </div>
                        </td>
                        <td>${formatPrice(
                          listing.discountedPrice
                        )} <span class="original-price">${formatPrice(
          listing.originalPrice
        )}</span></td>
                        <td>${listing.quantity}</td>
                        <td>${expiryText}</td>
                        <td><span class="user-status ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="listing-actions">
                                <button class="edit" data-id="${
                                  listing.id
                                }"><i class="fas fa-edit"></i></button>
                                <button class="delete" data-id="${
                                  listing.id
                                }"><i class="fas fa-trash-alt"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
      });

      // Update table body
      tableBody.innerHTML = tableRows;

      // Add event listeners to action buttons
      const editButtons = tableBody.querySelectorAll(".edit");
      const deleteButtons = tableBody.querySelectorAll(".delete");

      editButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const listingId = button.getAttribute("data-id");
          this.showEditListingModal(listingId);
        });
      });

      deleteButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const listingId = button.getAttribute("data-id");
          const success = await this.deleteListing(listingId);

          if (success) {
            // Refresh listings
            this.renderBusinessListings(tableBody);
          }
        });
      });
    } catch (error) {
      console.error("Error rendering business listings:", error);
      tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p>Error loading listings. Please try again later.</p>
                    </td>
                </tr>
            `;
    }
  }

  /**
   * Show edit listing modal
   * @param {string} listingId - ID of listing to edit
   */
  async showEditListingModal(listingId) {
    const modal = document.getElementById("edit-listing-modal");
    const form = document.getElementById("edit-listing-form");

    if (!modal || !form) {
      console.error("Edit listing modal or form not found");
      return;
    }

    try {
      // Get listing details
      const listing = await apiService.getListingById(listingId);

      if (!listing) {
        showNotification("Listing not found", "error");
        return;
      }

      // Populate form
      this.renderListingForm(form, listing);

      // Show modal
      openModal(modal);

      // Set up delete button
      const deleteBtn = document.getElementById("delete-listing");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", async () => {
          const success = await this.deleteListing(listingId);

          if (success) {
            // Close modal
            modal.querySelector(".modal-close").click();

            // Refresh listings
            const tableBody = document.getElementById("listings-table-body");
            if (tableBody) {
              this.renderBusinessListings(tableBody);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error showing edit listing modal:", error);
      showNotification("Error loading listing details", "error");
    }
  }
}

// Create and export listing service
const listingService = new ListingService();

// Set up listings page if on that page
document.addEventListener("DOMContentLoaded", () => {
  // Initialize listing functionality
  const listingsContainer = document.getElementById("listings-container");
  if (listingsContainer) {
    // Set up filters
    listingService.setupFilters();

    // Render listings
    listingService.renderListings(listingsContainer);
  }

  // Initialize featured listings on home page
  const featuredListingsContainer = document.getElementById(
    "featured-listings-container"
  );
  if (featuredListingsContainer) {
    // Render featured listings (limit to 3)
    listingService.renderListings(featuredListingsContainer, {
      limit: 3,
      filters: { sortBy: "discount" },
    });
  }

  // Set up listing detail modal
  const listingModal = document.getElementById("listing-modal");
  if (listingModal) {
    // Close modal when clicking close button or outside
    const closeBtn = listingModal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        listingModal.classList.remove("show");
        document.body.style.overflow = "";
      });
    }

    listingModal.addEventListener("click", (e) => {
      if (e.target === listingModal) {
        listingModal.classList.remove("show");
        document.body.style.overflow = "";
      }
    });
  }

  // Set up business dashboard listings table
  const listingsTableBody = document.getElementById("listings-table-body");
  if (listingsTableBody) {
    listingService.renderBusinessListings(listingsTableBody);
  }

  // Set up listing form
  const listingForm = document.getElementById("listing-form");
  if (listingForm) {
    // Handle form submission
    listingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const success = await listingService.submitListingForm(
        listingForm,
        "add"
      );

      if (success) {
        // Reset form
        listingForm.reset();

        // Update business listings table
        const listingsTableBody = document.getElementById(
          "listings-table-body"
        );
        if (listingsTableBody) {
          listingService.renderBusinessListings(listingsTableBody);
        }

        // Switch to listings tab
        const listingsTab = document.querySelector('[data-tab="listings"]');
        if (listingsTab) {
          listingsTab.click();
        }
      }
    });
  }

  // Set up edit listing form
  const editListingForm = document.getElementById("edit-listing-form");
  if (editListingForm) {
    // Handle form submission
    editListingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const success = await listingService.submitListingForm(
        editListingForm,
        "edit"
      );

      if (success) {
        // Close modal
        const modal = document.getElementById("edit-listing-modal");
        if (modal) {
          modal.querySelector(".modal-close").click();
        }

        // Update business listings table
        const listingsTableBody = document.getElementById(
          "listings-table-body"
        );
        if (listingsTableBody) {
          listingService.renderBusinessListings(listingsTableBody);
        }
      }
    });
  }

  // Set up "Add Listing" button in listings tab
  const addListingBtn = document.getElementById("add-listing-btn");
  if (addListingBtn) {
    addListingBtn.addEventListener("click", () => {
      // Switch to add listing tab
      const addListingTab = document.querySelector('[data-tab="add-listing"]');
      if (addListingTab) {
        addListingTab.click();
      }
    });
  }

  // Set up "Create First Listing" button
  const createFirstListingBtn = document.getElementById("create-first-listing");
  if (createFirstListingBtn) {
    createFirstListingBtn.addEventListener("click", () => {
      // Switch to add listing tab
      const addListingTab = document.querySelector('[data-tab="add-listing"]');
      if (addListingTab) {
        addListingTab.click();
      }
    });
  }
});

export default listingService;
