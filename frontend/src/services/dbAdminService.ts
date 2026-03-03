import axios from 'axios';

// La base URL de l'API (   adapter selon configuration, ici lecture depuis .env ou d  faut)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const dbAdminApi = {
    /**
     * R  cup  re les m  triques agr  g  es (lag, IOPS, etc.)
     */
    getMetrics: async () => {
        return axios.get(`${API_URL}/db/metrics`);
    },

    /**
     * R  cup  re la liste des r  plicas
     */
    getReplicas: async () => {
        return axios.get(`${API_URL}/db/replicas`);
    },

    /**
     * R  cup  re l'historique des backups
     */
    getBackups: async () => {
        return axios.get(`${API_URL}/db/backups`);
    },

    /**
     * R  cup  re la liste de tous les clusters
     */
    getClusters: async () => {
        return axios.get(`${API_URL}/db/clusters`);
    },

    /**
     * R  cup  re les donn  es de visualisation r  seau (NetViz)
     */
    getNetVizData: async () => {
        return axios.get(`${API_URL}/db/net-viz`);
    },

    /**
     * R  cup  re les donn  es de gestion de files d'attente (Q-Manager)
     */
    getQManagerData: async () => {
        return axios.get(`${API_URL}/db/q-manager`);
    },

    /**
     * R  cup  re les donn  es de monitoring cloud (CloudMonitor)
     */
    getCloudMonitorData: async () => {
        return axios.get(`${API_URL}/db/cloud-monitor`);
    },

    /**
     * R  cup  re les donn  es de performance DBA (DBA Sentinel)
     */
    getDBASentinelData: async () => {
        return axios.get(`${API_URL}/db/dba-sentinel`);
    }
};
