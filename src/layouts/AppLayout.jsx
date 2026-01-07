import BotWidget from "../components/BotWidget";
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Calendar, Users, Briefcase, Bell, User } from 'lucide-react';

export default function AppLayout() {
    const { currentUser, userRole, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error("Failed to log out");
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className="glass-panel" style={{
                width: '260px',
                margin: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: '16px',
                height: 'calc(100vh - 32px)'
            }}>
                <div style={{ marginBottom: '40px', padding: '0 12px' }}>
                    <h1 style={{
                        fontSize: '24px',
                        background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>CUNP</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Campus Unified Notifications</p>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
                    <NavItem to="/clubs" icon={<Users size={20} />} label="Clubs" />
                    <NavItem to="/events" icon={<Calendar size={20} />} label="Events" />

                    {/* Show Placements only for 2nd Year and above (Internships/Jobs) */}
                    <NavItem to="/placements" icon={<Briefcase size={20} />} label="Placements" />
                    <NavItem to="/profile" icon={<User size={20} />} label="Profile" />
                </nav>

                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Profile Pic Placeholder */}
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #00f0ff, #7000ff)' }}></div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{currentUser?.email}</p>
                            <p style={{ fontSize: '10px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{userRole}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                <Outlet />
            </main>
            <BotWidget />
        </div>
    );
}

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
            }
            style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 240, 255, 0.1), transparent)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.3s ease'
            })}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );
}
