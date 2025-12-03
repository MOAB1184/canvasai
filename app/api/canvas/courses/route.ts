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

    // Clean the token (remove any whitespace, newlines, quotes)
    canvasToken = canvasToken.trim().replace(/[\r\n\t"']/g, '');
    console.log('[Canvas API] Cleaned token length:', canvasToken.length);

    // Clean the domain (remove https://, trailing slashes, www)
    let cleanDomain = canvasDomain.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    console.log('[Canvas API] Cleaned domain:', cleanDomain);

    // Validate the token by making a test request
    try {
      console.log('[Canvas] Testing connection to:', cleanDomain);
      const authHeader = `Bearer ${canvasToken}`;
      console.log('[Canvas] Auth header length:', authHeader.length);
      
      const testResp = await fetch(
        `https://${cleanDomain}/api/v1/users/self`,
        { 
          headers: { 'Authorization': authHeader },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }
      );

      console.log('[Canvas] Test response status:', testResp.status);
      console.log('[Canvas] Test response headers:', Object.fromEntries(testResp.headers.entries()));

      if (!testResp.ok) {
        const errorText = await testResp.text();
        console.error('[Canvas] Test failed:', errorText);
        
        // Parse the error for a more helpful message
        let errorMessage = `Canvas returned status ${testResp.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && errorJson.errors[0]?.message) {
            errorMessage = errorJson.errors[0].message;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          // Use raw error text if not JSON
          if (errorText.length < 200) {
            errorMessage = errorText;
          }
        }
        
        return NextResponse.json({ 
          error: `Canvas connection failed: ${errorMessage}. Please verify your token is correct and not expired.`,
          details: {
            status: testResp.status,
            domain: cleanDomain,
            tokenLength: canvasToken.length
          }
        }, { status: 400 });
      }

      const userData = await testResp.json();
      console.log('[Canvas] Connected successfully as:', userData.name);
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

async function fetchCanvasCourses(token: string, domain: string): Promise<CanvasCourse[]> {
  const headers = { 'Authorization': `Bearer ${token}` };
  const courses: CanvasCourse[] = [];

  try {
    // Fetch active courses with enrollments
    const coursesResp = await fetch(
      `https://${domain}/api/v1/courses?enrollment_state=active&include[]=total_scores&include[]=current_grading_period_scores&include[]=term&per_page=20`,
      { headers }
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
        const teachersResp = await fetch(
          `https://${domain}/api/v1/courses/${course.id}/users?enrollment_type[]=teacher&per_page=1`,
          { headers }
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

