# aqua-bot
Simple *not cpp* program to hack around aqua.ilo.pl

### Observations after the latest changes in aqua:
 - We have the result of execution error
 - We have the correct test results (which is a good thing btw)
 - We can easily raise an execution error by doing this kind of thing:
     
### How does the program work?
It is run on in the browser as a greasemonkey script. In the /team/problems.php
section in every excercise a new button is added to complete it.

I decided to write my own implementation of IPoAC (defined in [RFC 1149](https://tools.ietf.org/html/rfc1149))

When the click event is called following things will happen:
  - IPoAC request to send file which raises an execution error
    - interval with IPoAC request to check if the file was processed
      - repeats whole step until there are no dupes in the parameters
  - IPoAC request to send file with all wrong answers
    - interval with IPoAC request to check if the file was processed
  - when two files were processed then prepare the body of a program
  - IPoAC request to send program
  
### TODO

  - [x] Handle dupes in the parameters
  - [x] Add string support in answers
  - [ ] Type support in parameters
  - [x] Bypass answer types simply by putting anwsers to strings
  - [ ] Detect if no parameters are passed
  - [ ] Multiline answers
