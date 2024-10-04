export const jsonData = [
    {
        "task": "Generation",
        "prompt": "Generate a short story about the fjords of Norway and its beauty when wandering through.",
        "markings": [
            // Fjords of Norway related markings (Blue)
            { "word": "fjords of Norway", "color": "rgba(51, 153, 255, 0.4)", "importance": 100 }, 
            { "word": "the deep blue waters", "color": "rgba(51, 153, 255, 0.4)", "importance": 80 }, 
            { "word": "towering cliffs", "color": "rgba(51, 153, 255, 0.4)", "importance": 60 }, 
            { "word": "snow", "color": "rgba(51, 153, 255, 0.4)", "importance": 40 },
            


            // Beauty related markings (Pink)
                { "word": "its beauty", "color": "rgba(220, 20, 60, 0.4)", "importance": 100 },
                { "word": "shimmered in the early morning light", "color": "rgba(220, 20, 60, 0.4)", "importance": 40 },
                { "word": "sunlight filtered through the clouds", "color": "rgba(220, 20, 60, 0.4)", "importance": 40 },
                { "word": "casting golden rays", "color": "rgba(220, 20, 60, 0.4)", "importance": 70 },
                { "word": "their silver streams", "color": "rgba(220, 20, 60, 0.4)", "importance": 65 },
                { "word": "glistening in the sun", "color": "rgba(220, 20, 60, 0.4)", "importance": 70 },
                { "word": "their beauty pure", "color": "rgba(220, 20, 60, 0.4)", "importance": 99 },
                { "word": "a deep sense of peace", "color": "rgba(220, 20, 60, 0.4)", "importance": 10 },
                { "word": "marveled", "color": "rgba(220, 20, 60, 0.4)", "importance": 70 },
                { "word": "wonder", "color": "rgba(220, 20, 60, 0.4)", "importance": 75 },
                { "word": "timeless", "color": "rgba(220, 20, 60, 0.4)", "importance": 35 },
                { "word": "felt", "color": "rgba(220, 20, 60, 0.4)", "importance": 45 },
            
            

            // Wandering related markings (Green)
            { "word": "wandering", "color": "rgba(144, 238, 144, 0.4)", "importance": 100 },
            { "word": "hiked along the narrow path", "color": "rgba(144, 238, 144, 0.4)", "importance": 90 },
            { "word": "an outcrop", "color": "rgba(144, 238, 144, 0.4)", "importance": 10 },
            { "word": "the sounds of nature", "color": "rgba(144, 238, 144, 0.4)", "importance": 40 },
            { "word": "rustling leaves", "color": "rgba(144, 238, 144, 0.4)", "importance": 55 },
            { "word": "the gentle lap of water", "color": "rgba(144, 238, 144, 0.4)", "importance": 10 },
            { "word": "distant bird calls", "color": "rgba(144, 238, 144, 0.4)", "importance": 30 },
            { "word": "crisp air", "color": "rgba(144, 238, 144, 0.4)", "importance": 10 },
            { "word": "the way", "color": "rgba(144, 238, 144, 0.4)", "importance": 80 },
            { "word": "waterfalls", "color": "rgba(144, 238, 144, 0.4)", "importance": 50 },
            { "word": "emerald green valleys", "color": "rgba(173, 216, 230, 0.4)", "importance": 30 }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Generate a short story about the fjords of Norway and its beauty when wandering through."
            },
            {
                "role": "llm",
                "content": `The fjords of Norway shimmered in the early morning light as Ingrid hiked along the narrow path. 
                            Towering cliffs, dusted with snow, reflected on the deep blue waters below. 
                            Sunlight filtered through the clouds, casting golden rays on emerald green valleys. 
                            The air was crisp, filled with the sounds of nature—the gentle lap of water, distant bird calls, and rustling leaves.
                            
                            Pausing at an outcrop, Ingrid marveled at waterfalls their silver streams glistening in the sun. The way felt timeless, their beauty pure, 
                            leaving her with a deep sense of peace and wonder.`
            }
        ]
    },
    {
        "task": "Generation",
        "prompt": "Write a step-by-step guide for preprocessing data and then visualizing it.",
        "markings": [
            { "word": "Generate", "color": "rgba(54, 162, 235, 0.4)", "importance": 90 },        // Generation task
            { "word": "step-by-step", "color": "rgba(54, 162, 235, 0.4)", "importance": 80 },    // Guide keyword
            { "word": "guide", "color": "rgba(54, 162, 235, 0.4)", "importance": 80 },
            { "word": "preprocessing", "color": "rgba(54, 162, 235, 0.4)", "importance": 100 },  // Preprocessing
            { "word": "data", "color": "rgba(54, 162, 235, 0.4)", "importance": 90 },
            { "word": "visualizing", "color": "rgba(255, 206, 86, 0.4)", "importance": 85 },     // Visualization

            // Words from LLM response:
            { "word": "Start", "color": "rgba(255, 206, 86, 0.4)", "importance": 50 },
            { "word": "cleaning", "color": "rgba(54, 162, 235, 0.4)", "importance": 95 },
            { "word": "missing values", "color": "rgba(54, 162, 235, 0.4)", "importance": 90 },
            { "word": "outliers", "color": "rgba(54, 162, 235, 0.4)", "importance": 85 },
            { "word": "Standardization", "color": "rgba(54, 162, 235, 0.4)", "importance": 95 },
            { "word": "normalization", "color": "rgba(54, 162, 235, 0.4)", "importance": 90 },

            { "word": "feature engineering", "color": "rgba(75, 192, 192, 0.4)", "importance": 85 },
            { "word": "scaling", "color": "rgba(75, 192, 192, 0.4)", "importance": 80 },
            { "word": "categorical variables", "color": "rgba(75, 192, 192, 0.4)", "importance": 80 },
            { "word": "one-hot encoding", "color": "rgba(75, 192, 192, 0.4)", "importance": 75 },

            { "word": "scatter plots", "color": "rgba(255, 206, 86, 0.4)", "importance": 90 },     // Visualization
            { "word": "histograms", "color": "rgba(255, 206, 86, 0.4)", "importance": 90 },
            { "word": "line charts", "color": "rgba(255, 206, 86, 0.4)", "importance": 85 },
            { "word": "visualize trends", "color": "rgba(255, 206, 86, 0.4)", "importance": 90 },
            { "word": "matplotlib", "color": "rgba(255, 206, 86, 0.4)", "importance": 80 },
            { "word": "seaborn", "color": "rgba(255, 206, 86, 0.4)", "importance": 80 }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Generate a step-by-step guide for preprocessing data and then visualizing it."
            },
            {
                "role": "llm",
                "content": `1. Start with data preprocessing:
                            - Data cleaning: Remove missing values or handle them using imputation techniques.
                            - Handle outliers by capping or removing extreme values.
                            - Standardization or normalization can be used to scale numeric data.
                            - Handle categorical variables through encoding techniques like one-hot encoding.

                            2. Perform feature engineering:
                            - Feature scaling ensures that numeric values are in a comparable range.
                            - Extract important features from raw data for better model performance.

                            3. Data visualization:
                            - Use scatter plots to visualize relationships between two variables.
                            - Histograms help visualize the distribution of numeric data.
                            - Line charts are great for showing trends over time.
                            - Libraries like matplotlib and seaborn are ideal for creating professional visualizations.

                            4. Visualize trends and patterns:
                            - After preprocessing, visualize trends to gain insights and guide further analysis.`                        
            }
        ]
    },
    {
        "task": "Summarization",
        "prompt": "Summarize the key points from this research on adapting agriculture to climate change.",
        "markings": [
            {
                "input": ["Adapting agriculture to climate change", "requires a multi-dimensional approach", "integrating technical, economic, and policy-driven strategies."],
                "output": ["Climate change adaptation in agriculture", "involves using drought-resistant crops", "sustainable farming practices"],
                "color": "rgba(255, 183, 77, 0.4)" // Orange shade for climate change adaptation
            },
            {
                "input": ["Key practices include the development of drought-resistant crops", "sustainable farming techniques such as conservation agriculture", "efficient irrigation systems"],
                "output": ["drought-resistant crops", "sustainable farming practices", "and efficient irrigation"],
                "color": "rgba(54, 162, 235, 0.4)" // Blue shade for technical solutions
            },
            {
                "input": ["On the policy front", "incentives such as subsidies for adopting sustainable technologies", "and the promotion of water and soil resource management policies"],
                "output": ["Policy measures", "like subsidies", "and resource management"],
                "color": "rgba(153, 102, 255, 0.4)" // Purple shade for policy measures
            },
            {
                "input": ["However, the effectiveness of these strategies", "depends on their implementation", "and alignment with local socio-economic conditions"],
                "output": ["success depends on effective implementation", "and local socio-economic alignment"],
                "color": "rgba(75, 192, 192, 0.4)" // Green shade for success factors
            }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Adapting agriculture to climate change requires a integrating technical, economic, and policy-driven strategies. Key practices include the development of drought-resistant crops, sustainable farming techniques such as conservation agriculture, and efficient irrigation systems, all aimed at mitigating climate impacts. On the policy front, incentives such as subsidies for adopting sustainable technologies and the promotion of water and soil resource management policies are crucial in supporting the shift towards more resilient agricultural systems. However, the effectiveness of these strategies largely depends on their implementation and alignment with local socio-economic conditions."
            },
            {
                "role": "llm",
                "content": "Climate change adaptation in agriculture involves using drought-resistant crops, sustainable farming practices, and efficient irrigation. Policy measures, like subsidies and resource management, support this transition, but success depends on effective implementation and local socio-economic alignment."
            }
        ]
    },
    {
        "task": "Summarization",
        "prompt": "Summarize key strategies in adapting agriculture to climate change.",
        "markings": [
            { 
                "input": ["Adapting agriculture to climate change", "multi-dimensional approach", "technical, economic, and policy-driven strategies"],
                "output": ["Climate change adaptation in agriculture", "multi-dimensional approach", "technical, economic, and policy measures"],
                "color": "rgba(255, 205, 86, 0.5)" // Yellow
            },
            { 
                "input": ["drought-resistant crops", "sustainable farming techniques", "efficient irrigation systems"], 
                "output": ["drought-resistant crops", "sustainable farming practices", "efficient irrigation"], 
                "color": "rgba(54, 162, 235, 0.5)" // Blue
            },
            { 
                "input": ["Incentives like subsidies and policies for water and soil management are essential", "promotion of water and soil resource management policies"], 
                "output": ["subsidies", "resource management", "support this transition"], 
                "color": "rgba(75, 192, 192, 0.5)" // Green
            }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Adapting agriculture to climate change requires a multi-dimensional approach. Key strategies include drought-resistant crops, sustainable farming techniques, and efficient irrigation systems. Incentives like subsidies and policies for water and soil management are essential."
            },
            {
                "role": "llm",
                "content": "Climate change adaptation in agriculture involves using drought-resistant crops, sustainable farming practices, and efficient irrigation. Policy measures, like subsidies and resource management, support this transition."
            }
        ]
    },  
    {
        "task": "Improvement",
        "prompt": "Improve the following letter by making it more formal and concise.",
        "markings": [
            { "oldWord": "Dear Sir", "newWord": "Dear Mr. Johnson" },
            { "oldWord": "I am writing this email", "newWord": "I write to you" },
            { "oldWord": "I hope everything is going fine", "newWord": "I trust this message finds you well" },
            { "oldWord": "really liked", "newWord": "appreciated" },
            { "oldWord": "cool idea", "newWord": "innovative concept" },
            { "oldWord": "awesome", "newWord": "remarkable" },
            { "oldWord": "get back to me ASAP", "newWord": "respond at your earliest convenience" }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Dear Sir, I am writing this email to let you know that I really liked your cool idea. It was awesome, and I hope everything is going fine. Please get back to me ASAP."
            },
            {
                "role": "llm",
                "content": "Dear <span style='color: red; text-decoration: line-through;'>Sir</span> <span style='color: green;'>Mr. Johnson</span>, <span style='color: red; text-decoration: line-through;'>I am writing this email</span> <span style='color: green;'>I write to you</span> to let you know that I <span style='color: red; text-decoration: line-through;'>really liked</span> <span style='color: green;'>appreciated</span> your <span style='color: red; text-decoration: line-through;'>cool idea</span>. It was <span style='color: red; text-decoration: line-through;'>awesome</span>, and <span style='color: red; text-decoration: line-through;'>I hope everything is going fine. Please <span style='color: red; text-decoration: line-through;'>get back to me ASAP</span> <span style='color: green;'>respond at your earliest convenience</span>."
            }
        ]
    },
    {
        "task": "Improvement",
        "prompt": "Simplify the following technical documentation for easier understanding.",
        "markings": [
            { "oldWord": "multi-threaded architecture with asynchronous callbacks", "newWord": "multiple threads for faster performance" },
            { "oldWord": "The application is built using a service-oriented architecture (SOA)", "newWord": "The application uses services that work together to complete tasks" },
            { "oldWord": "utilizes", "newWord": "uses" },
            { "oldWord": "leverages machine learning algorithms", "newWord": "uses machine learning to improve predictions" }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "The system operates on a multi-threaded architecture with asynchronous callbacks for I/O operations. The application is built using a service-oriented architecture (SOA) and leverages machine learning algorithms for predictive analysis."
            },
            {
                "role": "llm",
                "content": "The <span style='color: red; text-decoration: line-through;'>multi-threaded architecture with asynchronous callbacks</span> <span style='color: green;'>multiple threads for faster performance</span>. The <span style='color: red; text-decoration: line-through;'>application is built using a service-oriented architecture (SOA)</span> <span style='color: green;'>application uses services that work together to complete tasks</span> and <span style='color: red; text-decoration: line-through;'>leverages machine learning algorithms</span> <span style='color: green;'>uses machine learning to improve predictions</span>."
            }
        ]
    },
    {
        "task": "Explanation",
        "prompt": "Explain the concept of machine learning, focusing on supervised learning techniques.",
        "markings": [
            { "word": "machine learning", "importance": 100 },
            { "word": "core area of AI", "importance": 100 },
            { "word": "predictions", "importance": 100 },
            { "word": "precisions", "importance": 100 },
            { "word": "supervised learning", "importance": 90 },
            { "word": "trained on datasets with known inputs and outputs", "importance": 90 },
            { "word": "techniques", "importance": 80 },
            { "word": "field of AI", "importance": 75 },
            { "word": "classification", "importance": 75 },
            { "word": "assign items to categories", "importance": 75 },
            { "word": "regression", "importance": 75 },
            { "word": "predicts numerical values", "importance": 75 },
            { "word": "learn patterns from data", "importance": 85 },
            { "word": "labeled data", "importance": 70 },
            { "word": "input", "importance": 60 },
            { "word": "output", "importance": 60 },
            { "word": "generalize and predict outputs", "importance": 80 },
            { "word": "for new unseen inputs", "importance": 80 }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Explain the concept of machine learning, focusing on supervised learning techniques."
            },
            {
                "role": "llm",
                "content": `Machine learning is a core area of AI where systems learn patterns from data to make predictions or decisions. 
                            In supervised learning, models are trained on datasets with known inputs and outputs. 
                            The process involves providing the system with labeled data, allowing it to map inputs to corresponding outputs accurately.

                            Supervised learning techniques are used for tasks like classification, where the goal is to assign items to categories, 
                            and regression, which predicts numerical values. With enough labeled examples, the system can generalize and predict outputs for new, unseen inputs.`
            }
        ]
    },
    {
        "task": "Explanation",
        "prompt": "Explain how photosynthesis works, focusing on the role of chlorophyll and sunlight in the process.",
        "markings": [
            { "word": "photosynthesis", "importance": 100 },
            { "word": "chlorophyll", "importance": 95 },
            { "word": "sunlight", "importance": 95 },
            { "word": "carbon dioxide", "importance": 85 },
            { "word": "glucose", "importance": 80 },
            { "word": "oxygen", "importance": 80 },
            { "word": "energy conversion", "importance": 75 },
            { "word": "chemical energy", "importance": 70 },
            { "word": "water", "importance": 75 }
        ],
        "conversation": [
            {
                "role": "user",
                "content": "Explain how photosynthesis works, focusing on the role of chlorophyll and sunlight in the process."
            },
            {
                "role": "llm",
                "content": `Photosynthesis is the biochemical process that allows plants to convert light energy into chemical energy. 
                            Chlorophyll, the green pigment in plants, plays a critical role by capturing sunlight, which initiates the reactions in plant cells. 
                            This energy is then used to convert carbon dioxide and water into glucose and oxygen, providing both food for the plant and oxygen for the environment.

                            The process occurs in two stages: the light-dependent reactions, which capture energy from sunlight, and the Calvin cycle, where this energy helps turn carbon dioxide into glucose.`
            }
        ]
    }
];
