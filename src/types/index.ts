export interface User {
  id: string;
  name: string;
  avatar: string;
  university: string;
  campus: string;
  course: string;
  yearLevel: string;
  email: string;
  isVerified: boolean;
  role: 'student' | 'requester' | 'admin' | 'organization';
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  skills: string[];
  bio: string;
  availability: 'Available' | 'Busy' | 'Flexible';
  interests: string[];
}

export interface Job {
  id: string;
  title: string;
  category: 'Web Development' | 'Photography' | 'Graphic Design' | 'Academic Tutoring' | 'Event Support' | 'Errands & Logistics' | 'Other';
  jobType: 'Part-time' | 'Gig' | 'One-time' | 'Recurring';
  budget: number; // in PHP (₱)
  budgetUnit: 'job' | 'day' | 'hour';
  location: string; // e.g. "MSU-IIT", "Iligan City", "Remote"
  schedule: string; // e.g. "Flexible", "4 hours", "Weekend"
  description: string;
  skills: string[];
  image: string;
  postedAt: string;
  deadline: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterOrg?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicantCount: number;
}

/** Which rung of the career-page extraction ladder produced the jobs. */
export type CrawlSource = 'json-ld' | 'microdata' | 'ats' | 'selectors';

/** API-facing failure reasons for POST /api/crawl (never a stack trace). */
export type CrawlFailureReason =
  | 'invalid_url'
  | 'blocked_by_robots'
  | 'robots_unavailable'
  | 'crawl_delay_too_long'
  | 'rate_limited'
  | 'origin_halted'
  | 'challenge'
  | 'timeout'
  | 'unreachable'
  | 'server_error'
  | 'not_found'
  | 'not_html'
  | 'too_many_redirects'
  | 'internal';

/** Response shape for POST /api/crawl. */
export interface CrawlResult {
  ok: boolean;
  origin: string;
  robotsAllowed: boolean;
  unchanged: boolean;
  jobs: Job[];
  skipped: number;
  source: CrawlSource | null;
  crawledAt: string;
  reason?: CrawlFailureReason | null;
  notes: string;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  applicantCourse: string;
  applicantRating: number;
  proposal: string;
  proposedPrice: number;
  estimatedTime: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface DigitalAgreement {
  id: string;
  jobId: string;
  jobTitle: string;
  requesterId: string;
  requesterName: string;
  workerId: string;
  workerName: string;
  agreedPrice: number;
  currency: string;
  deadline: string;
  deliverables: string[];
  revisionTerms: string;
  paymentMethod: 'GCash' | 'Cash on Campus' | 'Simulated Protected Payment';
  paymentStatus: 'pending' | 'held' | 'released' | 'paid';
  status: 'active' | 'work_submitted' | 'completed' | 'disputed';
  createdAt: string;
  submittedWorkUrl?: string;
  submissionNotes?: string;
}

export interface Review {
  id: string;
  jobId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  toUserName?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  jobTitle?: string;
  role?: 'requester' | 'student';
}

export interface CampusTestimonial {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: string;
  reviewerOrg?: string;
  category: 'student' | 'requester' | 'organization';
  rating: number;
  gigTitle: string;
  gigCategory: 'Web Development' | 'Photography' | 'Graphic Design' | 'Academic Tutoring' | 'Event Support' | 'Errands & Logistics' | 'Other';
  payoutAmount: number;
  paymentMethod: string;
  payoutStatus: string;
  badge: string;
  quote: string;
  highlight: string;
  date: string;
  department: string;
  verifiedEmail: string;
  helpfulCount: number;
}

export interface ConnectMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface DisputeCase {
  id: string;
  jobTitle: string;
  jobId: string;
  agreementId?: string;
  requesterName: string;
  workerName: string;
  amount: number;
  reason: string;
  evidence: string;
  filedAt: string;
  status: 'pending' | 'resolved' | 'split';
  resolutionNote?: string;
}

export interface VerificationItem {
  id: string;
  studentId?: string;
  studentName: string;
  course: string;
  idNumber: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
