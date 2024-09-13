// Import the JSON data from the external data.js file
import { jsonData } from './data.js';

// Task Icons for each task archetype
const taskIcons = {
    "Generation": "plus-circle.svg",
    "Summarization": "minus-circle.svg",
    "Explanation": "alert-circle.svg",
    "Improvement": "arrow-up-circle.svg"
};

// Populate the button container with buttons grouped by task
window.onload = function () {
    const tasks = ["Explanation", "Generation", "Improvement", "Summarization"];
    tasks.forEach(task => {
        const taskGroup = document.getElementById(task);
        jsonData.forEach((data, index) => {
            if (data.task === task) {
                const button = document.createElement('button');
                button.textContent = `"${data.prompt}"`;
                button.onclick = () => loadConversation(index);
                taskGroup.appendChild(button);
            }
        });
    });

    // Trigger first example when play button is pressed
    document.getElementById('send-button').onclick = function () {
        loadConversation(0); // Load the first conversation as an example
    }
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
function displayUserMessage(text, task, prompt, markings) {
    const conversationDiv = document.getElementById('conversation');

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

    const conversationDiv = document.getElementById('conversation');
    conversationDiv.innerHTML = ''; // Clear previous conversation

    // Display original user message with prompt and appropriate highlighting
    let originalUserMessage = selectedData.conversation[0].content;
    displayUserMessage(originalUserMessage, selectedData.task, selectedData.prompt, selectedData.markings);

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
