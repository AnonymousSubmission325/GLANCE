// Sample JSON data with full prompts
const jsonData = [
    {
        "task": "Generation",
        "prompt": "Generate a poem about the ocean.",
        "conversation": [
            {"role": "user", "content": "Generate a poem about the ocean."},
            {"role": "llm", "content": "The ocean's waves crash with might,\nA dance of blue under the light,\nDepths unknown, secrets they keep,\nIn the ocean's arms, dreams sleep."}
        ],
        "visualization": "This visualization shows the rhyme scheme of the poem, highlighting the repeated patterns in the text."
    },
    {
        "task": "Summarization",
        "prompt": "Summarize the impact of climate change.",
        "conversation": [
            {"role": "user", "content": "Summarize the impact of climate change."},
            {"role": "llm", "content": "Climate change is leading to rising temperatures, more extreme weather events, and shifts in ecosystems, affecting both human and natural environments."},
            {"role": "input", "content": "The full report on climate change impacts, including temperature rise, ecosystem disruption, and human health risks."}
        ],
        "visualization": "This visualization highlights the key areas of impact, such as temperature rise, weather changes, and ecosystem disruption."
    },
    {
        "task": "Improvement",
        "prompt": "Improve the clarity of this paragraph about machine learning.",
        "conversation": [
            {"role": "user", "content": "Improve the clarity of this paragraph about machine learning."},
            {"role": "llm", "content": "Machine learning is a method of data analysis that automates analytical model building, enabling systems to learn from data patterns and make decisions with minimal human intervention."},
            {"role": "input", "content": "Machine learning is a field of AI that makes it possible for systems to improve and evolve their functions through iterative processes involving data analysis and pattern recognition."}
        ],
        "visualization": "This visualization shows the changes made to improve the clarity and conciseness of the text."
    },
    {
        "task": "Explanation",
        "prompt": "Explain how photosynthesis works.",
        "conversation": [
            {"role": "user", "content": "Explain how photosynthesis works."},
            {"role": "llm", "content": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll."}
        ],
        "visualization": "This visualization breaks down the steps of photosynthesis, showing the flow of energy and the role of chlorophyll."
    }
    // Add more entries as needed
];

// Populate the button container with buttons grouped by task
window.onload = function() {
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
}

// Load the selected conversation and visualization
function loadConversation(index) {
    const selectedData = jsonData[index];

    const conversationDiv = document.getElementById('conversation');
    conversationDiv.innerHTML = ''; // Clear previous conversation

    selectedData.conversation.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(message.role === 'user' ? 'user-message' : 'llm-message');
        messageDiv.textContent = message.content;
        conversationDiv.appendChild(messageDiv);
    });

    const visualizationDiv = document.getElementById('visualization');
    visualizationDiv.textContent = selectedData.visualization;
}
