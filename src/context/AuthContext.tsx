"use client";

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

const isCartEqual = (cart1: any[] | undefined, cart2: any[] | undefined) => {
  if (!cart1 || !cart2) return cart1 === cart2;
  if (cart1.length !== cart2.length) return false;
  
  const sorted1 = [...cart1].sort((a, b) => (a.id || "").localeCompare(b.id || ""));
  const sorted2 = [...cart2].sort((a, b) => (a.id || "").localeCompare(b.id || ""));

  return sorted1.every((item1, idx) => {
    const item2 = sorted2[idx];
    if (!item2) return false;
    return (
      item1.id === item2.id &&
      Number(item1.quantity) === Number(item2.quantity) &&
      (item1.size || "").toLowerCase() === (item2.size || "").toLowerCase() &&
      Number(item1.price) === Number(item2.price)
    );
  });
};

const isAddressEqual = (addr1: any, addr2: any) => {
  if (!addr1 || !addr2) return addr1 === addr2;
  return (
    (addr1.fullName || "").trim() === (addr2.fullName || "").trim() &&
    (addr1.email || "").trim() === (addr2.email || "").trim() &&
    (addr1.phone || "").trim().replace(/[\s-+]/g, "") === (addr2.phone || "").trim().replace(/[\s-+]/g, "") &&
    (addr1.address || "").trim() === (addr2.address || "").trim() &&
    (addr1.city || "").trim() === (addr2.city || "").trim() &&
    (addr1.state || "").trim() === (addr2.state || "").trim() &&
    (addr1.pincode || "").trim() === (addr2.pincode || "").trim() &&
    (addr1.country || "").trim() === (addr2.country || "").trim()
  );
};

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
  phone: string;
  profileData: any;
  loadingProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: { displayName?: string; email?: string; phone?: string; savedAddress?: any }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState<string>("");
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const profileDataRef = useRef<any>(null);

  // Sync profileData to ref
  useEffect(() => {
    profileDataRef.current = profileData;
  }, [profileData]);

  // Initialize phone from localStorage on client side mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("kitkart_phone") || "";
      if (savedPhone) {
        setPhone(savedPhone.replace(/[\s-+]/g, ""));
      }
    }
  }, []);

  // Listen to custom phone_updated events
  useEffect(() => {
    const handlePhoneUpdated = () => {
      const savedPhone = localStorage.getItem("kitkart_phone") || "";
      setPhone(savedPhone.replace(/[\s-+]/g, ""));
    };
    window.addEventListener("phone_updated", handlePhoneUpdated);
    return () => window.removeEventListener("phone_updated", handlePhoneUpdated);
  }, []);

  // Sync auth state changes and user details
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoadingProfile(true);
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          let currentPhone = localStorage.getItem("kitkart_phone") || "";
          currentPhone = currentPhone.replace(/[\s-+]/g, "");

          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.phoneNumber) {
              currentPhone = data.phoneNumber.replace(/[\s-+]/g, "");
              localStorage.setItem("kitkart_phone", currentPhone);
              setPhone(currentPhone);
            } else if (currentPhone) {
              await updateDoc(userRef, { phoneNumber: currentPhone });
            }
          } else {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              phoneNumber: currentPhone,
              createdAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error syncing auth user with Firestore:", err);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for profileData, cart, and address
  useEffect(() => {
    if (!phone) {
      setProfileData(null);
      return;
    }

    const profileRef = doc(db, "profiles_by_phone", phone);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData(data);

        // Sync cart to local storage if it differs
        if (data.cart) {
          const localCartStr = localStorage.getItem("kitkart_cart") || "[]";
          let localCart = [];
          try {
            localCart = JSON.parse(localCartStr);
          } catch (e) {}

          if (!isCartEqual(data.cart, localCart)) {
            localStorage.setItem("kitkart_cart", JSON.stringify(data.cart));
            window.dispatchEvent(new Event("cart_updated"));
          }
        }

        // Sync saved address to local storage if it differs
        if (data.savedAddress) {
          const localAddressStr = localStorage.getItem("kitkart_saved_address") || "null";
          let localAddress = null;
          try {
            localAddress = JSON.parse(localAddressStr);
          } catch (e) {}

          if (!isAddressEqual(data.savedAddress, localAddress)) {
            localStorage.setItem("kitkart_saved_address", JSON.stringify(data.savedAddress));
          }
        }
      } else {
        // Document does not exist yet, create it with current local cart/address
        const localCart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
        const localAddressStr = localStorage.getItem("kitkart_saved_address");
        let localAddress = null;
        if (localAddressStr) {
          try {
            localAddress = JSON.parse(localAddressStr);
          } catch (e) {}
        }

        setDoc(profileRef, {
          phoneNumber: phone,
          displayName: user?.displayName || "",
          email: user?.email || "",
          cart: localCart,
          savedAddress: localAddress,
          updatedAt: serverTimestamp()
        }, { merge: true }).catch((err) => console.error("Error creating profile:", err));
      }
    });

    return () => unsubscribe();
  }, [phone, user]);

  // Upload local cart changes to Firestore
  useEffect(() => {
    const handleCartUpdated = async () => {
      if (!phone) return;

      const localCart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
      const localAddressStr = localStorage.getItem("kitkart_saved_address");
      let localAddress = null;
      if (localAddressStr) {
        try {
          localAddress = JSON.parse(localAddressStr);
        } catch (e) {}
      }

      // Check against Firestore using the local Ref instead of doing getDoc read
      let firestoreCart = [];
      let firestoreAddress = null;
      if (profileDataRef.current) {
        firestoreCart = profileDataRef.current.cart || [];
        firestoreAddress = profileDataRef.current.savedAddress || null;
      }

      const cartChanged = !isCartEqual(firestoreCart, localCart);
      const addressChanged = !isAddressEqual(firestoreAddress, localAddress);

      if (cartChanged || addressChanged) {
        const profileRef = doc(db, "profiles_by_phone", phone);
        await setDoc(profileRef, {
          cart: localCart,
          savedAddress: localAddress,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    };

    window.addEventListener("cart_updated", handleCartUpdated);
    return () => window.removeEventListener("cart_updated", handleCartUpdated);
  }, [phone]);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, fullName: string, phoneInput?: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      const uid = userCredential.user.uid;
      const cleanPhone = phoneInput ? phoneInput.replace(/[\s-+]/g, "") : "";

      // Save uid -> phone mapping
      await setDoc(doc(db, "users", uid), {
        uid,
        email,
        displayName: fullName,
        phoneNumber: cleanPhone,
        createdAt: serverTimestamp()
      }, { merge: true });

      // Save/initialize phone-specific profile
      if (cleanPhone) {
        localStorage.setItem("kitkart_phone", cleanPhone);
        setPhone(cleanPhone);

        const localCart = JSON.parse(localStorage.getItem("kitkart_cart") || "[]");
        const localAddressStr = localStorage.getItem("kitkart_saved_address");
        let localAddress = null;
        if (localAddressStr) {
          try {
            localAddress = JSON.parse(localAddressStr);
          } catch (e) {}
        }

        await setDoc(doc(db, "profiles_by_phone", cleanPhone), {
          phoneNumber: cleanPhone,
          displayName: fullName,
          email: email,
          cart: localCart,
          savedAddress: localAddress,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    }
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("kitkart_phone");
    localStorage.removeItem("kitkart_saved_address");
    localStorage.setItem("kitkart_cart", "[]");
    setPhone("");
    setProfileData(null);
    window.dispatchEvent(new Event("cart_updated"));
  }

  async function updateProfileData(updates: { displayName?: string; email?: string; phone?: string; savedAddress?: any }) {
    let activePhone = phone || updates.phone || localStorage.getItem("kitkart_phone") || "";
    activePhone = activePhone.replace(/[\s-+]/g, "");

    if (updates.phone) {
      const cleanPhone = updates.phone.replace(/[\s-+]/g, "");
      if (cleanPhone !== phone) {
        localStorage.setItem("kitkart_phone", cleanPhone);
        setPhone(cleanPhone);
        activePhone = cleanPhone;
      }
    }

    if (user) {
      if (updates.displayName && updates.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: updates.displayName
        });
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        phoneNumber: activePhone,
        ...(updates.displayName ? { displayName: updates.displayName } : {}),
        ...(updates.email ? { email: updates.email } : {})
      }, { merge: true });
    }

    if (activePhone) {
      const profileRef = doc(db, "profiles_by_phone", activePhone);
      const profileUpdates: any = {
        phoneNumber: activePhone,
        updatedAt: serverTimestamp()
      };
      if (updates.displayName !== undefined) profileUpdates.displayName = updates.displayName;
      if (updates.email !== undefined) profileUpdates.email = updates.email;
      if (updates.savedAddress !== undefined) profileUpdates.savedAddress = updates.savedAddress;

      await setDoc(profileRef, profileUpdates, { merge: true });
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      phone,
      profileData,
      loadingProfile,
      login,
      signUp,
      loginWithGoogle,
      logout,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

