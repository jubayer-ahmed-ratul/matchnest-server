import User from "../models/user.model.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const callGemini = async (prompt) => {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Gemini error:", JSON.stringify(data));
    throw new Error(data.error?.message || "Gemini API error");
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// POST /api/ai/generate-bio
export const generateBio = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const prompt = `Write a warm, genuine and concise matrimony profile bio (max 120 words) for a person with the following details:
- Name: ${user.name}
- Age: ${user.age || "not specified"}
- Gender: ${user.gender || "not specified"}
- Religion: ${user.religion || "not specified"}
- Profession: ${user.profession || "not specified"}
- Education: ${user.education || "not specified"}
- Location: ${user.location?.city || "not specified"}, ${user.location?.country || "Bangladesh"}
- Hobbies: ${user.hobbies?.join(", ") || "not specified"}
- Family type: ${user.family?.familyType || "not specified"}
- Marital status: ${user.maritalStatus || "not specified"}

Write in first person. Be natural, positive and respectful. Do not use generic phrases. Do not include any heading or label, just the bio text.`;

    const bio = await callGemini(prompt);
    res.json({ success: true, bio: bio.trim() });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/compatibility
export const getCompatibility = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ success: false, message: "targetUserId required" });

    const [me, target] = await Promise.all([
      User.findById(req.user._id),
      User.findById(targetUserId),
    ]);

    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const prompt = `Analyze the compatibility between two people for matrimony and give a brief, honest and encouraging analysis (max 80 words). Focus on what they have in common and what could complement each other.

Person A:
- Age: ${me.age}, Gender: ${me.gender}, Religion: ${me.religion}, Profession: ${me.profession}
- Education: ${me.education}, Location: ${me.location?.city}, Hobbies: ${me.hobbies?.join(", ")}
- Family type: ${me.family?.familyType}, Income: ${me.career?.annualIncome}

Person B:
- Age: ${target.age}, Gender: ${target.gender}, Religion: ${target.religion}, Profession: ${target.profession}
- Education: ${target.education}, Location: ${target.location?.city}, Hobbies: ${target.hobbies?.join(", ")}
- Family type: ${target.family?.familyType}, Income: ${target.career?.annualIncome}

Give a compatibility score out of 100 at the start like "Score: 78/100" then a brief explanation. Be positive but realistic.`;

    const analysis = await callGemini(prompt);
    res.json({ success: true, analysis: analysis.trim() });
  } catch (error) {
    next(error);
  }
};
