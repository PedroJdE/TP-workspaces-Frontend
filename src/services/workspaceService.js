const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getWorkspaces(token){
    try{
        const res = await fetch(`${API_URL}/api/workspace`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching workspaces')
        return json.data.workspaces
    }
    catch(error){
        console.error('workspaceService.getWorkspaces', error)
        throw error
    }
}

export async function createWorkspace(payload, token){
    try{
        const res = await fetch(`${API_URL}/api/workspace`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error creating workspace')
        return json.data.workspace
    }
    catch(error){
        console.error('workspaceService.createWorkspace', error)
        throw error
    }
}

export async function updateWorkspace(workspaceId, payload, token){
    try{
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error updating workspace')
        return json.data.workspace
    }
    catch(error){
        console.error('workspaceService.updateWorkspace', error)
        throw error
    }
}

export async function inviteMember(workspaceId, payload, token){
    try{
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error inviting member')
        return json.data.invitedMember
    }
    catch(error){
        console.error('workspaceService.inviteMember', error)
        throw error
    }
}

export async function getWorkspaceMembers(workspaceId, token) {
    try {
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/members`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching members')
        return json.data.members
    }
    catch(error) {
        console.error('workspaceService.getWorkspaceMembers', error)
        throw error
    }
}

export async function getChannelMembers(workspaceId, channelId, token) {
    try {
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/channels/${channelId}/members`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching channel members')
        return json.data.members
    }
    catch(error) {
        console.error('workspaceService.getChannelMembers', error)
        throw error
    }
}

export async function getWorkspaceChannels(workspaceId, token) {
    try {
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/channels`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching channels')
        return json.data.channels
    }
    catch(error) {
        console.error('workspaceService.getWorkspaceChannels', error)
        throw error
    }
}

export async function createChannel(workspaceId, payload, token) {
    try {
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error creating channel')
        return json.data.channel
    }
    catch(error) {
        console.error('workspaceService.createChannel', error)
        throw error
    }
}

export async function updateChannel(workspaceId, channelId, payload, token) {
    try {
        const res = await fetch(`${API_URL}/api/workspace/${workspaceId}/channels/${channelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error updating channel')
        return json.data.channel
    }
    catch(error) {
        console.error('workspaceService.updateChannel', error)
        throw error
    }
}