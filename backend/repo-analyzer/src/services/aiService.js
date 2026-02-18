const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function classifyRepo({ name, description, languages, topics, readme }) {
  const prompt = `Analyze this GitHub repo and return ONLY a raw JSON object, no markdown, no backticks, no explanation.

Repo Name: ${name}
Description: ${description || "N/A"}
Languages: ${languages.join(", ") || "N/A"}
Topics: ${topics.join(", ") || "N/A"}
README (partial): ${readme.slice(0, 800) || "N/A"}

Return exactly this JSON structure:
{
  "fields": ["field1", "field2"],
  "techStack": ["tech1", "tech2"]
}

fields = broad domains like: Web Development, AI/ML, Blockchain, DevOps, Mobile, Data Science, Cybersecurity, Game Development, etc.
techStack = specific technologies, frameworks, libraries, languages used.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error(`Classification failed for ${name}:`, err.message);
    return { fields: [], techStack: languages };
  }
}

module.exports = { classifyRepo };
