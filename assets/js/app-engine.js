/**
 * SKILLNEST — CLIENT-SIDE STATE & INTERACTION ENGINE
 * Bridges local interaction with persistence and graceful backend fallback
 */

const AppEngine = (function() {
  const STORAGE_KEY = "skillnest_state_v1";

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not parse LocalStorage, resetting to default.", e);
    }
    // Initialize with seed data
    const initial = JSON.parse(JSON.stringify(SKILLNEST_DATA));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to LocalStorage:", e);
    }
  }

  let state = loadState();

  return {
    getState: () => state,

    resetToDemo: () => {
      state = JSON.parse(JSON.stringify(SKILLNEST_DATA));
      saveState(state);
      window.location.reload();
    },

    getCurrentUser: () => state.currentUser,

    getServices: () => state.services,

    getServiceById: (id) => {
      const numId = parseInt(id, 10);
      return state.services.find(s => s.id === numId) || state.services[0];
    },

    getCategories: () => state.categories,

    getResources: () => state.resources,

    getStudents: () => state.students,

    getOrders: () => state.orders,

    getComplaints: () => state.complaints,

    // Create a new order
    createOrder: (orderData) => {
      const newId = "SN-" + (Math.floor(1000 + Math.random() * 9000));
      const newOrder = {
        id: newId,
        serviceId: orderData.serviceId || 1,
        serviceTitle: orderData.serviceTitle || "Requested Service",
        role: "requester",
        counterpart: {
          name: orderData.providerName || "Tanmay Ghadi",
          avatar: orderData.providerAvatar || "assets/images/avatars/tanmay.jpg",
          branch: "Computer Engineering"
        },
        status: "pending",
        statusText: "Pending Acceptance",
        amount: orderData.amount || "₹200",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        deadline: orderData.deadline || "Within 3 Days",
        instructions: orderData.instructions || "Standard diploma guidance and formatting.",
        submittedFiles: [],
        canSubmitWork: false,
        canRequestRevision: false
      };

      state.orders.unshift(newOrder);
      state.currentUser.activeOrders += 1;
      saveState(state);
      return newOrder;
    },

    // Submit work files for an order
    submitWork: (orderId, fileName) => {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        if (!order.submittedFiles) order.submittedFiles = [];
        order.submittedFiles.push(fileName || "Completed_Deliverable.zip");
        order.status = "completed";
        order.statusText = "Completed (Delivered)";
        order.canSubmitWork = false;
        order.canRequestRevision = true;
        saveState(state);
        return true;
      }
      return false;
    },

    // Request revision on an order
    requestRevision: (orderId, feedback) => {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = "in_progress";
        order.statusText = "Revision Requested";
        order.revisionFeedback = feedback;
        saveState(state);
        return true;
      }
      return false;
    },

    // Add review
    submitReview: (orderId, rating, comment) => {
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.ratingGiven = rating;
        order.reviewComment = comment;
        saveState(state);
        return true;
      }
      return false;
    },

    // Upload a new resource
    uploadResource: (resource) => {
      const newRes = {
        id: state.resources.length + 1,
        subject: resource.subject,
        branch: resource.branch,
        branchCode: resource.branch.substring(0, 2).toUpperCase(),
        semester: resource.semester,
        type: resource.type,
        fileName: resource.fileName || `${resource.subject.replace(/\s+/g, '_')}_Notes.pdf`,
        fileSize: "2.4 MB",
        uploader: { name: state.currentUser.name, avatar: state.currentUser.avatar },
        downloads: 0,
        verified: true,
        description: resource.description || "Shared by GPM student community."
      };
      state.resources.unshift(newRes);
      state.currentUser.resourcesCount += 1;
      saveState(state);
      return newRes;
    },

    // Post a new service
    createService: (service) => {
      const newServ = {
        id: state.services.length + 1,
        title: service.title,
        category: service.category || "development",
        categoryName: service.categoryName || "Projects & Development",
        provider: {
          id: state.currentUser.id,
          name: state.currentUser.name,
          branch: state.currentUser.branch,
          year: state.currentUser.year,
          avatar: state.currentUser.avatar,
          rating: 5.0,
          reviewsCount: 0,
          responseTime: "< 1 hour"
        },
        price: parseInt(service.price, 10) || 200,
        deliveryDays: parseInt(service.deliveryDays, 10) || 2,
        coverImage: service.coverImage || "assets/images/services/service_ppt.jpg",
        description: service.description,
        features: service.features || ["Customized Support", "Syllabus Compliance", "Minor Revisions"],
        rating: 5.0,
        reviewsCount: 0,
        isFavorite: false
      };
      state.services.unshift(newServ);
      state.currentUser.myServicesCount += 1;
      saveState(state);
      return newServ;
    },

    // Increment resource download count
    downloadResource: (resourceId) => {
      const res = state.resources.find(r => r.id === parseInt(resourceId, 10));
      if (res) {
        res.downloads += 1;
        saveState(state);
        return res.downloads;
      }
      return 0;
    },

    // Resolve complaint in admin
    resolveComplaint: (complaintId, resolutionText) => {
      const comp = state.complaints.find(c => c.id === parseInt(complaintId, 10));
      if (comp) {
        comp.status = "resolved";
        comp.resolution = resolutionText || "Resolved by Academic Committee.";
        saveState(state);
        return true;
      }
      return false;
    },

    // Toast banner
    showToast: (title, message, iconClass = "bi-check-circle-fill text-success") => {
      let toast = document.getElementById("skillnest-global-toast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "skillnest-global-toast";
        toast.className = "sn-toast";
        document.body.appendChild(toast);
      }
      toast.innerHTML = `
        <i class="bi ${iconClass} fs-5"></i>
        <div>
          <strong style="display:block; color:var(--text-primary); font-size:0.9rem;">${title}</strong>
          <span style="color:var(--text-muted); font-size:0.82rem;">${message}</span>
        </div>
      `;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 4000);
    }
  };
})();

// Global Quick Login Handlers for instant demo testing
function demoLogin(role) {
  if (role === 'admin') {
    window.location.href = 'admin.php';
  } else {
    window.location.href = 'dashboard.php';
  }
}
