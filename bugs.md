# List of bugs in aqua

### Test difference
 - No difference is shown after about 2000-2700 wrong answers (sql limit?)
   - Due to this bug, I cannot generate whole set of correct answers in some problems... That's kind of irritating...
   - It won't be fixed... :c
 - Empty string answer is not quoted (not identity check?)
 - When test result is 0 and empty string is passed - no difference, only information about wrong answer (not identity check?)

### Other
 - HTTP 500 status code in `/team/checkpasswd.php` whilst banned
