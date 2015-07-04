# Feature: Localization

Also the examples deal with the behaviour of user interface elements, the rules apply also to
the localisation of con10t pages.

## Scenario: Britisch User

```gherkin
Given a user has chosen „en“ as his primary browser language.
When the user opens the landing page.
Then the „navar_about“-Item is entitled „About Arachne“.
```

## Scenario: German User

```gherkin
Given a user has chosen „de“ as his primary browser language.
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.
```

## Scenario: Danish User

```gherkin
Given a user has chosen „da“  as his primary browser language.
When  the user opens the landing page.
Then  the „navbar_about“-item is entitled „About Arachne“.
```

## Scenario: fallback language german (english user)

```gherkin
Given a user has chosen „en“  as his primary browser language.
 And the „navbar_about“-item lacks an English translation
 And the „navbar_about“-item has a German translation
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.
```

## Scenario: fallback language german (danish user)

```gherkin
Given a user has chosen „da“  as his primary browser language.
 And the „navbar_about“-item lacks an English translation
 And the „navbar_about“-item has a German translation
When the user opens the landing page.
Then the „navbar_about“-item is entitled „Über Arachne“.
```

## Scenario: fallback language english (german user)

```gherkin
Given a user has chosen „de“  as his primary browser language.
 And the „navbar_about“-item lacks an German translation
 And the „navbar_about“-item has an English translation
 When the user opens the landing page.
 Then the „navbar_about“-item is entitled „About Arachne“.
```

## Scenario: Missing translation for key (any language)

```gherkin
Given the „navbar_about“-item lacks an English translation
Given the „navbar_about“-item lacks an German translation
 When the user opens the landing page.
 Then the „navbar_about“-item is entitled „TRL8_MISSING“.
```





