const asyncWrapper = require('../utils/asyncWrapper');

const isAnthropicConfigured = process.env.ANTHROPIC_API_KEY && 
                               process.env.ANTHROPIC_API_KEY !== 'your_key_here';

let client = null;
if (isAnthropicConfigured) {
  const Anthropic = require('@anthropic-ai/sdk');
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log('✅ Anthropic AI initialized for MediBot.');
} else {
  console.warn('⚠️ ANTHROPIC_API_KEY not configured. MediBot will use fallback responses.');
}

const Patient = require('../models/Patient');

const chat = asyncWrapper(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  // If Anthropic is not configured, send a fallback
  if (!client) {
    return res.json({
      success: true,
      reply: 'I\'m currently in basic mode. Please configure the AI API key for advanced medical assistance. For now, I can help with general navigation — try asking about prescriptions, appointments, or medicines!',
      fallback: true
    });
  }

  // Load patient context if available
  let patientContext = '';
  if (req.user) {
    try {
      const patient = await Patient.findById(req.user.id)
        .select('name allergies currentMedications medicalHistory bloodGroup');
      if (patient) {
        patientContext = `
Patient details:
- Name: ${patient.name}
- Blood Group: ${patient.bloodGroup || 'Unknown'}
- Allergies: ${patient.allergies || 'None recorded'}
- Current Medications: ${patient.currentMedications || 'None recorded'}
`;
      }
    } catch (e) {
      // Not a patient, that's fine
    }
  }

  const systemPrompt = `You are MediBot, a helpful medical assistant for MediCare Portal — a platform connecting patients with clinic doctors.
${patientContext}
Your job:
- Answer health-related questions clearly and helpfully
- Always recommend consulting the doctor for diagnosis or treatment decisions
- If the patient has known allergies, warn about relevant medications
- Keep responses concise (under 150 words) and friendly
- Never diagnose conditions — only provide general guidance
- If someone seems to be in an emergency, always say to call 112 immediately`;

  const response = await client.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 500,
    system:     systemPrompt,
    messages: [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ],
  });

  res.json({ success: true, reply: response.content[0].text });
});

module.exports = { chat };
