const Groq = require('groq-sdk');

// @desc  Generate tasks from a description using Groq (llama-3.3-70b)
// @route POST /api/ai/generate-tasks
exports.generateTasks = async (req, res) => {
  const { description, projectName } = req.body;
  if (!description?.trim()) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mô tả dự án' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    return res.status(500).json({ message: 'GROQ_API_KEY chưa được cấu hình' });
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `Bạn là trợ lý quản lý dự án. Dựa trên mô tả sau, hãy tạo danh sách các nhiệm vụ (tasks) cụ thể và thực tế.

Dự án: ${projectName || 'Không có tên'}
Mô tả: ${description}

Hãy trả về JSON hợp lệ theo định dạng sau (KHÔNG có markdown, chỉ JSON thuần):
{
  "tasks": [
    {
      "title": "Tên nhiệm vụ ngắn gọn",
      "priority": "LOW|MEDIUM|HIGH|URGENT"
    }
  ]
}

Tạo 5-10 tasks phù hợp. Ưu tiên hợp lý dựa trên tầm quan trọng. Chỉ trả về JSON, không giải thích thêm.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed.tasks)) {
      return res.status(500).json({ message: 'AI trả về dữ liệu không hợp lệ' });
    }

    res.json({ tasks: parsed.tasks });
  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ message: 'Lỗi khi gọi Groq API: ' + error.message });
  }
};
