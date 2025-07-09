# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SchoolMatch Module Overview

This is a **Next.js school matching system** (院校匹配系统) - a sophisticated educational consulting tool that provides AI-powered university recommendations based on student profiles and requirements.

## Architecture & Flow

### Core Workflow (5-Step Process)
The application follows a sequential step-based workflow with state preservation:

1. **School Matching** (`SchoolMatching.tsx`) - Basic student information collection and initial matching
2. **Major Requirement Matching** (`MajorRequirementMatching.tsx`) - Subject-specific requirements analysis  
3. **Major Background Matching** (`MajorBackgroundMatching.tsx`) - Academic background evaluation
4. **Generate Report** (`GenerateReport.tsx`) - Comprehensive recommendation report generation
5. **Case Calibration** (`CaseCalibration.tsx`) - Final optimization and calibration

### Key Components Architecture

#### Main Page Component (`page.tsx`)
- **Permission-based access control** with `schoolmatch.*` permissions
- **Step navigation management** with completion tracking
- **Component preservation pattern** - uses CSS hide/show instead of mount/unmount to maintain state
- **Role-based authentication** via `useAuth` provider

#### Core Components (`components/`)

**SchoolMatching.tsx** - Main matching component:
- **Pure React state management** (no external state libraries)
- **SSE (Server-Sent Events) support** for real-time AI responses
- **Complex JSON parsing logic** for extracting `matched_schools` data from AI responses
- **Grade conversion utilities** between different grading systems (百分制, 五分制, 四分制)
- **Form validation** with required field checking

**StepNavigation.tsx** - Navigation component:
- **Ant Design Steps integration** with custom black/white theme
- **Responsive design** - full navigation on desktop, simplified on mobile
- **Progress tracking** with completion states and clickable navigation

**SchoolMatchingResult.tsx** - Results display:
- **Dual display modes**: Table view for structured data, Markdown view for AI responses
- **ReactMarkdown integration** with custom styling components
- **User input echo/summary** for query confirmation

**SchoolMatchingTable.tsx** - Structured data display:
- Displays `matched_schools` array in tabular format
- School categorization (冲刺, 主申, 保底)
- QS ranking and admission requirements

#### API Integration (`lib/api.ts`)

**Sophisticated SSE Handling**:
- **Real-time streaming responses** from backend AI services
- **Multi-format response parsing** (JSON, markdown, SSE events)
- **Progress tracking** with user feedback
- **Error handling** with detailed logging
- **Buffer management** for incomplete data chunks
- **Response accumulation** for fragmented AI outputs

#### Backend API Route (`api/school-match/route.ts`)

**Authentication & Authorization**:
- **API permission validation** via `validateApiPermissions`
- **Role-based access control** (`admin`, `schoolmatch.*` permissions)

**Request Processing**:
- **Structured message building** from form data
- **Grade system conversion** and formatting
- **Environment variable configuration** for backend API endpoints
- **SSE passthrough** - direct streaming from backend to frontend

**Response Handling**:
- **Content-type detection** (SSE vs JSON)
- **Error logging** with development/production modes
- **Response transformation** and validation

## Development Patterns

### State Management Strategy
- **Component-level state** using React hooks (no Redux/Zustand in this module)
- **State preservation** via CSS visibility instead of component mounting/unmounting
- **Form state isolation** per step with validation

### API Communication Patterns
- **SSE-first approach** for AI responses with JSON fallback
- **Progressive enhancement** - handles both streaming and traditional responses
- **Comprehensive error handling** with user-friendly messages
- **Real-time progress updates** during AI processing

### Permission & Security
- **Granular permission checking** with wildcard pattern matching
- **JWT-based authentication** via session validation
- **API route protection** with detailed error responses
- **Development vs production logging** strategies

### UI/UX Patterns
- **Progressive disclosure** - step-by-step information gathering
- **Responsive design** with mobile-first navigation
- **Real-time feedback** during AI processing
- **Accessibility considerations** with proper ARIA labels

## Key Configuration

### Environment Variables
- `BACKEND_API_URL` or `NEXT_PUBLIC_BACKEND_API_URL` - Backend service endpoint
- `NODE_ENV` - Controls logging verbosity and debug output

### Dependencies
- **Ant Design** - Steps component with custom theming
- **ReactMarkdown** - AI response rendering with custom components
- **Tailwind CSS** - Utility-first styling approach
- **Lucide React** - Icon system

### Permission System
- **Required permissions**: `schoolmatch.*` or admin role
- **Wildcard matching**: `schoolmatch.*` grants access to all schoolmatch features
- **Fallback handling**: Graceful degradation for unauthorized users

## Development Guidelines

### When Working with This Module

1. **State Management**: Preserve existing state management patterns - avoid introducing external state libraries
2. **SSE Handling**: Maintain backward compatibility with both SSE and JSON responses
3. **Permission Checks**: Always validate permissions before API access
4. **Error Handling**: Follow existing error logging patterns (development vs production)
5. **Component Structure**: Keep step-based components isolated but state-preserved
6. **API Integration**: Maintain SSE streaming capabilities for real-time AI responses

### Common Tasks

**Adding New Steps**: 
- Add step definition to `StepNavigation.tsx` steps array
- Create new component in `components/` directory
- Update `page.tsx` renderAllSteps function
- Ensure proper state preservation patterns

**Modifying AI Integration**:
- Update request format in `api/school-match/route.ts`
- Adjust response parsing in `lib/api.ts` SSE handlers
- Test both streaming and JSON response modes

**Permission Changes**:
- Update permission checks in `page.tsx` and API routes
- Test with different user roles and permission combinations
- Ensure graceful fallback for unauthorized access

### Testing Considerations
- **SSE Stream Testing**: Verify both complete and partial stream responses
- **Permission Testing**: Test all permission combinations and edge cases
- **State Preservation**: Ensure navigation doesn't lose user input
- **Error Scenarios**: Test network failures, timeout conditions, and malformed responses