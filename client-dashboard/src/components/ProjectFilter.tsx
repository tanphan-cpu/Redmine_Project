import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RedmineProject } from '../types';
import { Search, ChevronDown, Check } from 'lucide-react';

interface Props {
    projects: RedmineProject[];
    selectedIds: number[];
    onSelect: (ids: number[]) => void;
}

export const ProjectFilter: React.FC<Props> = ({ projects, selectedIds, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sort projects: selected projects first (by selection history), then unselected
    const sortedProjects = useMemo(() => {
        const selectedProjects = selectedIds
            .map(id => projects.find(p => p.id === id))
            .filter((p): p is RedmineProject => p !== undefined);
        
        const unselectedProjects = projects.filter(p => !selectedIds.includes(p.id));
        
        return [...selectedProjects, ...unselectedProjects];
    }, [projects, selectedIds]);

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Reset highlighted index when search term changes or dropdown opens
    useEffect(() => {
        setHighlightedIndex(0);
    }, [searchTerm, isOpen]);

    const toggleProject = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelect(selectedIds.filter(pid => pid !== id));
        } else {
            // Add new project to the beginning of the list (most recent)
            onSelect([id, ...selectedIds]);
        }
        // Clear search term after selection
        setSearchTerm("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // Generate display text for selected projects
    const getDisplayText = () => {
        if (selectedIds.length === 0) {
            return "";
        }
        
        // Get selected projects in order (most recent first)
        const selectedProjects = selectedIds
            .map(id => projects.find(p => p.id === id))
            .filter((p): p is RedmineProject => p !== undefined);
        
        if (selectedProjects.length === 1) {
            return selectedProjects[0].name;
        }
        
        // Multiple projects: show first one + "외 N개"
        const firstProject = selectedProjects[0].name;
        const othersCount = selectedProjects.length - 1;
        return `${firstProject} 외 ${othersCount}개`;
    };

    const displayText = getDisplayText();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true);
            }
            return;
        }

        if (filteredProjects.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredProjects.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                const highlightedProject = filteredProjects[highlightedIndex];
                if (highlightedProject) {
                    if (selectedIds.includes(highlightedProject.id)) {
                        onSelect(selectedIds.filter(pid => pid !== highlightedProject.id));
                    } else {
                        onSelect([highlightedProject.id, ...selectedIds]);
                    }
                    setSearchTerm("");
                    setIsOpen(false);
                }
                break;
            case 'Tab':
                // Tab to select first option
                if (filteredProjects.length > 0) {
                    const firstProject = filteredProjects[0];
                    if (firstProject && !selectedIds.includes(firstProject.id)) {
                        e.preventDefault();
                        onSelect([firstProject.id, ...selectedIds]);
                        setSearchTerm("");
                        setIsOpen(false);
                    }
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="relative h-[28px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full pl-8 pr-8 py-1 bg-gray-50 border border-gray-300 text-gray-900 text-[13px] rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:bg-white transition-colors outline-none h-full"
                    placeholder={selectedIds.length === 0 ? "Search Projects..." : ""}
                    value={searchTerm}
                    maxLength={100}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {/* Display selected projects text */}
                {selectedIds.length > 0 && searchTerm === "" && (
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 text-[13px] text-gray-900 truncate pointer-events-none">
                        {displayText}
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 max-h-72 overflow-y-auto custom-scrollbar">
                    {filteredProjects.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 bg-gray-50">No projects found.</div>
                    ) : (
                        <ul className="py-1">
                            {filteredProjects.map((project, index) => {
                                const isSelected = selectedIds.includes(project.id);
                                const isHighlighted = index === highlightedIndex;
                                return (
                                    <li
                                        key={project.id}
                                        onClick={() => toggleProject(project.id)}
                                        onMouseEnter={() => setHighlightedIndex(index)}
                                        className={`px-4 py-2.5 text-[13px] cursor-pointer flex items-center justify-between group ${
                                            isHighlighted 
                                                ? 'bg-blue-100' 
                                                : isSelected 
                                                    ? 'bg-blue-50/50' 
                                                    : 'hover:bg-blue-50'
                                        } ${isSelected ? 'text-gray-700' : 'text-gray-700'}`}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`truncate ${isSelected ? 'text-blue-700 font-medium' : ''}`}>{project.name}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
