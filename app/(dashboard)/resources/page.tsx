"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResourceCard } from "@/components/features/ResourceCard";
import { 
  Search, 
  Filter, 
  Upload, 
  FileText, 
  Video, 
  Link, 
  Image,
  File,
  TrendingUp,
  Clock,
  BookOpen
} from "lucide-react";

type ResourceType = "document" | "video" | "link" | "image" | "other";

interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  uploadedBy: string;
  tags?: string[];
  downloadCount?: number;
  createdAt: number;
}

export default function ResourcesPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const resources = useQuery(
    api.resources.getByCollege,
    currentUser?.collegeId
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId }
      : "skip"
  );

  const popularResources = useQuery(
    api.resources.getPopular,
    currentUser?.collegeId
      ? { clerkUserId: user!.id, collegeId: currentUser.collegeId, limit: 5 }
      : "skip"
  );

  const myUploads = useQuery(
    api.resources.getMyUploads,
    user?.id ? { clerkUserId: user.id } : "skip"
  );

  const incrementDownload = useMutation(api.resources.incrementDownload);

  const typeFilters: { type: ResourceType | null; icon: React.ElementType; label: string }[] = [
    { type: null, icon: Filter, label: "All" },
    { type: "document", icon: FileText, label: "Documents" },
    { type: "video", icon: Video, label: "Videos" },
    { type: "link", icon: Link, label: "Links" },
    { type: "image", icon: Image, label: "Images" },
    { type: "other", icon: File, label: "Other" },
  ];

  const filteredResources = (resources as Resource[] | undefined)?.filter((resource) => {
    const matchesSearch = searchQuery
      ? resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    const matchesType = selectedType ? resource.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  const handleDownload = async (resourceId: string) => {
    await incrementDownload({ clerkUserId: user!.id, resourceId });
  };

  const getTypeCount = (type: ResourceType | null) => {
    if (!resources) return 0;
    if (!type) return resources.length;
    return (resources as Resource[]).filter((r: Resource) => r.type === type).length;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Resources
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Access and share study materials, notes, and resources
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowUploadModal(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {typeFilters.map(({ type, icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => setSelectedType(type)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              selectedType === type
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Icon className="w-5 h-5" />
            <div className="text-left">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs opacity-70">{getTypeCount(type)}</p>
            </div>
          </button>
        ))}
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </Card>

      {popularResources && popularResources.length > 0 && !searchQuery && !selectedType && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Popular Resources
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(popularResources as Resource[]).map((resource) => (
              <ResourceCard
                key={resource._id}
                title={resource.title}
                description={resource.description}
                type={resource.type}
                url={resource.url}
                tags={resource.tags}
                downloadCount={resource.downloadCount}
                createdAt={resource.createdAt}
                isOwner={resource.uploadedBy === currentUser?._id}
                onDownload={() => handleDownload(resource._id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedType 
              ? `${typeFilters.find((f) => f.type === selectedType)?.label}` 
              : "All Resources"}
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filteredResources?.length ?? 0} resources
          </span>
        </div>

        {filteredResources && filteredResources.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(filteredResources as Resource[]).map((resource) => (
              <ResourceCard
                key={resource._id}
                title={resource.title}
                description={resource.description}
                type={resource.type}
                url={resource.url}
                tags={resource.tags}
                downloadCount={resource.downloadCount}
                createdAt={resource.createdAt}
                isOwner={resource.uploadedBy === currentUser?._id}
                onDownload={() => handleDownload(resource._id)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No resources found
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery || selectedType
                ? "Try adjusting your search or filters"
                : "Be the first to upload a resource!"}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </Card>
        )}
      </div>

      {myUploads && myUploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Your Uploads
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(myUploads as Resource[]).slice(0, 4).map((resource) => (
              <ResourceCard
                key={resource._id}
                title={resource.title}
                description={resource.description}
                type={resource.type}
                url={resource.url}
                tags={resource.tags}
                downloadCount={resource.downloadCount}
                createdAt={resource.createdAt}
                isOwner={true}
                canEdit={true}
                onDownload={() => handleDownload(resource._id)}
              />
            ))}
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Resource</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Upload modal placeholder - implement form here
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setShowUploadModal(false)} className="flex-1">
                Upload
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
