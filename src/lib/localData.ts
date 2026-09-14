import { Profile, FreelancerProfile, Service, ServiceCategory, Order, AcademicResource, Notification, Review } from '../types/database';

export const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-web',
    name: 'Web Development & Coding',
    slug: 'web-development',
    icon: 'Code2',
    description: 'Frontend UI, React, PHP, Python, and diploma project debugging assistance.'
  },
  {
    id: 'cat-cad',
    name: 'CAD & Engineering Drafting',
    slug: 'cad-drafting',
    icon: 'Compass',
    description: 'AutoCAD 2D plans, Civil drawing sheets, and Mechanical 3D models.'
  },
  {
    id: 'cat-ppt',
    name: 'PPT & Seminar Decks',
    slug: 'ppt-seminar',
    icon: 'Presentation',
    description: 'MSBTE formatted seminar presentations, slide styling, and defense notes.'
  },
  {
    id: 'cat-notes',
    name: 'Academic Notes & PYQ Solutions',
    slug: 'notes-academic',
    icon: 'BookOpen',
    description: 'Curated chapter summaries, handwritten notes, and solved MSBTE papers.'
  },
  {
    id: 'cat-graphics',
    name: 'Graphic & Poster Design',
    slug: 'graphic-design',
    icon: 'Palette',
    description: 'Departmental tech fest banners, event posters, and visual club branding.'
  },
  {
    id: 'cat-docs',
    name: 'Lab Manual Documentation',
    slug: 'documentation',
    icon: 'FileText',
    description: 'Executed laboratory manual writeups and formatted microproject reports.'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-student-1',
    full_name: 'Atharva Tendulkar',
    student_id: '2200150042',
    enrollment_no: '2200150042',
    email: 'atharva.gpm@gmail.com',
    department: 'Computer Engineering',
    year: 'TY',
    semester: 'Sem 5',
    phone: '+91 98231 45012',
    bio: 'TY Computer student at GPM Malvan. Passionate about algorithms and web technologies.',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    is_freelancer: false,
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'user-freelancer-1',
    full_name: 'Tanmay Ghadi',
    student_id: '2200150018',
    enrollment_no: '2200150018',
    email: 'tanmay.gpm@gmail.com',
    department: 'Computer Engineering',
    year: 'TY',
    semester: 'Sem 5',
    phone: '+91 94032 88419',
    bio: 'Fullstack developer & UI designer. Built multiple MSBTE capstone portals and web apps.',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    is_freelancer: true,
    created_at: '2026-01-05T09:30:00Z'
  },
  {
    id: 'user-freelancer-2',
    full_name: 'Pranav Parab',
    student_id: '2200150088',
    enrollment_no: '2200150088',
    email: 'pranav.civil@gmail.com',
    department: 'Civil Engineering',
    year: 'TY',
    semester: 'Sem 5',
    phone: '+91 91580 32104',
    bio: 'AutoCAD specialist with 2+ years drafting building plans, elevation views, and structural layouts.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    is_freelancer: true,
    created_at: '2026-01-08T11:20:00Z'
  },
  {
    id: 'user-freelancer-3',
    full_name: 'Sakshi Raut',
    student_id: '2300150064',
    enrollment_no: '2300150064',
    email: 'sakshi.raut@gmail.com',
    department: 'Mechanical Engineering',
    year: 'SY',
    semester: 'Sem 3',
    phone: '+91 97645 12093',
    bio: 'MSBTE seminar deck stylist, LaTeX formatter, and departmental topper in Thermal Engineering.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    is_freelancer: true,
    created_at: '2026-01-12T14:15:00Z'
  },
  {
    id: 'user-admin-1',
    full_name: 'Prof. V. R. Sawant',
    student_id: 'FAC-001501',
    enrollment_no: 'FAC-001501',
    email: 'admin@gpmalvan.ac.in',
    department: 'Computer Engineering',
    year: 'TY',
    semester: 'Faculty',
    phone: '+91 94220 55110',
    bio: 'Head of Department & SkillNest Campus Coordinator, Government Polytechnic Malvan.',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    is_freelancer: false,
    created_at: '2026-01-01T08:00:00Z'
  }
];

export const INITIAL_FREELANCERS: FreelancerProfile[] = [
  {
    id: 'f-1',
    user_id: 'user-freelancer-1',
    profile_id: 'user-freelancer-1',
    headline: 'Full-Stack Web Developer & UI Designer',
    bio: 'Experienced in React, Node.js, PHP, and Tailwind CSS. Successfully completed over 18 MSBTE project implementations.',
    specializations: ['Web Development', 'PHP & MySQL', 'React Frontend', 'Microproject Code'],
    skills: ['React', 'TypeScript', 'Node.js', 'TailwindCSS', 'PHP', 'MySQL', 'Git'],
    hourly_rate: 150.00,
    rating_avg: 4.9,
    rating: 4.9,
    rating_count: 26,
    reviews_count: 26,
    completed_orders: 18,
    completed_orders_count: 18,
    available: true,
    is_verified: true,
    profile: INITIAL_PROFILES[1]
  },
  {
    id: 'f-2',
    user_id: 'user-freelancer-2',
    profile_id: 'user-freelancer-2',
    headline: 'AutoCAD 2D/3D Drafter & Civil Design Specialist',
    bio: 'Providing municipal building submissions, AutoCAD 2D drafting, structural layouts, and Revit modelling for Civil students.',
    specializations: ['AutoCAD 2D', 'Building Planning', 'Civil Estimations', 'MSBTE Sheets'],
    skills: ['AutoCAD', 'Revit', 'Total Station Data', 'Excel Estimations', '3D SketchUp'],
    hourly_rate: 180.00,
    rating_avg: 4.8,
    rating: 4.8,
    rating_count: 19,
    reviews_count: 19,
    completed_orders: 24,
    completed_orders_count: 24,
    available: true,
    is_verified: true,
    profile: INITIAL_PROFILES[2]
  },
  {
    id: 'f-3',
    user_id: 'user-freelancer-3',
    profile_id: 'user-freelancer-3',
    headline: 'MSBTE Seminar Deck Stylist & Technical Writer',
    bio: 'Crafting stunning, MSBTE-guideline compliant seminar presentations, defense speaking notes, and formatted reports.',
    specializations: ['MSBTE Seminar PPT', 'Technical Writing', 'LaTeX Formatting', 'Canva Presentations'],
    skills: ['PowerPoint', 'Canva Pro', 'LaTeX', 'MS Word Formatting', 'Public Speaking Notes'],
    hourly_rate: 120.00,
    rating_avg: 5.0,
    rating: 5.0,
    rating_count: 31,
    reviews_count: 31,
    completed_orders: 31,
    completed_orders_count: 31,
    available: true,
    is_verified: true,
    profile: INITIAL_PROFILES[3]
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    freelancer_id: 'user-freelancer-1',
    category_id: 'cat-web',
    title: 'MSBTE Capstone Web App UI & Fullstack Debugging',
    description: 'Complete frontend responsive layout in React or Bootstrap/PHP, API integration, and comprehensive debugging for MSBTE diploma project evaluation.',
    price: 350.00,
    delivery_days: 3,
    skills: ['React', 'PHP', 'TailwindCSS', 'Debugging', 'MySQL'],
    tags: ['web', 'projects', 'coding', 'diploma'],
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 3,
    rating: 4.9,
    reviews_count: 14,
    status: 'active',
    created_at: '2026-02-01T12:00:00Z',
    category: INITIAL_CATEGORIES[0],
    freelancer: INITIAL_FREELANCERS[0]
  },
  {
    id: 'srv-2',
    freelancer_id: 'user-freelancer-2',
    category_id: 'cat-cad',
    title: 'AutoCAD 2D Civil Building Plan & Submission Sheet',
    description: 'Standard municipal corporation submission sheet layout with floor plan, section line, elevation view, and scheduled joinery table as per MSBTE syllabus.',
    price: 250.00,
    delivery_days: 2,
    skills: ['AutoCAD', 'Civil Plan', 'Drafting', 'Elevation', 'Sections'],
    tags: ['civil', 'cad', 'drawing', 'autocad'],
    images: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 2,
    rating: 4.8,
    reviews_count: 12,
    status: 'active',
    created_at: '2026-02-05T10:30:00Z',
    category: INITIAL_CATEGORIES[1],
    freelancer: INITIAL_FREELANCERS[1]
  },
  {
    id: 'srv-3',
    freelancer_id: 'user-freelancer-3',
    category_id: 'cat-ppt',
    title: 'MSBTE Seminar Deck & Defense Speaking Notes (15-20 Slides)',
    description: 'High-impact presentation deck with animated diagram flows, research methodology, literature survey tables, and slide-by-slide presenter notes for your external oral exam.',
    price: 150.00,
    delivery_days: 1,
    skills: ['PowerPoint', 'Canva', 'Oral Defense', 'Seminar', 'Formatting'],
    tags: ['ppt', 'presentation', 'seminar', 'slides'],
    images: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 4,
    rating: 5.0,
    reviews_count: 19,
    status: 'active',
    created_at: '2026-02-10T15:00:00Z',
    category: INITIAL_CATEGORIES[2],
    freelancer: INITIAL_FREELANCERS[2]
  },
  {
    id: 'srv-4',
    freelancer_id: 'user-freelancer-1',
    category_id: 'cat-notes',
    title: 'Curated MSBTE K-Scheme Notes & Solved Model PYQs',
    description: 'Concise handwritten and typed formula sheets, previous 5-year exam paper step-by-step solutions, and important 4-mark and 6-mark frequently asked questions.',
    price: 80.00,
    delivery_days: 1,
    skills: ['MSBTE Notes', 'PYQ Solutions', 'Formulas', 'Exam Prep'],
    tags: ['academic', 'notes', 'exam', 'msbte'],
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 1,
    rating: 4.9,
    reviews_count: 22,
    status: 'active',
    created_at: '2026-02-12T16:20:00Z',
    category: INITIAL_CATEGORIES[3],
    freelancer: INITIAL_FREELANCERS[0]
  },
  {
    id: 'srv-5',
    freelancer_id: 'user-freelancer-3',
    category_id: 'cat-graphics',
    title: 'Departmental Tech-Fest Banners & Event Posters',
    description: 'Modern, high-resolution vector posters, social media square banners, and certificates designed for GPM departmental workshops and student forums.',
    price: 180.00,
    delivery_days: 2,
    skills: ['Photoshop', 'Canva', 'Typography', 'Fest Posters', 'Branding'],
    tags: ['design', 'poster', 'banner', 'media'],
    images: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 3,
    rating: 4.8,
    reviews_count: 8,
    status: 'active',
    created_at: '2026-02-15T09:00:00Z',
    category: INITIAL_CATEGORIES[4],
    freelancer: INITIAL_FREELANCERS[2]
  },
  {
    id: 'srv-6',
    freelancer_id: 'user-freelancer-2',
    category_id: 'cat-docs',
    title: 'Complete Executed Lab Manual Writeup & Result Analysis',
    description: 'Typed laboratory manual formatting with sample output screenshots, circuit diagrams, accurate observation calculations, and conclusion notes.',
    price: 120.00,
    delivery_days: 1,
    skills: ['Lab Manual', 'Word Formatting', 'Diagrams', 'Calculations'],
    tags: ['academic', 'manuals', 'documentation'],
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    is_active: true,
    revisions_allowed: 2,
    rating: 4.9,
    reviews_count: 15,
    status: 'active',
    created_at: '2026-02-18T14:45:00Z',
    category: INITIAL_CATEGORIES[5],
    freelancer: INITIAL_FREELANCERS[1]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_no: 'ORD-882910',
    service_id: 'srv-1',
    student_id: 'user-student-1',
    freelancer_id: 'user-freelancer-1',
    service_title: 'MSBTE Capstone Web App UI & Fullstack Debugging',
    amount: 350.00,
    status: 'in_progress',
    deadline: '2026-09-20',
    requirements: 'Need assistance fixing SQLite database relations and CSS styling on mobile view for our final diploma project demo.',
    created_at: '2026-09-10T11:00:00Z',
    student: INITIAL_PROFILES[0],
    freelancer: INITIAL_FREELANCERS[0],
    submissions: []
  },
  {
    id: 'ord-102',
    order_no: 'ORD-541299',
    service_id: 'srv-3',
    student_id: 'user-student-1',
    freelancer_id: 'user-freelancer-3',
    service_title: 'MSBTE Seminar Deck & Defense Speaking Notes (15-20 Slides)',
    amount: 150.00,
    status: 'completed',
    deadline: '2026-09-08',
    requirements: 'Seminar presentation on Artificial Intelligence in Medical Diagnosis. Need MSBTE title slide and reference bibliography.',
    created_at: '2026-09-04T10:00:00Z',
    completed_at: '2026-09-07T16:30:00Z',
    student: INITIAL_PROFILES[0],
    freelancer: INITIAL_FREELANCERS[2],
    submissions: [
      {
        id: 'sub-1',
        order_id: 'ord-102',
        freelancer_id: 'user-freelancer-3',
        notes: 'Here is your completed 18-slide presentation deck with speech defense notes included in slide notes section!',
        file_name: 'AI_Medical_Diagnosis_GPM_Seminar.pptx',
        file_url: 'https://example.com/files/AI_Medical_Diagnosis_GPM_Seminar.pptx',
        submitted_at: '2026-09-07T16:30:00Z'
      }
    ]
  },
  {
    id: 'ord-103',
    order_no: 'ORD-902341',
    service_id: 'srv-2',
    student_id: 'user-student-1',
    freelancer_id: 'user-freelancer-2',
    service_title: 'AutoCAD 2D Civil Building Plan & Submission Sheet',
    amount: 250.00,
    status: 'pending',
    deadline: '2026-09-25',
    requirements: 'Draw G+1 residential building plan as per Konkan coastal climate norms. Built-up area 1200 sq.ft.',
    created_at: '2026-09-12T08:30:00Z',
    student: INITIAL_PROFILES[0],
    freelancer: INITIAL_FREELANCERS[1]
  }
];

export const INITIAL_RESOURCES: AcademicResource[] = [
  {
    id: 'res-1',
    uploader_id: 'user-freelancer-1',
    title: 'MSBTE K-Scheme Computer Network (22417) Question Bank',
    description: 'Comprehensive chapter-wise solved MSBTE question papers from Winter 2022 to Summer 2025.',
    subject: 'Computer Network',
    department: 'Computer Engineering',
    semester: 'Sem 4',
    resource_type: 'PYQs',
    file_url: 'https://example.com/msbte-cn-pyq.pdf',
    file_name: 'MSBTE_CN_22417_Solved_PYQ.pdf',
    file_size: '3.4 MB',
    downloads_count: 142,
    created_at: '2026-01-15T10:00:00Z',
    uploader: INITIAL_PROFILES[1]
  },
  {
    id: 'res-2',
    uploader_id: 'user-freelancer-2',
    title: 'Building Construction & Drawing Standards Reference Manual',
    description: 'Standard municipal norms, standard symbols for doors/windows, and staircase calculation formulas.',
    subject: 'Building Drawing',
    department: 'Civil Engineering',
    semester: 'Sem 3',
    resource_type: 'Manuals',
    file_url: 'https://example.com/civil-drawing-standards.pdf',
    file_name: 'Civil_Building_Drawing_Handbook.pdf',
    file_size: '5.1 MB',
    downloads_count: 98,
    created_at: '2026-01-20T12:00:00Z',
    uploader: INITIAL_PROFILES[2]
  },
  {
    id: 'res-3',
    uploader_id: 'user-freelancer-3',
    title: 'Thermal Engineering Handwritten Revision Formulas (Fast Track)',
    description: 'Quick cheat-sheet containing Carnot cycles, Rankine efficiency formulas, and steam table guide.',
    subject: 'Thermal Engineering',
    department: 'Mechanical Engineering',
    semester: 'Sem 4',
    resource_type: 'Notes',
    file_url: 'https://example.com/thermal-quick-formula.pdf',
    file_name: 'Thermal_Engg_Formula_Notes.pdf',
    file_size: '2.1 MB',
    downloads_count: 210,
    created_at: '2026-02-02T14:30:00Z',
    uploader: INITIAL_PROFILES[3]
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-student-1',
    title: 'Order Completed 🚀',
    message: 'Sakshi Raut has finalized and submitted files for order ORD-541299. Please review!',
    type: 'success',
    link: '/student/requests',
    is_read: false,
    created_at: '2026-09-07T16:35:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'user-student-1',
    title: 'Order Underway ✍️',
    message: 'Tanmay Ghadi started working on your capstone project requirements (ORD-882910).',
    type: 'info',
    link: '/student/requests',
    is_read: false,
    created_at: '2026-09-10T11:15:00Z'
  },
  {
    id: 'notif-3',
    user_id: 'user-freelancer-1',
    title: 'New Service Request! 💼',
    message: 'Atharva Tendulkar placed a new order ORD-882910 for your Fullstack Web service.',
    type: 'info',
    link: '/freelancer/orders',
    is_read: false,
    created_at: '2026-09-10T11:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    order_id: 'ord-102',
    freelancer_id: 'user-freelancer-3',
    reviewer_id: 'user-student-1',
    rating: 5,
    comment: 'Exceptional seminar slides! My seminar guide appreciated the structured layout and clean design. 10/10 recommend Sakshi!',
    created_at: '2026-09-08T09:00:00Z',
    reviewer: INITIAL_PROFILES[0]
  }
];
