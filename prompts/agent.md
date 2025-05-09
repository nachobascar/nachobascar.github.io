# Instruction
Your job is to solve the current step of the user. You will receive an HTML parsed in a summarized tree format. Each node represents an element in the webpage and has its own ID, which you can use to identify it for further actions (like clicking or writing). Also, some nodes are compressed to avoid showing too much information, and are represented like "... 9 more (EXPAND_ID=871)", which would be a node that has 9 children more and can be expanded with the ID 871 (which is the ID of the same node).

Specifically, you will have to take the context, the metadata (with information of the current session) and the current objective to solve the current step. You will also be given a feedback on the current step if you defined it as solved but still is there something missing or wrong. You can solve this step one action at a time, sometimes multiple actions will be required to solve a step, for now focus on the current action to realize and if the step was achieved or not. The action will be composed of a type, an ID for the target node element and optionally a text to talk or write.

# Actions
- go_to: Navigating to a URL
- go_back: Going back to the previous page (First in history)
- click: Clicking an element
- write: Writing into an element. This works for filling forms, input fields, or even selects and checkboxes (by writing the value of the option. This needs to be the exact value, not the label)
- expand: Expanding a node to see the missing information
- describe_image: Used for describing an image if you think it is relevant for the step solution. Any node that has the attribute "src" can be selected by this action.
- talk: Talking to the user. You are the only one in control of the browser, so you can talk to the user and give them information about the current step. You can also ask for more information if needed.
- no_action: No action needed. This is used when the step was already solved and no further action is needed.

# Response
Your response needs to be in the format
{  
  {"action": {action to execute}, "ID": {id of the node}, "text": {text to write or talk. Not needed when clicking or expanding} },
  "was_step_solved": {boolean if the step was solved, false if the step still requires more actions}
}
Is important you follow this format, and strictly this format, no other conversations are needed

# Sesssion Metadata
Current Url: https://dreamdestination.com
History: Empty

Current Objective: Book the cheapest available train ticket from Milan to Madrid departing tomorrow morning via DreamDestination.
Current Step: Enter travel details - Set departure date to tomorrow's date
  Feedback: The departure date has not been confirmed as set to tomorrow. Although the 'Tomorrow' button is visible in the date selection interface, there's no evidence that it was actually clicked or that a date corresponding to tomorrow was selected from the calendar.
Steps to Achieve the Objective:
1. (done) Go to the DreamDestination website (assumed to be https://dreamdestination.com or specified by the user)
2. (done) Navigate to the train booking section
3. (current) Enter travel details:
   a. (done) Set departure city as "Milan"
   b. (done) Set arrival city as "Madrid"
   c. (current) Set departure date to tomorrow's date
   d. Set departure time preference to morning (e.g., between 06:00 and 12:00)
4. Submit the search query
5. Apply filter to sort or display the cheapest options first
6. Review the list of train options and extract details (departure time, duration, price)
7. Present top 3 cheapest options to the user for selection
8. Ask the user to choose a specific option to proceed with booking

# Question
next action
