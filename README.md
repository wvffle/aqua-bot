# aqua-bot
Simple *not cpp* program to hack around aqua.ilo.pl

### Observations after the latest changes in aqua:
 - We have the result of execution error
 - We have the correct test results (which is a good thing btw)
 - ~~We can easily raise an execution error by doing this kind of thing:~~
   ```
   int main(void) {
     int a;
     std::cin >> a;
     return a;
   }
   ```
 - Since the latest changes we can print test results to standard output as a result of our program
     
### How does the program work?
It is run on in the browser as a greasemonkey script. In the /team/problems.php
section in every excercise a new button is added to complete it.

When the click event is called following things will happen:
  - XHR to send file which raises an execution error
    - interval with XHR to check if the file was processed
      - repeats whole step until there are no dupes in the parameters
  - XHR to send file with all wrong answers
    - interval with XHR to check if the file was processed
  - when two files were processed then prepare the body of a program
  - XHR to send program
    - interval with XHR to check if file was processed
      - update view with results
  
### Bugs of aqua
Every found bug of aqua is described inside [bugs.md](/bugs.md) file
  
### TODO

  - [x] Handle dupes in the parameters
  - [x] Add string support in answers
  - [x] Type support in parameters
  - [x] Bypass answer types simply by putting anwsers to strings
  - [ ] Detect if no parameters are passed
  - [x] Multiline answers
  - [x] Report critical bugs to the admin
