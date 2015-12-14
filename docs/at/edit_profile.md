# Arachne Acceptance Tests

## TEST1: Reject changing email to email in use by another user.

* 1) Create an account with email abc@trash-mail.com
* 2) Create a second account with email abc2@trash-mail.com
* 3) Log in as user using the second account.
* 4) Visit the update profile page.
* 5) Change the email to abc@trash-mail.com
* 6) If the change is successful, the test is FAILED.
* 7) If the change gets rejected with a proper message (for de,en), the test is PASSED.

## TEST2: Change an editable item

* 1) Create an account with email abc@trash-mail.com
* 2) Log in using the account
* 3) Visit the update profile page
* 4) Update the email adress to abc2@trash-mail.com
* 5) Go to the start page
* 6) Go back to the update profile page.
* 7) If the email adress is abc2@trash-mail.com the test is PASSED, otherwise FAILED.

## TEST3: Reject changing username.

* 1) Visit the update profile page.
* 2) The username must not be editable.
* 3) If it is, the test ist FAILED.
