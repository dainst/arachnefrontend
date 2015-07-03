# Feature Localization

## Scenario: Britisch User

Given a user has chosen „en“ as his primary browser language.
When the user opens the landing page.
Then the „navar_about“-Item is entitled „About Arachne“.

## Scenario: German User

Given a user has chosen „de“ as his primary browser language.
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.

## Scenario: Danish User

Given a user has chosen „da“  as his primary browser language.
When he user opens the landing page.
Then the „navbar_about“-item is entitled „About Arachne“.

## Scenario: Fallback Language German for not translated items.

Given a user has chosen „da“  as his primary browser language.
   And the „navbar_about“-item lacks an English translation
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.
