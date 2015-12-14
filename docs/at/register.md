# Arachne Acceptance Tests:

## TEST1: Register form error handling

The test has to be done with primary selected browser languages 'de' and 'en'.

* 1) Open register form.
* 2) Do not enter anything.
* 3) Click on register.
* 4) Is there a proper and descriptive error message what is missing?
* 4a) If yes, follow the advice and go back to 3.
* 4b) If no, the test is to considered FAILED:
* 5) Repeat steps 3 to 4 until the location changes to the start page and there is a mail that the registration has been successful.

## TEST2 : Account Activation

After TEST1, the account is not yet activated.
With the user created in test1,

* 1) Try to log in.
* 2) It should not be possible, otherwise FAIL.
* 3) As an admin, unlock the user.
* 4) Login should be possible, otherwise FAIL.
 
## TEST3: Reject registration with existing email

* 1) Open register form.
* 2) Register with email abc@trash-mail.com. The registration must be successful.
* 3) Open register form again.
* 4) Register again with email abc@trash-mail.com.
* 5) The registration must be rejected. If not the test is FAILED.

Clean up: Delete the account registered on abc@trash-mail.com


