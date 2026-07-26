const responses: Record<string, string[]> = {
  greeting: [
    "Hello! 👋 I'm ChatBot AI. How can I help you today?",
    "Hi there! I'm here to assist you. What would you like to know?",
    "Hey! Welcome! Feel free to ask me anything.",
  ],
  farewell: [
    "Goodbye! Have a great day! 👋",
    "Take care! Feel free to come back anytime.",
    "See you later! Don't hesitate to ask if you need help again.",
  ],
  thanks: [
    "You're welcome! Let me know if you need anything else. 😊",
    "Happy to help! Is there anything else I can assist with?",
    "Glad I could help! Feel free to ask more questions.",
  ],
  coding: [
    "Great question about coding! Here's what I'd suggest:\n\n1. Start with the basics - understand the core concepts\n2. Practice by building small projects\n3. Read documentation and other people's code\n4. Don't be afraid to make mistakes - that's how we learn!\n\nWould you like me to elaborate on any specific aspect?",
    "I'd be happy to help with your coding question! Could you provide more details about what you're working on? In the meantime, here are some general tips:\n\n• Break the problem into smaller parts\n• Use meaningful variable names\n• Comment your code\n• Test as you go\n\nLet me know the specifics and I'll provide a more targeted answer!",
  ],
  general: [
    "That's an interesting question! Let me think about this...\n\nBased on my understanding, I'd approach this by considering multiple perspectives. The key factors to consider are the context, the goals you're trying to achieve, and any constraints you might have.\n\nWould you like me to dive deeper into any particular aspect of this?",
    "Great question! Here's my take on this:\n\nThis is a topic that many people find interesting. The important thing is to consider the various aspects involved and make an informed decision.\n\nI'd suggest breaking this down into manageable parts and tackling each one step by step. Would you like specific guidance on any part of this?",
    "I appreciate you asking! Here are my thoughts:\n\nThis is a multifaceted topic. Let me share some key insights that might help:\n\n1. **Understanding the basics** - It's important to have a solid foundation\n2. **Considering the context** - Every situation is unique\n3. **Taking action** - The best approach is often to start and adjust along the way\n\nIs there a specific angle you'd like me to explore further?",
  ],
  help: [
    "I can help you with a wide range of topics! Here are some things I'm good at:\n\n💬 **General Knowledge** - Ask me about history, science, geography, etc.\n💻 **Coding & Tech** - I can help with programming, debugging, and tech concepts\n✍️ **Writing** - Need help drafting emails, essays, or creative content?\n🧮 **Math & Logic** - I can help solve problems and explain concepts\n🎨 **Creative Ideas** - Brainstorming, suggestions, and more\n\nWhat would you like to explore?",
  ],
};

function detectCategory(message: string): string {
  const lower = message.toLowerCase();

  if (/\b(hi|hello|hey|howdy|greetings|sup|yo)\b/.test(lower)) {
    return 'greeting';
  }
  if (/\b(bye|goodbye|see you|farewell|take care|later)\b/.test(lower)) {
    return 'farewell';
  }
  if (/\b(thank|thanks|thx|appreciate|grateful)\b/.test(lower)) {
    return 'thanks';
  }
  if (/\b(code|coding|program|debug|function|variable|javascript|python|react|html|css|api|bug|error)\b/.test(lower)) {
    return 'coding';
  }
  if (/\b(help|what can you|capabilities|able to|what do you)\b/.test(lower)) {
    return 'help';
  }
  return 'general';
}

function getRandomResponse(category: string): string {
  const categoryResponses = responses[category] || responses.general;
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

export function generateResponse(message: string): Promise<string> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1500; // 0.8s to 2.3s
    setTimeout(() => {
      const category = detectCategory(message);
      resolve(getRandomResponse(category));
    }, delay);
  });
}
