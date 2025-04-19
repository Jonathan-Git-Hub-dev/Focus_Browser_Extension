# Focus_Browser_Extension
This is a chrome-based extension productivity tool that allows users to create policies to disable specific website access at specific times.

For a demonstration please see the video titled "Demo".

How to install:
  1. Download the “code” folder to your device.
  2. Open chrome and navigate to “chrome://extensions/”.
  3. Activate “developer mode” using the toggle found in the top right corner.
  4. Press “load unpack” and navigate to the saved code folder, highlighting it and pressing “select folder”.
  5. Now you can interact with this extensions like other extensions on the top right, for specific advice on the use of the extension watch the demonstration video.



A brief overview of what the code does:
	pressing the extensions icon on the top right of the web browser opens a popup. This popup allows the user to view, create, edit and delete policies. A policy is a URL and the  time the user wants this website to be inaccessible. On the  loading of a tab the content.js script is run to check if there is a policy to limit access to this current URL. The script schedules itself to wake to handle the next change in state of the site or is forcefully awoken when policies change.

		
Thank you for looking at my project.
