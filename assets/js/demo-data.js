/**
 * SKILLNEST — GPM SEED DEMO DATA
 * Realistic data model for Government Polytechnic Mumbai
 */

const SKILLNEST_DATA = {
  currentUser: {
    id: 1,
    name: "Tanmay Ghadi",
    studentNo: "2208045",
    branch: "Computer Engineering",
    year: "TY",
    email: "tanmay.ghadi@gpm.ac.in",
    avatar: "assets/images/avatars/tanmay.jpg",
    rating: 4.9,
    reviewsCount: 28,
    activeOrders: 3,
    myServicesCount: 5,
    resourcesCount: 12,
    bio: "Enthusiastic web developer & presentation designer. Passionate about clean code, intuitive UI/UX, and helping batchmates ace seminars.",
    skills: ["Web Development", "PPT Design", "UI/UX", "C++", "DBMS", "Problem Solving"],
    role: "student",
    verified: true
  },

  categories: [
    { id: 1, name: "Academic Resources", slug: "academic", icon: "bi-journal-bookmark", count: "120+ Materials", color: "lavender" },
    { id: 2, name: "Projects & Development", slug: "development", icon: "bi-code-slash", count: "48+ Services", color: "green" },
    { id: 3, name: "PPT & Documents", slug: "ppt", icon: "bi-file-earmark-slides", count: "65+ Services", color: "peach" },
    { id: 4, name: "Design & Media", slug: "design", icon: "bi-palette", count: "34+ Services", color: "blue" },
    { id: 5, name: "Printing Services", slug: "printing", icon: "bi-printer", count: "Campus Pickup", color: "yellow" },
    { id: 6, name: "Career & Professional", slug: "career", icon: "bi-briefcase", count: "22+ Mentors", color: "peach" }
  ],

  services: [
    {
      id: 1,
      title: "Professional PPT Design for Seminars & Projects",
      category: "ppt",
      categoryName: "PPT & Documents",
      provider: {
        id: 1,
        name: "Tanmay Ghadi",
        branch: "Computer Engineering",
        year: "TY",
        avatar: "assets/images/avatars/tanmay.jpg",
        rating: 4.9,
        reviewsCount: 28,
        responseTime: "< 2 hours"
      },
      price: 200,
      deliveryDays: 2,
      coverImage: "assets/images/services/service_ppt.jpg",
      description: "Clean, creative and professional presentations tailored for diploma technical seminars, micro-project vivas, and project defense. Includes typography hierarchy, custom diagram vectorization, slide transitions, and full PowerPoint (.pptx) source file.",
      features: [
        "Customised Botanical / Minimal Theme",
        "Technical Content Structuring & Formatting",
        "High-Resolution Charts & Diagrams",
        "Speaker Notes for Seminar Practice",
        "Up to 2 Iterations / Minor Revisions",
        "Delivery within 48 Hours"
      ],
      rating: 4.9,
      reviewsCount: 24,
      isFavorite: true
    },
    {
      id: 2,
      title: "Responsive Frontend Web Development & UI Support",
      category: "development",
      categoryName: "Projects & Development",
      provider: {
        id: 3,
        name: "Aditya Sharma",
        branch: "Information Technology",
        year: "TY",
        avatar: "assets/images/avatars/aditya.jpg",
        rating: 4.8,
        reviewsCount: 19,
        responseTime: "< 1 hour"
      },
      price: 450,
      deliveryDays: 3,
      coverImage: "assets/images/services/service_web.jpg",
      description: "Need an aesthetic, functional frontend for your diploma micro-project or final capstone submission? I develop clean HTML5, CSS3, JavaScript, and Bootstrap interfaces with zero bloat and well-commented code that is easy to explain during external examination.",
      features: [
        "Fully Mobile-Responsive Layout",
        "Clean, Well-Commented Codebase",
        "Form Validation & Modal Popups",
        "Complete ZIP Package + Setup Guide",
        "Viva Preparation Q&A Assistance"
      ],
      rating: 4.8,
      reviewsCount: 19,
      isFavorite: false
    },
    {
      id: 3,
      title: "Comprehensive DBMS & OS Handwritten Study Notes",
      category: "academic",
      categoryName: "Academic Resources",
      provider: {
        id: 2,
        name: "Sneha Patil",
        branch: "Computer Engineering",
        year: "TY",
        avatar: "assets/images/avatars/sneha.jpg",
        rating: 4.9,
        reviewsCount: 42,
        responseTime: "< 30 mins"
      },
      price: 120,
      deliveryDays: 1,
      coverImage: "assets/images/services/service_notes.jpg",
      description: "Carefully organized, color-coded handwritten notes for Database Management Systems (22519) and Operating Systems (22516) following the MSBTE I-Scheme curriculum. Solved previous year question paper summaries included.",
      features: [
        "Curated Unit-wise Breakdown",
        "Clear Relational Schemas & ER Diagrams",
        "Last 5 Years Solved MSBTE PYQs",
        "High-Resolution Scanned PDF",
        "Instant Download Access"
      ],
      rating: 4.9,
      reviewsCount: 42,
      isFavorite: true
    },
    {
      id: 4,
      title: "Creative Event Poster & Technical Fest Branding",
      category: "design",
      categoryName: "Design & Media",
      provider: {
        id: 4,
        name: "Riya Kulkarni",
        branch: "Civil Engineering",
        year: "SY",
        avatar: "assets/images/avatars/riya.jpg",
        rating: 4.7,
        reviewsCount: 15,
        responseTime: "< 3 hours"
      },
      price: 180,
      deliveryDays: 2,
      coverImage: "assets/images/services/service_design.jpg",
      description: "Eye-catching graphic design for departmental tech fests, cultural events, sports meets, or student club logos. Printable vector files with modern color schemes and high-resolution exports.",
      features: [
        "Print-ready CMYK + Digital RGB Formats",
        "Instagram & WhatsApp Story Dimensions",
        "Source Illustrator / Figma / PSD files",
        "2 Unique Design Concepts"
      ],
      rating: 4.7,
      reviewsCount: 15,
      isFavorite: false
    },
    {
      id: 5,
      title: "Express On-Campus Spiral Document Printing & Handoff",
      category: "printing",
      categoryName: "Printing Services",
      provider: {
        id: 3,
        name: "Aditya Sharma",
        branch: "Information Technology",
        year: "TY",
        avatar: "assets/images/avatars/aditya.jpg",
        rating: 4.9,
        reviewsCount: 31,
        responseTime: "< 15 mins"
      },
      price: 90,
      deliveryDays: 1,
      coverImage: "assets/images/services/service_notes.jpg",
      description: "Avoid long stationary queues on deadline mornings. Send your lab manuals or project reports for high-grade 75 GSM B&W or color spiral binding with quick pickup near GPM Canteen or Main Building foyer.",
      features: [
        "75 GSM Premium White Paper",
        "Transparent Front Sheet & Spiral Binding",
        "Black & White / Color Print Options",
        "Convenient Campus Handover"
      ],
      rating: 4.9,
      reviewsCount: 31,
      isFavorite: false
    },
    {
      id: 6,
      title: "Technical Resume & LinkedIn Profile Optimization",
      category: "career",
      categoryName: "Career & Professional",
      provider: {
        id: 1,
        name: "Tanmay Ghadi",
        branch: "Computer Engineering",
        year: "TY",
        avatar: "assets/images/avatars/tanmay.jpg",
        rating: 4.8,
        reviewsCount: 16,
        responseTime: "< 2 hours"
      },
      price: 150,
      deliveryDays: 1,
      coverImage: "assets/images/services/service_ppt.jpg",
      description: "Get your diploma resume tailored for campus placements (L&T, Tata Motors, Capgemini, TCS). Includes clean single-page formatting, bullet-point phrasing, and ATS keyword matching.",
      features: [
        "Clean Minimal ATS Resume Template",
        "Action-Verb Bullet Refinements",
        "LinkedIn Headline & Summary Revamp",
        "Editable Google Doc + PDF Export"
      ],
      rating: 4.8,
      reviewsCount: 16,
      isFavorite: false
    }
  ],

  resources: [
    {
      id: 1,
      subject: "Database Management Systems (DBMS)",
      branch: "Computer Engineering",
      branchCode: "CO",
      semester: "Sem 5",
      type: "Notes",
      fileName: "DBMS_Module_Notes_GPM_2026.pdf",
      fileSize: "3.4 MB",
      uploader: { name: "Sneha Patil", avatar: "assets/images/avatars/sneha.jpg" },
      downloads: 142,
      verified: true,
      description: "Complete chapter-wise theoretical notes with ER diagrams and normalization examples."
    },
    {
      id: 2,
      subject: "Operating Systems (OS) Solved Papers",
      branch: "Computer Engineering",
      branchCode: "CO",
      semester: "Sem 5",
      type: "PYQs",
      fileName: "OS_MSBTE_Solved_Papers_2022_2025.pdf",
      fileSize: "2.8 MB",
      uploader: { name: "Tanmay Ghadi", avatar: "assets/images/avatars/tanmay.jpg" },
      downloads: 215,
      verified: true,
      description: "MSBTE previous year questions solved with process scheduling and memory management diagrams."
    },
    {
      id: 3,
      subject: "Client Side Scripting (CSS / JS) Lab Manual",
      branch: "Information Technology",
      branchCode: "IT",
      semester: "Sem 5",
      type: "Manuals",
      fileName: "CSS_Lab_Manual_Executed_Codes.pdf",
      fileSize: "1.9 MB",
      uploader: { name: "Aditya Sharma", avatar: "assets/images/avatars/aditya.jpg" },
      downloads: 98,
      verified: true,
      description: "All 16 prescribed laboratory experiments with executed outputs and syntax explanations."
    },
    {
      id: 4,
      subject: "Digital Electronics Model Question Papers",
      branch: "EXTC",
      branchCode: "EJ",
      semester: "Sem 3",
      type: "PYQs",
      fileName: "Digital_Electronics_Model_Answers.pdf",
      fileSize: "4.1 MB",
      uploader: { name: "Sneha Patil", avatar: "assets/images/avatars/sneha.jpg" },
      downloads: 180,
      verified: true,
      description: "K-Map simplifications, flip-flops, and counter circuits model answers."
    },
    {
      id: 5,
      subject: "Building Construction & Materials Guide",
      branch: "Civil Engineering",
      branchCode: "CE",
      semester: "Sem 3",
      type: "Notes",
      fileName: "BCM_Illustrated_Study_Guide.pdf",
      fileSize: "5.2 MB",
      uploader: { name: "Riya Kulkarni", avatar: "assets/images/avatars/riya.jpg" },
      downloads: 76,
      verified: true,
      description: "Comprehensive notes with hand-drawn structural sketches for masonry, lintels, and roofs."
    },
    {
      id: 6,
      subject: "Advanced Java Programming (AJP) Manual",
      branch: "Computer Engineering",
      branchCode: "CO",
      semester: "Sem 5",
      type: "Manuals",
      fileName: "AJP_Complete_Lab_Manual.pdf",
      fileSize: "2.5 MB",
      uploader: { name: "Tanmay Ghadi", avatar: "assets/images/avatars/tanmay.jpg" },
      downloads: 164,
      verified: true,
      description: "Swings, Event Handling, and JDBC programs with terminal execution screenshots."
    }
  ],

  students: [
    {
      id: 1,
      name: "Tanmay Ghadi",
      year: "TY",
      branch: "Computer Engineering",
      branchKey: "Computer",
      avatar: "assets/images/avatars/tanmay.jpg",
      rating: 4.9,
      completedOrders: 32,
      skills: ["Web Dev", "PPT Design", "UI/UX", "DBMS", "C++"],
      bio: "Web developer & PPT stylist. Always open to collaborate on micro-projects and semester seminars.",
      status: "Available"
    },
    {
      id: 2,
      name: "Sneha Patil",
      year: "TY",
      branch: "Computer Engineering",
      branchKey: "Computer",
      avatar: "assets/images/avatars/sneha.jpg",
      rating: 4.9,
      completedOrders: 48,
      skills: ["DBMS", "OS Notes", "PYQ Solutions", "Report Writing"],
      bio: "Academic topper compiling high-yield study resources and formula sheets for GPM batchmates.",
      status: "Available"
    },
    {
      id: 3,
      name: "Aditya Sharma",
      year: "TY",
      branch: "Information Technology",
      branchKey: "Computer",
      avatar: "assets/images/avatars/aditya.jpg",
      rating: 4.8,
      completedOrders: 25,
      skills: ["Frontend", "PHP", "Bootstrap", "Printing Handoff"],
      bio: "Coding mentor & quick campus printing coordinator. Drop a message for debugging help.",
      status: "Available"
    },
    {
      id: 4,
      name: "Riya Kulkarni",
      year: "SY",
      branch: "Civil Engineering",
      branchKey: "Civil",
      avatar: "assets/images/avatars/riya.jpg",
      rating: 4.7,
      completedOrders: 18,
      skills: ["AutoCAD", "Poster Design", "BCM Notes", "Illustrator"],
      bio: "Civil engineering student with an eye for aesthetics. Assisting clubs with banners & graphics.",
      status: "Available"
    },
    {
      id: 5,
      name: "Kunal Deshmukh",
      year: "TY",
      branch: "Mechanical Engineering",
      branchKey: "Mechanical",
      avatar: "assets/images/avatars/tanmay.jpg",
      rating: 4.8,
      completedOrders: 14,
      skills: ["SolidWorks", "SOM Notes", "CNC Basics", "Project Synopsis"],
      bio: "CAD modeler & mechanical lab assistant. Helping SY/TY juniors with drawing sheets and reports.",
      status: "Available"
    },
    {
      id: 6,
      name: "Pooja Sawant",
      year: "SY",
      branch: "Electronics & Telecomm (EXTC)",
      branchKey: "EXTC",
      avatar: "assets/images/avatars/sneha.jpg",
      rating: 4.8,
      completedOrders: 21,
      skills: ["Digital Electronics", "Arduino", "Circuit Sim", "PYQs"],
      bio: "Electronics enthusiast. Offering circuit simulation guidance and clean theory notes.",
      status: "Available"
    }
  ],

  orders: [
    {
      id: "SN-1082",
      serviceId: 1,
      serviceTitle: "Professional PPT Design for Seminars & Projects",
      role: "requester",
      counterpart: { name: "Tanmay Ghadi", avatar: "assets/images/avatars/tanmay.jpg", branch: "TY Computer" },
      status: "in_progress",
      statusText: "In Progress",
      amount: "₹200",
      date: "Sep 03, 2026",
      deadline: "Sep 12, 2026",
      instructions: "Please design a 15-slide presentation on 'Cloud Security Architecture' for my TY Seminar. Focus on encryption and IAM.",
      submittedFiles: ["Seminar_Draft_v1.pptx"],
      canSubmitWork: true,
      canRequestRevision: true
    },
    {
      id: "SN-1079",
      serviceId: 2,
      serviceTitle: "Responsive Frontend Web Development & UI Support",
      role: "provider",
      counterpart: { name: "Riya Kulkarni", avatar: "assets/images/avatars/riya.jpg", branch: "SY Civil" },
      status: "completed",
      statusText: "Completed",
      amount: "₹450",
      date: "Aug 26, 2026",
      deadline: "Sep 02, 2026",
      instructions: "Build an online book catalog frontend with clean card layout and filter buttons.",
      submittedFiles: ["Civil_Library_Portal_vFinal.zip"],
      ratingGiven: 5,
      canSubmitWork: false,
      canRequestRevision: false
    },
    {
      id: "SN-1065",
      serviceId: 3,
      serviceTitle: "Comprehensive DBMS & OS Handwritten Study Notes",
      role: "requester",
      counterpart: { name: "Sneha Patil", avatar: "assets/images/avatars/sneha.jpg", branch: "TY Computer" },
      status: "completed",
      statusText: "Completed",
      amount: "₹120",
      date: "Aug 24, 2026",
      deadline: "Aug 28, 2026",
      instructions: "Need Chapter 3 & 4 DBMS transaction management notes with solved questions.",
      submittedFiles: ["DBMS_Ch3_Transactions_SnehaNotes.pdf"],
      ratingGiven: 5,
      canSubmitWork: false,
      canRequestRevision: false
    },
    {
      id: "SN-1090",
      serviceId: 4,
      serviceTitle: "Creative Event Poster & Technical Fest Branding",
      role: "requester",
      counterpart: { name: "Riya Kulkarni", avatar: "assets/images/avatars/riya.jpg", branch: "SY Civil" },
      status: "pending",
      statusText: "Pending Approval",
      amount: "₹180",
      date: "Sep 04, 2026",
      deadline: "Sep 15, 2026",
      instructions: "Poster for GPM Computer Dept Hackathon 2026 with botanical tech theme.",
      submittedFiles: [],
      canSubmitWork: false,
      canRequestRevision: false
    }
  ],

  complaints: [
    {
      id: 1,
      studentName: "Aditya Sharma",
      studentNo: "2108034",
      orderNo: "SN-1061",
      category: "Download Issue",
      subject: "Resource download link timeout on campus Wi-Fi",
      status: "resolved",
      date: "Aug 29, 2026",
      resolution: "Re-cached PDF on local campus mirror."
    },
    {
      id: 2,
      studentName: "Kunal Deshmukh",
      studentNo: "2208088",
      orderNo: "SN-1077",
      category: "Academic Integrity",
      subject: "Clarification on capstone assistance boundaries",
      status: "investigating",
      date: "Sep 02, 2026",
      resolution: "Faculty committee reviewed deliverable; verified ethical guidance only."
    },
    {
      id: 3,
      studentName: "Pooja Sawant",
      studentNo: "2308022",
      orderNo: "SN-1088",
      category: "Delivery Delay",
      subject: "Provider requested 24h deadline extension due to internal unit test",
      status: "pending",
      date: "Sep 04, 2026",
      resolution: "Under mutual review."
    }
  ]
};
