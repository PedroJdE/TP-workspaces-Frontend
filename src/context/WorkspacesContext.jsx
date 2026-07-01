import React, { createContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import useRequest from '../hooks/useRequest';
import { getWorkspaces } from '../services/workspaceService';

export const WorkspacesContext = createContext({
    workspaces: [],
    loading: false,
    error: null,
    refetch: () => {}
});

export const WorkspacesContextProvider = () => {
    const { sendRequest, loading, response, error } = useRequest();

    const fetchWorkspaces = () => {
        sendRequest(getWorkspaces);
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const providerValue = {
        workspaces: response?.data?.workspaces || [],
        loading,
        error,
        refetch: fetchWorkspaces
    };

    return (
        <WorkspacesContext.Provider value={providerValue}>
            <Outlet />
        </WorkspacesContext.Provider>
    );
};