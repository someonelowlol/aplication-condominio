"use client";
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

// Admin modules
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminCrm from './AdminCrm';
import AdminFinanzas from './AdminFinanzas';
import AdminComunidad from './AdminComunidad';
import AdminMantenimiento from './AdminMantenimiento';
import AdminReservas from './AdminReservas';
import AdminSeguridad from './AdminSeguridad';
import AdminLegal from './AdminLegal';
import AdminConfig from './AdminConfig';
import AdminTecnologia from './AdminTecnologia';

import { Payment, Booking, Incident, Announcement } from '@/lib/types';

interface AdminWorkspaceProps {
  adminTab: string;
  onAdminTabChange: (tab: string) => void;
  payments: Payment[];
  bookings: Booking[];
  incidents: Incident[];
  announcements: Announcement[];
  onApprovePayment: (id: string) => void;
  onRejectPayment: (id: string) => void;
  onAddCustomPayment: (pay: Payment) => void;
  onApproveBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
  onChangeIncidentStatus: (id: string, status: 'reported' | 'assigned' | 'in_progress' | 'resolved') => void;
  onAssignTechnician: (id: string, name: string) => void;
  onAddComment: (id: string, content: string) => void;
  onAddAnnouncement: (ann: Announcement) => void;
}

export default function AdminWorkspace({
  adminTab,
  onAdminTabChange,
  payments,
  bookings,
  incidents,
  announcements,
  onApprovePayment,
  onRejectPayment,
  onAddCustomPayment,
  onApproveBooking,
  onCancelBooking,
  onChangeIncidentStatus,
  onAssignTechnician,
  onAddComment,
  onAddAnnouncement
}: AdminWorkspaceProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Sidebar vertical */}
      <AdminSidebar activeTab={adminTab} onTabChange={onAdminTabChange} />

      {/* Area de contenido dinámico */}
      <div className="flex-1 min-w-0 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={adminTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
          >
            {adminTab === 'dashboard' && (
              <AdminDashboard 
                payments={payments}
                bookings={bookings}
                incidents={incidents}
                onTabChange={onAdminTabChange}
              />
            )}
            {adminTab === 'crm' && <AdminCrm />}
            {adminTab === 'finanzas' && (
              <AdminFinanzas 
                payments={payments}
                onApprovePayment={onApprovePayment}
                onRejectPayment={onRejectPayment}
                onAddCustomPayment={onAddCustomPayment}
              />
            )}
            {adminTab === 'comunidad' && (
              <AdminComunidad 
                announcements={announcements}
                onAddAnnouncement={onAddAnnouncement}
              />
            )}
            {adminTab === 'mantenimiento' && (
              <AdminMantenimiento 
                incidents={incidents}
                onChangeIncidentStatus={onChangeIncidentStatus}
                onAssignTechnician={onAssignTechnician}
                onAddComment={onAddComment}
              />
            )}
            {adminTab === 'reservas' && (
              <AdminReservas 
                bookings={bookings}
                onApproveBooking={onApproveBooking}
                onCancelBooking={onCancelBooking}
                payments={payments}
              />
            )}
            {adminTab === 'seguridad' && <AdminSeguridad />}
            {adminTab === 'legal' && (
              <AdminLegal onAddCustomPayment={onAddCustomPayment} />
            )}
            {adminTab === 'config' && <AdminConfig />}
            {adminTab === 'ia_iot' && <AdminTecnologia />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
