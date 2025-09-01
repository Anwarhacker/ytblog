"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import {
  Search,
  Grid,
  List,
  Plus,
  Trash2,
  Edit,
  X,
  Sun,
  Moon,
  MessageCircle,
  Play,
} from "lucide-react";

// Utility functions
const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input.trim());
};

const extractVideoId = (url) => {
  const sanitizedUrl = sanitizeInput(url);
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = sanitizedUrl.match(regex);
  return match ? match[1] : "";
};

const generateThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// API functions
const fetchVideos = async () => {
  try {
    const response = await fetch("/api/videos");
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

const createVideo = async (videoData) => {
  try {
    const response = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoData),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error creating video:", error);
    return null;
  }
};

const updateVideo = async (id, videoData) => {
  try {
    const response = await fetch(`/api/videos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(videoData),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error updating video:", error);
    return null;
  }
};

const deleteVideo = async (id) => {
  try {
    const response = await fetch(`/api/videos/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting video:", error);
    return false;
  }
};

// Video Card Component
const VideoCard = ({ video, onEdit, onDelete, onView, isAdmin = false }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-700">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <button
          onClick={() => onView?.(video)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </button>
        {isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-1">
              <button
                onClick={() => onEdit?.(video)}
                className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Edit className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={() => onDelete?.(video._id)}
                className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2">
          {sanitizeInput(video.title)}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3">
          {sanitizeInput(video.description)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
          <span>{formatDate(video.createdAt)}</span>
          <button
            onClick={() => onView?.(video)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Watch Video
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Modal Component
const VideoModal = ({ video, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {sanitizeInput(video.title)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {sanitizeInput(video.description)}
          </p>
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-500">
            Published on {formatDate(video.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Form Component
const AdminForm = ({ video, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        url: video.url,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        url: "",
      });
    }
  }, [video, isOpen]);

  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const sanitizedData = {
      title: sanitizeInput(formData.title),
      description: sanitizeInput(formData.description),
      url: sanitizeInput(formData.url),
    };

    const videoId = extractVideoId(sanitizedData.url);
    if (!videoId) {
      setFormError("Please enter a valid YouTube URL");
      return;
    }

    onSave({
      title: sanitizedData.title,
      description: sanitizedData.description,
      url: sanitizedData.url,
      videoId,
      thumbnail: generateThumbnail(videoId),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {video ? "Edit Video" : "Add New Video"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: sanitizeInput(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: sanitizeInput(e.target.value) })
              }
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {formError}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {video ? "Update" : "Add"} Video
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ isOpen, onClose, onLogin, loginError = "" }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(sanitizeInput(password));
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
            Admin Login
          </h2>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {loginError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Component
const YouTubeBlog = ({ className = "" }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState({ isAdmin: false });
  const [isDark, setIsDark] = useState(false);

  // Filter videos based on search query (memoized for performance)
  const filteredVideos = useMemo(() => {
    const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(sanitizedQuery) ||
        video.description.toLowerCase().includes(sanitizedQuery)
    );
  }, [videos, searchQuery]);

  // Initialize theme on component mount
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Load videos
  useEffect(() => {
    loadVideos();
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const loadVideos = async () => {
    setLoading(true);
    const fetchedVideos = await fetchVideos();
    setVideos(fetchedVideos);
    setLoading(false);
  };

  const handleVideoView = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleVideoEdit = (video) => {
    setEditingVideo(video);
    setIsAdminFormOpen(true);
  };

  const handleVideoDelete = async (id) => {
    if (confirm("Are you sure you want to delete this video?")) {
      const success = await deleteVideo(id);
      if (success) {
        setVideos(videos.filter((v) => v._id !== id));
      }
    }
  };

  const handleVideoSave = async (videoData) => {
    if (editingVideo) {
      // Update existing video
      const updatedVideo = await updateVideo(editingVideo._id, videoData);
      if (updatedVideo) {
        setVideos(
          videos.map((v) => (v._id === editingVideo._id ? updatedVideo : v))
        );
      }
    } else {
      // Add new video
      const newVideo = await createVideo(videoData);
      if (newVideo) {
        setVideos([newVideo, ...videos]);
      }
    }

    setEditingVideo(undefined);
  };

  const [loginError, setLoginError] = useState("");

  const handleLogin = async (password) => {
    try {
      // In production, this should be a secure API call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: sanitizeInput(password) }),
      });

      if (response.ok) {
        setUser({ isAdmin: true });
        setIsLoginOpen(false);
        setLoginError("");
      } else {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch {
      setLoginError("Login failed. Please check your connection.");
    }
  };

  const handleLogout = () => {
    setUser({ isAdmin: false });
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors ${className}`}
    >
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Maleka anwar voice
              </h1>

              {/* Search Bar */}
              <div className="hidden md:flex items-center relative">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Admin Controls */}
              {user.isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingVideo(undefined);
                      setIsAdminFormOpen(true);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Video</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading videos...
            </p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-4">
              <MessageCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {searchQuery ? "No videos found" : "No videos yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery
                ? "Try adjusting your search terms"
                : user.isAdmin
                ? "Add your first video to get started"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredVideos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onEdit={user.isAdmin ? handleVideoEdit : undefined}
                onDelete={user.isAdmin ? handleVideoDelete : undefined}
                onView={handleVideoView}
                isAdmin={user.isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <VideoModal
        video={selectedVideo}
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedVideo(null);
        }}
      />

      <AdminForm
        video={editingVideo}
        isOpen={isAdminFormOpen}
        onClose={() => {
          setIsAdminFormOpen(false);
          setEditingVideo(undefined);
        }}
        onSave={handleVideoSave}
      />

      <LoginForm
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginError("");
        }}
        onLogin={handleLogin}
        loginError={loginError}
      />
    </div>
  );
};

export default YouTubeBlog;