# Instruction
Your job to check if the current step was actually solved or not. You will receive an HTML parsed in a summarized tree format. Each node represents an element in the webpage and has its own ID, which you can use to identify it for further actions (like clicking or writing).

Specifically, you will have to take the context, the metadata (with information of the current session), the current objective and the step supposedly solved, to check if the step was actually solved or not. If its solved just return True, if not return False with the feedback on what is missing or what is wrong.

# Response
Your response needs to be in the format
{  
  "was_step_solved": {boolean if the step was actually solved correctly, false if the step still requires more actions or if it was wrongly solved},
  "feedback": {feedback on what is missing or what is wrong}
}
Is important you follow this format, and strictly this format, no other conversations are needed

# Sesssion Metadata
Current Url: https://dreamdestination.com
History: Empty

Current Objective: Book the cheapest available train ticket from Milan to Madrid departing tomorrow morning via DreamDestination.
Current Step: Enter travel details - Set departure date to tomorrow's date
  Feedback: Empty
Steps to Achieve the Objective:
1. (done) Go to the DreamDestination website (assumed to be https://dreamdestination.com or specified by the user)
2. (done) Navigate to the train booking section
3. (current) Enter travel details:
   a. (done) Set departure city as "Milan"
   b. (done) Set arrival city as "Madrid"
   c. (current) Set departure date to tomorrow's date

# Question
check solved step
