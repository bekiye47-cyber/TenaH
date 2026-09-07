import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { adminService, isSupabaseLive } from '../services/adminSupabase';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  isLiveSupabase: boolean;
  accessDeniedMessage: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  clearAccessDenied: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminService.getSessionAdmin().then((user) => {
      if (mounted) {
        setAdminUser(user);
        setIsLoading(false);
      }
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    setAccessDeniedMessage(null);
    try {
      const user = await adminService.signIn(email, pass);
      setAdminUser(user);
    } catch (err: any) {
      if (err.message && err.message.includes('Access denied')) {
        setAccessDeniedMessage(err.message);
      }
      throw err;
    }
  };

  const signUp = async (email: string, pass: string) => {
    return await adminService.signUp(email, pass);
  };

  const signOut = async () => {
    await adminService.signOut();
    setAdminUser(null);
    setAccessDeniedMessage(null);
  };

  const clearAccessDenied = () => {
    setAccessDeniedMessage(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        isLiveSupabase: isSupabaseLive,
        accessDeniedMessage,
        signIn,
        signUp,
        signOut,
        clearAccessDenied,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
