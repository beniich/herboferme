import { create } from 'zustand';
import { Complaint, FilterParams } from '@/types';
import { complaintsApi } from '@/lib/api';

interface ComplaintsState {
    complaints: Complaint[];
    selectedComplaint: Complaint | null;
    isLoading: boolean;
    error: string | null;
    filters: FilterParams;

    // Actions
    fetchComplaints: (params?: FilterParams) => Promise<void>;
    fetchComplaintById: (id: string) => Promise<void>;
    setSelectedComplaint: (complaint: Complaint | null) => void;
    setFilters: (filters: Partial<FilterParams>) => void;
    clearFilters: () => void;

    // Mutation helpers
    addComplaint: (complaint: Complaint) => void;
    updateComplaintInList: (id: string, updates: Partial<Complaint>) => void;
    removeComplaint: (id: string) => void;
}

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
    complaints: [],
    selectedComplaint: null,
    isLoading: false,
    error: null,
    filters: {
        status: [],
        category: [],
        priority: [],
        search: '',
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters }
        }));
        // Auto-fetch could be triggered here or manually in components
    },

    clearFilters: () => {
        set({
            filters: {
                status: [],
                category: [],
                priority: [],
                search: '',
            }
        });
    },

    setSelectedComplaint: (complaint) => set({ selectedComplaint: complaint }),

    fetchComplaints: async (params) => {
        const currentFilters = get().filters;
        set({ isLoading: true, error: null });
        try {
            const data = await complaintsApi.getAll(params || currentFilters);
            set({ complaints: data as any, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Erreur lors du chargement des r  clamations',
                isLoading: false
            });
        }
    },

    fetchComplaintById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const data = await complaintsApi.getById(id);
            set({ selectedComplaint: data as any, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'R  clamation introuvable',
                isLoading: false
            });
        }
    },

    addComplaint: (complaint) => {
        set((state) => ({
            complaints: [complaint, ...state.complaints]
        }));
    },

    updateComplaintInList: (id, updates) => {
        set((state) => ({
            complaints: state.complaints.map((c) =>
                c._id === id ? { ...c, ...updates } : c
            ),
            selectedComplaint: state.selectedComplaint?._id === id
                ? { ...state.selectedComplaint, ...updates }
                : state.selectedComplaint
        }));
    },

    removeComplaint: (id) => {
        set((state) => ({
            complaints: state.complaints.filter((c) => c._id !== id),
            selectedComplaint: state.selectedComplaint?._id === id ? null : state.selectedComplaint
        }));
    }
}));
