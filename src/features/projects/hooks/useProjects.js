import { useState, useEffect, useCallback } from "react";
import { getAllProjects } from "../api";
import { showError } from "../../../utils/toast";
import { useDebounce } from "../../../hooks/useDebounce";

export const useProjects = (workspaceId) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  /** Extract URL from string / array / object */
  const getMediaUrl = (media) => {
    if (!media) return null;

    if (typeof media === "string") return media;
    if (Array.isArray(media)) return typeof media[0] === "string" ? media[0] : media[0]?.url;
    if (typeof media === "object" && media.url) return media.url;

    return null;
  };

  /** Convert API format → frontend card format */
  const transformProject = useCallback((project) => {
    const p = project.details || project; // merge details easily

    return {
      id: project.id,
      name: project.name || p.name || "Untitled",
      site_name: project.name || p.name || "Untitled",
      address: p.address || "",
      status: project.status || p.status || "pending",
      progress: p.progress ? Number(p.progress) : 0,
      profile_photo:
        getMediaUrl(project.profilePhoto) ||
        getMediaUrl(project.profile_photo) ||
        getMediaUrl(project.media?.profilePhoto) ||
        getMediaUrl(project.media?.profile_photo) ||
        getMediaUrl(p.profilePhoto) ||
        getMediaUrl(p.profile_photo) ||
        null,
      startDate: p.startDate || p.start_date || project.startDate || project.start_date,
      endDate: p.endDate || p.completion_date || p.end_date || project.endDate || project.completion_date || project.end_date,
      originalData: project,
    };
  }, []);

  /** Fetch API projects */
  const fetchProjects = useCallback(async () => {
    if (!workspaceId) {
      setProjects([]);
      setFilteredProjects([]);
      return;
    }

    try {
      setIsFetchingProjects(true);

      const res = await getAllProjects(workspaceId);
      const transformed = res.map(transformProject);

      setProjects(transformed);
      setFilteredProjects(transformed);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to fetch projects");
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setIsFetchingProjects(false);
    }
  }, [workspaceId, transformProject]);

  /** Searching + Filtering */
  useEffect(() => {
    setIsLoading(true);

    const s = debouncedSearch.toLowerCase();
    const status = statusFilter ? statusFilter.toLowerCase() : '';

    const results = projects.filter((p) => {
      // Status filter: match exact status or handle variations
      const projectStatus = (p.status || '').toLowerCase();
      let matchesStatus = true;

      if (status) {
        // Handle status variations
        if (status === 'in_progress' || status === 'in process') {
          matchesStatus = projectStatus === 'in_progress' || projectStatus === 'in process' || projectStatus === 'inprocess';
        } else if (status === 'completed') {
          matchesStatus = projectStatus === 'completed' || projectStatus === 'complete';
        } else if (status === 'upcoming') {
          matchesStatus = projectStatus === 'upcoming' || projectStatus === 'pending' || projectStatus === 'not_started';
        } else {
          matchesStatus = projectStatus === status;
        }
      }

      if (!matchesStatus) return false;

      // Search filter
      const target = `${p.name} ${p.address}`.toLowerCase();
      return target.includes(s);
    });

    setFilteredProjects(results);
    setIsLoading(false);
  }, [debouncedSearch, statusFilter, projects]);

  /** Initial fetch */
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    filteredProjects,
    isLoading,
    isFetchingProjects,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    refetch: fetchProjects,
  };
};

export default useProjects;
