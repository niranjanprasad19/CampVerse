import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student', 'rep', 'admin'
    const [loading, setLoading] = useState(true);

    // Sign up with Email/Pass
    async function signup(email, password, rollNumber, additionalData) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document
        try {
            // Race condition: if Firestore takes too long (e.g. 5s), assume connection/rules issue
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Database operation timed out. Check if Firestore is enabled in Console.")), 5000));

            await Promise.race([
                setDoc(doc(db, "users", user.uid), {
                    email,
                    rollNumber,
                    role: 'student', // Default role
                    ...additionalData,
                    createdAt: new Date()
                }),
                timeoutPromise
            ]);
        } catch (dbError) {
            console.error("Firestore Error (proceeding in Demo Mode):", dbError);
            alert("Database is currently unreachable. You are logged in via 'Demo Mode'.");
        }

        return user;
    }

    // Login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Google Login
    async function googleLogin() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user doc exists, if not create it
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                email: user.email,
                role: 'student',
                createdAt: new Date()
            });
        }

        return user;
    }

    function logout() {
        localStorage.removeItem('demoRole'); // Clear demo session
        return signOut(auth);
    }

    useEffect(() => {
        // Ensure standard persistence
        setPersistence(auth, browserLocalPersistence).catch(console.error);

        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Real User Found
                setCurrentUser(user); // Set basic user immediately to prevent redirect
                localStorage.removeItem('demoRole'); // Cleanup demo if real user exists
                // Realtime listener for user profile
                unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUserRole(userData.role);
                        setCurrentUser({ ...user, ...userData }); // Enhance with profile data
                        // Sync subscribed clubs from firestore
                        if (userData.subscribedClubs) {
                            setSubscribedClubs(userData.subscribedClubs);
                        } else {
                            setSubscribedClubs([]);
                        }
                    } else {
                        setCurrentUser(user);
                        setUserRole(null);
                        setSubscribedClubs([]);
                    }
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setCurrentUser(user);
                });
                setLoading(false);
            } else {
                // No Real User - Check for Demo Session
                const demoRole = localStorage.getItem('demoRole');
                if (demoRole) {
                    // Restore Demo User
                    setCurrentUser({ uid: `demo-${demoRole}`, email: `${demoRole}@cunp.com`, displayName: `Demo ${demoRole}`, year: 4, branch: 'CSE', rollNumber: '2022CS001' });
                    setUserRole(demoRole);
                    setSubscribedClubs([]);
                } else {
                    if (unsubscribeDoc) unsubscribeDoc();
                    setCurrentUser(null);
                    setUserRole(null);
                    setSubscribedClubs([]);
                }
                setLoading(false);
            }
        });

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const [subscribedClubs, setSubscribedClubs] = useState([]);

    const subscribeToClub = async (club) => {
        // Optimistic update
        const newClub = { id: club.id, name: club.name || '', category: club.category || 'General' };

        if (currentUser && !currentUser.uid.startsWith('demo-')) {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    subscribedClubs: arrayUnion(newClub)
                });
            } catch (e) {
                console.error("Error subscribing:", e);
                alert("Could not save subscription.");
            }
        } else {
            // Demo/Local fallback
            setSubscribedClubs(prev => {
                if (prev.find(c => c.id === club.id)) return prev;
                return [...prev, newClub];
            });
        }
    };

    const unsubscribeFromClub = async (clubId) => {
        const clubToRemove = subscribedClubs.find(c => c.id === clubId);

        if (currentUser && !currentUser.uid.startsWith('demo-')) {
            if (!clubToRemove) return;
            try {
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    subscribedClubs: arrayRemove(clubToRemove)
                });
            } catch (e) {
                console.error("Error unsubscribing:", e);
            }
        } else {
            setSubscribedClubs(prev => prev.filter(c => c.id !== clubId));
        }
    };

    const loginAsDemo = (role) => {
        localStorage.setItem('demoRole', role); // Save demo session
        setCurrentUser({ uid: `demo-${role}`, email: `${role}@cunp.com`, displayName: `Demo ${role}`, year: 4, branch: 'CSE', rollNumber: '2022CS001' });
        setUserRole(role);
        setSubscribedClubs([]); // Reset for demo
    };

    const value = {
        currentUser,
        userRole,
        subscribedClubs,
        signup,
        login,
        googleLogin,
        logout,
        subscribeToClub,
        unsubscribeFromClub,
        loginAsDemo,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
