import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { currentUser, userRole, subscribedClubs } = useAuth();
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);

    // Announcement Form State
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // In real app, query firestore with "where club in subscribedClubs"
                const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
                const querySnapshot = await getDocs(q);
                let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (data.length === 0) throw new Error("No data");
                setAnnouncements(data);
            } catch (e) {
                // Pre-Populated 3 Announcements Per Club (Mock)
                const allAnnouncements = [
                    { id: 1, title: 'HackNova 2026 Registration Open', club: 'Coding Club', content: 'Register now for the biggest hackathon! Teams of 4 allowed.', createdAt: new Date() },
                    { id: 2, title: 'Python Workshop', club: 'Coding Club', content: 'Learn Python from scratch this weekend. Venue: Lab 3.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 3, title: 'Coding Contest Results', club: 'Coding Club', content: 'Congratulations to the winners of last weeks contest!', createdAt: new Date(Date.now() - 172800000) },

                    { id: 4, title: 'Music Auditions', club: 'Music Society', content: 'We are looking for vocalists and guitarists.', createdAt: new Date() },
                    { id: 5, title: 'Concert Night', club: 'Music Society', content: 'Live performance by the college band.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 6, title: 'Jam Session', club: 'Music Society', content: 'Open mic for everyone on Friday.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 7, title: 'RoboWars 2026', club: 'Robotics Club', content: 'Build your bot and fight for glory.', createdAt: new Date() },
                    { id: 8, title: 'Arduino Workshop', club: 'Robotics Club', content: 'Basics of electronics and sensors.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 9, title: 'Tech Exhibition', club: 'Robotics Club', content: 'Showcase your projects to external visitors.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 13, title: 'Debate Championship', club: 'Debate Club', content: 'Inter-college debate competition.', createdAt: new Date() },
                    { id: 14, title: 'Public Speaking Workshop', club: 'Debate Club', content: 'Master the art of speech.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 15, title: 'Mock Parliament', club: 'Debate Club', content: 'Experience the legislative process.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 16, title: 'Photo Walk', club: 'Photography Club', content: 'Campus photo walk this Sunday morning.', createdAt: new Date() },
                    { id: 17, title: 'Exhibition Setup', club: 'Photography Club', content: 'Volunteers needed for gallery setup.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 18, title: 'Editing Workshop', club: 'Photography Club', content: 'Learn Lightroom basics.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 19, title: 'Dance Off', club: 'Dance Crew', content: 'Auditions for the annual fest.', createdAt: new Date() },
                    { id: 20, title: 'Workshop: Hip Hop', club: 'Dance Crew', content: 'Guest choreographer workshop.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 21, title: 'Flash Mob', club: 'Dance Crew', content: 'Practice starts at 5 PM.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 22, title: 'Book Club Meet', club: 'Literature Club', content: 'Discussing "1984" by Orwell.', createdAt: new Date() },
                    { id: 23, title: 'Poetry Slam', club: 'Literature Club', content: 'Open mic for poets.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 24, title: 'Creative Writing', club: 'Literature Club', content: 'Workshop on short story writing.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 25, title: 'Startup Pitch', club: 'E-Cell', content: 'Pitch your idea to investors.', createdAt: new Date() },
                    { id: 26, title: 'Guest Lecture', club: 'E-Cell', content: 'Talk by a successful alumni entrepreneur.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 27, title: 'Internship Fair', club: 'E-Cell', content: 'Find internships in local startups.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 28, title: 'Art Exhibition', club: 'Fine Arts', content: 'Showcasing student artwork.', createdAt: new Date() },
                    { id: 29, title: 'Sketching Competition', club: 'Fine Arts', content: 'Theme: Campus Life.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 30, title: 'Mural Painting', club: 'Fine Arts', content: 'Help us paint the canteen wall.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 31, title: 'Inter-Hostel Cricket', club: 'Sports Committee', content: 'Registration extended till Friday.', createdAt: new Date() },
                    { id: 32, title: 'Football Trials', club: 'Sports Committee', content: 'College team selection trials.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 33, title: 'Yoga Session', club: 'Sports Committee', content: 'Morning yoga for mental health.', createdAt: new Date(Date.now() - 172800000) },

                    { id: 10, title: 'Placement Drive: Google', club: 'Placement Cell', content: 'Eligibility: 4th Year CSE. Package: 20 LPA.', createdAt: new Date() },
                    { id: 11, title: 'Internship Opportunity: Amazon', club: 'Placement Cell', content: 'For 3rd Year students. apply by tomorrow.', createdAt: new Date(Date.now() - 86400000) },
                    { id: 12, title: 'Resume Building Session', club: 'Placement Cell', content: 'Expert session on creating ATS friendly resumes.', createdAt: new Date(Date.now() - 172800000) },

                    // Admin / General
                    { id: 99, title: 'Holiday Declaration', club: 'Admin', content: 'College will remain closed on Monday.', createdAt: new Date() },
                ];

                // Filter Logic: Show Admin/Placement/General + Subscribed Clubs
                const visible = allAnnouncements.filter(a => {
                    if (a.club === 'Admin' || a.club === 'Placement Cell') return true;
                    // Check subscriptions
                    return subscribedClubs.some(sub => sub.name === a.club);
                });

                setAnnouncements(visible);
            }
        };
        fetchAnnouncements();
    }, [subscribedClubs]); // Re-run when subscriptions change

    const handlePostAnnouncement = (e) => {
        e.preventDefault();
        const newPost = {
            id: Date.now(),
            title: newTitle,
            content: newContent,
            club: 'My Club', // In real app, use the club the admin manages
            createdAt: new Date()
        };
        setAnnouncements([newPost, ...announcements]);
        setShowPostModal(false);
        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="page-container">
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="fade-in">Hello, {currentUser?.displayName || 'Student'}</h1>
                    <p className="fade-in" style={{ animationDelay: '0.1s', color: 'var(--text-secondary)' }}>
                        Here's what's happening on campus today.
                    </p>
                </div>
                {(userRole === 'admin' || userRole === 'club_admin') && (
                    <button onClick={() => setShowPostModal(true)} className="btn-primary fade-in">
                        Post Update
                    </button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <section>
                    <h3 style={{ marginBottom: '16px' }}>Latest Announcements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {announcements.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel"
                                style={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.club}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(item.createdAt?.seconds * 1000 || item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 style={{ marginBottom: '8px' }}>{item.title}</h4>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.content}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 style={{ marginBottom: '16px' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }} onClick={() => navigate('/clubs')}>
                            <h4>View Clubs</h4>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', cursor: 'pointer', textAlign: 'center' }} onClick={() => navigate('/events')}>
                            <h4>Upcoming Events</h4>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '16px' }}>Your Clubs</h3>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        {subscribedClubs.length > 0 ? (
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {subscribedClubs.map(club => (
                                    <li key={club.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                                        <span>{club.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>You haven't joined any clubs yet.</p>
                        )}
                    </div>
                </section>
            </div>

            {showPostModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel"
                        style={{ width: '500px', padding: '32px', position: 'relative' }}
                    >
                        <h3 style={{ marginBottom: '24px' }}>New Announcement</h3>
                        <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                            <textarea placeholder="Content" value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} required />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setShowPostModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Post</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </div >
    );
}
