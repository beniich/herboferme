import { LogEntry } from "./types";

export const logs: LogEntry[] = [
    {
        _id: "1",
        userId: {
            _id: "user-1",
            name: "Operator A",
            email: "operator.a@reclamtrack.com",
            role: "operator",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDV7AFUsni4iT_wqg4tx8E6BIrKa4G6Kh6Q8snsgn-fD8MGxM0-3XEONfbUJtnUd4AT8_WRT7vycTkGxmukALTg-RfIFGLTsbOUh2gXTCFrS4AEvjR-6UKnTLXlmbO3M6ILhdKgMDwF-iJgzYjE9FaR0r1mRxCpmA7-g0PYM6Yx2O9_n0Cpx9abwUop4P98HAfJyjt5VLi37vtq5Hqz9KLoePRznrMvL912Hg3XgM0CmJ5OBayGr5KSRCkpwwJBQr0oytfECul90Pna",
        },
        action: "CREATED",
        targetId: "REC-005",
        targetType: "Complaint",
        details: "Initial intervention record for district #04",
        timestamp: new Date().toISOString(),
        severity: "normal",
    },
    {
        _id: "2",
        userId: {
            _id: "user-2",
            name: "Sarah Admin",
            email: "sarah.admin@reclamtrack.com",
            role: "admin",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCxgBKeZrdEXwoEtSfdEnjO0dQk9ygaRvPsHOzIfo-i5faXs1lkS1xyGDU8chcISRl3V0TA36wk8KrkfBvu6zSyMerOmrNSXDmes-hrRoeXkU9rLi4Ve3vH2lh00Cc-l4S1WrKSQXeeqfBMuraJtVrVfbV8uyovVR4VuyMx3ncpIGAPkgxSQG_sE7C1W6F1q7otWN9iXjyY82V30MOF90RqaFA7Gkj1yG3rgJjHt-AgMLsHP4d_o3GT5HNjbf61p4kh2j7h4v9hlgj9",
        },
        action: "STATUS CHANGE",
        targetId: "REC-002",
        targetType: "Complaint",
        details: "Open     Resolved",
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        severity: "normal",
    },
    {
        _id: "3",
        userId: {
            _id: "system",
            name: "System",
            email: "system@reclamtrack.com",
            role: "system",
        },
        action: "DELETED",
        targetId: "REC-089",
        targetType: "Complaint",
        details: "Duplicate record purged by integrity check",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        severity: "critical",
    },
    {
        _id: "4",
        userId: {
            _id: "user-4",
            name: "Mike Field",
            email: "mike.field@reclamtrack.com",
            role: "operator",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCkMsamfFG7x-kkhGFKKKY7m2awU52X8n4SeMGQ1FTzMhs0rt28l8-DjU1vYMg246Cy6JXvoG3dd2EEW_uj_DpvXh1SkBEaVJKLZDUCUaGOBuICDymnKL25HBo2dSGbpZAAvi8ZNfbaflnph-1S00SLPWFvVQ4toOqL6SPhCTDozzuTP9aSrmoXi54OsMdunL6qBr4kUn0Uc9INFqX3TMvJs8U--46CHZL9TAfsrFQGUgpD9PjZaBrVSjFdGb8RTQAejmYSEH3xNj1l",
        },
        action: "MODIFIED",
        targetId: "REC-012",
        targetType: "Complaint",
        details: "Updated site inspection notes",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        severity: "normal",
    },
];
