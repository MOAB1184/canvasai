const CANVAS_BASE_URL = process.env.CANVAS_BASE_URL;
const CANVAS_ACCESS_TOKEN = process.env.CANVAS_ACCESS_TOKEN;
const CANVAS_COURSE_ID = process.env.CANVAS_COURSE_ID;

export class Canvas {
  static async createPage(title: string, htmlBody: string) {
    if (!CANVAS_BASE_URL || !CANVAS_ACCESS_TOKEN || !CANVAS_COURSE_ID) {
      console.warn("Missing Canvas environment variables. Skipping Canvas push.");
      return null;
    }

    const url = `${CANVAS_BASE_URL}/api/v1/courses/${CANVAS_COURSE_ID}/pages`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CANVAS_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wiki_page: {
            title: title,
            body: htmlBody,
            published: true,
            editing_roles: "teachers",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Canvas API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.html_url; // Return the URL of the created page
    } catch (error) {
      console.error("Failed to create Canvas page:", error);
      throw error;
    }
  }
}
