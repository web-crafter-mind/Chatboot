import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ProfileContextValue {
  name: string;
  setName: (name: string) => void;
  isNew: boolean;
  dismissWelcome: () => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  name: 'User',
  setName: () => {},
  isNew: false,
  dismissWelcome: () => {},
});

const STORAGE_KEY = 'chatbot-profile';

interface StoredProfile {
  name: string;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState<string>('User');
  const [isNew, setIsNew] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as StoredProfile;
        setNameState(data.name || 'User');
      } else {
        setIsNew(true); // no profile → show welcome screen
      }
    } catch {
      setIsNew(true);
    }
  }, []);

  const save = (newName: string) => {
    const trimmed = newName.trim() || 'User';
    setNameState(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: trimmed }));
    } catch {
      /* ignore */
    }
  };

  const dismissWelcome = () => {
    setIsNew(false);
    // Save a default if they just dismiss
    if (!localStorage.getItem(STORAGE_KEY)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'User' }));
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <ProfileContext.Provider value={{ name, setName: save, isNew, dismissWelcome }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
