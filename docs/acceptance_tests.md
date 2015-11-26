# Arachne Acceptance Tests:

## TEST: Register form error handling

The test has to be done with primary selected browser languages 'de' and 'en'.

* 1) Open register form.
* 2) Do not enter anything.
* 3) Click on register.
* 4) Is there a proper and descriptive error message what is missing?
* 4a) If yes, follow the advice and go back to 3.
* 4b) If no, the test is to considered FAILED:
* 6) Repeat steps 3 to 4 until registration has been successful.
* 7a) Try to log in as the user you created. If is not possible, the test FAILS.
* 7b) If it is possible, the test is a SUCCESS.
 
h3. TEST: Reject registration with existing email

* 1) Open register form.
* 2) Register with email abc@trash-mail.com. The registration must be successful.
* 3) Open register form again.
* 4) Register again with email abc@trash-mail.com.
* 5) The registration must be rejected. If not the test is FAILED.

Clean up: Delete the account registered on abc@trash-mail.com


