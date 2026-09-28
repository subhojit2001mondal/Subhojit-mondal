import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ContactNumber,
  DEFAULT_CONTACT_NUMBERS,
  subscribeToContactNumbers,
  saveContactNumberToDb,
  deleteContactNumberFromDb,
  formatTelLink,
  formatWhatsAppLink,
  getPrimaryContact
} from '../services/dbService';

interface ContactContextType {
  contacts: ContactNumber[];
  getPrimaryPhone: (property: 'gangtok' | 'kalyani') => string;
  getPrimaryWhatsApp: (property: 'gangtok' | 'kalyani') => string;
  getCallLink: (property: 'gangtok' | 'kalyani') => string;
  getWhatsAppLink: (property: 'gangtok' | 'kalyani', message?: string) => string;
  saveContact: (contact: ContactNumber) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<ContactNumber[]>(DEFAULT_CONTACT_NUMBERS);

  useEffect(() => {
    const unsub = subscribeToContactNumbers((updatedContacts) => {
      if (updatedContacts && updatedContacts.length > 0) {
        setContacts(updatedContacts);
      }
    });
    return () => unsub();
  }, []);

  const getPrimaryPhone = (property: 'gangtok' | 'kalyani'): string => {
    const contact = getPrimaryContact(contacts, property, 'call');
    return contact.phoneNumber;
  };

  const getPrimaryWhatsApp = (property: 'gangtok' | 'kalyani'): string => {
    const contact = getPrimaryContact(contacts, property, 'whatsapp');
    return contact.phoneNumber;
  };

  const getCallLink = (property: 'gangtok' | 'kalyani'): string => {
    const phone = getPrimaryPhone(property);
    return formatTelLink(phone);
  };

  const getWhatsAppLink = (property: 'gangtok' | 'kalyani', message?: string): string => {
    const phone = getPrimaryWhatsApp(property);
    return formatWhatsAppLink(phone, message);
  };

  const saveContact = async (contact: ContactNumber) => {
    await saveContactNumberToDb(contact);
  };

  const deleteContact = async (contactId: string) => {
    await deleteContactNumberFromDb(contactId);
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        getPrimaryPhone,
        getPrimaryWhatsApp,
        getCallLink,
        getWhatsAppLink,
        saveContact,
        deleteContact
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};
