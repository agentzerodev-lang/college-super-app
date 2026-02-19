"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock,
  Shield,
  Heart,
  HelpCircle,
  Bell,
  Activity,
  Users,
  Navigation
} from "lucide-react";

type SOSType = "emergency" | "medical" | "security" | "other";

export default function SOSPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState("");

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const myAlerts = useQuery(
    api.sos.getMyAlerts,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const activeAlerts = useQuery(
    api.sos.getActiveByCollege,
    currentUser?.collegeId && (currentUser.role === "faculty" || currentUser.role === "admin")
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId }
      : "skip"
  );

  const createSOS = useMutation(api.sos.create);
  const cancelSOS = useMutation(api.sos.cancel);

  const isStaff = currentUser?.role === "faculty" || 
                  currentUser?.role === "admin" || 
                  currentUser?.role === "hostelAdmin";

  const hasActiveAlert = (myAlerts as { status: string }[] | undefined)?.some((alert) => 
    alert.status === "active" || alert.status === "responding"
  );

  const activeAlert = (myAlerts as { status: string }[] | undefined)?.find((alert) => 
    alert.status === "active" || alert.status === "responding"
  ) as { _id: string; type: string; status: string; description?: string; createdAt: number; location?: { latitude: number; longitude: number }; responders?: string[] } | undefined;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError("Unable to get your location");
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const sosTypes: { type: SOSType; icon: React.ElementType; label: string; description: string; color: string; bg: string }[] = [
    {
      type: "emergency",
      icon: AlertTriangle,
      label: "Emergency",
      description: "Immediate danger or threat",
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
    {
      type: "medical",
      icon: Heart,
      label: "Medical",
      description: "Health emergency or injury",
      color: "text-pink-600",
      bg: "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      type: "security",
      icon: Shield,
      label: "Security",
      description: "Security threat or incident",
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      type: "other",
      icon: HelpCircle,
      label: "Other",
      description: "Other urgent assistance needed",
      color: "text-slate-600",
      bg: "bg-slate-100 dark:bg-slate-700",
    },
  ];

  const handleCreateSOS = async (type: SOSType) => {
    if (!currentUser?.collegeId) return;

    setIsLoading(true);
    try {
      await createSOS({
        clerkUserId: user!.id,
        collegeId: currentUser.collegeId,
        type,
        location: currentLocation
          ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }
          : undefined,
        description: customDescription || undefined,
      });
      setCustomDescription("");
    } catch (error) {
      console.error("Failed to create SOS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSOS = async () => {
    if (!activeAlert) return;

    setIsLoading(true);
    try {
      await cancelSOS({
        clerkUserId: user!.id,
        sosId: activeAlert._id as Id<"sosAlerts">,
      });
    } catch (error) {
      console.error("Failed to cancel SOS:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (hasActiveAlert && activeAlert) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 animate-pulse">
            <Bell className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600">SOS Active</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Help is on the way
          </p>
        </div>

        <Card className="p-6 border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                <span className="font-semibold text-red-600">
                  {activeAlert.type.toUpperCase()}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeAlert.status === "responding"
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                  : "bg-red-100 dark:bg-red-900/30 text-red-600"
              }`}>
                {activeAlert.status === "responding" ? "Responding" : "Active"}
              </span>
            </div>

            {activeAlert.description && (
              <p className="text-slate-600 dark:text-slate-300">
                {activeAlert.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(activeAlert.createdAt)}
              </span>
              {activeAlert.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location shared
                </span>
              )}
            </div>

            {activeAlert.responders && activeAlert.responders.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Users className="w-4 h-4" />
                {activeAlert.responders.length} responder(s) assigned
              </div>
            )}

            <div className="pt-4 border-t border-red-200 dark:border-red-800">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCancelSOS}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Cancel Alert (False Alarm)"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Emergency Contacts
          </h3>
          <div className="space-y-2">
            <a
              href="tel:911"
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Phone className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">Emergency Services</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">911</p>
              </div>
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Emergency SOS
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Quickly alert campus security and emergency services
        </p>
      </div>

      {currentLocation && (
        <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Navigation className="w-4 h-4" />
            <span className="text-sm">Your location is being tracked</span>
          </div>
        </Card>
      )}

      {locationError && (
        <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{locationError}</span>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {sosTypes.map((sosType) => {
          const Icon = sosType.icon;
          return (
            <Card
              key={sosType.type}
              className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-500"
              onClick={() => !isLoading && handleCreateSOS(sosType.type)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${sosType.bg}`}>
                  <Icon className={`w-8 h-8 ${sosType.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                    {sosType.label}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {sosType.description}
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Additional Details (Optional)
        </label>
        <textarea
          value={customDescription}
          onChange={(e) => setCustomDescription(e.target.value)}
          placeholder="Describe your situation..."
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </Card>

      <Card className="p-4 bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Emergency Contacts
        </h3>
        <div className="space-y-2">
          <a
            href="tel:911"
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Phone className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Emergency Services</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">911</p>
            </div>
          </a>
          <a
            href="tel:112"
            className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Shield className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Campus Security</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Available 24/7</p>
            </div>
          </a>
        </div>
      </Card>

      {myAlerts && myAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Alerts
          </h2>
          <div className="space-y-2">
            {(myAlerts as { _id: string; type: string; status: string; createdAt: number }[]).slice(0, 5).map((alert) => (
              <Card key={alert._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.type === "emergency"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : alert.type === "medical"
                        ? "bg-pink-100 dark:bg-pink-900/30"
                        : alert.type === "security"
                        ? "bg-orange-100 dark:bg-orange-900/30"
                        : "bg-slate-100 dark:bg-slate-700"
                    }`}>
                      {alert.type === "emergency" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {alert.type === "medical" && <Heart className="w-4 h-4 text-pink-500" />}
                      {alert.type === "security" && <Shield className="w-4 h-4 text-orange-500" />}
                      {alert.type === "other" && <HelpCircle className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {alert.type}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.status === "resolved"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                      : alert.status === "responding"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600"
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isStaff && activeAlerts && activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Active Campus Alerts ({activeAlerts.length})
          </h2>
          <div className="space-y-2">
            {(activeAlerts as { _id: string; type: string; status: string; createdAt: number }[]).map((alert) => (
              <Card key={alert._id} className="p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {alert.type} - {alert.status}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatTime(alert.createdAt)}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Respond
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
