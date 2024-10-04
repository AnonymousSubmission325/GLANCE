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
function displaySummarizationMessage(selectedData, text, task, prompt, markings) {
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

    const conversationDiv = document.getElementById('conversation');
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
