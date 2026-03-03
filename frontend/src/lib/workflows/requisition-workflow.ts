
// lib/workflows/requisition-workflow.ts

export enum RequisitionStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    IN_PREPARATION = 'in_preparation',
    READY = 'ready',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum RequisitionAction {
    SUBMIT = 'submit',
    REVIEW = 'review',
    APPROVE = 'approve',
    REJECT = 'reject',
    START_PREPARATION = 'start_preparation',
    MARK_READY = 'mark_ready',
    DELIVER = 'deliver',
    CANCEL = 'cancel',
    REQUEST_CHANGES = 'request_changes',
}

interface StatusTransition {
    from: RequisitionStatus;
    to: RequisitionStatus;
    action: RequisitionAction;
    requiredRole: string[];
    requiresComment?: boolean;
}

// D  finition des transitions autoris  es
export const REQUISITION_TRANSITIONS: StatusTransition[] = [
    // Soumission
    {
        from: RequisitionStatus.DRAFT,
        to: RequisitionStatus.PENDING,
        action: RequisitionAction.SUBMIT,
        requiredRole: ['technician', 'manager', 'admin'],
    },

    // Revue
    {
        from: RequisitionStatus.PENDING,
        to: RequisitionStatus.REVIEWED,
        action: RequisitionAction.REVIEW,
        requiredRole: ['manager', 'warehouse_manager', 'admin'],
    },

    // Approbation
    {
        from: RequisitionStatus.REVIEWED,
        to: RequisitionStatus.APPROVED,
        action: RequisitionAction.APPROVE,
        requiredRole: ['warehouse_manager', 'admin'],
    },

    // Rejet avec commentaire obligatoire
    {
        from: RequisitionStatus.PENDING,
        to: RequisitionStatus.REJECTED,
        action: RequisitionAction.REJECT,
        requiredRole: ['manager', 'warehouse_manager', 'admin'],
        requiresComment: true,
    },
    {
        from: RequisitionStatus.REVIEWED,
        to: RequisitionStatus.REJECTED,
        action: RequisitionAction.REJECT,
        requiredRole: ['warehouse_manager', 'admin'],
        requiresComment: true,
    },

    // Demande de modifications
    {
        from: RequisitionStatus.REVIEWED,
        to: RequisitionStatus.DRAFT,
        action: RequisitionAction.REQUEST_CHANGES,
        requiredRole: ['warehouse_manager', 'admin'],
        requiresComment: true,
    },

    // Pr  paration
    {
        from: RequisitionStatus.APPROVED,
        to: RequisitionStatus.IN_PREPARATION,
        action: RequisitionAction.START_PREPARATION,
        requiredRole: ['warehouse_manager', 'admin'],
    },

    // Pr  t
    {
        from: RequisitionStatus.IN_PREPARATION,
        to: RequisitionStatus.READY,
        action: RequisitionAction.MARK_READY,
        requiredRole: ['warehouse_manager', 'admin'],
    },

    // Livraison
    {
        from: RequisitionStatus.READY,
        to: RequisitionStatus.DELIVERED,
        action: RequisitionAction.DELIVER,
        requiredRole: ['warehouse_manager', 'technician', 'manager', 'admin'],
    },

    // Annulation (possible    plusieurs   tapes)
    {
        from: RequisitionStatus.DRAFT,
        to: RequisitionStatus.CANCELLED,
        action: RequisitionAction.CANCEL,
        requiredRole: ['technician', 'manager', 'admin'],
    },
    {
        from: RequisitionStatus.PENDING,
        to: RequisitionStatus.CANCELLED,
        action: RequisitionAction.CANCEL,
        requiredRole: ['manager', 'admin'],
    },
    {
        from: RequisitionStatus.REVIEWED,
        to: RequisitionStatus.CANCELLED,
        action: RequisitionAction.CANCEL,
        requiredRole: ['admin'],
    },
];

// V  rification si une transition est autoris  e
export function canTransition(
    currentStatus: RequisitionStatus,
    action: RequisitionAction,
    userRole: string
): boolean {
    const transition = REQUISITION_TRANSITIONS.find(
        (t) => t.from === currentStatus && t.action === action
    );

    if (!transition) return false;
    return transition.requiredRole.includes(userRole);
}

// Obtenir le prochain statut apr  s une action
export function getNextStatus(
    currentStatus: RequisitionStatus,
    action: RequisitionAction
): RequisitionStatus | null {
    const transition = REQUISITION_TRANSITIONS.find(
        (t) => t.from === currentStatus && t.action === action
    );

    return transition?.to || null;
}

// Obtenir toutes les actions possibles pour un statut donn
export function getAvailableActions(
    currentStatus: RequisitionStatus,
    userRole: string
): RequisitionAction[] {
    return REQUISITION_TRANSITIONS
        .filter((t) => t.from === currentStatus && t.requiredRole.includes(userRole))
        .map((t) => t.action);
}

// V  rifier si un commentaire est requis
export function requiresComment(
    currentStatus: RequisitionStatus,
    action: RequisitionAction
): boolean {
    const transition = REQUISITION_TRANSITIONS.find(
        (t) => t.from === currentStatus && t.action === action
    );

    return transition?.requiresComment || false;
}
