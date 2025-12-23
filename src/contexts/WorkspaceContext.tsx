/**
 * Workspace Context
 * 
 * Manages organization/workspace selection for B2B multi-tenant model.
 * Handles workspace resolution, switching, and context persistence.
 * 
 * @module contexts/WorkspaceContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useUser, useOrganization, useOrganizationList } from '@clerk/clerk-react';
import { UserRole, ViewContext } from '../config/navigation';

// ========================================
// TYPES
// ========================================

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  imageUrl?: string | null;
  role: UserRole;
}

export interface WorkspaceContextType {
  // Workspace state
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  isResolved: boolean;
  needsWorkspaceSelection: boolean;
  
  // View context (employee vs recruiter)
  viewContext: ViewContext;
  setViewContext: (context: ViewContext) => void;
  
  // User role in current workspace
  userRole: UserRole;
  
  // Actions
  selectWorkspace: (workspaceId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Storage key for persisted workspace
const WORKSPACE_STORAGE_KEY = 'voxly_current_workspace';
const VIEW_CONTEXT_STORAGE_KEY = 'voxly_view_context';

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Map Clerk organization role to app UserRole
 */
function mapClerkRoleToUserRole(clerkRole?: string): UserRole {
  switch (clerkRole?.toLowerCase()) {
    case 'admin':
    case 'org:admin':
      return 'admin';
    case 'recruiter':
    case 'org:recruiter':
      return 'recruiter';
    case 'manager':
    case 'org:manager':
      return 'manager';
    case 'employee':
    case 'org:employee':
      return 'employee';
    case 'candidate':
    case 'org:candidate':
      return 'candidate';
    default:
      // Default to candidate for individual users without org
      return 'candidate';
  }
}

/**
 * Get persisted workspace ID from storage
 */
function getPersistedWorkspaceId(): string | null {
  try {
    return localStorage.getItem(WORKSPACE_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Persist workspace ID to storage
 */
function persistWorkspaceId(workspaceId: string): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceId);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get persisted view context from storage
 */
function getPersistedViewContext(): ViewContext {
  try {
    const stored = localStorage.getItem(VIEW_CONTEXT_STORAGE_KEY);
    // Support both old and new view context values
    if (stored === 'b2c' || stored === 'b2b' || stored === 'hr') {
      return stored;
    }
    // Migrate old values
    if (stored === 'candidate') return 'b2c';
    if (stored === 'recruiter') return 'b2b';
    if (stored === 'employee') return 'hr';
  } catch {
    // Ignore
  }
  return 'b2c'; // Default view context (personal interview practice)
}

/**
 * Persist view context to storage
 */
function persistViewContext(context: ViewContext): void {
  try {
    localStorage.setItem(VIEW_CONTEXT_STORAGE_KEY, context);
  } catch {
    // Ignore storage errors
  }
}

// ========================================
// PROVIDER
// ========================================

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { organization: activeOrg, isLoaded: isOrgLoaded } = useOrganization();
  const { 
    userMemberships, 
    isLoaded: isMembershipsLoaded,
    setActive 
  } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // State
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolved, setIsResolved] = useState(false);
  const [viewContext, setViewContextState] = useState<ViewContext>(getPersistedViewContext);

  // Compute user role from workspace or user metadata
  const userRole: UserRole = React.useMemo(() => {
    // If in an organization, use the org role
    if (currentWorkspace) {
      return currentWorkspace.role;
    }
    
    // Otherwise, check user's public metadata
    const metadataRole = user?.publicMetadata?.role as string | undefined;
    if (metadataRole) {
      return mapClerkRoleToUserRole(metadataRole);
    }
    
    // Default to candidate
    return 'candidate';
  }, [currentWorkspace, user?.publicMetadata?.role]);

  // Check if user needs to select a workspace
  const needsWorkspaceSelection = React.useMemo(() => {
    if (!isSignedIn) return false;
    if (!isResolved) return false;
    // User has multiple orgs but none selected
    return workspaces.length > 1 && !currentWorkspace;
  }, [isSignedIn, isResolved, workspaces.length, currentWorkspace]);

  // Handle view context changes
  const setViewContext = useCallback((context: ViewContext) => {
    setViewContextState(context);
    persistViewContext(context);
  }, []);

  // Build workspaces list from Clerk memberships
  const refreshWorkspaces = useCallback(async () => {
    if (!isMembershipsLoaded || !isSignedIn) {
      setWorkspaces([]);
      return;
    }

    const memberships = userMemberships?.data || [];
    
    const workspaceList: Workspace[] = memberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug || undefined,
      imageUrl: membership.organization.imageUrl,
      role: mapClerkRoleToUserRole(membership.role),
    }));

    setWorkspaces(workspaceList);
  }, [isMembershipsLoaded, isSignedIn, userMemberships?.data]);

  // Select a workspace
  const selectWorkspace = useCallback(async (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return;
    }

    try {
      // Set active organization in Clerk
      if (setActive) {
        await setActive({ organization: workspaceId });
      }
      
      setCurrentWorkspace(workspace);
      persistWorkspaceId(workspaceId);
    } catch (error) {
      console.error('Failed to select workspace:', error);
    }
  }, [workspaces, setActive]);

  // Resolve workspace on load
  useEffect(() => {
    const resolveWorkspace = async () => {
      // Wait for all data to load
      if (!isUserLoaded || !isOrgLoaded || !isMembershipsLoaded) {
        return;
      }

      // Not signed in - no workspace to resolve
      if (!isSignedIn) {
        setIsLoading(false);
        setIsResolved(true);
        setCurrentWorkspace(null);
        return;
      }

      // Build workspace list
      await refreshWorkspaces();

      const memberships = userMemberships?.data || [];

      // Case 1: User has no org memberships - work as individual
      if (memberships.length === 0) {
        setCurrentWorkspace(null);
        setIsResolved(true);
        setIsLoading(false);
        return;
      }

      // Case 2: User has exactly one org - auto-select it
      if (memberships.length === 1) {
        const singleOrg = memberships[0];
        const workspace: Workspace = {
          id: singleOrg.organization.id,
          name: singleOrg.organization.name,
          slug: singleOrg.organization.slug || undefined,
          imageUrl: singleOrg.organization.imageUrl,
          role: mapClerkRoleToUserRole(singleOrg.role),
        };
        
        if (setActive) {
          await setActive({ organization: singleOrg.organization.id });
        }
        
        setCurrentWorkspace(workspace);
        persistWorkspaceId(workspace.id);
        setIsResolved(true);
        setIsLoading(false);
        return;
      }

      // Case 3: User has multiple orgs - check for persisted selection or active org
      const persistedId = getPersistedWorkspaceId();
      const matchingPersistedMembership = memberships.find(
        (m) => m.organization.id === persistedId
      );

      if (matchingPersistedMembership) {
        // Use persisted workspace
        const workspace: Workspace = {
          id: matchingPersistedMembership.organization.id,
          name: matchingPersistedMembership.organization.name,
          slug: matchingPersistedMembership.organization.slug || undefined,
          imageUrl: matchingPersistedMembership.organization.imageUrl,
          role: mapClerkRoleToUserRole(matchingPersistedMembership.role),
        };
        
        if (setActive) {
          await setActive({ organization: workspace.id });
        }
        
        setCurrentWorkspace(workspace);
        setIsResolved(true);
        setIsLoading(false);
        return;
      }

      // Check if there's already an active org
      if (activeOrg) {
        const activeMembership = memberships.find(
          (m) => m.organization.id === activeOrg.id
        );
        
        if (activeMembership) {
          const workspace: Workspace = {
            id: activeOrg.id,
            name: activeOrg.name,
            slug: activeOrg.slug || undefined,
            imageUrl: activeOrg.imageUrl,
            role: mapClerkRoleToUserRole(activeMembership.role),
          };
          
          setCurrentWorkspace(workspace);
          persistWorkspaceId(workspace.id);
          setIsResolved(true);
          setIsLoading(false);
          return;
        }
      }

      // No workspace auto-selected - user needs to choose
      setCurrentWorkspace(null);
      setIsResolved(true);
      setIsLoading(false);
    };

    resolveWorkspace();
  }, [
    isUserLoaded,
    isOrgLoaded,
    isMembershipsLoaded,
    isSignedIn,
    userMemberships?.data,
    activeOrg,
    setActive,
    refreshWorkspaces,
  ]);

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    isLoading,
    isResolved,
    needsWorkspaceSelection,
    viewContext,
    setViewContext,
    userRole,
    selectWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
}

export default WorkspaceContext;
