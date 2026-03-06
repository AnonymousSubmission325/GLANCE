// Import the JSON data from the external data.js file
import { jsonData } from './data.js';
import { OPENAI_API_KEY } from './config.js';

// Task Icons for each task archetype
const taskIcons = {
    "Generation": "plus-circle.svg",
    "Summarization": "minus-circle.svg",
    "Explanation": "alert-circle.svg",
    "Improvement": "arrow-up-circle.svg"
};

// Persisted strategies (title + three inputs)
let strategies = [];
// default system instruction to control tone/length and HTML behavior
const DEFAULT_SYSTEM_INSTRUCTION = `You are a concise assistant. Keep responses focused and reasonably brief. When asked to produce HTML fragments, respond with valid HTML fragments only (no surrounding <html> or <body> tags) and avoid executing scripts. For visual outputs, produce self-contained static HTML/CSS/SVG without external resources.`;

// utility: remove markdown code fences (```html ... ```) so they don't show up verbatim
function stripCodeFences(str) {
    if (!str || typeof str !== 'string') return str;
    // replace ```...``` blocks with their inner content
    return str.replace(/```[\s\S]*?```/g, m => {
        // strip opening and closing backticks and any language tag
        const inner = m.replace(/^```\w*\s*/, '').replace(/```$/, '');
        return inner;
    });
}

// spinner helpers
function showSpinner(container) {
    const el = document.createElement('div');
    el.className = 'loading-inline';
    const sp = document.createElement('span');
    sp.className = 'spinner';
    const txt = document.createElement('span');
    txt.textContent = 'Loading...';
    el.appendChild(sp);
    el.appendChild(txt);
    container.appendChild(el);
    return el;
}

function hideSpinner(spinnerEl) {
    if (spinnerEl && spinnerEl.parentNode) spinnerEl.parentNode.removeChild(spinnerEl);
}

// Helper to call the Vercel proxy instead of OpenAI directly
async function callOpenAIChat(messages, opts = {}) {
    const apiBase = OPENAI_API_KEY;
    if (!apiBase) throw new Error('No Vercel proxy URL configured in GLANCE_CONFIG');

    const systemMsg = { role: 'system', content: opts.system || DEFAULT_SYSTEM_INSTRUCTION };
    const allMessages = [systemMsg, ...messages];

    // Convert messages array to a single prompt string for the proxy
    const promptText = allMessages.map(msg => `[${msg.role}]: ${msg.content}`).join('\n\n');

    const body = {
        prompt: promptText,
        model: opts.model || 'gpt-3.5-turbo',
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 800,
    };

    const resp = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Proxy error ${resp.status}: ${errText}`);
    }

    const data = await resp.json();
    return data?.output || data?.choices?.[0]?.message?.content || '';
}

// returns the element where messages should be appended (new #messages preferred)
function getConversationDiv() {
    return document.getElementById('messages') || document.getElementById('conversation');
}

async function sendChat() {
    const inputEl = document.getElementById('user-input');
    if (!inputEl) return;
    const text = inputEl.value.trim();

    // conversation container may have two parts now
    const conversationDiv = getConversationDiv();
    if (!text) return;

    // show user message immediately
    const userContainer = document.createElement('div');
    userContainer.className = 'message-container';
    const userBubble = document.createElement('div');
    userBubble.className = 'user-message';
    userBubble.textContent = text;
    userContainer.appendChild(userBubble);
    conversationDiv.appendChild(userContainer);
    inputEl.value = '';

    // 1) Get initial assistant reply (hidden, used only for prompt building)
    let initialReply = '';
    try {
        initialReply = await callOpenAIChat([{ role: 'user', content: text }]);
    } catch (err) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'message-container';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message llm-message';
        errorDiv.textContent = 'Error during initial response: ' + err.message;
        errorContainer.appendChild(errorDiv);
        conversationDiv.appendChild(errorContainer);
        console.error(err);
        return;
    }
    // remove any markdown fences
    initialReply = stripCodeFences(initialReply);

    // 2) Build prompt 2 combining user input, initialReply, and all strategies
    const strategiesSummary = strategies.map((s, i) => {
        return `Strategy ${i + 1}: Title: ${s.title}\nTask Context: ${s.taskContext}\nEvidence Derivation: ${s.evidence}\nVisual Encoding: ${s.visual}`;
    }).join('\n\n');

    const prompt2 = `You are given a user's input and an initial assistant reply. Produce a final answer in HTML form (body content only) that captures the key ideas and applies augmentation strategies.\n\nIMPORTANT STRATEGY CLASSIFICATION:\n- INLINE TEXT STRATEGIES: Apply colors, highlighting, text styling, bold/italic emphasis, structured formatting, semantic markup to enhance the text presentation.\n- EXTERNAL VISUALIZATION STRATEGIES (ignore these here): These require charts, graphs, diagrams - will be handled separately.\n\nEvaluate the strategies below and apply ONLY the inline text enhancement strategies. Do NOT repeat the initial reply verbatim - synthesize fresh content based on concepts, enhanced with inline visual styling.\n\nUser input:\n${text}\n\nInitial assistant reply (use concepts, but do NOT repeat verbatim):\n${initialReply}\n\nAvailable strategies (apply only INLINE TEXT enhancements):\n${strategiesSummary}\n\nRespond only with valid HTML (no surrounding <html> or <body> tags). Use inline CSS or <style> tags for text colors, highlighting, bold/italic, and visual enhancement. Use 'Noto Sans' font. Make it pretty with good styling.`;

    const finalContainer = document.createElement('div');
    finalContainer.className = 'message-container';
    const finalDiv = document.createElement('div');
    finalDiv.className = 'message llm-message';
    finalDiv.textContent = 'Generating HTML output...';
    finalContainer.appendChild(finalDiv);
    conversationDiv.appendChild(finalContainer);

    // spinner while generating HTML output (attach to bubble)
    const spinner2 = showSpinner(finalDiv);
    let htmlReply = '';
    try {
        htmlReply = await callOpenAIChat([{ role: 'user', content: prompt2 }], { max_tokens: 1200 });
    } catch (err) {
        hideSpinner(spinner2);
        finalDiv.textContent = 'Error during HTML generation: ' + err.message;
        console.error(err);
        return;
    }
    hideSpinner(spinner2);

    // strip fences if model wrapped the HTML in ```html blocks
    htmlReply = stripCodeFences(htmlReply);

    // Render the returned HTML safely inside a sandboxed iframe with gray background
    try {
        finalDiv.innerHTML = '';
        const iframeFinal = document.createElement('iframe');
        iframeFinal.className = 'html-output-box';
        iframeFinal.setAttribute('sandbox', '');
        iframeFinal.srcdoc = htmlReply;
        finalDiv.appendChild(iframeFinal);
    } catch (err) {
        finalDiv.textContent = 'Error rendering HTML output.';
        console.error(err);
    }

    // 3) Ask for a visualization using the generated HTML
    const vizPrompt = `You have the following HTML answer:\n${htmlReply}\n\nIMPORTANT STRATEGY CLASSIFICATION:\n- INLINE TEXT STRATEGIES: Already applied in the HTML above (colors, highlighting, styling).\n- EXTERNAL VISUALIZATION STRATEGIES: Create charts, graphs, diagrams, visual summaries that represent the data visually.\n\nCreate a beautiful, self-contained static visualization in HTML using visual elements (bar charts, pie charts, line graphs, diagrams, etc.). Apply ONLY external visualization strategies that benefit from visual representation. Focus on summarizing key concepts visually, not repeating text. You MAY include brief labels and keywords for clarity, but do NOT duplicate the text content.\n\nAvailable strategies (apply only those suited for EXTERNAL VISUALIZATION):\n${strategiesSummary}\n\nRespond only with the HTML fragment for the visualization. Make it visually appealing.`;

    const vizSystemInstruction = `You are a visualization expert. Your goal is to create visual representations (charts, graphs, diagrams) that complement and summarize the HTML content without duplicating text. Apply strategies that benefit from visual representation only. Use brief labels and keywords where necessary for clarity, but focus on visual storytelling, not text transcription.`;

    const vizDiv = document.getElementById('visualization');
    if (vizDiv) {
        vizDiv.innerHTML = '';
        const spinnerV = showSpinner(vizDiv);
        try {
            const vizHtml = await callOpenAIChat([{ role: 'user', content: vizPrompt }], { max_tokens: 800, system: vizSystemInstruction });
            hideSpinner(spinnerV);
            // sanitize fences
            const cleanViz = stripCodeFences(vizHtml);
            // render HTML in iframe with gray background
            vizDiv.innerHTML = '';
            const iframeViz = document.createElement('iframe');
            iframeViz.className = 'visualization-output-box';
            iframeViz.setAttribute('sandbox', '');
            iframeViz.srcdoc = cleanViz;
            vizDiv.appendChild(iframeViz);
        } catch (err) {
            hideSpinner(spinnerV);
            vizDiv.innerHTML = `<div style="color:red">Visualization error: ${err.message}</div>`;
            console.error(err);
        }
    }
}

// Save the current strategies array to localStorage
function saveStrategiesToStorage() {
    try {
        localStorage.setItem('glance_strategies', JSON.stringify(strategies));
    } catch (e) {
        console.warn('Failed to save strategies', e);
    }
}

function loadStrategiesFromStorage() {
    try {
        const raw = localStorage.getItem('glance_strategies');
        strategies = raw ? JSON.parse(raw) : [];
    } catch (e) {
        strategies = [];
    }
}

function renderStrategies() {
    const list = document.getElementById('tasks-placeholder');
    if (!list) return;
    list.innerHTML = '';
    strategies.forEach((s, idx) => {
        const el = createStrategyElement(s, idx);
        list.appendChild(el);
    });
}

function createStrategyElement(s, idx) {
    const item = document.createElement('div');
    item.className = 'strategy-item';
    item.setAttribute('draggable', 'true');
    item.dataset.index = idx;

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '0.5rem';

    const icon = document.createElement('img');
    icon.src = 'puzzle.svg';
    icon.alt = '';
    icon.className = 'strategy-icon';

    const text = document.createElement('span');
    text.className = 'strategy-text';
    const charLimit = 40;
    const truncated = s.title.length > charLimit ? s.title.slice(0, charLimit - 1) + '…' : s.title;
    text.textContent = truncated;
    text.setAttribute('title', s.title);

    left.appendChild(icon);
    left.appendChild(text);

    const right = document.createElement('div');
    right.className = 'strategy-right';
    
    const edit = document.createElement('button');
    edit.className = 'strategy-edit';
    edit.setAttribute('aria-label', 'Edit strategy');
    edit.textContent = '✎';
    edit.addEventListener('click', (ev) => {
        ev.stopPropagation();
        // Pre-fill modal with strategy data
        document.getElementById('strategy-title').value = s.title;
        document.getElementById('task-context').value = s.taskContext;
        document.getElementById('evidence-derivation').value = s.evidence;
        document.getElementById('visual-encoding').value = s.visual;
        // Mark this as edit mode (store the index)
        document.getElementById('augmentation-modal').dataset.editIndex = idx;
        // Open modal
        const modal = document.getElementById('augmentation-modal');
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('strategy-title').focus();
    });
    right.appendChild(edit);
    
    const del = document.createElement('button');
    del.className = 'strategy-delete';
    del.setAttribute('aria-label', 'Delete strategy');
    del.textContent = '✕';
    del.addEventListener('click', (ev) => {
        ev.stopPropagation();
        strategies.splice(idx, 1);
        saveStrategiesToStorage();
        renderStrategies();
    });
    right.appendChild(del);

    item.appendChild(left);
    item.appendChild(right);

    if (s.selected) item.classList.add('selected');
    item.addEventListener('click', () => {
        item.classList.toggle('selected');
        strategies[idx].selected = item.classList.contains('selected');
        saveStrategiesToStorage();
    });

    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);

    return item;
}

function handleDragStart(e) {
    dragSrcIndex = Number(this.dataset.index);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const targetIndex = Number(this.dataset.index);
    if (isNaN(dragSrcIndex) || isNaN(targetIndex) || dragSrcIndex === targetIndex) return;
    const item = strategies.splice(dragSrcIndex, 1)[0];
    strategies.splice(targetIndex, 0, item);
    saveStrategiesToStorage();
    renderStrategies();
    dragSrcIndex = null;
}

// Populate the button container with buttons grouped by task
window.onload = function () {
    const tasks = ["Explanation", "Generation", "Improvement", "Summarization"];
    tasks.forEach(task => {
        const taskGroup = document.getElementById(task);
        if (!taskGroup) return; // skip if the sidebar section was removed
        jsonData.forEach((data, index) => {
            if (data.task === task) {
                const button = document.createElement('button');
                button.textContent = `"${data.prompt}"`;
                button.onclick = () => loadConversation(index);
                taskGroup.appendChild(button);
            }
        });
    });

    // Wire send button and Enter key to chat send
    const sendBtn = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    if (sendBtn) sendBtn.addEventListener('click', sendChat);
    if (userInput) {
        userInput.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' && !ev.shiftKey) {
                ev.preventDefault();
                sendChat();
            }
        });
    }
    // Attach submit handler for the input masks if present
    const submitBtn = document.getElementById('submit-masks');
    if (submitBtn) submitBtn.addEventListener('click', handleMasksSubmit);

    // Wire the create-augmentation button to open the modal
    const createBtn = document.getElementById('create-augmentation-btn');
    const modal = document.getElementById('augmentation-modal');
    const backdrop = document.getElementById('augmentation-backdrop');
    const closeBtn = document.getElementById('augmentation-close');

    if (createBtn && modal) {
        createBtn.addEventListener('click', () => {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            const titleInput = document.getElementById('strategy-title');
            if (titleInput) setTimeout(() => titleInput.focus(), 10);
        });
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }
    });

    // initialize strategy list drag/drop container
    const list = document.getElementById('tasks-placeholder');
    if (list) {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('drop', handleDrop);
    }
    // API key controls
    const saveKeyBtn = document.getElementById('save-api-key');
    const clearKeyBtn = document.getElementById('clear-api-key');
    const apiInput = document.getElementById('api-key-input');
    if (saveKeyBtn && apiInput) {
        saveKeyBtn.addEventListener('click', () => {
            const val = apiInput.value.trim();
            if (!val) return alert('Please paste your OpenAI API key.');
            try { localStorage.setItem('glance_api_key', val); alert('API key saved'); } catch (e) { console.warn(e); }
        });
    }
    if (clearKeyBtn) {
        clearKeyBtn.addEventListener('click', () => {
            localStorage.removeItem('glance_api_key');
            if (apiInput) apiInput.value = '';
            alert('API key cleared');
        });
    }
    // populate saved key (masked) if present
    try {
        const saved = localStorage.getItem('glance_api_key');
        if (saved && apiInput) apiInput.value = saved;
    } catch (e) { /* ignore */ }
    // load persisted strategies and render
    loadStrategiesFromStorage();
    renderStrategies();
};


// Function to highlight matching phrases in both user and LLM messages
function highlightMatchingPhrases(text, markings, isLLM = false) {
    let highlightedText = text;
    let appliedHighlights = []; // Store applied highlight ranges to prevent overlap

    markings.forEach(({ input, output, color }) => {
        const phrases = isLLM ? output : input;

        phrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            let match;
            let highlightApplied = false;

            while ((match = regex.exec(highlightedText)) !== null) {
                const start = match.index;
                const end = start + match[0].length;

                // Check if this range overlaps with any existing highlights
                const overlap = appliedHighlights.some(
                    ({ start: appliedStart, end: appliedEnd }) =>
                        (start >= appliedStart && start < appliedEnd) || (end > appliedStart && end <= appliedEnd)
                );

                if (!overlap) {
                    // Apply highlight if no overlap
                    highlightedText = `${highlightedText.slice(0, start)}<span style="background-color:${color};">${highlightedText.slice(start, end)}</span>${highlightedText.slice(end)}`;

                    // Update the appliedHighlights array
                    appliedHighlights.push({ start, end: end + color.length + 31 }); // Adjust for the length of added tags
                    highlightApplied = true;
                    break;
                }
            }

            // If highlight is applied, update indices accordingly
            if (highlightApplied) {
                // Offset regex index to avoid highlighting the same phrase again in the loop
                regex.lastIndex = match.index + match[0].length;
            }
        });
    });

    return highlightedText;
}

// Function to display user message with prompt and italicized text
function displaySummarizationMessage(selectedData, text, task, prompt, markings) {
    const conversationDiv = getConversationDiv();

    // Create a container for the icon and message
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center'; // Vertical centering of icon and text
    messageContainer.style.justifyContent = 'flex-end'; // Align container to the right

    // Add icon
    const icon = document.createElement('img');
    icon.src = taskIcons[task];
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.marginRight = '10px';

    // Highlight matching phrases in the user message
    const highlightedText = highlightMatchingPhrases(text, markings);

    // Add user message with prompt and italicized text
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `${prompt}<br><i>${highlightedText}</i>`;

    // Add elements to container
    messageContainer.appendChild(icon);
    messageContainer.appendChild(userMessageDiv);

    // Add the container to the conversation
    conversationDiv.appendChild(messageContainer);

    // Apply a transition for the "flying" effect
    messageContainer.style.transform = 'translateX(100%)'; // Start position (off-screen)
    setTimeout(() => {
        messageContainer.style.transition = 'transform 0.5s ease-out';
        messageContainer.style.transform = 'translateX(0)'; // End position (in place)
    }, 10); // Slight delay to ensure the transition occurs

    // Simulate delay before LLM response
    setTimeout(() => {
        const llmMessageDiv = document.createElement('div');
        llmMessageDiv.classList.add('message', 'llm-message');

        // Highlight matching phrases in the LLM response
        let highlightedLLMResponse = highlightMatchingPhrases(selectedData.conversation[1].content, selectedData.markings, true);

        typeText(llmMessageDiv, highlightedLLMResponse, 30); // Continue using typing effect for LLM response
        conversationDiv.appendChild(llmMessageDiv);
    }, 1000); // 1 second delay before showing LLM response


}

// Function to display the user message and improved response with typing effect
function displayImprovementMessage(selectedData, text, task, prompt, markings) {
    const conversationDiv = getConversationDiv();

    // Create a container for the icon and message
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center'; // Vertical centering of icon and text
    messageContainer.style.justifyContent = 'flex-end'; // Align container to the right

    // Add icon
    const icon = document.createElement('img');
    icon.src = taskIcons[task];
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.marginRight = '10px';

    // Add user message with prompt and italicized text
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `${prompt}<br><i>${text}</i>`;

    // Add elements to container
    messageContainer.appendChild(icon);
    messageContainer.appendChild(userMessageDiv);

    // Add the container to the conversation
    conversationDiv.appendChild(messageContainer);

    // Apply a transition for the "flying" effect
    messageContainer.style.transform = 'translateX(100%)'; // Start position (off-screen)
    setTimeout(() => {
        messageContainer.style.transition = 'transform 0.5s ease-out';
        messageContainer.style.transform = 'translateX(0)'; // End position (in place)
    }, 10); // Slight delay to ensure the transition occurs

    // Simulate delay before LLM response
    setTimeout(() => {
        const llmMessageDiv = document.createElement('div');
        llmMessageDiv.classList.add('message', 'llm-message');

        // Process the improvements: highlight old and new words in the LLM response
        let improvedLLMText = selectedData.conversation[1].content;
        markings.forEach(({ oldWord, newWord }) => {
            const oldWordRegex = new RegExp(`\\b${oldWord}\\b`, 'gi');
            improvedLLMText = improvedLLMText.replace(oldWordRegex, `<span style="color: red; text-decoration: line-through;">${oldWord}</span> <span style="color: green;">${newWord}</span>`);
        });

        // Typing effect for LLM response
        typeText(llmMessageDiv, improvedLLMText, 30); // 30ms delay between characters
        conversationDiv.appendChild(llmMessageDiv);
    }, 1000); // 1 second delay before showing the improved LLM response
}

// Function to display user message with prompt and provide explanation with highlighted key terms
function displayExplanationMessage(selectedData, text, task, prompt, markings) {
    const conversationDiv = getConversationDiv();

    // Create a container for the icon and message
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center'; // Vertical centering of icon and text
    messageContainer.style.justifyContent = 'flex-end'; // Align container to the right

    // Add icon
    const icon = document.createElement('img');
    icon.src = taskIcons[task];
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.marginRight = '10px';

    // Highlight matching phrases in the user message
    const highlightedText = highlightExplanation(text, markings);

    // Add user message with prompt and italicized text
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `<i>${highlightedText}</i>`; // No dollar sign, prompt included

    // Add elements to container
    messageContainer.appendChild(icon);
    messageContainer.appendChild(userMessageDiv);

    // Add the container to the conversation
    conversationDiv.appendChild(messageContainer);

    // Apply a transition for the "flying" effect
    messageContainer.style.transform = 'translateX(100%)'; // Start position (off-screen)
    setTimeout(() => {
        messageContainer.style.transition = 'transform 0.5s ease-out';
        messageContainer.style.transform = 'translateX(0)'; // End position (in place)
    }, 10); // Slight delay to ensure the transition occurs

    // Simulate delay before LLM response
    setTimeout(() => {
        const llmMessageDiv = document.createElement('div');
        llmMessageDiv.classList.add('message', 'llm-message');

        // Highlight the explanation in the LLM response
        console.log(selectedData)
        let highlightedLLMText = highlightExplanation(selectedData.conversation[1].content, selectedData.markings, true);
        // Render the text exactly as it is without altering the capitalization
        typeText(llmMessageDiv, highlightedLLMText, 30); // 30ms delay between characters
        conversationDiv.appendChild(llmMessageDiv);
    }, 1000); // 1 second delay before showing LLM response
}


// Function to highlight key terms in the explanation message
function highlightExplanation(text, markings, isLLM = false) {
    let highlightedText = text;

    // Apply the markings (highlighting key terms)
    markings.forEach(({ word }) => {
        // Create a case-insensitive regex but capture the original case using a callback
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, (match) => {
            // Return the original word in its original case but wrapped in a <span> for styling
            return `<span style="font-weight: bold;">${match}</span>`;
        });
    });

    return highlightedText;
}

// Function to display user message with prompt and provide generation task feedback with highlighted key terms
function displayGenerationMessage(selectedData, text, task, prompt, markings) {
    const conversationDiv = getConversationDiv();

    // Create a container for the icon and message
    const messageContainer = document.createElement('div');
    messageContainer.style.display = 'flex';
    messageContainer.style.alignItems = 'center'; // Vertical centering of icon and text
    messageContainer.style.justifyContent = 'flex-end'; // Align container to the right

    // Add icon
    const icon = document.createElement('img');
    icon.src = taskIcons[task];
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.marginRight = '10px';

    // Highlight matching phrases in the user message
    const highlightedText = highlightGeneration(text, markings);

    // Add user message with prompt and italicized text
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('message', 'user-message');
    userMessageDiv.innerHTML = `${prompt}<br><i>${highlightedText}</i>`;

    // Add elements to container
    messageContainer.appendChild(icon);
    messageContainer.appendChild(userMessageDiv);

    // Add the container to the conversation
    conversationDiv.appendChild(messageContainer);

    // Apply a transition for the "flying" effect
    messageContainer.style.transform = 'translateX(100%)'; // Start position (off-screen)
    setTimeout(() => {
        messageContainer.style.transition = 'transform 0.5s ease-out';
        messageContainer.style.transform = 'translateX(0)'; // End position (in place)
    }, 10); // Slight delay to ensure the transition occurs

    // Simulate delay before LLM response
    setTimeout(() => {
        const llmMessageDiv = document.createElement('div');
        llmMessageDiv.classList.add('message', 'llm-message');

        // Highlight matching phrases in the LLM response
        let highlightedLLMText = highlightGeneration(selectedData.conversation[1].content, selectedData.markings, true);

        // Typing effect for LLM response
        typeText(llmMessageDiv, highlightedLLMText, 30); // 30ms delay between characters
        conversationDiv.appendChild(llmMessageDiv);
    }, 1000); // 1 second delay before showing LLM response
}

// Function to highlight key terms in the generation task
function highlightGeneration(text, markings, isLLM = false) {
    let highlightedText = text;

    // Apply the markings (highlighting key terms)
    markings.forEach(({ word, color }) => {
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        highlightedText = highlightedText.replace(regex, (match) => {
            return `<span style="background-color:${color};">${match}</span>`;
        });
    });

    return highlightedText;
}





// Function to simulate typing effect with correct HTML parsing
function typeText(element, htmlContent, delay = 50) {
    element.innerHTML = ''; // Clear content
    let charIndex = 0;

    function typeNextChar() {
        if (charIndex < htmlContent.length) {
            if (htmlContent[charIndex] === '<') {
                const endTagIndex = htmlContent.indexOf('>', charIndex) + 1;
                let tagContent = htmlContent.slice(charIndex, endTagIndex);
                if (htmlContent[endTagIndex - 2] !== '/') {
                    const closingTagIndex = htmlContent.indexOf('</', endTagIndex);
                    if (closingTagIndex !== -1) {
                        const closingTagEndIndex = htmlContent.indexOf('>', closingTagIndex) + 1;
                        tagContent = htmlContent.slice(charIndex, closingTagEndIndex);
                        charIndex = closingTagEndIndex;
                    } else {
                        charIndex = endTagIndex;
                    }
                } else {
                    charIndex = endTagIndex;
                }
                element.innerHTML += tagContent;
            } else {
                element.innerHTML += htmlContent[charIndex];
                charIndex++;
            }
            setTimeout(typeNextChar, delay);
        }
    }

    typeNextChar();
}

// Load the selected conversation and highlight important words
function loadConversation(index) {
    const selectedData = jsonData[index];

    const conversationDiv = getConversationDiv();
    conversationDiv.innerHTML = ''; // Clear previous conversation
    console.log(selectedData)
    // Display original user message with prompt and appropriate highlighting
    let originalUserMessage = selectedData.conversation[0].content;
    let task = selectedData.task;

    if(task == "Summarization"){
        displaySummarizationMessage(selectedData, originalUserMessage, selectedData.task, selectedData.prompt, selectedData.markings);
    }
    if(task == "Improvement"){
        displayImprovementMessage(selectedData,originalUserMessage, selectedData.task, selectedData.prompt, selectedData.markings);
    }
    if(task == "Generation"){
        displayGenerationMessage(selectedData,originalUserMessage, selectedData.task, selectedData.prompt, selectedData.markings);
    }
    if(task == "Explanation"){
        displayExplanationMessage(selectedData, originalUserMessage, selectedData.task, selectedData.prompt, selectedData.markings);
    }

}

// Handle submit from the three input masks - now handles both create and edit
function handleMasksSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('strategy-title')?.value.trim() || 'Untitled';
    const taskContext = document.getElementById('task-context')?.value || '';
    const evidence = document.getElementById('evidence-derivation')?.value || '';
    const visual = document.getElementById('visual-encoding')?.value || '';

    const modal = document.getElementById('augmentation-modal');
    const editIndex = modal.dataset.editIndex;

    if (editIndex !== undefined && editIndex !== 'undefined') {
        // Edit mode: update existing strategy
        const idx = parseInt(editIndex, 10);
        strategies[idx] = { title, taskContext, evidence, visual, selected: strategies[idx].selected };
        delete modal.dataset.editIndex;
    } else {
        // Create mode: add new strategy
        const payload = { title, taskContext, evidence, visual };
        onMasksSubmit(payload);
    }
    
    saveStrategiesToStorage();
    renderStrategies();

    // Close the augmentation modal after submit
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
    // Clear the inputs
    const t1 = document.getElementById('task-context');
    const t2 = document.getElementById('evidence-derivation');
    const t3 = document.getElementById('visual-encoding');
    const ttitle = document.getElementById('strategy-title');
    if (t1) t1.value = '';
    if (t2) t2.value = '';
    if (t3) t3.value = '';
    if (ttitle) ttitle.value = '';
}

// New function triggered by the submit button - customize as needed
function onMasksSubmit(data) {
    console.log('Masks submitted:', data);
    // No longer display a "Submitted" message in conversation
    // Just persist the strategy silently

    // Persist the new strategy and re-render the list
    strategies.push({ title: data.title, taskContext: data.taskContext, evidence: data.evidence, visual: data.visual });
    saveStrategiesToStorage();
    renderStrategies();

    // Close the augmentation modal after submit
    const modal = document.getElementById('augmentation-modal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
    // Clear the inputs
    const t1 = document.getElementById('task-context');
    const t2 = document.getElementById('evidence-derivation');
    const t3 = document.getElementById('visual-encoding');
    const ttitle = document.getElementById('strategy-title');
    if (t1) t1.value = '';
    if (t2) t2.value = '';
    if (t3) t3.value = '';
    if (ttitle) ttitle.value = '';
}
