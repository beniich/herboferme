export interface Complaint {
    _id: string;
    number: string;
    // Step 1
    category: string;
    subcategory: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;

    // Step 2
    address: string;
    city: string;
    district: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;

    // Step 3
    photos: string[];
    documents?: { name: string; url: string }[];
    audioNote?: string;

    // Step 4 (Contact)
    isAnonymous: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;

    // Workflow
    status: 'nouvelle' | 'en cours' | 'r  solue' | 'ferm  e' | 'rejet  e';
    assignedTeamId?: { _id: string; name: string }; // Populated
    technicianId?: { _id: string; name: string; email: string }; // Populated

    createdAt: string;
    updatedAt: string;

    // Legacy support (optional)
    leakType?: string;
}

export interface Team {
    _id: string;
    name: string;                // Eau,   lectricit  ,
    status: 'disponible' | 'intervention' | 'repos';
    location?: { lat: number; lng: number };
}

export interface PlanningSlot {
    _id: string;
    teamId: string;
    teamName: string;
    start: string;              // ISO date   time
    end: string;
    complaintNumber?: string;   // si un ticket est li
}

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role: 'admin' | 'dispatcher' | 'staff';
}

export interface Assignment {
    _id: string;
    complaintId: string;
    teamId: string;
    assignedAt: string;
    status: 'affect  ' | 'en cours' | 'termin  ';
}

// Types from Roadmap 2
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    message?: string;
    timestamp?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
    status?: string[];
    category?: string[];
    priority?: string[];
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

export interface TimelineEvent {
    id: string;
    type: 'created' | 'assigned' | 'in_progress' | 'resolved' | 'closed' | 'note';
    title: string;
    description: string;
    timestamp: string;
    actor?: string;
}

export interface Organization {
    _id: string;
    name: string;
    slug: string;
    ownerId: string;
    logo?: string;
    subscription: {
        plan: 'FREE' | 'PRO' | 'ENTERPRISE';
        status: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELED';
        expiresAt?: string;
        maxUsers?: number;
        maxTickets?: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Membership {
    _id: string;
    userId: string;
    organizationId: string | Organization;
    roles: string[];
    status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
    joinedAt: string;
}
