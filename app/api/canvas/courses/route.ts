import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';

export interface CanvasCourse {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  term?: string;
  enrollmentType?: string;
  grade?: string;
  color?: string;
}

const COURSE_COLORS = [
  'from-green-400 to-emerald-600',
  'from-orange-400 to-red-500',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-violet-600',
  'from-pink-400 to-rose-600',
  'from-cyan-400 to-teal-600',
  'from-yellow-400 to-amber-600',
  'from-red-400 to-pink-600',
];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    console.log('[Canvas API] GET request, session:', session ? 'EXISTS' : 'NULL');
    
    if (!session) {
      console.error('[Canvas API] No session found - user not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ id: session.userId });

    if (!user?.canvasToken || !user?.canvasDomain) {
      return NextResponse.json({ 
        error: 'Canvas not connected',
        courses: [],
        needsSetup: true
      });
    }

    const courses = await fetchCanvasCourses(user.canvasToken, user.canvasDomain);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Failed to get courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    console.log('[Canvas API] POST request, session:', session ? 'EXISTS' : 'NULL');
    
    if (!session) {
      console.error('[Canvas API] No session found - user not authenticated');
      return NextResponse.json({ error: 'Not authenticated. Please log in again.' }, { status: 401 });
    }

    const body = await request.json();
    let { canvasToken, canvasDomain } = body;
    
    console.log('[Canvas API] Received domain:', canvasDomain);
    console.log('[Canvas API] Token length:', canvasToken?.length || 0);
    console.log('[Canvas API] Token first 10 chars:', canvasToken?.substring(0, 10) || 'N/A');

    if (!canvasToken || !canvasDomain) {
      return NextResponse.json({ error: 'Canvas token and domain are required' }, { status: 400 });
    }

    // Clean the token (remove any whitespace, newlines, quotes, and check for encoding issues)
    canvasToken = canvasToken.trim().replace(/[\r\n\t"']/g, '');
    console.log('[Canvas API] Cleaned token length:', canvasToken.length);
    console.log('[Canvas API] Token character codes:', canvasToken.substring(0, 20).split('').map((c: string) => c.charCodeAt(0)).join(','));
    
    // Validate token format (Canvas tokens typically start with numbers and ~)
    if (!/^[\d~]/.test(canvasToken)) {
      console.warn('[Canvas API] Token format unusual - does not start with number or ~');
    }

    // Clean the domain (remove https://, trailing slashes, www)
    let cleanDomain = canvasDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    console.log('[Canvas API] Cleaned domain:', cleanDomain);

    // Validate the token by trying to fetch courses (more reliable than users/self endpoint)
    // Canvas supports multiple authentication methods - try them all
    try {
      console.log('[Canvas] Testing connection to:', cleanDomain);
      console.log('[Canvas] Token (first 10 chars):', canvasToken.substring(0, 10));
      console.log('[Canvas] Token (last 10 chars):', canvasToken.substring(canvasToken.length - 10));
      
      let testResp: Response | null = null;
      let authMethod = '';
      const testEndpoint = `/api/v1/courses?enrollment_state=active&per_page=1`;
      
      // Method 1: Bearer token (newer Canvas instances)
      testResp = await fetch(
        `https://${cleanDomain}${testEndpoint}`,
        { 
          headers: { 'Authorization': `Bearer ${canvasToken}` },
          signal: AbortSignal.timeout(10000)
        }
      );
      console.log('[Canvas] Method 1 (Bearer) - status:', testResp.status);
      authMethod = 'Bearer';
      
      // Method 2: Token without Bearer prefix (some Canvas instances)
      if (!testResp.ok && (testResp.status === 401 || testResp.status === 403)) {
        console.log('[Canvas] Bearer failed, trying token without prefix...');
        testResp = await fetch(
          `https://${cleanDomain}${testEndpoint}`,
          { 
            headers: { 'Authorization': canvasToken },
            signal: AbortSignal.timeout(10000)
          }
        );
        console.log('[Canvas] Method 2 (Token only) - status:', testResp.status);
        if (testResp.ok) authMethod = 'Token only';
      }
      
      // Method 3: Query parameter (older Canvas instances)
      if (!testResp.ok && (testResp.status === 401 || testResp.status === 403)) {
        console.log('[Canvas] Token header failed, trying query parameter...');
        const urlWithToken = `https://${cleanDomain}${testEndpoint}${testEndpoint.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(canvasToken)}`;
        testResp = await fetch(
          urlWithToken,
          { 
            signal: AbortSignal.timeout(10000)
          }
        );
        console.log('[Canvas] Method 3 (Query param) - status:', testResp.status);
        if (testResp.ok) authMethod = 'Query parameter';
      }
      
      if (!testResp) {
        throw new Error('Failed to make test request');
      }

      console.log('[Canvas] Final response status:', testResp.status);
      console.log('[Canvas] Successful auth method:', authMethod);
      console.log('[Canvas] Response headers:', Object.fromEntries(testResp.headers.entries()));

      // If we get 200 or 200 with empty array, auth is working
      if (testResp.ok) {
        const testData = await testResp.json();
        console.log('[Canvas] Token validation successful!');
        console.log('[Canvas] Using auth method:', authMethod);
        // Don't need to log user data since we're just validating the token works
      } else {
        const errorText = await testResp.text();
        console.error('[Canvas] All auth methods failed');
        console.error('[Canvas] Final error response:', errorText);
        console.error('[Canvas] Response status:', testResp.status);
        console.error('[Canvas] Response status text:', testResp.statusText);
        
        // Parse the error for a more helpful message
        let errorMessage = `Canvas returned status ${testResp.status}`;
        let errorDetails: any = {};
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors[0]?.message) {
            errorMessage = errorJson.errors[0].message;
            errorDetails = errorJson.errors[0];
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
            errorDetails = errorJson;
          }
        } catch (e) {
          // Use raw error text if not JSON
          if (errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        
        // Check if token format looks valid (Canvas tokens usually start with numbers and ~)
        const tokenFormatValid = /^[\d~]/.test(canvasToken);
        
        return NextResponse.json({ 
          error: `Canvas connection failed: ${errorMessage}. Please verify your token is correct and not expired.`,
          details: {
            status: testResp.status,
            statusText: testResp.statusText,
            domain: cleanDomain,
            tokenLength: canvasToken.length,
            tokenPrefix: canvasToken.substring(0, 5),
            tokenSuffix: canvasToken.substring(canvasToken.length - 5),
            tokenFormatValid,
            methodsTried: ['Bearer', 'Token only', 'Query parameter'],
            canvasError: errorDetails
          }
        }, { status: 400 });
      }
    } catch (e: any) {
      console.error('[Canvas] Connection error:', e);
      return NextResponse.json({ 
        error: `Could not connect to Canvas: ${e.message}. Check your domain.`,
        details: {
          domain: cleanDomain,
          errorType: e.name
        }
      }, { status: 400 });
    }

    // Store the credentials with cleaned domain
    const db = await getDb();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
      { id: session.userId },
      { $set: { canvasToken, canvasDomain: cleanDomain, canvasConnectedAt: Date.now() } }
    );

    // Fetch courses
    const courses = await fetchCanvasCourses(canvasToken, cleanDomain);

    return NextResponse.json({ 
      success: true,
      courses
    });
  } catch (error) {
    console.error('Connect Canvas error:', error);
    return NextResponse.json({ error: 'Failed to connect Canvas' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Clear Canvas credentials
    const db = await getDb();
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
      { id: session.userId },
      { $unset: { canvasToken: '', canvasDomain: '', canvasConnectedAt: '' } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disconnect Canvas error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Canvas' }, { status: 500 });
  }
}

// Helper function to make Canvas API requests with fallback authentication
async function canvasApiRequest(url: string, token: string): Promise<Response> {
  // Method 1: Try Bearer token first
  let resp = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // Method 2: If Bearer fails, try token without prefix
  if (!resp.ok && resp.status === 401) {
    resp = await fetch(url, {
      headers: { 'Authorization': token }
    });
  }

  // Method 3: If header methods fail, try query parameter
  if (!resp.ok && resp.status === 401) {
    const urlObj = new URL(url);
    urlObj.searchParams.set('access_token', token);
    resp = await fetch(urlObj.toString());
  }

  return resp;
}

async function fetchCanvasCourses(token: string, domain: string): Promise<CanvasCourse[]> {
  const courses: CanvasCourse[] = [];

  try {
    // Fetch active courses with enrollments
    const coursesResp = await canvasApiRequest(
      `https://${domain}/api/v1/courses?enrollment_state=active&include[]=total_scores&include[]=current_grading_period_scores&include[]=term&per_page=20`,
      token
    );

    if (!coursesResp.ok) {
      throw new Error('Failed to fetch courses');
    }

    const canvasCourses = await coursesResp.json();

    if (!Array.isArray(canvasCourses)) {
      return [];
    }

    for (let i = 0; i < canvasCourses.length; i++) {
      const course = canvasCourses[i];
      
      // Try to get instructor name
      let instructor = 'TBD';
      try {
        const teachersResp = await canvasApiRequest(
          `https://${domain}/api/v1/courses/${course.id}/users?enrollment_type[]=teacher&per_page=1`,
          token
        );
        if (teachersResp.ok) {
          const teachers = await teachersResp.json();
          if (Array.isArray(teachers) && teachers.length > 0) {
            instructor = teachers[0].name || teachers[0].short_name || 'TBD';
          }
        }
      } catch (e) {
        // Ignore instructor fetch errors
      }

      // Get grade if available
      let grade = 'N/A';
      if (course.enrollments && course.enrollments.length > 0) {
        const enrollment = course.enrollments[0];
        if (enrollment.computed_current_score !== undefined) {
          const score = enrollment.computed_current_score;
          const letterGrade = enrollment.computed_current_grade || getLetterGrade(score);
          grade = `${Math.round(score)}% ${letterGrade}`;
        }
      }

      courses.push({
        id: course.id.toString(),
        name: course.name,
        code: course.course_code || course.name.substring(0, 10),
        instructor,
        term: course.term?.name || 'Current Term',
        enrollmentType: course.enrollments?.[0]?.type || 'student',
        grade,
        color: COURSE_COLORS[i % COURSE_COLORS.length]
      });
    }

    return courses;
  } catch (error) {
    console.error('Failed to fetch Canvas courses:', error);
    return [];
  }
}

function getLetterGrade(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

