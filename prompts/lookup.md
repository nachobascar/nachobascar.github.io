# Instruction
Your job is to find out the ID of the relevant node for solving an action. You will receive an HTML parsed in a summarized tree format. Each node represents an element in the webpage and has its own ID, which you can use to identify it for further actions (like clicking or writing). Also, some nodes are compressed to avoid showing too much information, and are represented like "... 9 more (EXPAND_ID=871)", which would be a node that has 9 children more and can be expanded with the ID 871 (which is the ID of the same node).

Specifically, you will have to take the context, the metadata (with information of the current session), the current objective, the current step and the message of the user to find out the ID of the node that contains all the relevance for solving the request. It could be the node containing all the information, or the node containing the action for solving the current step. If you cannot find the node, and you think it should be inside a compressed one, you have to specify the ID of the node to expand, and specifying that it needs to be expanded for further lookup.

# Response
Your response needs to be in the format
{ "ID": {id of the node}, "requires_expansion": {boolean if we require expanding the node for further lookup} }
Is important you follow this format, and strictly this format, no other conversations are needed

# Sesssion Metadata
Current Url: https://www.zillow.com/austin-tx/rentals/?itc=renter_zw_zh_homepage-renter-rtb_btn_find-rentals-visual-refresh&searchQueryState=%7B%22isMapVisible%22%3Atrue%2C%22mapBounds%22%3A%7B%22north%22%3A30.519484%2C%22south%22%3A30.06787%2C%22east%22%3A-97.541748%2C%22west%22%3A-98.090558%7D%2C%22filterState%22%3A%7B%22fr%22%3A%7B%22value%22%3Atrue%7D%2C%22fsba%22%3A%7B%22value%22%3Afalse%7D%2C%22fsbo%22%3A%7B%22value%22%3Afalse%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22cmsn%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%2C%22mp%22%3A%7B%22max%22%3A2000%7D%2C%22price%22%3A%7B%22max%22%3A389590%7D%2C%22beds%22%3A%7B%22min%22%3A1%2C%22max%22%3A1%7D%7D%2C%22isListVisible%22%3Atrue%2C%22usersSearchTerm%22%3A%22Austin%2C%20TX%22%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A10221%2C%22regionType%22%3A6%7D%5D%7D
History: 
1. https://www.zillow.com/homes/for_rent/?itc=renter_zw_zh_homepage-renter-rtb_btn_find-rentals-visual-refresh
2. https://www.zillow.com

Current Objective: To find a nice 1-bedroom apartment on rent in Austin, TX for $2000 or less.
Current Step: Summarize findings and request the user about further actions
Steps to Achieve the Objective:
1. (done) Go to real estate platform Zillow
2. (done) Search for properties with the required filters
3. (current) Summarize findings and request the user about further actions