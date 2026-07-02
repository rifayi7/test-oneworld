"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LeadContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <LeadContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLead() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLead must be used within a LeadProvider");
  }
  return context;
}
