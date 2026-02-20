import React, { useEffect, useState, useMemo, useRef } from 'react';
import { getIssues, getIssueById, getProjects } from './api/redmine';
import type { RedmineProject } from './types';
import { groupTickets, getPartLabel, type GroupedTicket } from './utils';
import { TicketRow } from './components/TicketRow';
import { TicketHeader } from './components/TicketHeader';
import { GanttGrid } from './components/GanttGrid';
import { Sidebar } from './components/Sidebar';
import { ProjectFilter } from './components/ProjectFilter';
import { ColumnSelector } from './components/ColumnSelector';
import { PartSelector, type PartFilterState } from './components/PartSelector';
import { Loader2, Search, User } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<RedmineProject[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  // Removed groupedTickets state - derived via useMemo
  const [rawGroupedTickets, setRawGroupedTickets] = useState<GroupedTicket[]>([]);
  const [searchTicket, setSearchTicket] = useState("");
  const [searchAssignee, setSearchAssignee] = useState("");
  const [hoveredTicketId, setHoveredTicketId] = useState<number | null>(null);

  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  // Sync Scroll Refs
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Filter state
  const [filters, setFilters] = useState({
    pic: false,
    deadline: false,
    period: false
  });

  const [partFilters, setPartFilters] = useState<PartFilterState>({
    be: true,
    fe: true,
    plan: true,
    design: true,
    qa: true,
  });

  const handleScroll = (source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrolling.current) return;
    isScrolling.current = true;

    const target = source === 'left' ? rightPanelRef.current : leftPanelRef.current;
    if (target) {
      target.scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
    }

    requestAnimationFrame(() => { isScrolling.current = false; });
  };

  // 1. Fetch Projects on Mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const list = await getProjects();
        setProjects(list);
        if (list.length > 0) {
          const defaultProj = list.find(p => p.name.includes("농협")) || list[0];
          setSelectedProjectIds([defaultProj.id]);
        }
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
    loadProjects();
  }, []);

  // 2. Fetch Issues when Project Changes
  useEffect(() => {
    if (selectedProjectIds.length === 0) {
      setRawGroupedTickets([]);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        // Fetch issues for ALL selected projects
        const promises = selectedProjectIds.map(id => getIssues(id, 100));
        const results = await Promise.all(promises);
        const issues = results.flat();

        const featureIds = new Set(issues.map(i => i.id));
        const neededParentIds = new Set<number>();

        issues.forEach(issue => {
          if (issue.parent) {
            if (!featureIds.has(issue.parent.id)) {
              neededParentIds.add(issue.parent.id);
            }
          }
        });

        if (neededParentIds.size > 0) {
          const parentPromises = Array.from(neededParentIds).map(id => getIssueById(id));
          const parents = await Promise.all(parentPromises);
          issues.push(...parents);
        }

        const grouped = groupTickets(issues);
        setRawGroupedTickets(grouped); // Store the raw grouped tickets
      } catch (error) {
        console.error("Failed to fetch issues", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedProjectIds]);

  // 3. Apply Filters via useMemo (Instant)
  const groupedTickets = useMemo(() => {
    if (rawGroupedTickets.length === 0) {
      return [];
    }

    const ticketQuery = searchTicket.toLowerCase().trim();
    const assigneeQuery = searchAssignee.toLowerCase().trim();

    return rawGroupedTickets.map(group => {
      // 1. Check if the feature itself matches search criteria
      const featureMatchesTicket = !ticketQuery ||
        group.feature.id.toString().includes(ticketQuery) ||
        group.feature.subject.toLowerCase().includes(ticketQuery);

      const featureMatchesAssignee = !assigneeQuery ||
        (group.feature.assigned_to?.name.toLowerCase().includes(assigneeQuery) || false);

      const parentMatchesSearch = featureMatchesTicket && featureMatchesAssignee;

      // 2. Filter parts by partFilters and search criteria
      const filteredParts = group.parts.filter(part => {
        // Part Filter (BE, FE, etc.) - Always applies
        const label = getPartLabel(part);
        const matchesPartType =
          (label === 'BE' && partFilters.be) ||
          (label === 'FE' && partFilters.fe) ||
          (label === 'Plan' && partFilters.plan) ||
          (label === 'Design' && partFilters.design) ||
          (label === 'QA' && partFilters.qa) ||
          (!['BE', 'FE', 'Plan', 'Design', 'QA'].includes(label));

        if (!matchesPartType) return false;

        // If parent matches the search query, all its parts are considered relevant to the ticket search
        const matchesTicket = parentMatchesSearch || !ticketQuery ||
          part.id.toString().includes(ticketQuery) ||
          part.subject.toLowerCase().includes(ticketQuery);

        const matchesAssignee = !assigneeQuery ||
          (part.assigned_to?.name.toLowerCase().includes(assigneeQuery) || false);

        return matchesTicket && matchesAssignee;
      });

      // A group is kept if:
      // - The feature matches both ticket and assignee queries
      // - OR any of its parts (after partType filtering) match both ticket and assignee queries
      if (parentMatchesSearch || filteredParts.length > 0) {
        return {
          ...group,
          parts: filteredParts
        };
      }
      return null;
    }).filter((g): g is GroupedTicket => g !== null);
  }, [rawGroupedTickets, partFilters, searchTicket, searchAssignee]);


  // Resize Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      // Sidebar width is 256px (fixed in Sidebar.tsx)
      const sidebarWidth = 256;
      const newWidth = e.clientX - sidebarWidth;

      // Constraints: Min 300px, Max 50% of screen width
      const maxWidth = window.innerWidth / 2;
      if (newWidth >= 300 && newWidth <= maxWidth) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex bg-white font-sans text-gray-900 overflow-hidden">
      {/* Sidebar (Left) */}
      <Sidebar
        projects={projects}
        selectedIds={selectedProjectIds}
        onSelect={setSelectedProjectIds}
      />

      {/* Main Content (Right) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Vertical Layout - Extreme Compact */}
        <div className="h-[60px] px-6 py-1 border-b border-gray-200 bg-white shadow-sm z-50 flex flex-col justify-start flex-shrink-0 gap-0">

          {/* Row 1: Part Filters & Searches Grouped on the Right */}
          <div className="flex items-center justify-between w-full h-[28px]">
            {/* Left: Part Filters */}
            <div className="flex items-center">
              <PartSelector filters={partFilters} onChange={setPartFilters} />
            </div>

            {/* Right: Searches & Project Filter Grouped */}
            <div className="flex items-center gap-2 h-[28px]">
              {/* Ticket Search */}
              <div className="relative w-[180px] h-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-300 text-gray-900 text-[13px] rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-[28px]"
                  placeholder="Ticket or Subject..."
                  value={searchTicket}
                  onChange={(e) => setSearchTicket(e.target.value)}
                />
              </div>

              {/* Assignee Search */}
              <div className="relative w-[150px] h-full">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1 bg-gray-50 border border-gray-300 text-gray-900 text-[13px] rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none h-full"
                  placeholder="담당자..."
                  value={searchAssignee}
                  onChange={(e) => setSearchAssignee(e.target.value)}
                />
              </div>

              {/* Project Search */}
              <div className="w-[180px] h-full">
                <ProjectFilter
                  projects={projects}
                  selectedIds={selectedProjectIds}
                  onSelect={setSelectedProjectIds}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Column Selector */}
          <div className="flex items-center gap-4 mt-0">
            <ColumnSelector filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Dashboard Workspace - Split View */}
        <div className={`flex-1 overflow-hidden relative mt-[60px] ${isResizing ? 'cursor-col-resize select-none' : ''} `}>
          {selectedProjectIds.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center text-gray-400">
              Select a project to view dashboard.
            </div>
          ) : loading ? (
            <div className="w-full h-full flex justify-center items-center text-gray-400">
              <Loader2 className="animate-spin mr-2" /> Loading data...
            </div>
          ) : groupedTickets.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center text-gray-500">No tickets found for this project.</div>
          ) : (
            <div className="w-full h-full flex overflow-hidden bg-white">
              {/* Left Panel: Ticket List (Independently Scrollable) */}
              <div
                ref={leftPanelRef}
                onScroll={handleScroll('left')}
                className="flex-shrink-0 bg-white overflow-y-auto overflow-x-hidden custom-scrollbar z-30 pb-4"
                style={{ width: `${leftPanelWidth}px` }}
              >
                <div className="sticky top-0 z-40 bg-white">
                  <TicketHeader
                    showPic={filters.pic}
                    showDeadline={filters.deadline}
                    showPeriod={filters.period}
                  />
                </div>
                {(() => {
                  let maxHours = 5;
                  groupedTickets.forEach(group => {
                    const featureEst = group.feature.estimated_hours || 0;
                    const featureSpent = group.feature.spent_hours || 0;
                    maxHours = Math.max(maxHours, featureEst, featureSpent);
                    group.parts.forEach(part => {
                      maxHours = Math.max(maxHours, part.estimated_hours || 0, part.spent_hours || 0);
                    });
                  });

                  return groupedTickets.map((group) => (
                    <React.Fragment key={group.feature.id}>
                      <TicketRow
                        issue={group.feature}
                        isFeature
                        maxHours={maxHours}
                        showPic={filters.pic}
                        showDeadline={filters.deadline}
                        showPeriod={filters.period}
                        isHovered={hoveredTicketId === group.feature.id}
                        onHover={setHoveredTicketId}
                      />
                      {group.parts.map(part => (
                        <TicketRow
                          key={part.id}
                          issue={part}
                          isCompact
                          maxHours={maxHours}
                          showPic={filters.pic}
                          showDeadline={filters.deadline}
                          showPeriod={filters.period}
                          isHovered={hoveredTicketId === part.id}
                          onHover={setHoveredTicketId}
                        />
                      ))}
                    </React.Fragment>
                  ));
                })()}
              </div>

              {/* Vertical Splitter */}
              <div
                className="w-0 z-40 relative flex-shrink-0 cursor-col-resize"
                onMouseDown={() => setIsResizing(true)}
              >
                <div className="absolute inset-y-0 -left-1 -right-1" /> {/* Invisible hit area */}
              </div>

              {/* Right Panel: Gantt Grid (Independently Scrollable) */}
              <div className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
                <GanttGrid
                  groupedTickets={groupedTickets}
                  containerRef={rightPanelRef}
                  onScroll={handleScroll('right')}
                  hoveredTicketId={hoveredTicketId}
                  onHover={setHoveredTicketId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
