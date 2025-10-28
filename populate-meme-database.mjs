#!/usr/bin/env node

/**
 * CouchLoop Meme Database Column Population Script
 * 
 * This script uses your ChatGPT-Notion middleware to populate the database
 * with all required columns for the meme variable pool.
 * 
 * Usage:
 * 1. Set your DATABASE_ID below
 * 2. Set your API_SECRET (from CHATGPT_ACTION_SECRET env var)
 * 3. Run: node populate-meme-database.mjs
 */

const DATABASE_ID = "YOUR_DATABASE_ID_HERE"; // Replace with actual database ID
const API_SECRET = process.env.CHATGPT_ACTION_SECRET || "YOUR_SECRET_HERE";
const API_BASE_URL = "https://api.wheniwas.me"; // Change if using different endpoint

const properties = {
  "style_tone": {
    "type": "select",
    "options": [
      "mockumentary realism",
      "inspirational sports parody", 
      "corporate mindfulness ad parody",
      "deadpan therapy meme",
      "self-aware comedy",
      "awkward documentary style",
      "motivational poster parody",
      "therapy session aesthetic"
    ]
  },
  "setting_description": {
    "type": "select",
    "options": [
      "office cubicle",
      "therapy waiting room",
      "bedroom at 2 a.m.",
      "park bench at sunset",
      "gym locker room",
      "coffee shop corner",
      "car interior",
      "bathroom mirror",
      "kitchen counter",
      "couch at home"
    ]
  },
  "character_archetype": {
    "type": "select", 
    "options": [
      "anxious intern",
      "stoic superhero",
      "overworked founder",
      "motivational coach",
      "AI therapist avatar",
      "exhausted parent",
      "overthinking millennial",
      "wellness influencer",
      "corporate burnout",
      "self-help skeptic"
    ]
  },
  "emotional_trigger": {
    "type": "select",
    "options": [
      "breakup",
      "anxiety spiral", 
      "burnout",
      "self-doubt",
      "motivation slump",
      "overthinking loop",
      "imposter syndrome",
      "relationship stress",
      "career uncertainty",
      "social anxiety"
    ]
  },
  "emotional_theme": {
    "type": "select",
    "options": [
      "self-forgiveness",
      "resilience",
      "inner-child reflection",
      "letting go",
      "optimism fatigue",
      "boundary setting",
      "self-compassion",
      "growth mindset",
      "emotional regulation",
      "mindful acceptance"
    ]
  },
  "tone_direction": {
    "type": "select",
    "options": [
      "sincere but ironic",
      "calm but intense",
      "awkwardly motivational",
      "heartfelt yet absurd",
      "gently sarcastic",
      "warmly cynical",
      "optimistically realistic",
      "compassionately blunt"
    ]
  },
  "camera_style": {
    "type": "select",
    "options": [
      "handheld zooms",
      "tripod realism", 
      "selfie-style framing",
      "slow push-in",
      "reaction cutaway",
      "documentary close-up",
      "wide establishing shot",
      "intimate medium shot",
      "dutch angle tilt",
      "mirror reflection"
    ]
  },
  "lighting_style": {
    "type": "select",
    "options": [
      "daylight realism",
      "warm introspective glow",
      "fluorescent office tone",
      "moody cinematic",
      "golden hour soft",
      "harsh bathroom lighting",
      "cozy lamp warmth",
      "blue screen glow",
      "natural window light",
      "dramatic shadow play"
    ]
  },
  "setup_text": {
    "type": "rich_text"
  },
  "punchline_text": {
    "type": "rich_text"
  },
  "Notes": {
    "type": "rich_text"
  },
  "Usage_Count": {
    "type": "number"
  },
  "Last_Used": {
    "type": "date"
  },
  "Quality_Rating": {
    "type": "select",
    "options": [
      "⭐ Needs Work",
      "⭐⭐ Good",
      "⭐⭐⭐ Great",
      "⭐⭐⭐⭐ Excellent",
      "⭐⭐⭐⭐⭐ Perfect"
    ]
  },
  "Active": {
    "type": "checkbox"
  }
};

async function populateDatabase() {
  if (DATABASE_ID === "YOUR_DATABASE_ID_HERE") {
    console.error("❌ Please set DATABASE_ID in the script first!");
    process.exit(1);
  }

  if (API_SECRET === "YOUR_SECRET_HERE") {
    console.error("❌ Please set CHATGPT_ACTION_SECRET environment variable!");
    process.exit(1);
  }

  console.log("🚀 Populating CouchLoop Meme Database with columns...");
  console.log(`📍 Database ID: ${DATABASE_ID}`);
  console.log(`🔧 Adding ${Object.keys(properties).length} properties`);

  try {
    const response = await fetch(`${API_BASE_URL}/chatgpt/notion-update-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`
      },
      body: JSON.stringify({
        database_id: DATABASE_ID,
        properties: properties
      })
    });

    const result = await response.json();

    if (response.ok && result.ok !== false) {
      console.log("✅ Success! Database columns have been populated.");
      console.log(`📊 Action: ${result.action}`);
      console.log(`🆔 Database ID: ${result.database_id}`);
      if (result.data_source_id) {
        console.log(`📋 Data Source ID: ${result.data_source_id}`);
      }
      console.log("\n🎬 Your meme database is now ready with these columns:");
      Object.keys(properties).forEach(prop => {
        const type = properties[prop].type;
        const optionCount = properties[prop].options ? properties[prop].options.length : 0;
        console.log(`  • ${prop} (${type}${optionCount > 0 ? `, ${optionCount} options` : ''})`);
      });
    } else {
      console.error("❌ API Error:", result.error || result);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message);
    process.exit(1);
  }
}

// Run the script
populateDatabase();