"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/app/store/authStore";

export default function NotificationsTab() {
  const { user } = useAuthStore();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => axiosInstance.get(`/Notification/by-user/${user?.id}`).then(r => r.data?.data || []),
    enabled: !!user?.id
  });

  const timeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Notifications</h1>
      <div className="bg-[#0e121a] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Loading notifications...</p>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500 italic">You have no notifications right now.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-5 md:p-6 hover:bg-white/[0.02] transition-colors ${!notif.isRead ? 'bg-blue-500/5 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">{notif.title}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
