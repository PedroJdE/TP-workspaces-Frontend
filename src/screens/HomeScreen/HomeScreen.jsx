import React, { useState, useEffect, useContext, useRef } from 'react'
import './HomeScreen.css'
import { getWorkspaces, createWorkspace, inviteMember, updateWorkspace, getWorkspaceMembers, getChannelMembers, getWorkspaceChannels, createChannel, updateChannel } from '../../services/workspaceService'
import { getChannelMessages, getNewMessages, sendMessage } from '../../services/messageService'
import { AuthContext } from '../../context/AuthContext'

const POLL_INTERVAL_MS = 4000

export const HomeScreen = () => {
  const [workspaces, setWorkspaces] = useState([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [workspaceError, setWorkspaceError] = useState(null)

  // Workspaces expandidos en el sidebar (Set de ids) + sus canales cacheados
  const [expandedWorkspaces, setExpandedWorkspaces] = useState(() => new Set())
  const [channelsByWorkspace, setChannelsByWorkspace] = useState({}) // { [wsId]: { items, loading, error } }

  // Canal actualmente abierto en el panel de mensajería
  const [selectedChannelId, setSelectedChannelId] = useState(null)
  const [selectedChannelWorkspaceId, setSelectedChannelWorkspaceId] = useState(null)

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState(null)
  const [sendingMessage, setSendingMessage] = useState(false)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState(null)

  // ===== Modales =====
  const [activeModal, setActiveModal] = useState(null) // null | 'workspace' | 'editWorkspace' | 'channel' | 'editChannel' | 'invite'
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalErrors, setModalErrors] = useState({})
  const [modalWorkspaceId, setModalWorkspaceId] = useState(null) // a qué workspace pertenece la acción del modal

  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('')

  const [editWorkspaceId, setEditWorkspaceId] = useState(null)
  const [editWorkspaceName, setEditWorkspaceName] = useState('')
  const [editWorkspaceDescription, setEditWorkspaceDescription] = useState('')

  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')
  const [newChannelMemberIds, setNewChannelMemberIds] = useState([])

  const [editChannelId, setEditChannelId] = useState(null)
  const [editChannelName, setEditChannelName] = useState('')
  const [editChannelDescription, setEditChannelDescription] = useState('')
  const [editChannelMemberIds, setEditChannelMemberIds] = useState([])

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('USER')
  const [workspaceMemberOptions, setWorkspaceMemberOptions] = useState([])

  // ===== Toasts =====
  const [toasts, setToasts] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { authToken, userData } = useContext(AuthContext)

  const lastMessageTimestampRef = useRef(null)
  const pollIntervalRef = useRef(null)

  const getWorkspaceId = (workspaceEntry) => workspaceEntry?.workspace?._id || workspaceEntry?.workspace_id || workspaceEntry?._id
  const getWorkspaceName = (workspaceEntry) => workspaceEntry?.workspace?.nombre || workspaceEntry?.workspace?.name || workspaceEntry?.nombre || workspaceEntry?.workspace_nombre || `Workspace`
  const getWorkspaceDescription = (workspaceEntry) => workspaceEntry?.workspace?.descripcion || workspaceEntry?.workspace?.description || workspaceEntry?.descripcion || workspaceEntry?.workspace_descripcion || ''
  const getUserInitials = (name) => {
    if (!name) return 'TU'
    return name.split(' ').map(part => part[0]).join('').substring(0, 2).toUpperCase()
  }

  const getMessageAuthor = (msg) => {
    const sender = msg.sender || {}
    return sender.nombre || sender.name || sender.username || sender.email || 'Usuario'
  }

  const loadWorkspaceMembers = async (workspaceId) => {
    if (!workspaceId) return
    setMembersLoading(true)
    setMembersError(null)
    try {
      const fetchedMembers = await getWorkspaceMembers(workspaceId, authToken)
      setMembers(fetchedMembers || [])
      setWorkspaceMemberOptions(fetchedMembers || [])
    } catch (err) {
      setMembersError(err.message || 'Error cargando miembros')
    } finally {
      setMembersLoading(false)
    }
  }

  const userName = userData?.nombre || 'Tu Nombre'
  const userInitials = getUserInitials(userName)

  const selectedChannelObj = selectedChannelId
    ? channelsByWorkspace[selectedChannelWorkspaceId]?.items?.find(c => c._id === selectedChannelId)
    : null

  const selectedWorkspaceEntry = workspaces.find(workspace => getWorkspaceId(workspace) === selectedChannelWorkspaceId) || workspaces[0] || null
  const selectedWorkspaceName = getWorkspaceName(selectedWorkspaceEntry) || 'Workspace'
  const selectedWorkspaceDescription = getWorkspaceDescription(selectedWorkspaceEntry) || ''
  const notifications = selectedWorkspaceName
    ? [{
        id: 1,
        title: 'Nuevo aviso',
        message: `Te invitaron al workspace ${selectedWorkspaceName}. Aceptá la invitación por correo.`
      }]
    : []

  // ---- Toast helpers ----
  const pushToast = (message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  // ---- Carga inicial de workspaces ----
  useEffect(() => {
    loadWorkspaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadWorkspaces(){
    setLoadingWorkspaces(true)
    setWorkspaceError(null)
    try{
      const w = await getWorkspaces(authToken)
      setWorkspaces(w || [])
      // Al primer load, despliega el primer workspace para que no arranque todo vacío
      if (w && w.length > 0 && expandedWorkspaces.size === 0) {
        const firstId = getWorkspaceId(w[0])
        setExpandedWorkspaces(new Set([firstId]))
        setSelectedChannelWorkspaceId(firstId)
        loadChannelsForWorkspace(firstId)
      }
    }
    catch(err){
      setWorkspaceError(err.message || 'Error cargando workspaces')
    }
    finally{
      setLoadingWorkspaces(false)
    }
  }

  // ---- Canales por workspace (lazy, al desplegar) ----
  async function loadChannelsForWorkspace(workspaceId) {
    setChannelsByWorkspace(prev => ({
      ...prev,
      [workspaceId]: { items: prev[workspaceId]?.items || [], loading: true, error: null }
    }))
    try {
      const items = await getWorkspaceChannels(workspaceId, authToken)
      setChannelsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: { items: items || [], loading: false, error: null }
      }))
    }
    catch(err) {
      setChannelsByWorkspace(prev => ({
        ...prev,
        [workspaceId]: { items: [], loading: false, error: err.message || 'Error cargando canales' }
      }))
    }
  }

  const toggleWorkspaceExpand = (workspaceId) => {
    setSelectedChannelWorkspaceId(workspaceId)
    setExpandedWorkspaces(prev => {
      const next = new Set(prev)
      if (next.has(workspaceId)) {
        next.delete(workspaceId)
      } else {
        next.add(workspaceId)
      }
      return next
    })
    if (!channelsByWorkspace[workspaceId]) {
      loadChannelsForWorkspace(workspaceId)
    }
    setIsSidebarOpen(false)
  }

  // ---- Selección de canal + mensajería ----
  const handleSelectChannel = (channel, workspaceId) => {
    setSelectedChannelId(channel._id)
    setSelectedChannelWorkspaceId(workspaceId)
    loadWorkspaceMembers(workspaceId)
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    if (!selectedChannelId) {
      setMessages([])
      return
    }

    let cancelled = false

    async function loadInitialMessages() {
      setMessagesLoading(true)
      setMessagesError(null)
      try {
        const data = await getChannelMessages(selectedChannelId, authToken)
        if (cancelled) return
        setMessages(data || [])
        const last = (data && data.length > 0) ? data[data.length - 1].createdAt : new Date().toISOString()
        lastMessageTimestampRef.current = last
      }
      catch(err) {
        if (!cancelled) setMessagesError(err.message || 'Error cargando mensajes')
      }
      finally {
        if (!cancelled) setMessagesLoading(false)
      }
    }

    loadInitialMessages()

    pollIntervalRef.current = setInterval(async () => {
      if (!lastMessageTimestampRef.current) return
      try {
        const newOnes = await getNewMessages(selectedChannelId, lastMessageTimestampRef.current, authToken)
        if (newOnes && newOnes.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id))
            const filtered = newOnes.filter(m => !existingIds.has(m._id))
            return filtered.length > 0 ? [...prev, ...filtered] : prev
          })
          lastMessageTimestampRef.current = newOnes[newOnes.length - 1].createdAt
        }
      }
      catch(err) {
        // No interrumpimos el polling por un error puntual de red
        console.error('Polling de mensajes falló', err)
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [selectedChannelId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const input = e.target.message
    const text = input.value.trim()
    if (!text || !selectedChannelId || sendingMessage) return
    setSendingMessage(true)
    try {
      const sent = await sendMessage(selectedChannelId, text, authToken)
      setMessages(prev => [...prev, sent])
      lastMessageTimestampRef.current = sent.createdAt
      input.value = ''
    }
    catch(err) {
      pushToast('Error enviando mensaje: ' + (err.message || err), 'error')
    }
    finally {
      setSendingMessage(false)
    }
  }

  // ---- Modal helpers ----
  const closeModal = () => {
    if (modalSubmitting) return
    setActiveModal(null)
    setModalErrors({})
    setModalWorkspaceId(null)
    setNewWorkspaceName('')
    setNewWorkspaceDescription('')
    setEditWorkspaceId(null)
    setEditWorkspaceName('')
    setEditWorkspaceDescription('')
    setNewChannelName('')
    setNewChannelDescription('')
    setNewChannelMemberIds([])
    setEditChannelId(null)
    setEditChannelName('')
    setEditChannelDescription('')
    setEditChannelMemberIds([])
    setInviteEmail('')
    setInviteRole('USER')
  }

  useEffect(() => {
    if (!activeModal) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal, modalSubmitting])

  const openCreateWorkspaceModal = () => {
    setModalErrors({})
    setActiveModal('workspace')
  }

  const openEditWorkspaceModal = (workspaceEntry) => {
    const id = getWorkspaceId(workspaceEntry)
    setEditWorkspaceId(id)
    setEditWorkspaceName(getWorkspaceName(workspaceEntry))
    setEditWorkspaceDescription(getWorkspaceDescription(workspaceEntry))
    setModalErrors({})
    setActiveModal('editWorkspace')
  }

  const openCreateChannelModal = async (workspaceId) => {
    setModalWorkspaceId(workspaceId)
    setModalErrors({})
    setNewChannelName('')
    setNewChannelDescription('')
    setNewChannelMemberIds([])
    try {
      const fetchedMembers = await getWorkspaceMembers(workspaceId, authToken)
      setWorkspaceMemberOptions(fetchedMembers || [])
    } catch (err) {
      setWorkspaceMemberOptions([])
    }
    setActiveModal('channel')
  }

  const openEditChannelModal = async (channel, workspaceId) => {
    setEditChannelId(channel._id)
    setModalWorkspaceId(workspaceId)
    setEditChannelName(channel.nombre || '')
    setEditChannelDescription(channel.descripcion || '')
    setModalErrors({})
    try {
      const [workspaceMembers, channelMembers] = await Promise.all([
        getWorkspaceMembers(workspaceId, authToken),
        getChannelMembers(workspaceId, channel._id, authToken)
      ])
      setWorkspaceMemberOptions(workspaceMembers || [])
      setEditChannelMemberIds((channelMembers || []).filter(member => member.hasAccess).map(member => member.user_id?.toString()).filter(Boolean))
    } catch (err) {
      setWorkspaceMemberOptions([])
      setEditChannelMemberIds([])
    }
    setActiveModal('editChannel')
  }

  const openInviteModal = () => {
    const targetWorkspaceId = selectedChannelWorkspaceId || getWorkspaceId(workspaces[0])
    if (!targetWorkspaceId) {
      pushToast('Seleccioná un workspace primero', 'error')
      return
    }
    setModalWorkspaceId(targetWorkspaceId)
    setModalErrors({})
    setActiveModal('invite')
  }

  // ---- Submits ----
  const handleSubmitCreateWorkspace = async (e) => {
    e.preventDefault()
    const name = newWorkspaceName.trim()
    if (!name) { setModalErrors({ name: 'El nombre es obligatorio' }); return }
    setModalSubmitting(true)
    try{
      await createWorkspace({ nombre: name, descripcion: newWorkspaceDescription.trim() }, authToken)
      await loadWorkspaces()
      pushToast('Workspace creado con éxito')
      closeModal()
    }
    catch(err){
      setModalErrors({ form: err.message || 'No se pudo crear el workspace' })
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const handleSubmitEditWorkspace = async (e) => {
    e.preventDefault()
    const name = editWorkspaceName.trim()
    if (!name) { setModalErrors({ name: 'El nombre es obligatorio' }); return }
    setModalSubmitting(true)
    try{
      await updateWorkspace(editWorkspaceId, { nombre: name, descripcion: editWorkspaceDescription.trim() }, authToken)
      await loadWorkspaces()
      pushToast('Workspace actualizado')
      closeModal()
    }
    catch(err){
      setModalErrors({ form: err.message || 'No se pudo actualizar el workspace' })
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const handleSubmitCreateChannel = async (e) => {
    e.preventDefault()
    const name = newChannelName.trim()
    if (!name) { setModalErrors({ name: 'El nombre del canal es obligatorio' }); return }
    setModalSubmitting(true)
    try {
      await createChannel(modalWorkspaceId, { nombre: name, descripcion: newChannelDescription.trim(), memberIds: newChannelMemberIds }, authToken)
      await loadChannelsForWorkspace(modalWorkspaceId)
      pushToast('Canal creado con éxito')
      closeModal()
    }
    catch(err) {
      setModalErrors({ form: err.message || 'No se pudo crear el canal' })
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const handleSubmitEditChannel = async (e) => {
    e.preventDefault()
    const name = editChannelName.trim()
    if (!name) { setModalErrors({ name: 'El nombre es obligatorio' }); return }
    setModalSubmitting(true)
    try {
      await updateChannel(modalWorkspaceId, editChannelId, { nombre: name, descripcion: editChannelDescription.trim(), memberIds: editChannelMemberIds }, authToken)
      await loadChannelsForWorkspace(modalWorkspaceId)
      pushToast('Canal actualizado')
      closeModal()
    }
    catch(err) {
      setModalErrors({ form: err.message || 'No se pudo actualizar el canal' })
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const handleSubmitInvite = async (e) => {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) { setModalErrors({ email: 'El email es obligatorio' }); return }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValid) { setModalErrors({ email: 'Ingresá un email válido' }); return }
    setModalSubmitting(true)
    try{
      const result = await inviteMember(modalWorkspaceId, { email, rol: inviteRole }, authToken)
      await loadWorkspaceMembers(modalWorkspaceId)
      pushToast(result.mailSent ? 'Invitación enviada' : 'La invitación fue creada, pero no se pudo enviar el correo')
      closeModal()
    }
    catch(err){
      setModalErrors({ form: err.message || 'No se pudo enviar la invitación' })
    }
    finally {
      setModalSubmitting(false)
    }
  }

  return (
    <div className="home-container">
      {/* ===== SIDEBAR ===== */}
      <div className={`mobile-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`home-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">W</div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Workspace</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>workspace.dev</div>
          </div>
        </div>

        <div className="sidebar-workspace">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div className="sidebar-section-title">Workspaces</div>
            <button type="button" className="btn btn-glass" onClick={openCreateWorkspaceModal} style={{fontSize:'0.8rem'}}>Nuevo</button>
          </div>

          {loadingWorkspaces && <div style={{padding: '0.5rem', color: 'var(--text-secondary)'}}>Cargando...</div>}
          {!loadingWorkspaces && workspaceError && <div style={{padding: '0.5rem', color: 'var(--text-secondary)'}}>Error: {workspaceError}</div>}
          {!loadingWorkspaces && workspaces && workspaces.length === 0 && (
            <div style={{padding: '0.5rem', color: 'var(--text-secondary)'}}>No hay workspaces disponibles. Creá uno.</div>
          )}

          {!loadingWorkspaces && workspaces && workspaces.length > 0 && (
            workspaces.map((w, idx) => {
              const id = getWorkspaceId(w)
              const name = getWorkspaceName(w) || `Workspace ${idx+1}`
              const expanded = expandedWorkspaces.has(id)
              const wsChannels = channelsByWorkspace[id]

              return (
                <div key={id} className="workspace-block">
                  <div className="workspace-row">
                    <div className="workspace-row-main" onClick={() => toggleWorkspaceExpand(id)}>
                      <span className={`chevron ${expanded ? 'chevron-open' : ''}`}>▸</span>
                      <span className="workspace-row-name">{name}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn"
                      title="Editar workspace"
                      onClick={(e) => { e.stopPropagation(); openEditWorkspaceModal(w) }}
                    >✎</button>
                  </div>

                  {expanded && (
                    <div className="channel-list">
                      {wsChannels?.loading && <div className="channel-list-hint">Cargando canales...</div>}
                      {wsChannels?.error && <div className="channel-list-hint">Error: {wsChannels.error}</div>}
                      {!wsChannels?.loading && wsChannels?.items?.length === 0 && (
                        <div className="channel-list-hint">No hay canales todavía</div>
                      )}
                      {!wsChannels?.loading && wsChannels?.items?.map(ch => (
                        <div key={ch._id} className={`channel-item ${selectedChannelId === ch._id ? 'active' : ''}`}>
                          <span className="channel-item-name" onClick={() => handleSelectChannel(ch, id)}># {ch.nombre}</span>
                          <button
                            type="button"
                            className="icon-btn icon-btn-sm"
                            title="Editar canal"
                            onClick={(e) => { e.stopPropagation(); openEditChannelModal(ch, id) }}
                          >✎</button>
                        </div>
                      ))}
                      <button type="button" className="channel-add-btn" onClick={() => openCreateChannelModal(id)}>+ Nuevo canal</button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{userInitials}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-status">Disponible</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="home-main">
        {/* ===== TOP NAVBAR ===== */}
        <nav className="home-navbar">
          <button type="button" className="navbar-hamburger" onClick={() => setIsSidebarOpen(prev => !prev)} aria-label="Abrir menú">
            ☰
          </button>
          <div className="navbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Buscar mensajes..." />
          </div>

          <div className="navbar-actions">
            <div className="notifications-wrapper">
              <button className="navbar-btn" title="Notificaciones" onClick={() => setShowNotifications(prev => !prev)}>🔔</button>
              {notifications.length > 0 && <span className="notification-badge">1</span>}
              {showNotifications && notifications.length > 0 && (
                <div className="notifications-panel">
                  {notifications.map(item => (
                    <div key={item.id} className="notification-item">
                      <div className="notification-title">{item.title}</div>
                      <div className="notification-message">{item.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="navbar-btn" title="Configuración">⚙️</button>
          </div>
        </nav>

        {/* ===== CONTENT AREA ===== */}
        <div className="home-content">
          {/* Channel Section */}
          <section className="channel-section">
            <div className="channel-header">
              <div className="workspace-header-info">
                <div className="workspace-header-name">{selectedWorkspaceName}</div>
                {selectedWorkspaceDescription && <div className="workspace-header-description">{selectedWorkspaceDescription}</div>}
                <div className="channel-title">{selectedChannelObj ? `# ${selectedChannelObj.nombre}` : 'Seleccioná un canal'}</div>
                {selectedChannelObj?.descripcion && (
                  <div className="channel-subtitle">{selectedChannelObj.descripcion}</div>
                )}
              </div>
              <button className="btn btn-glass invite-inline-btn" onClick={openInviteModal}>Invitar miembros</button>
            </div>

            <div className="channel-messages">
              {!selectedChannelId && (
                <div style={{padding: '1rem', color: 'var(--text-secondary)'}}>
                  Elegí un canal de la izquierda para ver los mensajes.
                </div>
              )}
              {selectedChannelId && messagesLoading && (
                <div style={{padding: '1rem', color: 'var(--text-secondary)'}}>Cargando mensajes...</div>
              )}
              {selectedChannelId && messagesError && (
                <div style={{padding: '1rem', color: 'var(--text-danger)'}}>Error: {messagesError}</div>
              )}
              {selectedChannelId && !messagesLoading && !messagesError && messages.length === 0 && (
                <div style={{padding: '1rem', color: 'var(--text-secondary)'}}>
                  No hay mensajes todavía. ¡Sé el primero en escribir!
                </div>
              )}
              {selectedChannelId && messages.map(msg => (
                <div key={msg._id} className="message">
                  <div className="message-avatar">{getUserInitials(getMessageAuthor(msg))}</div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">{getMessageAuthor(msg)}</span>
                      <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-input-area">
              <input
                type="text"
                name="message"
                className="message-input"
                placeholder={selectedChannelId ? 'Escribe un mensaje...' : 'Seleccioná un canal primero'}
                disabled={!selectedChannelId || sendingMessage}
              />
              <button type="submit" className="send-btn" disabled={!selectedChannelId || sendingMessage}>➤</button>
            </form>
          </section>

          {/* Members Panel */}
          <aside className="members-section">
            <div className="members-header">👥 Miembros ({members.length})</div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '0 var(--spacing-md)'}}>
              <div></div>
              <div>
                <button className="btn btn-glass" onClick={openInviteModal} style={{fontSize:'0.8rem'}}>Invitar</button>
              </div>
            </div>
            <div className="members-list">
              {membersLoading && <div style={{padding:'0.75rem', color:'var(--text-secondary)'}}>Cargando miembros...</div>}
              {!membersLoading && membersError && <div style={{padding:'0.75rem', color:'var(--text-danger)'}}>{membersError}</div>}
              {!membersLoading && !membersError && members.length === 0 && (
                <div style={{padding:'0.75rem', color:'var(--text-secondary)'}}>No hay miembros en este workspace todavía.</div>
              )}
              {!membersLoading && !membersError && members.map(member => (
                <div key={member.user_id} className="member-item">
                  <div className="member-avatar">{getUserInitials(member.user_nombre)}</div>
                  <div className="member-name">{member.user_nombre || member.user_email || 'Usuario'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{member.member_rol}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* ===== MODALES ===== */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

            {activeModal === 'workspace' && (
              <form onSubmit={handleSubmitCreateWorkspace}>
                <div className="modal-header">
                  <div className="modal-title">Crear workspace</div>
                  <button type="button" className="modal-close" onClick={closeModal} disabled={modalSubmitting}>✕</button>
                </div>
                <div className="modal-fields">
                  {modalErrors.form && <div className="modal-error-banner">{modalErrors.form}</div>}
                  <label htmlFor="ws-name">Nombre del workspace</label>
                  <input
                    id="ws-name"
                    type="text"
                    autoFocus
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Ej: Equipo de Producto"
                    className={modalErrors.name ? 'input-error' : ''}
                  />
                  {modalErrors.name && <div className="modal-field-error">{modalErrors.name}</div>}

                  <label htmlFor="ws-desc">Descripción (opcional)</label>
                  <textarea
                    id="ws-desc"
                    rows={3}
                    value={newWorkspaceDescription}
                    onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                    placeholder="¿De qué se trata este espacio?"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={closeModal} disabled={modalSubmitting}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                    {modalSubmitting ? 'Creando...' : 'Crear workspace'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editWorkspace' && (
              <form onSubmit={handleSubmitEditWorkspace}>
                <div className="modal-header">
                  <div className="modal-title">Editar workspace</div>
                  <button type="button" className="modal-close" onClick={closeModal} disabled={modalSubmitting}>✕</button>
                </div>
                <div className="modal-fields">
                  {modalErrors.form && <div className="modal-error-banner">{modalErrors.form}</div>}
                  <label htmlFor="ews-name">Nombre del workspace</label>
                  <input
                    id="ews-name"
                    type="text"
                    autoFocus
                    value={editWorkspaceName}
                    onChange={(e) => setEditWorkspaceName(e.target.value)}
                    className={modalErrors.name ? 'input-error' : ''}
                  />
                  {modalErrors.name && <div className="modal-field-error">{modalErrors.name}</div>}

                  <label htmlFor="ews-desc">Descripción</label>
                  <textarea
                    id="ews-desc"
                    rows={3}
                    value={editWorkspaceDescription}
                    onChange={(e) => setEditWorkspaceDescription(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={closeModal} disabled={modalSubmitting}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                    {modalSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'channel' && (
              <form onSubmit={handleSubmitCreateChannel}>
                <div className="modal-header">
                  <div className="modal-title">Crear canal</div>
                  <button type="button" className="modal-close" onClick={closeModal} disabled={modalSubmitting}>✕</button>
                </div>
                <div className="modal-fields">
                  {modalErrors.form && <div className="modal-error-banner">{modalErrors.form}</div>}
                  <label htmlFor="ch-name">Nombre del canal</label>
                  <input
                    id="ch-name"
                    type="text"
                    autoFocus
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Ej: general"
                    className={modalErrors.name ? 'input-error' : ''}
                  />
                  {modalErrors.name && <div className="modal-field-error">{modalErrors.name}</div>}

                  <label htmlFor="ch-desc">Descripción (opcional)</label>
                  <textarea
                    id="ch-desc"
                    rows={3}
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    placeholder="¿Para qué se usa este canal?"
                  />

                  <label>Acceso del canal</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                    {workspaceMemberOptions.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay miembros del workspace para asignar.</div>}
                    {workspaceMemberOptions.map(member => {
                      const memberId = member.user_id?.toString() || member._id?.toString()
                      const checked = newChannelMemberIds.includes(memberId)
                      return (
                        <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setNewChannelMemberIds(prev => checked ? prev.filter(id => id !== memberId) : [...prev, memberId])}
                          />
                          <span>{member.user_nombre || member.user_email || member.email || 'Usuario'}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={closeModal} disabled={modalSubmitting}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                    {modalSubmitting ? 'Creando...' : 'Crear canal'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'editChannel' && (
              <form onSubmit={handleSubmitEditChannel}>
                <div className="modal-header">
                  <div className="modal-title">Editar canal</div>
                  <button type="button" className="modal-close" onClick={closeModal} disabled={modalSubmitting}>✕</button>
                </div>
                <div className="modal-fields">
                  {modalErrors.form && <div className="modal-error-banner">{modalErrors.form}</div>}
                  <label htmlFor="ech-name">Nombre del canal</label>
                  <input
                    id="ech-name"
                    type="text"
                    autoFocus
                    value={editChannelName}
                    onChange={(e) => setEditChannelName(e.target.value)}
                    className={modalErrors.name ? 'input-error' : ''}
                  />
                  {modalErrors.name && <div className="modal-field-error">{modalErrors.name}</div>}

                  <label htmlFor="ech-desc">Descripción</label>
                  <textarea
                    id="ech-desc"
                    rows={3}
                    value={editChannelDescription}
                    onChange={(e) => setEditChannelDescription(e.target.value)}
                  />

                  <label>Acceso del canal</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto' }}>
                    {workspaceMemberOptions.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay miembros del workspace para asignar.</div>}
                    {workspaceMemberOptions.map(member => {
                      const memberId = member.user_id?.toString() || member._id?.toString()
                      const checked = editChannelMemberIds.includes(memberId)
                      return (
                        <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setEditChannelMemberIds(prev => checked ? prev.filter(id => id !== memberId) : [...prev, memberId])}
                          />
                          <span>{member.user_nombre || member.user_email || member.email || 'Usuario'}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={closeModal} disabled={modalSubmitting}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                    {modalSubmitting ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'invite' && (
              <form onSubmit={handleSubmitInvite}>
                <div className="modal-header">
                  <div className="modal-title">Invitar miembro</div>
                  <button type="button" className="modal-close" onClick={closeModal} disabled={modalSubmitting}>✕</button>
                </div>
                <div className="modal-fields">
                  {modalErrors.form && <div className="modal-error-banner">{modalErrors.form}</div>}
                  <label htmlFor="inv-email">Email</label>
                  <input
                    id="inv-email"
                    type="email"
                    autoFocus
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="persona@empresa.com"
                    className={modalErrors.email ? 'input-error' : ''}
                  />
                  {modalErrors.email && <div className="modal-field-error">{modalErrors.email}</div>}

                  <label htmlFor="inv-role">Rol</label>
                  <select
                    id="inv-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="USER">Miembro</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="OWNER">Propietario</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-glass" onClick={closeModal} disabled={modalSubmitting}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={modalSubmitting}>
                    {modalSubmitting ? 'Enviando...' : 'Enviar invitación'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ===== TOASTS ===== */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismissToast(t.id)}>
            <span className="toast-icon">{t.type === 'error' ? '⚠️' : '✓'}</span>
            <span className="toast-message">{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
