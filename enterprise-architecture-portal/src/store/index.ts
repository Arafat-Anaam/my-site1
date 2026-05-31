import { create } from 'zustand';
import type { Diagram, DiagramCategory, UIScreen } from '@types';

interface DiagramStore {
  // State
  diagrams: Diagram[];
  selectedDiagram: Diagram | null;
  searchQuery: string;
  selectedCategories: DiagramCategory[];
  selectedTags: string[];
  viewMode: 'grid' | 'list';
  zoomLevel: number;
  sidebarOpen: boolean;
  filterPanelOpen: boolean;

  // Actions
  setDiagrams: (diagrams: Diagram[]) => void;
  selectDiagram: (diagram: Diagram) => void;
  clearSelected: () => void;
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: DiagramCategory) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setZoomLevel: (level: number) => void;
  setSidebarOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;

  // Computed
  filteredDiagrams: () => Diagram[];
  availableTags: () => string[];
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  // State
  diagrams: [],
  selectedDiagram: null,
  searchQuery: '',
  selectedCategories: [],
  selectedTags: [],
  viewMode: 'grid',
  zoomLevel: 1,
  sidebarOpen: true,
  filterPanelOpen: false,

  // Actions
  setDiagrams: (diagrams) => set({ diagrams }),
  
  selectDiagram: (diagram) => set({ selectedDiagram: diagram }),
  
  clearSelected: () => set({ selectedDiagram: null }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleCategory: (category) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category],
    })),
  
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  
  clearFilters: () =>
    set({
      searchQuery: '',
      selectedCategories: [],
      selectedTags: [],
    }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setZoomLevel: (level) => set({ zoomLevel: Math.max(0.5, Math.min(2, level)) }),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setFilterPanelOpen: (open) => set({ filterPanelOpen: open }),

  // Computed
  filteredDiagrams: () => {
    const { diagrams, searchQuery, selectedCategories, selectedTags } = get();
    
    return diagrams.filter((diagram) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        diagram.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diagram.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diagram.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Category filter
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(diagram.category);

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => diagram.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  },

  availableTags: () => {
    const { diagrams } = get();
    const tags = new Set<string>();
    diagrams.forEach((diagram) => {
      diagram.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  },
}));

// UI/Screen Store
interface UIScreenStore {
  screens: UIScreen[];
  selectedScreen: UIScreen | null;
  previewMode: 'wireframe' | 'mockup' | 'interactive';
  devicePreview: 'desktop' | 'tablet' | 'mobile';

  setScreens: (screens: UIScreen[]) => void;
  selectScreen: (screen: UIScreen) => void;
  setPreviewMode: (mode: 'wireframe' | 'mockup' | 'interactive') => void;
  setDevicePreview: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export const useUIScreenStore = create<UIScreenStore>((set) => ({
  screens: [],
  selectedScreen: null,
  previewMode: 'wireframe',
  devicePreview: 'desktop',

  setScreens: (screens) => set({ screens }),
  selectScreen: (screen) => set({ selectedScreen: screen }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setDevicePreview: (device) => set({ devicePreview: device }),
}));

// Navigation Store
interface NavigationStore {
  currentSection: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  theme: 'light' | 'dark';
  language: 'en' | 'ar';

  setSectionActive: (section: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentSection: 'home',
  breadcrumbs: [{ label: 'Home', href: '/' }],
  theme: 'light',
  language: 'en',

  setSectionActive: (section) => set({ currentSection: section }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
  
  setLanguage: (lang) => set({ language: lang }),
}));

// Analytics Store
interface AnalyticsStore {
  viewCount: Record<string, number>;
  searchHistory: string[];
  favoritesDiagrams: string[];
  lastViewed: string[];

  recordView: (diagramId: string) => void;
  addSearchHistory: (query: string) => void;
  toggleFavorite: (diagramId: string) => void;
  addToLastViewed: (diagramId: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  viewCount: {},
  searchHistory: [],
  favoritesDiagrams: [],
  lastViewed: [],

  recordView: (diagramId) =>
    set((state) => ({
      viewCount: {
        ...state.viewCount,
        [diagramId]: (state.viewCount[diagramId] || 0) + 1,
      },
    })),

  addSearchHistory: (query) =>
    set((state) => ({
      searchHistory: [
        query,
        ...state.searchHistory.filter((q) => q !== query),
      ].slice(0, 10),
    })),

  toggleFavorite: (diagramId) =>
    set((state) => ({
      favoritesDiagrams: state.favoritesDiagrams.includes(diagramId)
        ? state.favoritesDiagrams.filter((id) => id !== diagramId)
        : [...state.favoritesDiagrams, diagramId],
    })),

  addToLastViewed: (diagramId) =>
    set((state) => ({
      lastViewed: [
        diagramId,
        ...state.lastViewed.filter((id) => id !== diagramId),
      ].slice(0, 20),
    })),
}));
