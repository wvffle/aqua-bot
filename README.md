# aqua-bot
Simple *not cpp* program to hack around aqua.ilo.pl

### Observations after the latest changes in aqua:
  - ROEECTR
  - I have the result of execution error
  - I have the correct test results (new thing)
  - ah..
  - result of execution error correct test results
  - weird dance
  - result of execution error correct test results
     
### How does the bot work?
It is run on in the browser as a greasemonkey script. In the /team/problems.php
section in every excercise a new button is added to complete it.

When the click event is called following things will happen:
  - XHR request to send file which raises an execution error
    - interval with XHR request to check if the file was processed
  - XHR request to send file with all wrong answers
    - interval with XHR request to check if the file was processed
  - when two files were processed then prepare the body of a program
  - XHR request to send program
  
### TODO

  - [ ] Handle dupes in the parameters
