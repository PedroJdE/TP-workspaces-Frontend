const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export async function getChannelMessages(channelId, token) {
    try {
        const res = await fetch(`${API_URL}/api/channels/${channelId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching messages')
        return json.data.messages
    }
    catch(error){
        console.error('messageService.getChannelMessages', error)
        throw error
    }
}

export async function getNewMessages(channelId, afterISODate, token) {
    try {
        const url = `${API_URL}/api/channels/${channelId}/messages/new?after=${encodeURIComponent(afterISODate)}`
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error fetching new messages')
        return json.data.messages
    }
    catch(error){
        console.error('messageService.getNewMessages', error)
        throw error
    }
}

export async function sendMessage(channelId, content, token) {
    try {
        const res = await fetch(`${API_URL}/api/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ content })
        })
        const json = await res.json()
        if(!res.ok) throw new Error(json.message || 'Error sending message')
        return json.data.message
    }
    catch(error){
        console.error('messageService.sendMessage', error)
        throw error
    }
}