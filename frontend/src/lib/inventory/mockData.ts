import { Material, Complaint, User, Department, Site } from '@/types/material-requisition';

export const mockMaterials: Material[] = [
    {
        id: 'MAT-001',
        sku: 'PIPE-PVC-50',
        name: 'Tuyau PVC   50mm',
        category: 'Plomberie',
        unit: 'm  tre',
        currentStock: 150,
        unitPrice: 12.50,
        preferredSupplier: 'Hydraulique Pro',
        minStockLevel: 50,
        reorderTime: 3,
        description: 'Tuyau PVC haute r  sistance pour eau potable',
    },
    {
        id: 'MAT-002',
        sku: 'VALVE-BALL-25',
        name: 'Vanne    boule 25mm',
        category: 'Plomberie',
        unit: 'pi  ce',
        currentStock: 45,
        unitPrice: 28.75,
        preferredSupplier: 'Hydraulique Pro',
        minStockLevel: 20,
        reorderTime: 5,
        description: 'Vanne    boule en laiton chrom  ',
    },
    {
        id: 'MAT-003',
        sku: 'METER-DIGITAL',
        name: 'Compteur num  rique intelligent',
        category: 'Comptage',
        unit: 'pi  ce',
        currentStock: 12,
        unitPrice: 185.00,
        preferredSupplier: 'TechMeter SA',
        minStockLevel: 10,
        reorderTime: 14,
        description: 'Compteur d\'eau connect   avec t  l  -relev  ',
    },
    {
        id: 'MAT-004',
        sku: 'SEAL-RUBBER-SET',
        name: 'Kit joints caoutchouc',
        category: 'Fournitures',
        unit: 'kit',
        currentStock: 89,
        unitPrice: 15.25,
        preferredSupplier: 'Fournitures G  n  rales',
        minStockLevel: 30,
        reorderTime: 2,
        description: 'Assortiment de joints pour r  parations courantes',
    },
    {
        id: 'MAT-005',
        sku: 'PIPE-COPPER-22',
        name: 'Tube cuivre   22mm',
        category: 'Plomberie',
        unit: 'm  tre',
        currentStock: 8,
        unitPrice: 22.80,
        preferredSupplier: 'M  taux Industriels',
        minStockLevel: 25,
        reorderTime: 7,
        description: 'Tube cuivre   croui pour installations sanitaires',
    },
    {
        id: 'MAT-006',
        sku: 'CLAMP-METAL-50',
        name: 'Collier m  tallique   50mm',
        category: 'Fixations',
        unit: 'pi  ce',
        currentStock: 156,
        unitPrice: 3.45,
        preferredSupplier: 'Fournitures G  n  rales',
        minStockLevel: 100,
        reorderTime: 2,
        description: 'Collier de serrage avec vis',
    },
];

export const mockComplaints: Complaint[] = [
    {
        id: 'REC-8921',
        title: 'Fuite d\'eau - Main Street',
        type: 'repair',
        status: 'in_progress',
        address: '45 Main Street, Casablanca',
        assignedTechnician: 'Ahmed El Mansouri',
        priority: 'high',
    },
    {
        id: 'REC-8922',
        title: 'Baisse de pression - Boulevard',
        type: 'repair',
        status: 'pending',
        address: '123 Boulevard Mohammed V, Casablanca',
        assignedTechnician: 'Fatima Zahra',
        priority: 'medium',
    },
    {
        id: 'REC-8923',
        title: 'Remplacement compteur',
        type: 'installation',
        status: 'pending',
        address: '78 Rue des Fleurs, Casablanca',
        priority: 'low',
    },
    {
        id: 'REC-8924',
        title: 'Maintenance pr  ventive - Quartier Maarif',
        type: 'preventive_maintenance',
        status: 'pending',
        address: 'Zone Maarif, Casablanca',
        assignedTechnician: 'Youssef Benani',
        priority: 'medium',
    },
];

export const mockUsers: User[] = [
    {
        id: 'USR-001',
        name: 'Ahmed El Mansouri',
        email: 'ahmed.elmansouri@intervention.ma',
        department: 'Op  rations Terrain',
        role: 'technician',
    },
    {
        id: 'USR-002',
        name: 'Fatima Zahra Idrissi',
        email: 'fatima.idrissi@intervention.ma',
        department: 'Op  rations Terrain',
        role: 'technician',
    },
    {
        id: 'USR-003',
        name: 'Youssef Benani',
        email: 'youssef.benani@intervention.ma',
        department: 'Maintenance',
        role: 'manager',
    },
    {
        id: 'USR-004',
        name: 'Karim Alaoui',
        email: 'karim.alaoui@intervention.ma',
        department: 'Logistique',
        role: 'manager',
    },
];

export const mockDepartments: Department[] = [
    { id: 'DEPT-001', name: 'Op  rations Terrain', code: 'OPS' },
    { id: 'DEPT-002', name: 'Maintenance', code: 'MAINT' },
    { id: 'DEPT-003', name: 'Logistique', code: 'LOG' },
    { id: 'DEPT-004', name: 'Service Compteurs', code: 'COMP' },
    { id: 'DEPT-005', name: 'R  seaux', code: 'RES' },
];

export const mockSites: Site[] = [
    {
        id: 'SITE-001',
        name: 'D  p  t Central Casablanca',
        address: 'Zone Industrielle Ain Sebaa, Casablanca',
    },
    {
        id: 'SITE-002',
        name: 'Atelier Maarif',
        address: 'Boulevard Zerktouni, Maarif, Casablanca',
    },
    {
        id: 'SITE-003',
        name: 'Station Anfa',
        address: 'Boulevard d\'Anfa, Casablanca',
    },
    {
        id: 'SITE-004',
        name: 'Agence Hay Hassani',
        address: 'Quartier Hay Hassani, Casablanca',
    },
];

// Helper functions
export const getMaterialById = (id: string): Material | undefined => {
    return mockMaterials.find(m => m.id === id);
};

export const getComplaintById = (id: string): Complaint | undefined => {
    return mockComplaints.find(c => c.id === id);
};

export const getUserById = (id: string): User | undefined => {
    return mockUsers.find(u => u.id === id);
};

export const searchMaterials = (query: string): Material[] => {
    const lowerQuery = query.toLowerCase();
    return mockMaterials.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.sku.toLowerCase().includes(lowerQuery) ||
        m.category.toLowerCase().includes(lowerQuery)
    );
};

export const getAlternativeMaterials = (materialId: string): Material[] => {
    const material = getMaterialById(materialId);
    if (!material) return [];

    return mockMaterials.filter(m =>
        m.id !== materialId &&
        m.category === material.category
    ).slice(0, 3);
};

export const calculateReorderDelay = (material: Material): number => {
    return material.reorderTime;
};

export const checkStockAvailability = (materialId: string, quantity: number): {
    available: boolean;
    currentStock: number;
    shortfall: number;
} => {
    const material = getMaterialById(materialId);
    if (!material) {
        return { available: false, currentStock: 0, shortfall: quantity };
    }

    return {
        available: material.currentStock >= quantity,
        currentStock: material.currentStock,
        shortfall: Math.max(0, quantity - material.currentStock),
    };
};
