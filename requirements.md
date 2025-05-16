# Agentic Browsing Input  Requirements

This document outlines the requirements for the Agentic Browsing Input System (ABIS), which is designed to facilitate the interaction between users and the Agentic Browsing system. The ABIS system will be responsible for processing user inputs, parsing the website structure, handling metadata memorization, and all the required information for the Agentic Browsing system to function effectively.

The Agentic Browsing Controller System (ABCS) refers to any system that utilizes LLMs and AI Agents to assist users in browsing the web. Therefore, the ABIS is a crucial component of the ABCS, and is agnostic to the specific implementation of the ABCS. The ABIS is designed to be flexible and adaptable to different use cases, allowing for a wide range of applications in web browsing and interaction.

### Definitions

The idea of this project is to separate the agentic browsing behavior in two layers:

- **Agentic Browsing Input System (ABIS)**: The system that handles and processes the raw inputs from the user, browser and contextual information, transforming them into a structured format that can be easily understood and processed by the LLM.
- **Agentic Browsing Controller System (ABCS)**: The system that utilizes LLMs and AI Agents to assist users in browsing the web. It is responsible for processing the ABIS output and performing the actions required to achieve the user's goals.
- **Human-in-the-loop**: A system that requires or allows human intervention in the decision-making process. This could include providing feedback, asking for clarification, or requesting additional information from the user.
- **Human-out-of-the-loop**: A system that operates autonomously, without the need for human intervention. This could include fully automated systems that do not require any input or feedback from the user.
- **Self-correcting mechanism**: A system that is able to adapt to behavioral errors, misunderstandings, deviations from the plan. This could include a feedback mechanism provided by the agent, allowing to keep in mind any errors or new requirements that may arise during the browsing session.

## Requirements
### 0. System Interfaces and Data Flow
- ABIS Input: [user text input, DOM snapshot, past ABIS metadata output]
- ABIS Output: JSON object
- Data Refresh Triggers: page load, DOM mutation

### 1. Input Parsing

- The ABIS must be able to parse the input from the user, which could in theory include text, images, and other media types. For the purposes of this project, we will focus on conversational input, therefore, text input.
- The ABIS must be able to identify the intent of the user based on the input provided, and the current context of both the website and the current ABIS itself.

### 2. Website Structure Parsing

- The ABIS must be able to parse the structure of the website, including the HTML and CSS elements, to understand the layout and organization of the content.
- The information included about the website needs to be both:
  - Sufficient: to allow the LLM to understand the structure, content of the website and the actions that can be performed on it.
  - Minimal: to avoid overwhelming the LLM with unnecessary information.
- The ABIS must be highly flexible and adaptable to different website structures, allowing for a wide range of applications in web browsing and interaction.
  - It shouldn't be limited to a specific set of good practices or accessibility standards, but should be able to handle a wide range of website structures and layouts.
- The ABIS should restructure the website information in a way that is easy for the LLM to understand and process. Potentially, this could be in a tree-like structure, with highly simplified elements and attributes, to allow for a structured representation of information and actions.

### 3. Metadata Memorization

The ABIS must keep track of a variety of metadata, including:

- The browsing history of the user, including:
  - The last websites visited which are relevant for the current session, including:
    - The URL
    - A small summary of the page content (e.g. "form page for personal information")
    - The action taken before triggering the change of page (e.g. "pressed the submit button", "clicked on the X element", "back button", etc.)
- The current context of the user, including:
  - The users preferences: 
    - Language
    - Accessibility needs (how they prefer the information to be presented, e.g., speed, length, etc.)
    - Any other relevant information that could help the LLM to better understand the user and their needs.
  - The objective of the current browsing session. This could be a specific task or goal that the user is trying to achieve, such as finding information, completing a form, etc. It must be complete and clear enough to allow the LLM to understand the full context of the user and their needs without any direct input from the user. (e.g. not "To book a flight to Madrid", but "To book a flight to Madrid for the 15th of December, leaving from London and returning on the 20th of December...")
  - The step-to-step plan to achieve the objective. This should be high-level (e.g., "find information about X", "set the price filter from $200 to $400", "fill the name input field with 'Tizio'", etc.) and not technical (e.g., "click on the X element", "set input element X to value Y", etc.). The LLM should be able to understand the plan and adapt it to the specific website structure and content.
    - Each step should include their status too, specifying if its "done", "in-progress" or "pending".

### 4. Self-Correcting Mechanism

Due to the nature of agentic behavior, it has been highly recommended to use a self-correcting mechanism to ensure that the agent is able to adapt to behavioral errors, misunderstandings, deviations from the plan.

The ABIS should be compatible with self-correcting mechanisms, allowing for the integration of feedback loops and error correction processes. This could include a feedback mechanism provided by the agent, allowing to keep in mind any errors or new requirements that may arise during the browsing session.

As the ABIS is agnostic to the specific implementation of the ABCS, it should be flexible enough to allow for the integration of different self-correcting mechanisms, depending on the specific needs and requirements of the browsing session.

### 5. Human-in-the-loop

The ABIS is designed to allow human-out-of-the-loop behavior, but it should also be able to integrate human-in-the-loop behavior when required. This could include the ability to provide feedback, ask for clarification, inform about the actions being done on the moment, or request additional information from the user.

In general, the ABCS should be the one in charge in defining the level of human-in-the-loop, and of handling its implementation. The ABIS should only allow the integration of this human feedback on the information flow.

### 6. Output Format

The output format of the ABIS should be structured in a way that allows the ABCS to parse, filter and easily transform to current needs. This is not intrinsically an optimized format to LLMs, but allows flexibility for the ABIS to be completely agnostic to the ABCS implementation.

Due to flexibility and adaptability, JSON is the preferred format for the output of the ABIS. This allows for easy parsing and filtering of the information, and can be easily transformed to other formats if needed.

An example of what the output format could look like is as follows (this is not a final version, but a draft to make the idea clear):
```yaml
  - metadata: metadata about the context, website and browsing session
    - history: list of the last websites visited which are relevant for the current session, including
      - url: URL of the website
      - short_description: short description of the page content
      - last_action: last action taken before triggering the change of page 
      - timestamp: timestamp of the last action
    - user_preferences: user preferences, including
      - language: preferred language of the user
      - accessibility_needs: how the user prefers the information to be presented (e.g., "User prefers short and concise information, with no unnecessary details", "User prefers a structured representation of the information, with clear labels and descriptions", etc.)
      - ...
  - website: structured representation of the website DOM, including
    - url: URL of the website
    - short_description: short description of the website
    - summary: summarized content of the website
    - links: list of links of interest to the user that can be navigated to
    - buttons: list of clickable elements of interest to the user
      - id: unique identifier for the action
      - action: action to be performed (e.g., save user information, open price filter, etc.)
    - forms: list of forms of interest to the user that can be filled out
      - title: title of the form
      - description: description of the form
      - submit_id: element ID of the submit button
      - fields: list of fields in the form
        - id: unique identifier for the field
        - type: type of field (e.g., text, checkbox, radio, etc.)
        - label: label of the field
        - placeholder: placeholder text for the field
        - value: current value of the field
        - required: boolean indicating if the field is required
        - options: list of options for select fields 
    - elements: Tree-like structure of the simplified website elements, including
      - id: unique identifier mapping for each element
      - tags: List of HTML tags which were merged into the element
      - content: text content of the element
      - [clickable]: boolean indicating if the element is clickable
      - [aria-*]: accessibility labels for the element
      - [src, href, alt, title, type, role, value, placeholder]: Important attributes of the element
      - children: List of child elements
    - screenshot: Screenshot of the website
  - intent_information: parsed user input, including intent and context
    - objective: objective of the current browsing session
    - step_by_step_plan: high-level plan to achieve the objective
      - step: step to be performed
      - status: status of the step (e.g., "done", "in-progress", "pending")
  - feedback: feedback mechanism for the agent
    - agent_feedback: feedback provided by the agent
    - user_feedback: feedback provided by the user
```

#### 6.1. LLM-Friendly Format

For the purposes of this project, and outside of the ABIS requirements, we will not only focus on the information flow, but also in an optimized format for LLMs to understand.

This format should be:
- Clean: The output should be clean and easy to read, with no unnecessary information or clutter.
- Structured: The output should be structured in a way that allows the LLM to easily parse and understand the information. This includes both the attributes of each category, node and element, as well as the relationships between them.
- Simplified: The output should be simplified to allow the LLM to focus on the most relevant information and actions, without being overwhelmed by unnecessary details. Always keeping in mind the current objective and context of the user.

The LLM-friendly output could consist of more than one output, including
- A simplified version of the website structure, parsed in an LLM-friendly format, supposed to be given to the LLM as a vectorized file. For example, a possible friendly output could look like:

```
BODY[ID=0]
  A[ID=2][clickable=true][href=#main]: "Skip to content"
  DIV[ID=6]
    DIV,NAV[ID=13][aria-label="Chat history"]: "Chat history"
      DIV[ID=15]
        SPAN,BUTTON,svg,path[ID=19][clickable=true][aria-label="Close sidebar"]
        DIV[ID=20]
          SPAN,BUTTON,svg,path[ID=24][clickable=true][aria-label="Ctrl K"]
          SPAN,A,svg,path[ID=28][clickable=true][aria-label="New chat"][href=/]
      DIV[ID=29]
        DIV,SPAN,A,DIV,svg,path[ID=40][clickable=true][title="ChatGPT"][href=/]: "ChatGPT ChatGPT"
        DIV,A[ID=44][clickable=true][title="Sora"][href=https://sora.chatgpt.com?utm_source=chatgpt]
          DIV,IMG[ID=46][clickable=true][src=https://cdn.oaistatic.com/assets/sora-mutf8tav.webp][alt="Sora icon"]
          DIV[ID=47]: "Sora"
        DIV,A[ID=50][clickable=true][title="Library"][href=/library]
          DIV,svg[ID=53][clickable=true]
            path[ID=54][clickable=true]
            path[ID=55][clickable=true]
          DIV[ID=56]: "Library 2"
  ...
```

- A summarized text output including the most relevant metadata about the website, user preferences, and the step-by-step plan to achieve the objective. This could be a text output that is easy for the LLM to understand and process. For example, a possible summarized output could look like:

```md
# Current User Intent
- Objective: To book a flight to Madrid for the 15th of December, leaving from London and returning on the 20th of December
- Current Step: Search for flights - Set the departure from London
- step_by_step_plan:
  - (done) Go to Kayak website
  - (in-progress) Search for flights
    - (in-progress) Set the departure from London
    - (pending) Set the arrival to Madrid
    - (pending) Set the departure date to 15th of December
    - (pending) Set the return date to 20th of December
  - (pending) Inform the user about the available flights
  ...

## Self-Correction Mechanism
- Agent Error Feedback: "The agent was unable to find the departure field on the Kayak website. It is possible that the field is not visible or accessible at this time."
- User Feedback: "The user has provided further information about their preferences, including the departure and return dates, and the departure city."

# Current Website:
- url: https://www.example.com
- short_description: Example website for testing purposes
- summary: This is an example website for testing purposes. It contains a variety of elements and actions that can be performed, including buttons, forms, and links.
- links: 
  - id: 1
    action: Navigate to the homepage
  - id: 2
    action: Navigate to the contact page
- buttons:
  - id: 3
    action: Submit the form
  - id: 4
    action: Cancel the form
- forms:
  - title: Contact Form
    description: This is a contact form that can be filled out and submitted.
    submit_id: 3
    fields:
      - id: 5
        type: text
        label: Name
        placeholder: Enter your name
        required: true
      - id: 6
        type: email
        label: Email
        placeholder: Enter your email
        value: email@example.com
        required: true

# Metadata:

## Session History:
1. [Kayak](https://www.kayak.com)
  - Kayak website for booking flights
  - last_action: Clicked on the 'Search for flights' button
  - timestamp: 2023-10-01T12:00:00Z
2. [Google](https://www.google.com)
  - Google search engine
  - last_action: Clicked on Kayak link
  - timestamp: 2023-10-01T11:00:00Z
...

## Current User Preferences:
- language: "en"
- User prefers short and concise information, with no unnecessary details
```




- An image output of the website, including the screenshot of the website itself and identified elements of interest (e.g. boxes with IDs over important non-identifyable elements).

### 7. Error Handling

In the situation in which the ABIS is unable to parse the website structure, or identify the steps to perform in order to achieve the user's goal, there should be a fallback mechanism to handle this situation. This could include:
- Processing the current browser screenshot for identifying possible elements to interact with (e.g. Captchas, popups, actionable SVGs or images without labels, etc.)
- Providing a fallback message to the user, asking for clarification, additional information or suggestions on how to proceed.

### 8. Security and Privacy

The ABIS must ensure that the user's data and privacy are protected at all times. This includes:
  - Not storing any personal information or sensitive data without the user's consent.
  - Ensuring that any data shared with third parties is done in a secure and privacy-compliant manner.

The ABIS should be designed to comply with relevant data protection regulations, such as GDPR and CCPA, and should include mechanisms for obtaining user consent and providing transparency about data collection and processing practices.

### 9. Performance Requirements

The ABIS should generate its output within a reasonable time frame. The time frame should depends on the complexity of the task and the amount of time expected to be spent doing it without the user intervention.

#### 9.1. Base Latency

The base latency, meaning the minimum time required to process the DOM input, without any user input, should be less than 10ms. This includes the time required to parse the website structure, identify the elements and attributes, and generate the output.

#### 9.2. User Input Latency

The user input latency, meaning the time required to process the user intent and generate the summarized objective, metadata preferences and step-by-step plan, should be less than 1 second.

#### 9.3. Fallback Latency

In specific complex cases, the ABIS could be required to transform the current website structure into a more simplified version, or to process the current browser screenshot for identifying possible elements to interact with. This should be done in less than 2 second.

