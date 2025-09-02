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
  Video,
  Calendar,
  Eye,
  Sparkles,
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
const VideoCard = ({
  video,
  onEdit,
  onDelete,
  onView,
  isAdmin = false,
  viewMode = "grid",
}) => {
  if (viewMode === "list") {
    return (
      <div className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-video sm:aspect-square sm:w-48 lg:w-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex-shrink-0">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 224px"
            />
            <button
              onClick={() => onView?.(video)}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <Play
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5"
                  fill="currentColor"
                />
              </div>
            </button>
            {isAdmin && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit?.(video)}
                    className="p-1.5 glass rounded-md hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-200"
                  >
                    <Edit className="w-3 h-3 text-white drop-shadow-lg" />
                  </button>
                  <button
                    onClick={() => onDelete?.(video._id)}
                    className="p-1.5 glass rounded-md hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 className="w-3 h-3 text-red-400 drop-shadow-lg" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 sm:mb-3 text-lg sm:text-xl leading-tight">
              {video.title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
              {video.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <button
                onClick={() => onView?.(video)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Watch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={() => onView?.(video)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play
              className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1"
              fill="currentColor"
            />
          </div>
        </button>
        {isAdmin && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => onEdit?.(video)}
                className="p-1.5 sm:p-2 glass rounded-md sm:rounded-lg hover:bg-white/20 dark:hover:bg-slate-800/20 transition-all duration-200 backdrop-blur-sm"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-lg" />
              </button>
              <button
                onClick={() => onDelete?.(video._id)}
                className="p-1.5 sm:p-2 glass rounded-md sm:rounded-lg hover:bg-red-500/20 transition-all duration-200 backdrop-blur-sm"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 drop-shadow-lg" />
              </button>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1 sm:gap-2 text-white text-xs sm:text-sm font-medium drop-shadow-lg">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Watch Now</span>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-5">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 sm:mb-3 text-base sm:text-lg leading-tight">
          {video.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
          {video.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-500 dark:text-slate-500">
            <Calendar className="w-3 h-3" />
            <span className="truncate">{formatDate(video.createdAt)}</span>
          </div>
          <button
            onClick={() => onView?.(video)}
            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
          >
            Watch
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-scale-in">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {video.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="aspect-video bg-black flex-shrink-0">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-y-auto">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base lg:text-lg">
            {video.description}
          </p>
          <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Published on {formatDate(video.createdAt)}</span>
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
      title: formData.title,
      description: formData.description,
      url: formData.url,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
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
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
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
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
          </div>
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              {video ? "Update" : "Add"} Video
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 text-center">
            Admin Login
          </h2>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
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
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
              >
                Login
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
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
const YouTubeBlog = () => {
  const className = "";
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
    const sanitizedQuery = searchQuery.toLowerCase();
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
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500 ${className}`}
    >
      {/* Header */}
      <header className="glass sticky top-0 z-40 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div> */}
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
                Maleka Anwar Voice
              </h1>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex items-center relative flex-1 max-w-md mx-8">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300/50 dark:border-slate-600/50 rounded-xl bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm shadow-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* View Toggle - Hidden on mobile */}
              <div className="hidden md:flex items-center bg-white/80 dark:bg-slate-700/80 rounded-lg p-1 shadow-sm backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-3 bg-white/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg sm:rounded-xl transition-all duration-200 shadow-sm backdrop-blur-sm"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-2 py-1 sm:px-3 sm:py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                >
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Search & View Toggle */}
          <div className="lg:hidden pb-3 sm:pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300/50 dark:border-slate-600/50 rounded-lg bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm shadow-sm text-sm"
              />
            </div>
            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center justify-center">
              <div className="flex items-center bg-white/80 dark:bg-slate-700/80 rounded-lg p-1 shadow-sm backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {loading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 dark:border-blue-800 mx-auto"></div>
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-transparent border-t-blue-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <p className="mt-4 sm:mt-6 text-slate-600 dark:text-slate-400 text-base sm:text-lg">
              Loading videos...
            </p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-3">
              {searchQuery ? "No videos found" : "No videos yet"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-sm sm:max-w-md mx-auto px-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : user.isAdmin
                ? "Add your first video to get started"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <>
            {/* Results Count - Mobile */}
            <div className="mb-4 sm:mb-6 text-sm text-slate-600 dark:text-slate-400">
              {searchQuery && (
                <p>
                  {filteredVideos.length} video
                  {filteredVideos.length !== 1 ? "s" : ""} found
                  {searchQuery && ` for "${searchQuery}"`}
                </p>
              )}
            </div>

            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8"
                  : "space-y-4 sm:space-y-6"
              }
            >
              {filteredVideos.map((video, index) => (
                <div
                  key={video._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <VideoCard
                    video={video}
                    onEdit={user.isAdmin ? handleVideoEdit : undefined}
                    onDelete={user.isAdmin ? handleVideoDelete : undefined}
                    onView={handleVideoView}
                    isAdmin={user.isAdmin}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © 2024 Maleka Anwar Voice •
              <a
                href="https://www.youtube.com/@Maleka-jn5bf/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors ml-1"
              >
                YouTube Channel
              </a>
            </p>
          </div>
        </div>
      </footer>

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
