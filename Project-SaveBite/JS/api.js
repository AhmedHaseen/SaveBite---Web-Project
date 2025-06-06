/**
 * API service for SaveBite application
 *
 * This file contains mock API functions that simulate backend endpoints.
 * In a real application, these would make actual HTTP requests to a server.
 */
import authService from "./auth.js";
import { generateId, isExpired } from "./utils.js";

// Constants for localStorage keys
const LISTINGS_KEY = "savebite_listings";
const ORDERS_KEY = "savebite_orders";
const CART_KEY = "savebite_cart";

/**
 * API Service class
 */
class ApiService {
  constructor() {
    this.initializeMockData();
  }

  /**
   * Initialize mock data if it doesn't exist
   */
  initializeMockData() {
    // Initialize listings if they don't exist
    if (!localStorage.getItem(LISTINGS_KEY)) {
      this.createMockListings();
    }

    // Initialize empty orders array if it doesn't exist
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
    }

    // Initialize empty cart if it doesn't exist
    if (!localStorage.getItem(CART_KEY)) {
      localStorage.setItem(CART_KEY, JSON.stringify({ items: [] }));
    }
  }

  /**
   * Create mock listings data
   */
  createMockListings() {
    const users = authService.getUsers();
    const businessUsers = users.filter((user) => user.role === "business");

    // If no business users, add some default ones
    if (businessUsers.length === 0) {
      const defaultBusinesses = [
        {
          id: generateId(),
          name: "Green Garden Cafe",
          email: "contact@greengarden.com",
          role: "business",
          businessName: "Green Garden Cafe",
          businessType: "cafe",
          businessAddress: "123 Main St, Anytown, USA",
          createdAt: new Date().toISOString(),
          status: "active",
        },
        {
          id: generateId(),
          name: "Fresh Bakery",
          email: "info@freshbakery.com",
          role: "business",
          businessName: "Fresh Bakery",
          businessType: "bakery",
          businessAddress: "456 Oak Ave, Anytown, USA",
          createdAt: new Date().toISOString(),
          status: "active",
        },
        {
          id: generateId(),
          name: "Sunny Grocery",
          email: "hello@sunnygrocery.com",
          role: "business",
          businessName: "Sunny Grocery",
          businessType: "grocery",
          businessAddress: "789 Pine Rd, Anytown, USA",
          createdAt: new Date().toISOString(),
          status: "active",
        },
      ];

      const users = authService.getUsers();
      users.push(...defaultBusinesses);
      authService.saveUsers(users);

      businessUsers.push(...defaultBusinesses);
    }

    // Create mock listings
    const mockListings = [];

    // Add listings for Green Garden Cafe
    const business1 = businessUsers[0] || defaultBusinesses[0];
    mockListings.push(
      {
        id: generateId(),
        businessId: business1.id,
        businessName: business1.businessName,
        foodName: "Vegetable Pasta Salad",
        category: "meals",
        description:
          "Fresh pasta salad with seasonal vegetables, olives, and Italian dressing. Perfect for a quick lunch!",
        originalPrice: 12.99,
        discountedPrice: 7.99,
        quantity: 5,
        expiryDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days from now
        imageUrl:
          "https://images.pexels.com/photos/1373915/pexels-photo-1373915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: true,
        pickupAddress: business1.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: generateId(),
        businessId: business1.id,
        businessName: business1.businessName,
        foodName: "Avocado Sandwich",
        category: "meals",
        description:
          "Whole grain bread with avocado, tomato, lettuce and our special herb mayo. Healthy and delicious!",
        originalPrice: 9.99,
        discountedPrice: 5.99,
        quantity: 3,
        expiryDate: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day from now
        imageUrl:
          "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: true,
        pickupAddress: business1.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      }
    );

    // Add listings for Fresh Bakery
    const business2 = businessUsers[1] || defaultBusinesses[1];
    mockListings.push(
      {
        id: generateId(),
        businessId: business2.id,
        businessName: business2.businessName,
        foodName: "Assorted Pastry Box",
        category: "bakery",
        description:
          "A box of our daily fresh pastries including croissants, Danish pastries, and cinnamon rolls. Perfect for breakfast or office meetings!",
        originalPrice: 18.99,
        discountedPrice: 11.99,
        quantity: 4,
        expiryDate: new Date(
          Date.now() + 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day from now
        imageUrl:
          "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: true,
        pickupAddress: business2.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: generateId(),
        businessId: business2.id,
        businessName: business2.businessName,
        foodName: "Artisan Bread Loaf",
        category: "bakery",
        description:
          "Freshly baked artisan sourdough bread. Crispy crust with soft inside. Perfect with soups or for sandwiches.",
        originalPrice: 7.99,
        discountedPrice: 4.99,
        quantity: 6,
        expiryDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days from now
        imageUrl:
          "https://images.pexels.com/photos/1756062/pexels-photo-1756062.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: true,
        pickupAddress: business2.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      }
    );

    // Add listings for Sunny Grocery
    const business3 = businessUsers[2] || defaultBusinesses[2];
    mockListings.push(
      {
        id: generateId(),
        businessId: business3.id,
        businessName: business3.businessName,
        foodName: "Organic Fruit Box",
        category: "produce",
        description:
          "A mix of seasonal organic fruits including apples, oranges, and bananas. Great for daily snacks or juicing!",
        originalPrice: 15.99,
        discountedPrice: 9.99,
        quantity: 8,
        expiryDate: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(), // 3 days from now
        imageUrl:
          "https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: false,
        pickupAddress: business3.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      },
      {
        id: generateId(),
        businessId: business3.id,
        businessName: business3.businessName,
        foodName: "Fresh Dairy Bundle",
        category: "dairy",
        description:
          "A bundle of fresh dairy products including milk, yogurt, and cheese. All items are approaching their sell-by date but still perfectly good!",
        originalPrice: 22.99,
        discountedPrice: 12.99,
        quantity: 3,
        expiryDate: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days from now
        imageUrl:
          "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        pickupOnly: true,
        pickupAddress: business3.businessAddress,
        createdAt: new Date().toISOString(),
        status: "active",
      }
    );

    // Save mock listings to localStorage
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(mockListings));
  }

  // ==================== Listing API Methods ====================

  /**
   * Get all listings
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of listings
   */
  async getListings(filters = {}) {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        let listings = listingsJson ? JSON.parse(listingsJson) : [];

        // Check for expired listings and update their status
        listings = listings.map((listing) => {
          if (isExpired(listing.expiryDate) && listing.status === "active") {
            return { ...listing, status: "expired" };
          }
          return listing;
        });

        // Save updated listings
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));

        // Apply filters if provided
        if (filters) {
          // Filter by business ID
          if (filters.businessId) {
            listings = listings.filter(
              (listing) => listing.businessId === filters.businessId
            );
          }

          // Filter by status
          if (filters.status) {
            listings = listings.filter(
              (listing) => listing.status === filters.status
            );
          }

          // Filter by category
          if (filters.category && filters.category !== "all") {
            listings = listings.filter(
              (listing) => listing.category === filters.category
            );
          }

          // Filter by search term
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            listings = listings.filter(
              (listing) =>
                listing.foodName.toLowerCase().includes(searchTerm) ||
                listing.description.toLowerCase().includes(searchTerm) ||
                listing.businessName.toLowerCase().includes(searchTerm)
            );
          }

          // Sort listings
          if (filters.sortBy) {
            switch (filters.sortBy) {
              case "expiry":
                listings.sort(
                  (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
                );
                break;
              case "price-asc":
                listings.sort((a, b) => a.discountedPrice - b.discountedPrice);
                break;
              case "price-desc":
                listings.sort((a, b) => b.discountedPrice - a.discountedPrice);
                break;
              case "discount":
                listings.sort((a, b) => {
                  const discountA =
                    (a.originalPrice - a.discountedPrice) / a.originalPrice;
                  const discountB =
                    (b.originalPrice - b.discountedPrice) / b.originalPrice;
                  return discountB - discountA;
                });
                break;
            }
          }

          // Limit results
          if (filters.limit && listings.length > filters.limit) {
            listings = listings.slice(0, filters.limit);
          }
        }

        resolve(listings);
      }, 300); // Simulate 300ms network delay
    });
  }

  /**
   * Get a listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise<Object|null>} Listing object or null if not found
   */
  async getListingById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];
        const listing = listings.find((listing) => listing.id === id) || null;

        resolve(listing);
      }, 200);
    });
  }

  /**
   * Create a new listing
   * @param {Object} listingData - Listing data
   * @returns {Promise<Object>} Result object with success flag and message/listing
   */
  async createListing(listingData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized (business or admin)
        if (
          !currentUser ||
          (currentUser.role !== "business" && currentUser.role !== "admin")
        ) {
          resolve({
            success: false,
            message: "Unauthorized: Only businesses can create listings",
          });
          return;
        }

        // Create new listing object
        const newListing = {
          id: generateId(),
          businessId: currentUser.id,
          businessName: currentUser.businessName || currentUser.name,
          ...listingData,
          createdAt: new Date().toISOString(),
          status: "active",
        };

        // Add to listings
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];
        listings.push(newListing);
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));

        resolve({ success: true, listing: newListing });
      }, 300);
    });
  }

  /**
   * Update an existing listing
   * @param {string} id - Listing ID
   * @param {Object} listingData - Updated listing data
   * @returns {Promise<Object>} Result object with success flag and message/listing
   */
  async updateListing(id, listingData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized
        if (
          !currentUser ||
          (currentUser.role !== "business" && currentUser.role !== "admin")
        ) {
          resolve({
            success: false,
            message: "Unauthorized: Only businesses can update listings",
          });
          return;
        }

        // Get existing listings
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];

        // Find the listing
        const listingIndex = listings.findIndex((listing) => listing.id === id);

        if (listingIndex === -1) {
          resolve({ success: false, message: "Listing not found" });
          return;
        }

        const listing = listings[listingIndex];

        // Check if user is the owner or an admin
        if (
          currentUser.role !== "admin" &&
          listing.businessId !== currentUser.id
        ) {
          resolve({
            success: false,
            message: "Unauthorized: You can only update your own listings",
          });
          return;
        }

        // Update listing
        const updatedListing = {
          ...listing,
          ...listingData,
          updatedAt: new Date().toISOString(),
        };

        listings[listingIndex] = updatedListing;
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));

        resolve({ success: true, listing: updatedListing });
      }, 300);
    });
  }

  /**
   * Delete a listing
   * @param {string} id - Listing ID
   * @returns {Promise<Object>} Result object with success flag and message
   */
  async deleteListing(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized
        if (
          !currentUser ||
          (currentUser.role !== "business" && currentUser.role !== "admin")
        ) {
          resolve({
            success: false,
            message: "Unauthorized: Only businesses can delete listings",
          });
          return;
        }

        // Get existing listings
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];

        // Find the listing
        const listingIndex = listings.findIndex((listing) => listing.id === id);

        if (listingIndex === -1) {
          resolve({ success: false, message: "Listing not found" });
          return;
        }

        const listing = listings[listingIndex];

        // Check if user is the owner or an admin
        if (
          currentUser.role !== "admin" &&
          listing.businessId !== currentUser.id
        ) {
          resolve({
            success: false,
            message: "Unauthorized: You can only delete your own listings",
          });
          return;
        }

        // Remove listing
        listings.splice(listingIndex, 1);
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));

        resolve({ success: true, message: "Listing deleted successfully" });
      }, 300);
    });
  }

  // ==================== Cart API Methods ====================

  /**
   * Get cart contents
   * @returns {Promise<Object>} Cart object with items array
   */
  async getCart() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cartJson = localStorage.getItem(CART_KEY);
        const cart = cartJson ? JSON.parse(cartJson) : { items: [] };
        resolve(cart);
      }, 100);
    });
  }

  /**
   * Add item to cart
   * @param {Object} item - Item to add
   * @returns {Promise<Object>} Updated cart object
   */
  async addToCart(item) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cartJson = localStorage.getItem(CART_KEY);
        const cart = cartJson ? JSON.parse(cartJson) : { items: [] };

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex((i) => i.id === item.id);

        if (existingItemIndex !== -1) {
          // Update quantity
          cart.items[existingItemIndex].quantity += item.quantity;
        } else {
          // Add new item
          cart.items.push(item);
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        resolve(cart);
      }, 200);
    });
  }

  /**
   * Update cart item quantity
   * @param {string} itemId - Item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart object
   */
  async updateCartItemQuantity(itemId, quantity) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cartJson = localStorage.getItem(CART_KEY);
        const cart = cartJson ? JSON.parse(cartJson) : { items: [] };

        // Find item
        const itemIndex = cart.items.findIndex((i) => i.id === itemId);

        if (itemIndex !== -1) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
          } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
          }
        }

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        resolve(cart);
      }, 200);
    });
  }

  /**
   * Remove item from cart
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} Updated cart object
   */
  async removeFromCart(itemId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cartJson = localStorage.getItem(CART_KEY);
        const cart = cartJson ? JSON.parse(cartJson) : { items: [] };

        // Remove item
        cart.items = cart.items.filter((i) => i.id !== itemId);

        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        resolve(cart);
      }, 200);
    });
  }

  /**
   * Clear cart
   * @returns {Promise<Object>} Empty cart object
   */
  async clearCart() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const emptyCart = { items: [] };
        localStorage.setItem(CART_KEY, JSON.stringify(emptyCart));
        resolve(emptyCart);
      }, 200);
    });
  }

  // ==================== Order API Methods ====================

  /**
   * Get all orders
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of orders
   */
  async getOrders(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ordersJson = localStorage.getItem(ORDERS_KEY);
        let orders = ordersJson ? JSON.parse(ordersJson) : [];

        // Apply filters if provided
        if (filters) {
          // Filter by user ID (customer)
          if (filters.userId) {
            orders = orders.filter((order) => order.userId === filters.userId);
          }

          // Filter by business ID
          if (filters.businessId) {
            orders = orders.filter((order) => {
              return order.items.some(
                (item) => item.businessId === filters.businessId
              );
            });
          }

          // Filter by status
          if (filters.status && filters.status !== "all") {
            orders = orders.filter((order) => order.status === filters.status);
          }

          // Sort orders (newest first by default)
          orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        resolve(orders);
      }, 300);
    });
  }

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object|null>} Order object or null if not found
   */
  async getOrderById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ordersJson = localStorage.getItem(ORDERS_KEY);
        const orders = ordersJson ? JSON.parse(ordersJson) : [];
        const order = orders.find((order) => order.id === id) || null;

        resolve(order);
      }, 200);
    });
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Result object with success flag and message/order
   */
  async createOrder(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authenticated
        if (!currentUser) {
          resolve({
            success: false,
            message: "Unauthorized: Please log in to place an order",
          });
          return;
        }

        // Get cart
        const cartJson = localStorage.getItem(CART_KEY);
        const cart = cartJson ? JSON.parse(cartJson) : { items: [] };

        if (cart.items.length === 0) {
          resolve({ success: false, message: "Cart is empty" });
          return;
        }

        // Create new order
        const newOrder = {
          id: generateId(),
          userId: currentUser.id,
          userName: currentUser.name,
          userEmail: currentUser.email,
          items: [...cart.items], // Clone cart items
          ...orderData,
          subtotal: cart.items.reduce(
            (total, item) => total + item.discountedPrice * item.quantity,
            0
          ),
          savings: cart.items.reduce(
            (total, item) =>
              total +
              (item.originalPrice - item.discountedPrice) * item.quantity,
            0
          ),
          tax: cart.items.reduce(
            (total, item) =>
              total + item.discountedPrice * item.quantity * 0.08,
            0
          ), // Assuming 8% tax
          total: cart.items.reduce(
            (total, item) =>
              total + item.discountedPrice * item.quantity * 1.08,
            0
          ), // Including tax
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        // Add to orders
        const ordersJson = localStorage.getItem(ORDERS_KEY);
        const orders = ordersJson ? JSON.parse(ordersJson) : [];
        orders.push(newOrder);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

        // Update listings quantities
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];

        cart.items.forEach((item) => {
          const listingIndex = listings.findIndex(
            (listing) => listing.id === item.id
          );
          if (listingIndex !== -1) {
            listings[listingIndex].quantity -= item.quantity;

            // Mark as sold out if quantity is 0
            if (listings[listingIndex].quantity <= 0) {
              listings[listingIndex].status = "sold-out";
            }
          }
        });

        localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));

        // Clear cart
        localStorage.setItem(CART_KEY, JSON.stringify({ items: [] }));

        resolve({ success: true, order: newOrder });
      }, 500);
    });
  }

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Result object with success flag and message/order
   */
  async updateOrderStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized
        if (
          !currentUser ||
          (currentUser.role !== "business" && currentUser.role !== "admin")
        ) {
          resolve({
            success: false,
            message: "Unauthorized: Only businesses can update orders",
          });
          return;
        }

        // Get orders
        const ordersJson = localStorage.getItem(ORDERS_KEY);
        const orders = ordersJson ? JSON.parse(ordersJson) : [];

        // Find order
        const orderIndex = orders.findIndex((order) => order.id === id);

        if (orderIndex === -1) {
          resolve({ success: false, message: "Order not found" });
          return;
        }

        const order = orders[orderIndex];

        // If business user, check if they own any items in the order
        if (currentUser.role === "business") {
          const ownsAnyItem = order.items.some(
            (item) => item.businessId === currentUser.id
          );

          if (!ownsAnyItem) {
            resolve({
              success: false,
              message:
                "Unauthorized: You can only update orders for your listings",
            });
            return;
          }
        }

        // Update order status
        order.status = status;
        order.updatedAt = new Date().toISOString();

        orders[orderIndex] = order;
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

        resolve({ success: true, order });
      }, 300);
    });
  }

  // ==================== User API Methods ====================

  /**
   * Get all users
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of users
   */
  async getUsers(filters = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is an admin
        if (!currentUser || currentUser.role !== "admin") {
          resolve({
            success: false,
            message: "Unauthorized: Only admins can view all users",
          });
          return;
        }

        let users = authService.getUsers();

        // Apply filters
        if (filters) {
          // Filter by role
          if (filters.role && filters.role !== "all") {
            users = users.filter((user) => user.role === filters.role);
          }

          // Filter by status
          if (filters.status && filters.status !== "all") {
            users = users.filter((user) => user.status === filters.status);
          }

          // Filter by search term
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            users = users.filter(
              (user) =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                (user.businessName &&
                  user.businessName.toLowerCase().includes(searchTerm))
            );
          }

          // Sort users by join date (newest first by default)
          users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        resolve({ success: true, users });
      }, 300);
    });
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} Result object with success flag and user/message
   */
  async getUserById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized (admin or the user themselves)
        if (
          !currentUser ||
          (currentUser.role !== "admin" && currentUser.id !== id)
        ) {
          resolve({
            success: false,
            message: "Unauthorized: You can only view your own profile",
          });
          return;
        }

        const users = authService.getUsers();
        const user = users.find((user) => user.id === id);

        if (!user) {
          resolve({ success: false, message: "User not found" });
          return;
        }

        resolve({ success: true, user });
      }, 200);
    });
  }

  /**
   * Update user status (block/unblock)
   * @param {string} id - User ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Result object with success flag and message
   */
  async updateUserStatus(id, status) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is an admin
        if (!currentUser || currentUser.role !== "admin") {
          resolve({
            success: false,
            message: "Unauthorized: Only admins can update user status",
          });
          return;
        }

        const users = authService.getUsers();
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
          resolve({ success: false, message: "User not found" });
          return;
        }

        // Prevent blocking self
        if (id === currentUser.id) {
          resolve({
            success: false,
            message: "You cannot block your own account",
          });
          return;
        }

        // Update user status
        users[userIndex].status = status;
        users[userIndex].updatedAt = new Date().toISOString();

        authService.saveUsers(users);

        resolve({
          success: true,
          message: `User ${
            status === "blocked" ? "blocked" : "activated"
          } successfully`,
        });
      }, 300);
    });
  }

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Result object with success flag and message/user
   */
  async updateUserProfile(id, userData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authorized (admin or the user themselves)
        if (
          !currentUser ||
          (currentUser.role !== "admin" && currentUser.id !== id)
        ) {
          resolve({
            success: false,
            message: "Unauthorized: You can only update your own profile",
          });
          return;
        }

        const users = authService.getUsers();
        const userIndex = users.findIndex((user) => user.id === id);

        if (userIndex === -1) {
          resolve({ success: false, message: "User not found" });
          return;
        }

        // Update user data
        const updatedUser = {
          ...users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString(),
        };

        // Don't allow changing role unless admin
        if (currentUser.role !== "admin") {
          updatedUser.role = users[userIndex].role;
        }

        users[userIndex] = updatedUser;
        authService.saveUsers(users);

        // Update session if current user
        if (id === currentUser.id) {
          const session = authService.getSession();
          if (session) {
            session.userName = updatedUser.name;
            authService.saveSession(session);
          }
        }

        resolve({ success: true, user: updatedUser });
      }, 300);
    });
  }

  // ==================== Stats API Methods ====================

  /**
   * Get statistics for dashboard
   * @param {string} type - Type of stats ('admin', 'business', or 'overview')
   * @returns {Promise<Object>} Statistics object
   */
  async getStats(type = "overview") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = authService.getCurrentUser();

        // Check if user is authenticated
        if (!currentUser) {
          resolve({
            success: false,
            message: "Unauthorized: Please log in to view stats",
          });
          return;
        }

        const users = authService.getUsers();
        const listingsJson = localStorage.getItem(LISTINGS_KEY);
        const listings = listingsJson ? JSON.parse(listingsJson) : [];
        const ordersJson = localStorage.getItem(ORDERS_KEY);
        const orders = ordersJson ? JSON.parse(ordersJson) : [];

        let stats = {};

        switch (type) {
          case "admin":
            // Admin dashboard stats
            if (currentUser.role !== "admin") {
              resolve({
                success: false,
                message: "Unauthorized: Only admins can view admin stats",
              });
              return;
            }

            stats = {
              totalUsers: users.length,
              totalCustomers: users.filter((user) => user.role === "customer")
                .length,
              totalBusinesses: users.filter((user) => user.role === "business")
                .length,
              totalAdmins: users.filter((user) => user.role === "admin").length,
              totalListings: listings.length,
              activeListings: listings.filter(
                (listing) => listing.status === "active"
              ).length,
              totalOrders: orders.length,
              totalRevenue: orders.reduce(
                (total, order) => total + order.total,
                0
              ),
              totalFoodSaved: orders.reduce(
                (total, order) =>
                  total +
                  order.items.reduce(
                    (itemTotal, item) => itemTotal + item.quantity,
                    0
                  ),
                0
              ),
              recentActivity: this.generateMockActivityLogs(5),
              categoryBreakdown: this.generateCategoryBreakdown(listings),
              monthlyOrders: this.generateMonthlyOrdersData(),
            };
            break;

          case "business":
            // Business dashboard stats
            if (
              currentUser.role !== "business" &&
              currentUser.role !== "admin"
            ) {
              resolve({
                success: false,
                message:
                  "Unauthorized: Only businesses can view business stats",
              });
              return;
            }

            const businessListings = listings.filter(
              (listing) => listing.businessId === currentUser.id
            );
            const businessOrders = orders.filter((order) =>
              order.items.some((item) => item.businessId === currentUser.id)
            );

            stats = {
              activeListings: businessListings.filter(
                (listing) => listing.status === "active"
              ).length,
              pendingOrders: businessOrders.filter(
                (order) => order.status === "pending"
              ).length,
              foodSaved: businessOrders.reduce(
                (total, order) =>
                  total +
                  order.items.reduce(
                    (itemTotal, item) =>
                      item.businessId === currentUser.id
                        ? itemTotal + item.quantity
                        : itemTotal,
                    0
                  ),
                0
              ),
              totalRevenue: businessOrders.reduce(
                (total, order) =>
                  total +
                  order.items.reduce(
                    (itemTotal, item) =>
                      item.businessId === currentUser.id
                        ? itemTotal + item.discountedPrice * item.quantity
                        : itemTotal,
                    0
                  ),
                0
              ),
              recentActivity: this.generateMockActivityLogs(3, currentUser.id),
              expiringListings: businessListings
                .filter(
                  (listing) =>
                    listing.status === "active" &&
                    new Date(listing.expiryDate) > new Date() &&
                    new Date(listing.expiryDate) <
                      new Date(Date.now() + 24 * 60 * 60 * 1000)
                ) // Within 24 hours
                .sort(
                  (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
                ),
            };
            break;

          default:
            // Overview stats (for home page)
            stats = {
              totalMealsSaved: 1500 + Math.floor(Math.random() * 100),
              co2Reduced: 3750 + Math.floor(Math.random() * 250),
              partnerBusinesses: users.filter(
                (user) => user.role === "business"
              ).length,
            };
        }

        resolve({ success: true, stats });
      }, 300);
    });
  }

  /**
   * Generate mock activity logs
   * @param {number} count - Number of logs to generate
   * @param {string} businessId - Optional business ID to filter by
   * @returns {Array} Array of activity log objects
   */
  generateMockActivityLogs(count = 5, businessId = null) {
    const activities = [
      { type: "listing-created", message: "New listing created: {item}" },
      { type: "listing-updated", message: "Listing updated: {item}" },
      { type: "order-placed", message: "New order received for {item}" },
      { type: "order-completed", message: "Order completed for {item}" },
    ];

    const listingsJson = localStorage.getItem(LISTINGS_KEY);
    let listings = listingsJson ? JSON.parse(listingsJson) : [];

    // Filter by business ID if provided
    if (businessId) {
      listings = listings.filter(
        (listing) => listing.businessId === businessId
      );
    }

    const logs = [];

    for (let i = 0; i < count && i < listings.length; i++) {
      const listing = listings[i];
      const activity =
        activities[Math.floor(Math.random() * activities.length)];

      logs.push({
        id: generateId(),
        type: activity.type,
        message: activity.message.replace("{item}", listing.foodName),
        timestamp: new Date(
          Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000
        ).toISOString(), // Random time within last 48 hours
        item: {
          id: listing.id,
          name: listing.foodName,
        },
      });
    }

    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return logs;
  }

  /**
   * Generate category breakdown
   * @param {Array} listings - Listings array
   * @returns {Array} Category breakdown data
   */
  generateCategoryBreakdown(listings) {
    const categories = {
      meals: { count: 0, weight: 0 },
      bakery: { count: 0, weight: 0 },
      produce: { count: 0, weight: 0 },
      dairy: { count: 0, weight: 0 },
      other: { count: 0, weight: 0 },
    };

    // Assign weights to each category
    listings.forEach((listing) => {
      if (categories[listing.category]) {
        categories[listing.category].count++;
        // Assign random weight per item
        const weight =
          (listing.category === "meals" ? 0.5 : 0.3) * listing.quantity;
        categories[listing.category].weight += weight;
      } else {
        categories.other.count++;
        categories.other.weight += 0.3 * listing.quantity;
      }
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      weight: Math.round(data.weight * 10) / 10, // Round to 1 decimal place
      percentage:
        listings.length > 0
          ? Math.round((data.count / listings.length) * 100)
          : 0,
    }));
  }

  /**
   * Generate monthly orders data
   * @returns {Array} Monthly orders data
   */
  generateMonthlyOrdersData() {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentMonth = new Date().getMonth();

    return months.map((month, index) => {
      // Generate reasonable increasing trend with some randomness
      const value = 10 + index * 5 + Math.floor(Math.random() * 20);

      // Make future months have null values
      return {
        month,
        value: index <= currentMonth ? value : null,
      };
    });
  }
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;
