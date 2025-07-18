const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const button = form.querySelector('button');

// Add welcome message on page load
window.addEventListener('load', () => {
  appendMessage('bot', '👋 Halo! Saya Gemini AI. Apa yang bisa saya bantu hari ini?');
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Disable input and button during request
  setUILoading(true);

  appendMessage('user', userMessage);
  input.value = '';

  // Show typing indicator
  const loadingMessage = appendMessage('bot', '🤔 Sedang berpikir...', true);
  
  try {
    // Send message to backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage })
    });

    // Check if request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    
    // Remove loading message and show actual response
    chatBox.removeChild(loadingMessage);
    appendMessage('bot', data.reply);

  } catch (error) {
    console.error('Error:', error);
    // Remove loading message and show error
    chatBox.removeChild(loadingMessage);
    appendMessage('bot', '😕 Maaf, terjadi kesalahan. Silakan coba lagi.');
  } finally {
    // Re-enable input and button
    setUILoading(false);
  }
});

// Handle Enter key press
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

// Auto-resize input and focus
input.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

function appendMessage(sender, text, isLoading = false) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  if (isLoading) {
    msg.classList.add('loading');
  }
  
  // Add typing animation for bot messages
  if (sender === 'bot' && !isLoading) {
    msg.innerHTML = '';
    typeWriter(msg, text, 30);
  } else {
    msg.textContent = text;
  }
  
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// Typing animation effect
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
      // Auto scroll during typing
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }
  
  type();
}

// Set loading state for UI elements
function setUILoading(isLoading) {
  input.disabled = isLoading;
  button.disabled = isLoading;
  button.textContent = isLoading ? '⏳' : 'Kirim';
  
  if (isLoading) {
    input.placeholder = 'Menunggu respon...';
  } else {
    input.placeholder = 'Ketik pesan Anda...';
    input.focus();
  }
}

// Auto-focus input when page loads
window.addEventListener('load', () => {
  input.focus();
});
